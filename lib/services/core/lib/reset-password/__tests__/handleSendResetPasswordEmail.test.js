const { getLocalizedMessage } = require("../../../lib/locale-provider");
const { cleanError, handleError } = require("../../notifications");
const handleSendResetPasswordEmail = require("../handleSendResetPasswordEmail");
const sendResetEmailRequest = require("../sendResetEmailRequest");
const handleForgottenPasswordTypeEmailSuccess = require("../handleForgottenPasswordTypeEmailSuccess");

jest.mock("../../../lib/locale-provider");
jest.mock("../../notifications");
jest.mock("../sendResetEmailRequest");
jest.mock("../handleForgottenPasswordTypeEmailSuccess");

let emailEl;

beforeEach(() => {
  jest.resetAllMocks();

  sendResetEmailRequest.mockImplementation(() =>
    Promise.resolve({
      data: {
        "@type": "success",
      },
    }),
  );

  getLocalizedMessage.mockImplementation((key, values) => {
    const stringifiedValues = values ? JSON.stringify(values) : "";
    return `Localized: ${key} ${stringifiedValues}`.trim();
  });

  emailEl = document.createElement("input");
  emailEl.value = "another.email@example.com";
  jest.spyOn(document, "querySelector").mockImplementation((selector) => {
    return selector === "#IKUISDK-reset-password-email" ? emailEl : null;
  });

  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  document.querySelector.mockRestore();
  console.error.mockRestore();
});

