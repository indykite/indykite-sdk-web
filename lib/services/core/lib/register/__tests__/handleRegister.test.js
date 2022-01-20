const { getLocalizedMessage } = require("../../../lib/locale-provider");
const storage = require("../../storage");
const {
  sendCredentialsForLoginOrRegister,
  sendVerifierForLoginOrRegister,
} = require("../../common");
const { cleanAllNotifications, cleanError, handleError } = require("../../notifications");
const handleRegister = require("../handleRegister");

jest.mock("../../../lib/locale-provider");
jest.mock("../../storage");
jest.mock("../../common");
jest.mock("../../notifications");

const originalLocation = window.location;
delete window.location;

let emailEl;
let passwordEl;
let confirmPasswordEl;

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
  },
};

beforeEach(() => {
  emailEl = document.createElement("input");
  passwordEl = document.createElement("input");
  confirmPasswordEl = document.createElement("input");
  window.location = undefined;

  jest.resetAllMocks();
  jest.spyOn(document, "querySelector").mockImplementation((selector) => {
    switch (selector) {
      case "#IKUISDK-username":
        return emailEl;
      case "#IKUISDK-password":
        return passwordEl;
      case "#IKUISDK-confirm-password":
        return confirmPasswordEl;
      default:
        return null;
    }
  });
  getLocalizedMessage.mockImplementation((key, values) => {
    const stringifiedValues = values ? JSON.stringify(values) : "";
    return `Localized: ${key} ${stringifiedValues}`.trim();
  });
  sendCredentialsForLoginOrRegister.mockImplementation(() =>
    Promise.resolve({
      data: {
        "~thread": {
          thid: "thread-id",
        },
        verifier: "verifier-token",
      },
    }),
  );
  sendVerifierForLoginOrRegister.mockImplementation(() =>
    Promise.resolve({
      data: {
        "@type": "success",
      },
    }),
  );
});

afterAll(() => {
  window.location = originalLocation;
});

