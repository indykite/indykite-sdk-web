const { getLocalizedMessage } = require("../../../lib/locale-provider");
const { storeOnLoginSuccess } = require("../../storage");
const { cleanError, handleError, setNotificationsState } = require("../../notifications");
const sendNewPasswordRequest = require("../sendNewPasswordRequest");
const sendNewPasswordVerifier = require("../sendNewPasswordVerifier");
const handleSendNewPassword = require("../handleSendNewPassword");

jest.mock("../../../lib/locale-provider");
jest.mock("../../storage");
jest.mock("../../notifications");
jest.mock("../sendNewPasswordRequest");
jest.mock("../sendNewPasswordVerifier");

let originalLocation = window.location;
const windowLocationMock = {
  origin: "https://example.com",
};

beforeAll(() => {
  delete window.location;
});

beforeEach(() => {
  jest.resetAllMocks();
  window.location = windowLocationMock;

  sendNewPasswordRequest.mockImplementation(() =>
    Promise.resolve({
      data: {
        "~thread": {
          thid: "verifier-thread-id",
        },
        "@type": "verifier",
      },
    }),
  );

  sendNewPasswordVerifier.mockImplementation(() =>
    Promise.resolve({
      data: {
        "@type": "success",
        sub: "user-id",
        token: "access-token",
      },
    }),
  );

  getLocalizedMessage.mockImplementation((key, values) => {
    const stringifiedValues = values ? JSON.stringify(values) : "";
    return `Localized: ${key} ${stringifiedValues}`.trim();
  });

  jest.spyOn(document, "querySelector");
});

afterEach(() => {
  document.querySelector.mockRestore();
});

afterAll(() => {
  window.location = originalLocation;
});

