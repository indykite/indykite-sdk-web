const storage = require("../../../lib/storage");
const { sendVerifierForLoginOrRegister } = require("../../../lib/common");
const { cleanAllNotifications } = require("../../../lib/notifications");
const { getThreadId } = require("../../../lib/storage");
const { getOidcFinalUrlWithLoginVerifier } = require("../../../utils/helpers");
const verifier = require("../verifier");

jest.mock("../../../lib/storage");
jest.mock("../../../lib/common");
jest.mock("../../../lib/notifications");
jest.mock("../../../lib/storage");
jest.mock("../../../utils/helpers");

const originalLocation = window.location;

beforeEach(() => {
  if (window.location) {
    delete window.location;
  }

  jest.resetAllMocks();

  sendVerifierForLoginOrRegister.mockImplementation(() =>
    Promise.resolve({
      data: {
        "@type": "success",
        token: "mocked-token",
      },
    }),
  );
  getThreadId.mockImplementation(() => "thread-id-mock");
  getOidcFinalUrlWithLoginVerifier.mockImplementation(
    () => "https://domain.com/path/with/original-params-and-verifier",
  );
});

afterAll(() => {
  window.location = originalLocation;
});

let returnedValue;

describe("when oidc original params are not present", () => {
  describe("when the response does not have an error", () => {
    describe("when the onSuccess callback is not present", () => {
      beforeEach(async () => {
        returnedValue = await verifier();
        return returnedValue;
      });

      it("sends correct request", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
        expect(sendVerifierForLoginOrRegister).toBeCalledWith("thread-id-mock");
      });

      it("cleans all notifications", () => {
        expect(cleanAllNotifications).toBeCalledTimes(1);
      });

      it("returns a correct value", () => {
        expect(returnedValue).toEqual({
          "@type": "success",
          token: "mocked-token",
        });
      });
    });

    describe("when the onSuccess callback is present", () => {
      let onSuccessCallback;

      beforeEach(async () => {
        onSuccessCallback = jest.fn();
        returnedValue = await verifier({ onSuccessCallback });
        return returnedValue;
      });

      it("sends correct request", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
        expect(sendVerifierForLoginOrRegister).toBeCalledWith("thread-id-mock");
      });

      it("cleans all notifications", () => {
        expect(cleanAllNotifications).toBeCalledTimes(1);
      });

      it("returns a correct value", () => {
        expect(returnedValue).toEqual({
          "@type": "success",
          token: "mocked-token",
        });
      });

      it("calls the onSuccess callback", () => {
        expect(onSuccessCallback).toBeCalledTimes(1);
        expect(onSuccessCallback).toBeCalledWith({
          "@type": "success",
          token: "mocked-token",
        });
      });
    });

    describe("when callback is present in the window object", () => {
      let callback;

      beforeEach(async () => {
        callback = jest.fn();
        window.IKSDK = {
          registeredCallback: callback,
        };
        returnedValue = await verifier();
        return returnedValue;
      });

      afterEach(() => {
        delete window.IKSDK;
      });

      it("sends correct request", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
        expect(sendVerifierForLoginOrRegister).toBeCalledWith("thread-id-mock");
      });

      it("cleans all notifications", () => {
        expect(cleanAllNotifications).toBeCalledTimes(1);
      });

      it("returns a correct value", () => {
        expect(returnedValue).toEqual({
          "@type": "success",
          token: "mocked-token",
        });
      });

      it("calls the callback", () => {
        expect(window.IKSDK.registeredCallback).toBeCalledTimes(1);
        expect(window.IKSDK.registeredCallback).toBeCalledWith({
          "@type": "success",
          token: "mocked-token",
        });
      });
    });
  });

  describe("when the response does have an error", () => {
    let onSuccessCallback;
    let thrownValue;

    beforeEach(async () => {
      sendVerifierForLoginOrRegister.mockImplementation(() =>
        Promise.resolve({
          data: {
            "@type": "error",
          },
        }),
      );

      onSuccessCallback = jest.fn();
      thrownValue = null;
      try {
        await verifier({ onSuccessCallback });
      } catch (err) {
        thrownValue = err;
      }
    });

    it("sends correct request", () => {
      expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
      expect(sendVerifierForLoginOrRegister).toBeCalledWith("thread-id-mock");
    });

    it("does not clean notifications", () => {
      expect(cleanAllNotifications).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(thrownValue).toEqual({
        "@type": "error",
      });
    });

    it("does not call the onSuccess callback", () => {
      expect(onSuccessCallback).toBeCalledTimes(0);
    });
  });
});

describe("when oidc original params are not present", () => {
  const originalParams = {
    scope: "mock",
    redirect_uri: "https://example.com/callback",
  };
  let onSuccessCallback;

  beforeEach(async () => {
    sendVerifierForLoginOrRegister.mockImplementation(() =>
      Promise.resolve({
        data: {
          "@type": "success",
          token: "mocked-token",
          verifier: "mocked-verifier",
        },
      }),
    );
    storage.getOidcOriginalParams.mockImplementation(() => originalParams);

    onSuccessCallback = jest.fn();
    returnedValue = await verifier({ onSuccessCallback });
  });

  it("sends correct request", () => {
    expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
    expect(sendVerifierForLoginOrRegister).toBeCalledWith("thread-id-mock");
  });

  it("cleans all notifications", () => {
    expect(cleanAllNotifications).toBeCalledTimes(1);
  });

  it("clears oidc data", () => {
    expect(storage.clearOidcData).toBeCalledTimes(1);
  });

  it("does not return any value", () => {
    expect(returnedValue).toBeUndefined();
  });

  it("does not call the onSuccess callback", () => {
    expect(onSuccessCallback).toBeCalledTimes(0);
  });

  it("changes location url", () => {
    expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(1);
    expect(getOidcFinalUrlWithLoginVerifier).toBeCalledWith(originalParams, "mocked-verifier");
    expect(window.location).toEqual("https://domain.com/path/with/original-params-and-verifier");
  });
});