describe("when requests return correct responses", () => {
  describe("when values are passed via parameters", () => {
    describe("when OIDC original parameters are not stored", () => {
      describe("when onSuccess callback is not present", () => {
        let returnedValue;

        beforeEach(async () => {
          returnedValue = await handleRegister({
            emailValueParam: "user@example.com",
            id: "option-id",
            passwordValueParam: "password",
          });
        });

        it("returns a correct value", () => {
          expect(returnedValue).toEqual({
            "@type": "success",
          });
        });

        it("handles no error", () => {
          expect(handleError).toBeCalledTimes(0);
        });

        it("sends credential request with correct parameters", () => {
          expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
          expect(sendCredentialsForLoginOrRegister).toBeCalledWith({
            emailValueParam: "user@example.com",
            passwordValueParam: "password",
            id: "option-id",
          });
        });

        it("sends verifier request with correct parameters", () => {
          expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
          expect(sendVerifierForLoginOrRegister).toBeCalledWith("thread-id");
        });

        it("stores the verifier data", () => {
          expect(storage.storeOnLoginSuccess).toBeCalledTimes(1);
          expect(storage.storeOnLoginSuccess).toBeCalledWith({
            "@type": "success",
          });
        });

        it("cleans notifications", () => {
          expect(cleanAllNotifications).toBeCalledTimes(1);
        });

        it("does not clean OIDC data", () => {
          expect(storage.clearOidcData).toBeCalledTimes(0);
        });

        it("does not redirect the page", () => {
          expect(window.location).toBeUndefined();
        });
      });

      describe("when onSuccess callback is not present, but registeredCallback is", () => {
        let returnedValue;

        beforeEach(async () => {
          window.IKSDK.registeredCallback = jest.fn();

          returnedValue = await handleRegister({
            emailValueParam: "user@example.com",
            id: "option-id",
            passwordValueParam: "password",
          });
        });

        afterEach(() => {
          delete window.IKSDK.registeredCallback;
        });

        it("calls registered callback", () => {
          expect(window.IKSDK.registeredCallback).toBeCalledTimes(1);
          expect(window.IKSDK.registeredCallback).toBeCalledWith({
            "@type": "success",
          });
        });
      });

      describe("when onSuccess callback is present", () => {
        const onSuccessCallback = jest.fn();
        let returnedValue;

        beforeEach(async () => {
          returnedValue = await handleRegister({
            emailValueParam: "user@example.com",
            id: "option-id",
            passwordValueParam: "password",
            onSuccessCallback,
          });
        });

        it("calls onSuccessCallback", () => {
          expect(onSuccessCallback).toBeCalledTimes(1);
          expect(onSuccessCallback).toBeCalledWith({
            "@type": "success",
          });
        });
      });
    });

    describe("when OIDC original parameters are stored", () => {
      const onSuccessCallback = jest.fn();
      let returnedValue;

      beforeEach(async () => {
        storage.getOidcOriginalParams.mockImplementation(() => ({
          redirect_url: "https://www.example.com",
          state: "state-token",
        }));

        returnedValue = await handleRegister({
          emailValueParam: "user@example.com",
          id: "option-id",
          passwordValueParam: "password",
          onSuccessCallback,
        });
      });

      it("does not return anything", () => {
        expect(returnedValue).toBeUndefined();
      });

      it("handles no error", () => {
        expect(handleError).toBeCalledTimes(0);
      });

      it("sends credential request with correct parameters", () => {
        expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
        expect(sendCredentialsForLoginOrRegister).toBeCalledWith({
          emailValueParam: "user@example.com",
          passwordValueParam: "password",
          id: "option-id",
        });
      });

      it("sends verifier request with correct parameters", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
        expect(sendVerifierForLoginOrRegister).toBeCalledWith("thread-id");
      });

      it("stores the verifier data", () => {
        expect(storage.storeOnLoginSuccess).toBeCalledTimes(1);
        expect(storage.storeOnLoginSuccess).toBeCalledWith({
          "@type": "success",
        });
      });

      it("cleans notifications", () => {
        expect(cleanAllNotifications).toBeCalledTimes(1);
      });

      it("cleans OIDC data", () => {
        expect(storage.clearOidcData).toBeCalledTimes(1);
      });

      it("redirects the page", () => {
        expect(window.location).toBe(
          "https://example.com/o/oauth2/auth?redirect_url=https%3A%2F%2Fwww.example.com&state=state-token&login_verifier=verifier-token",
        );
      });

      it("does not call onSuccessCallback", () => {
        expect(onSuccessCallback).toBeCalledTimes(0);
      });
    });
  });

  describe("when values are retrieved from form inputs", () => {
    describe("when password inputs contain same passwords", () => {
      let returnedValue;

      beforeEach(async () => {
        emailEl.value = "another.user@example.com";
        passwordEl.value = "input-password";
        confirmPasswordEl.value = "input-password";

        returnedValue = await handleRegister({
          id: "option-id",
          emailValueParam: null,
          passwordValueParam: null,
        });
      });

      it("returns a correct value", () => {
        expect(returnedValue).toEqual({
          "@type": "success",
        });
      });

      it("handles no error", () => {
        expect(handleError).toBeCalledTimes(0);
      });

      it("sends credential request with correct parameters", () => {
        expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
        expect(sendCredentialsForLoginOrRegister).toBeCalledWith({
          emailValueParam: "another.user@example.com",
          passwordValueParam: "input-password",
          id: "option-id",
        });
      });

      it("sends verifier request with correct parameters", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
        expect(sendVerifierForLoginOrRegister).toBeCalledWith("thread-id");
      });

      it("stores the verifier data", () => {
        expect(storage.storeOnLoginSuccess).toBeCalledTimes(1);
        expect(storage.storeOnLoginSuccess).toBeCalledWith({
          "@type": "success",
        });
      });

      it("cleans notifications", () => {
        expect(cleanAllNotifications).toBeCalledTimes(1);
      });

      it("does not clean OIDC data", () => {
        expect(storage.clearOidcData).toBeCalledTimes(0);
      });

      it("does not redirect the page", () => {
        expect(window.location).toBeUndefined();
      });
    });

    describe("when password input values differ", () => {
      let returnedValue;

      beforeEach(async () => {
        emailEl.value = "another.user@example.com";
        passwordEl.value = "input-password1";
        confirmPasswordEl.value = "input-password2";

        returnedValue = await handleRegister({
          id: "option-id",
          emailValueParam: null,
          passwordValueParam: null,
        });
      });

      it("does not return anything", () => {
        expect(returnedValue).toBeUndefined();
      });

      it("handles error", () => {
        expect(handleError).toBeCalledTimes(1);
        expect(handleError).toBeCalledWith({
          msg: "Localized: uisd.register.password_confirmation_failed",
        });
      });

      it("does not send credential request", () => {
        expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(0);
      });

      it("does not send verifier request", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(0);
      });

      it("does not store the verifier data", () => {
        expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
      });

      it("does not clean notifications", () => {
        expect(cleanAllNotifications).toBeCalledTimes(0);
      });

      it("does not clean OIDC data", () => {
        expect(storage.clearOidcData).toBeCalledTimes(0);
      });

      it("does not redirect the page", () => {
        expect(window.location).toBeUndefined();
      });
    });
  });
});