describe("when the new password is passed via parameter", () => {
  const newPassword = "new-password";

  describe("when the reset password request returns verifier", () => {
    describe("when the verifier request returns 'success' response", () => {
      let returnedValue;

      beforeEach(async () => {
        returnedValue = await handleSendNewPassword(newPassword);
      });

      it("cleans notification error", () => {
        expect(cleanError).toBeCalledTimes(1);
      });

      it("does not call querySelector function", () => {
        expect(document.querySelector).toBeCalledTimes(0);
      });

      it("calls sendNewPaswordRequest with a correct parameter", () => {
        expect(sendNewPasswordRequest).toBeCalledTimes(1);
        expect(sendNewPasswordRequest).toBeCalledWith(newPassword);
      });

      it("calls sendNewPasswordVerifier with a correct parameter", () => {
        expect(sendNewPasswordVerifier).toBeCalledTimes(1);
        expect(sendNewPasswordVerifier).toBeCalledWith("verifier-thread-id");
      });

      it("stores the response", () => {
        expect(storeOnLoginSuccess).toBeCalledTimes(1);
        expect(storeOnLoginSuccess).toBeCalledWith({
          "@type": "success",
          sub: "user-id",
          token: "access-token",
        });
      });

      it("returns a correct value", () => {
        expect(returnedValue).toEqual({
          "@type": "success",
          sub: "user-id",
          token: "access-token",
        });
      });

      it("does not set a notification", () => {
        expect(setNotificationsState).toBeCalledTimes(0);
      });

      it("does not change the location", () => {
        expect(window.location).toBe(windowLocationMock);
      });
    });

    describe("when the verifier request returns 'unknown' response", () => {
      let returnedValue;

      beforeEach(async () => {
        sendNewPasswordVerifier.mockImplementation(() =>
          Promise.resolve({
            data: {
              "@type": "unknown",
            },
          }),
        );

        returnedValue = await handleSendNewPassword(newPassword);
      });

      it("cleans notification error", () => {
        expect(cleanError).toBeCalledTimes(1);
      });

      it("does not call querySelector function", () => {
        expect(document.querySelector).toBeCalledTimes(0);
      });

      it("calls sendNewPaswordRequest with a correct parameter", () => {
        expect(sendNewPasswordRequest).toBeCalledTimes(1);
        expect(sendNewPasswordRequest).toBeCalledWith(newPassword);
      });

      it("calls sendNewPasswordVerifier with a correct parameter", () => {
        expect(sendNewPasswordVerifier).toBeCalledTimes(1);
        expect(sendNewPasswordVerifier).toBeCalledWith("verifier-thread-id");
      });

      it("does not store the response", () => {
        expect(storeOnLoginSuccess).toBeCalledTimes(0);
      });

      it("does not return a value", () => {
        expect(returnedValue).toBeUndefined();
      });

      it("does not set a notification", () => {
        expect(setNotificationsState).toBeCalledTimes(0);
      });

      it("does not change the location", () => {
        expect(window.location).toBe(windowLocationMock);
      });
    });

    describe("when the verifier request returns 'fail' response", () => {
      let caughtError;

      beforeEach(async () => {
        sendNewPasswordVerifier.mockImplementation(() =>
          Promise.resolve({
            data: {
              "@type": "fail",
            },
          }),
        );

        try {
          await handleSendNewPassword(newPassword);
        } catch (err) {
          caughtError = err;
        }
      });

      it("calls sendNewPaswordRequest with a correct parameter", () => {
        expect(sendNewPasswordRequest).toBeCalledTimes(1);
        expect(sendNewPasswordRequest).toBeCalledWith(newPassword);
      });

      it("calls sendNewPasswordVerifier with a correct parameter", () => {
        expect(sendNewPasswordVerifier).toBeCalledTimes(1);
        expect(sendNewPasswordVerifier).toBeCalledWith("verifier-thread-id");
      });

      it("does not store the response", () => {
        expect(storeOnLoginSuccess).toBeCalledTimes(0);
      });

      it("throws an error", () => {
        expect(caughtError).toEqual({
          msg: "Localized: uisdk.reset_password.fail_message",
        });
      });

      it("does not set a notification", () => {
        expect(setNotificationsState).toBeCalledTimes(0);
      });

      it("handles the error", () => {
        expect(handleError).toBeCalledTimes(1);
        expect(handleError).toBeCalledWith({
          msg: "Localized: uisdk.reset_password.fail_message",
        });
      });
    });

    describe("when the verifier request returns a response with error", () => {
      let caughtError;

      beforeEach(async () => {
        sendNewPasswordVerifier.mockImplementation(() =>
          Promise.resolve({
            "~error": "Test error",
            data: {
              "@type": "fail",
            },
          }),
        );

        try {
          await handleSendNewPassword(newPassword);
        } catch (err) {
          caughtError = err;
        }
      });

      it("calls sendNewPaswordRequest with a correct parameter", () => {
        expect(sendNewPasswordRequest).toBeCalledTimes(1);
        expect(sendNewPasswordRequest).toBeCalledWith(newPassword);
      });

      it("calls sendNewPasswordVerifier with a correct parameter", () => {
        expect(sendNewPasswordVerifier).toBeCalledTimes(1);
        expect(sendNewPasswordVerifier).toBeCalledWith("verifier-thread-id");
      });

      it("does not store the response", () => {
        expect(storeOnLoginSuccess).toBeCalledTimes(0);
      });

      it("throws an error", () => {
        expect(caughtError).toEqual("Test error");
      });

      it("does not set a notification", () => {
        expect(setNotificationsState).toBeCalledTimes(0);
      });

      it("does not handle the error", () => {
        expect(handleError).toBeCalledTimes(0);
      });
    });

    describe("when the verifier request returns a response without data", () => {
      let caughtError;

      beforeEach(async () => {
        sendNewPasswordVerifier.mockImplementation(() => Promise.resolve());

        try {
          await handleSendNewPassword(newPassword);
        } catch (err) {
          caughtError = err;
        }
      });

      it("calls sendNewPaswordRequest with a correct parameter", () => {
        expect(sendNewPasswordRequest).toBeCalledTimes(1);
        expect(sendNewPasswordRequest).toBeCalledWith(newPassword);
      });

      it("calls sendNewPasswordVerifier with a correct parameter", () => {
        expect(sendNewPasswordVerifier).toBeCalledTimes(1);
        expect(sendNewPasswordVerifier).toBeCalledWith("verifier-thread-id");
      });

      it("does not store the response", () => {
        expect(storeOnLoginSuccess).toBeCalledTimes(0);
      });

      it("throws an error", () => {
        expect(caughtError).toEqual({
          msg: "Localized: uisdk.reset_password.missing_verifier",
        });
      });

      it("does not set a notification", () => {
        expect(setNotificationsState).toBeCalledTimes(0);
      });

      it("handles the error", () => {
        expect(handleError).toBeCalledTimes(1);
        expect(handleError).toBeCalledWith({
          msg: "Localized: uisdk.reset_password.missing_verifier",
        });
      });
    });
  });

  describe("when the reset password request returns an unknown message", () => {
    let returnedValue;

    beforeEach(async () => {
      sendNewPasswordRequest.mockImplementation(() =>
        Promise.resolve({
          data: {
            "~thread": {
              thid: "verifier-thread-id",
            },
            "@type": "unknown",
          },
        }),
      );

      returnedValue = await handleSendNewPassword(newPassword);
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("does not call querySelector function", () => {
      expect(document.querySelector).toBeCalledTimes(0);
    });

    it("calls sendNewPaswordRequest with a correct parameter", () => {
      expect(sendNewPasswordRequest).toBeCalledTimes(1);
      expect(sendNewPasswordRequest).toBeCalledWith(newPassword);
    });

    it("does not call sendNewPasswordVerifier", () => {
      expect(sendNewPasswordVerifier).toBeCalledTimes(0);
    });

    it("does not store the response", () => {
      expect(storeOnLoginSuccess).toBeCalledTimes(0);
    });

    it("does not return a value", () => {
      expect(returnedValue).toBeUndefined();
    });

    it("does not set a notification", () => {
      expect(setNotificationsState).toBeCalledTimes(0);
    });

    it("does not change the location", () => {
      expect(window.location).toBe(windowLocationMock);
    });
  });

  describe("when the reset password request returns 'fail' response", () => {
    let caughtError;

    beforeEach(async () => {
      sendNewPasswordRequest.mockImplementation(() =>
        Promise.resolve({
          data: {
            "~thread": {
              thid: "verifier-thread-id",
            },
            "@type": "fail",
          },
        }),
      );

      try {
        await handleSendNewPassword(newPassword);
      } catch (err) {
        caughtError = err;
      }
    });

    it("calls sendNewPaswordRequest with a correct parameter", () => {
      expect(sendNewPasswordRequest).toBeCalledTimes(1);
      expect(sendNewPasswordRequest).toBeCalledWith(newPassword);
    });

    it("does not call sendNewPasswordVerifier", () => {
      expect(sendNewPasswordVerifier).toBeCalledTimes(0);
    });

    it("does not store the response", () => {
      expect(storeOnLoginSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        msg: "Localized: uisdk.general.email",
      });
    });

    it("does not set a notification", () => {
      expect(setNotificationsState).toBeCalledTimes(0);
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith({
        msg: "Localized: uisdk.general.email",
      });
    });
  });

  describe("when the reset password request returns a response with error", () => {
    let caughtError;

    beforeEach(async () => {
      sendNewPasswordRequest.mockImplementation(() =>
        Promise.resolve({
          data: {
            "~error": "Test error",
            "~thread": {
              thid: "verifier-thread-id",
            },
            "@type": "fail",
          },
        }),
      );

      try {
        await handleSendNewPassword(newPassword);
      } catch (err) {
        caughtError = err;
      }
    });

    it("calls sendNewPaswordRequest with a correct parameter", () => {
      expect(sendNewPasswordRequest).toBeCalledTimes(1);
      expect(sendNewPasswordRequest).toBeCalledWith(newPassword);
    });

    it("does not call sendNewPasswordVerifier", () => {
      expect(sendNewPasswordVerifier).toBeCalledTimes(0);
    });

    it("does not store the response", () => {
      expect(storeOnLoginSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        "~error": "Test error",
        "~thread": {
          thid: "verifier-thread-id",
        },
        "@type": "fail",
      });
    });

    it("does not set a notification", () => {
      expect(setNotificationsState).toBeCalledTimes(0);
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith("Test error");
    });
  });

  describe("when the reset password request returns a response without thread ID", () => {
    let caughtError;

    beforeEach(async () => {
      sendNewPasswordRequest.mockImplementation(() =>
        Promise.resolve({
          data: {
            "@type": "fail",
          },
        }),
      );

      try {
        await handleSendNewPassword(newPassword);
      } catch (err) {
        caughtError = err;
      }
    });

    it("calls sendNewPaswordRequest with a correct parameter", () => {
      expect(sendNewPasswordRequest).toBeCalledTimes(1);
      expect(sendNewPasswordRequest).toBeCalledWith(newPassword);
    });

    it("does not call sendNewPasswordVerifier", () => {
      expect(sendNewPasswordVerifier).toBeCalledTimes(0);
    });

    it("does not store the response", () => {
      expect(storeOnLoginSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        msg: "Localized: uisdk.reset_password.missing_thid",
      });
    });

    it("does not set a notification", () => {
      expect(setNotificationsState).toBeCalledTimes(0);
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith({
        msg: "Localized: uisdk.reset_password.missing_thid",
      });
    });
  });

  describe("when the reset password request returns a response without data", () => {
    let caughtError;

    beforeEach(async () => {
      sendNewPasswordRequest.mockImplementation(() => Promise.resolve());

      try {
        await handleSendNewPassword(newPassword);
      } catch (err) {
        caughtError = err;
      }
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("calls sendNewPaswordRequest with a correct parameter", () => {
      expect(sendNewPasswordRequest).toBeCalledTimes(1);
      expect(sendNewPasswordRequest).toBeCalledWith(newPassword);
    });

    it("does not call sendNewPasswordVerifier", () => {
      expect(sendNewPasswordVerifier).toBeCalledTimes(0);
    });

    it("does not store the response", () => {
      expect(storeOnLoginSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        msg: "Localized: uisdk.reset_password.no_server_response",
      });
    });

    it("does not set a notification", () => {
      expect(setNotificationsState).toBeCalledTimes(0);
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith({
        msg: "Localized: uisdk.reset_password.no_server_response",
      });
    });
  });
});