describe("when the new password is passed via parameter", () => {
  const emailAddress = "email@example.com";

  describe("when the send reset password request returns 'success' response", () => {
    let returnedValue;

    beforeEach(async () => {
      returnedValue = await handleSendResetPasswordEmail(emailAddress);
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("calls sendResetEmailRequest with a correct parameter", () => {
      expect(sendResetEmailRequest).toBeCalledTimes(1);
      expect(sendResetEmailRequest).toBeCalledWith(emailAddress);
    });

    it("handles the success response", () => {
      expect(handleForgottenPasswordTypeEmailSuccess).toBeCalledTimes(1);
      expect(handleForgottenPasswordTypeEmailSuccess).toBeCalledWith(
        "Localized: uisdk.reset_password.email_send",
      );
    });

    it("returns a correct value", () => {
      expect(returnedValue).toEqual({
        "@type": "success",
      });
    });

    it("does not handle an error", () => {
      expect(handleError).toBeCalledTimes(0);
    });

    it("does not print anything to the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when the send reset password request returns 'unknown' response", () => {
    let returnedValue;

    beforeEach(async () => {
      sendResetEmailRequest.mockImplementation(() =>
        Promise.resolve({
          data: {
            "@type": "unknown",
          },
        }),
      );

      returnedValue = await handleSendResetPasswordEmail(emailAddress);
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("calls sendResetEmailRequest with a correct parameter", () => {
      expect(sendResetEmailRequest).toBeCalledTimes(1);
      expect(sendResetEmailRequest).toBeCalledWith(emailAddress);
    });

    it("does not handle the success response", () => {
      expect(handleForgottenPasswordTypeEmailSuccess).toBeCalledTimes(0);
    });

    it("returns a correct value", () => {
      expect(returnedValue).toEqual({
        "@type": "unknown",
      });
    });

    it("does not handle an error", () => {
      expect(handleError).toBeCalledTimes(0);
    });

    it("does not print anything to the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when the send reset password request returns 'fail' response", () => {
    let caughtError;

    beforeEach(async () => {
      sendResetEmailRequest.mockImplementation(() =>
        Promise.resolve({
          data: {
            "@type": "fail",
          },
        }),
      );

      try {
        await handleSendResetPasswordEmail(emailAddress);
      } catch (err) {
        caughtError = err;
      }
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("calls sendResetEmailRequest with a correct parameter", () => {
      expect(sendResetEmailRequest).toBeCalledTimes(1);
      expect(sendResetEmailRequest).toBeCalledWith(emailAddress);
    });

    it("does not handle the success response", () => {
      expect(handleForgottenPasswordTypeEmailSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        msg: "Localized: uisdk.general.error",
      });
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith({
        msg: "Localized: uisdk.general.error",
      });
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith({
        msg: "Localized: uisdk.general.error",
      });
    });
  });

  describe("when the send reset password request returns an error", () => {
    let caughtError;

    beforeEach(async () => {
      sendResetEmailRequest.mockImplementation(() =>
        Promise.resolve({
          data: {
            "@type": "fail",
            "~error": "Test error",
          },
        }),
      );

      try {
        await handleSendResetPasswordEmail(emailAddress);
      } catch (err) {
        caughtError = err;
      }
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("calls sendResetEmailRequest with a correct parameter", () => {
      expect(sendResetEmailRequest).toBeCalledTimes(1);
      expect(sendResetEmailRequest).toBeCalledWith(emailAddress);
    });

    it("does not handle the success response", () => {
      expect(handleForgottenPasswordTypeEmailSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual("Test error");
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith("Test error");
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith("Test error");
    });
  });

  describe("when the send reset password request returns no data", () => {
    let caughtError;

    beforeEach(async () => {
      sendResetEmailRequest.mockImplementation(() => {});

      try {
        await handleSendResetPasswordEmail(emailAddress);
      } catch (err) {
        caughtError = err;
      }
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("calls sendResetEmailRequest with a correct parameter", () => {
      expect(sendResetEmailRequest).toBeCalledTimes(1);
      expect(sendResetEmailRequest).toBeCalledWith(emailAddress);
    });

    it("does not handle the success response", () => {
      expect(handleForgottenPasswordTypeEmailSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        msg: "Localized: uisdk.reset_password.no_server_response",
      });
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith({
        msg: "Localized: uisdk.reset_password.no_server_response",
      });
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith({
        msg: "Localized: uisdk.reset_password.no_server_response",
      });
    });
  });
});

describe("when the new password is retrieved from a form", () => {
  const emailAddress = null;

  describe("when the input field is empty", () => {
    let caughtError;

    beforeEach(async () => {
      emailEl.value = "";

      try {
        await handleSendResetPasswordEmail(emailAddress);
      } catch (err) {
        caughtError = err;
      }
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("does not call sendResetEmailRequest", () => {
      expect(sendResetEmailRequest).toBeCalledTimes(0);
    });

    it("does not handle the success response", () => {
      expect(handleForgottenPasswordTypeEmailSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual("Localized: uisdk.reset_password.missing_email");
    });

    it("handles the error", () => {
      expect(handleError).toBeCalledTimes(1);
      expect(handleError).toBeCalledWith({
        msg: "Localized: uisdk.reset_password.missing_email",
      });
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith("Localized: uisdk.reset_password.missing_email");
    });
  });

  describe("when the input field does not exist", () => {
    let caughtError;

    beforeEach(async () => {
      document.querySelector.mockImplementation(() => null);

      try {
        await handleSendResetPasswordEmail(emailAddress);
      } catch (err) {
        caughtError = err;
      }
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("does not call sendResetEmailRequest", () => {
      expect(sendResetEmailRequest).toBeCalledTimes(0);
    });

    it("does not handle the success response", () => {
      expect(handleForgottenPasswordTypeEmailSuccess).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual("No reset password input found.");
    });

    it("does not handle the error", () => {
      expect(handleError).toBeCalledTimes(0);
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith("No reset password input found.");
    });
  });

  describe("when the value in the input is defined", () => {
    let returnedValue;

    beforeEach(async () => {
      returnedValue = await handleSendResetPasswordEmail(emailAddress);
    });

    it("cleans notification error", () => {
      expect(cleanError).toBeCalledTimes(1);
    });

    it("calls sendResetEmailRequest with a correct parameter", () => {
      expect(sendResetEmailRequest).toBeCalledTimes(1);
      expect(sendResetEmailRequest).toBeCalledWith("another.email@example.com");
    });

    it("handles the success response", () => {
      expect(handleForgottenPasswordTypeEmailSuccess).toBeCalledTimes(1);
      expect(handleForgottenPasswordTypeEmailSuccess).toBeCalledWith(
        "Localized: uisdk.reset_password.email_send",
      );
    });

    it("returns a correct value", () => {
      expect(returnedValue).toEqual({
        "@type": "success",
      });
    });

    it("does not handle an error", () => {
      expect(handleError).toBeCalledTimes(0);
    });

    it("does not print anything to the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });
});