describe("when the verifier request contains an error in the response", () => {
  const onSuccessCallback = jest.fn();
  let caughtError;

  beforeEach(async () => {
    sendVerifierForLoginOrRegister.mockImplementation(() =>
      Promise.resolve({
        data: {
          "~error": "Test error",
        },
      }),
    );

    try {
      await handleRegister({
        emailValueParam: "user@example.com",
        id: "option-id",
        passwordValueParam: "password",
        onSuccessCallback,
      });
    } catch (err) {
      caughtError = err;
    }
  });

  it("throws an error", () => {
    expect(caughtError).toEqual({
      "~error": "Test error",
    });
  });

  it("handles no error", () => {
    expect(handleError).toBeCalledTimes(0);
  });

  it("sends credential request with correct parameters", () => {
    expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
    expect(sendCredentialsForLoginOrRegister).toBeCalledWith({
      emailValueParam: "user@example.com",
      passwordValueParam: "password",
      id: "option-id",
    });
  });

  it("sends verifier request with correct parameters", () => {
    expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
    expect(sendVerifierForLoginOrRegister).toBeCalledWith("thread-id");
  });

  it("does not store the verifier data", () => {
    expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
  });

  it("does not clean notifications", () => {
    expect(cleanAllNotifications).toBeCalledTimes(0);
  });

  it("does not clean OIDC data", () => {
    expect(storage.clearOidcData).toBeCalledTimes(0);
  });

  it("does not redirect the page", () => {
    expect(window.location).toBeUndefined();
  });
});

describe("when the credentials request contains an error in the response", () => {
  const onSuccessCallback = jest.fn();
  let caughtError;

  beforeEach(async () => {
    sendCredentialsForLoginOrRegister.mockImplementation(() =>
      Promise.resolve({
        data: {
          "~error": "Test error",
        },
      }),
    );

    try {
      await handleRegister({
        emailValueParam: "user@example.com",
        id: "option-id",
        passwordValueParam: "password",
        onSuccessCallback,
      });
    } catch (err) {
      caughtError = err;
    }
  });

  it("throws an error", () => {
    expect(caughtError).toEqual({
      "~error": "Test error",
    });
  });

  it("handles no error", () => {
    expect(handleError).toBeCalledTimes(0);
  });

  it("sends credential request with correct parameters", () => {
    expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
    expect(sendCredentialsForLoginOrRegister).toBeCalledWith({
      emailValueParam: "user@example.com",
      passwordValueParam: "password",
      id: "option-id",
    });
  });

  it("does not send verifier request", () => {
    expect(sendVerifierForLoginOrRegister).toBeCalledTimes(0);
  });

  it("does not store the verifier data", () => {
    expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
  });

  it("does not clean notifications", () => {
    expect(cleanAllNotifications).toBeCalledTimes(0);
  });

  it("does not clean OIDC data", () => {
    expect(storage.clearOidcData).toBeCalledTimes(0);
  });

  it("does not redirect the page", () => {
    expect(window.location).toBeUndefined();
  });
});

describe("when the credentials request does not have any data in the response", () => {
  const onSuccessCallback = jest.fn();
  let caughtError;

  beforeEach(async () => {
    sendCredentialsForLoginOrRegister.mockImplementation(() => Promise.resolve());

    try {
      await handleRegister({
        emailValueParam: "user@example.com",
        id: "option-id",
        passwordValueParam: "password",
        onSuccessCallback,
      });
    } catch (err) {
      caughtError = err;
    }
  });

  it("throws an error", () => {
    expect(caughtError).toBe(
      "Oops something went wrong when sending credentials to the indentity provider server.",
    );
  });

  it("handles no error", () => {
    expect(handleError).toBeCalledTimes(0);
  });

  it("sends credential request with correct parameters", () => {
    expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
    expect(sendCredentialsForLoginOrRegister).toBeCalledWith({
      emailValueParam: "user@example.com",
      passwordValueParam: "password",
      id: "option-id",
    });
  });

  it("does not send verifier request", () => {
    expect(sendVerifierForLoginOrRegister).toBeCalledTimes(0);
  });

  it("does not store the verifier data", () => {
    expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
  });

  it("does not clean notifications", () => {
    expect(cleanAllNotifications).toBeCalledTimes(0);
  });

  it("does not clean OIDC data", () => {
    expect(storage.clearOidcData).toBeCalledTimes(0);
  });

  it("does not redirect the page", () => {
    expect(window.location).toBeUndefined();
  });
});