describe("when the password is retrieved from a form", () => {
  const newPassword = null;
  let passwordEl;
  let confirmPasswordEl;
  let returnedValue;

  beforeEach(() => {
    passwordEl = document.createElement("input");
    confirmPasswordEl = document.createElement("input");
    document.querySelector.mockImplementation((selector) => {
      switch (selector) {
        case "#IKUISDK-new-password":
          return passwordEl;
        case "#IKUISDK-confirm-new-password":
          return confirmPasswordEl;
        default:
          return null;
      }
    });
  });

  describe("when passwords are empty", () => {
    let caughtError;

    beforeEach(async () => {
      try {
        await handleSendNewPassword(newPassword);
      } catch (err) {
        caughtError = err;
      }
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("does not call sendNewPaswordRequest", () => {
      expect(sendNewPasswordRequest).toBeCalledTimes(0);
    });

    it("does not call sendNewPasswordVerifier", () => {
      expect(sendNewPasswordVerifier).toBeCalledTimes(0);
    });

    it("does not store the response", () => {
      expect(storeOnLoginSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toBe("Localized: uisdk.reset_password.missing_new_password");
    });

    it("does not set a notification", () => {
      expect(setNotificationsState).toBeCalledTimes(0);
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith({
        msg: "Localized: uisdk.reset_password.missing_new_password",
      });
    });
  });

  describe("when password inputs can not be found", () => {
    let caughtError;

    beforeEach(async () => {
      document.querySelector.mockImplementation(() => null);

      try {
        await handleSendNewPassword(newPassword);
      } catch (err) {
        caughtError = err;
      }
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("does not call sendNewPaswordRequest", () => {
      expect(sendNewPasswordRequest).toBeCalledTimes(0);
    });

    it("does not call sendNewPasswordVerifier", () => {
      expect(sendNewPasswordVerifier).toBeCalledTimes(0);
    });

    it("does not store the response", () => {
      expect(storeOnLoginSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toBe("Localized: uisdk.reset_password.missing_new_password");
    });

    it("does not set a notification", () => {
      expect(setNotificationsState).toBeCalledTimes(0);
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith({
        msg: "Localized: uisdk.reset_password.missing_new_password",
      });
    });
  });

  describe("when passwords differ", () => {
    let caughtError;

    beforeEach(async () => {
      passwordEl.value = "password123";
      confirmPasswordEl.value = "password456";

      try {
        await handleSendNewPassword(newPassword);
      } catch (err) {
        caughtError = err;
      }
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("does not call sendNewPaswordRequest", () => {
      expect(sendNewPasswordRequest).toBeCalledTimes(0);
    });

    it("does not call sendNewPasswordVerifier", () => {
      expect(sendNewPasswordVerifier).toBeCalledTimes(0);
    });

    it("does not store the response", () => {
      expect(storeOnLoginSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toBe("Localized: uisdk.reset_password.missing_new_password");
    });

    it("does not set a notification", () => {
      expect(setNotificationsState).toBeCalledTimes(0);
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith({
        msg: "Localized: uisdk.reset_password.missing_new_password",
      });
    });
  });

  describe("when passwords are the same", () => {
    const passwordValue = "password123";
    let returnedValue;

    beforeEach(async () => {
      passwordEl.value = passwordValue;
      confirmPasswordEl.value = passwordValue;

      returnedValue = await handleSendNewPassword(newPassword);
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("class querySelector function", () => {
      expect(document.querySelector).toBeCalled();
    });

    it("calls sendNewPaswordRequest with a correct parameter", () => {
      expect(sendNewPasswordRequest).toBeCalledTimes(1);
      expect(sendNewPasswordRequest).toBeCalledWith(passwordValue);
    });

    it("calls sendNewPasswordVerifier with a correct parameter", () => {
      expect(sendNewPasswordVerifier).toBeCalledTimes(1);
      expect(sendNewPasswordVerifier).toBeCalledWith("verifier-thread-id");
    });

    it("stores the response", () => {
      expect(storeOnLoginSuccess).toBeCalledTimes(1);
      expect(storeOnLoginSuccess).toBeCalledWith({
        "@type": "success",
        sub: "user-id",
        token: "access-token",
      });
    });

    it("does not returns a value", () => {
      expect(returnedValue).toBeUndefined();
    });

    it("sets a notification", () => {
      expect(setNotificationsState).toBeCalledTimes(1);
      expect(setNotificationsState).toBeCalledWith({
        title: "Localized: uisdk.reset_password.success_message",
        type: "success",
      });
    });

    it("changes the location", () => {
      expect(window.location).toEqual({
        ...windowLocationMock,
        href: "https://example.com/login",
      });
    });
  });
});
