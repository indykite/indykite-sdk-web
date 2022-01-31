const { loginFormSetupRequest } = require("../../login");
const handleSendResetPasswordEmail = require("../handleSendResetPasswordEmail");
const forgotPasswordSetupRequest = require("../forgotPasswordSetupRequest");
const sendResetPasswordEmail = require("../sendResetPasswordEmail");

jest.mock("../../login");
jest.mock("../handleSendResetPasswordEmail");
jest.mock("../forgotPasswordSetupRequest");

window.IKSDK = {
  config: {
    applicationId: "42",
    baseUri: "https://example.com",
  },
};

const formFields = [];

beforeEach(() => {
  jest.resetAllMocks();
  forgotPasswordSetupRequest.mockImplementation(() => Promise.resolve(formFields));
  handleSendResetPasswordEmail.mockImplementation(() =>
    Promise.resolve({
      "@type": "success",
    }),
  );
  loginFormSetupRequest.mockImplementation(() => Promise.resolve());
});

describe("when forgotPasswordSetupRequest returns form fields", () => {
  describe("when the email is successfully sent", () => {
    let returnedValue;

    beforeEach(async () => {
      returnedValue = await sendResetPasswordEmail("user@example.com");
    });

    it("calls forgotPasswordSetupRequest function", () => {
      expect(forgotPasswordSetupRequest).toBeCalledTimes(1);
    });

    it("passes the email to the handleSendResetPasswordEmail function", () => {
      expect(handleSendResetPasswordEmail).toBeCalledTimes(1);
      expect(handleSendResetPasswordEmail).toBeCalledWith("user@example.com");
    });

    it("does not call loginFormSetupRequest", () => {
      expect(loginFormSetupRequest).toBeCalledTimes(0);
    });

    it("returns a correct value", () => {
      expect(returnedValue).toEqual({
        "@type": "success",
      });
    });
  });

  describe("when the email send fails after first try", () => {
    let returnedValue;

    beforeEach(async () => {
      handleSendResetPasswordEmail.mockImplementationOnce(() => Promise.reject(new Error()));
      handleSendResetPasswordEmail.mockImplementationOnce(() =>
        Promise.resolve({
          "@type": "success",
        }),
      );

      returnedValue = await sendResetPasswordEmail("user@example.com");
    });

    it("calls forgotPasswordSetupRequest function", () => {
      expect(forgotPasswordSetupRequest).toBeCalledTimes(2);
    });

    it("passes the email to the handleSendResetPasswordEmail function", () => {
      expect(handleSendResetPasswordEmail).toBeCalledTimes(2);
      expect(handleSendResetPasswordEmail).toHaveBeenNthCalledWith(1, "user@example.com");
      expect(handleSendResetPasswordEmail).toHaveBeenNthCalledWith(2, "user@example.com");
    });

    it("calls loginFormSetupRequest", () => {
      expect(loginFormSetupRequest).toBeCalledTimes(1);
      expect(loginFormSetupRequest).toBeCalledWith(window.IKSDK.config);
    });

    it("returns a correct value", () => {
      expect(returnedValue).toEqual({
        "@type": "success",
      });
    });
  });

  describe("when the email send fail after second try", () => {
    let caughtError;

    beforeEach(async () => {
      handleSendResetPasswordEmail.mockImplementationOnce(() =>
        Promise.reject(new Error("Test error #1")),
      );
      handleSendResetPasswordEmail.mockImplementationOnce(() =>
        Promise.reject(new Error("Test error #2")),
      );

      try {
        await sendResetPasswordEmail("user@example.com");
      } catch (err) {
        caughtError = err;
      }
    });

    it("calls forgotPasswordSetupRequest function", () => {
      expect(forgotPasswordSetupRequest).toBeCalledTimes(2);
    });

    it("passes the email to the handleSendResetPasswordEmail function", () => {
      expect(handleSendResetPasswordEmail).toBeCalledTimes(2);
      expect(handleSendResetPasswordEmail).toHaveBeenNthCalledWith(1, "user@example.com");
      expect(handleSendResetPasswordEmail).toHaveBeenNthCalledWith(2, "user@example.com");
    });

    it("calls loginFormSetupRequest", () => {
      expect(loginFormSetupRequest).toBeCalledTimes(1);
      expect(loginFormSetupRequest).toBeCalledWith(window.IKSDK.config);
    });

    it("throws an error", () => {
      expect(caughtError.message).toBe("Test error #2");
    });
  });

  describe("when loginFormSetupRequest throws an error", () => {
    let caughtError;

    beforeEach(async () => {
      handleSendResetPasswordEmail.mockImplementationOnce(() => Promise.reject(new Error()));
      handleSendResetPasswordEmail.mockImplementationOnce(() =>
        Promise.resolve({
          "@type": "success",
        }),
      );
      loginFormSetupRequest.mockImplementation(() => Promise.reject(new Error("Test error")));

      try {
        await sendResetPasswordEmail("user@example.com");
      } catch (err) {
        caughtError = err;
      }
    });

    it("calls forgotPasswordSetupRequest function", () => {
      expect(forgotPasswordSetupRequest).toBeCalledTimes(1);
    });

    it("passes the email to the handleSendResetPasswordEmail function", () => {
      expect(handleSendResetPasswordEmail).toBeCalledTimes(1);
      expect(handleSendResetPasswordEmail).toHaveBeenCalledWith("user@example.com");
    });

    it("calls loginFormSetupRequest", () => {
      expect(loginFormSetupRequest).toBeCalledTimes(1);
      expect(loginFormSetupRequest).toBeCalledWith(window.IKSDK.config);
    });

    it("throws an error", () => {
      expect(caughtError.message).toBe("Test error");
    });
  });
});

describe("when forgotPasswordSetupRequest fails after first try", () => {
  let returnedValue;

  beforeEach(async () => {
    forgotPasswordSetupRequest.mockImplementationOnce(() => Promise.reject(new Error()));
    forgotPasswordSetupRequest.mockImplementationOnce(() => Promise.resolve(formFields));

    returnedValue = await sendResetPasswordEmail("user@example.com");
  });

  it("calls forgotPasswordSetupRequest function", () => {
    expect(forgotPasswordSetupRequest).toBeCalledTimes(2);
  });

  it("passes the email to the handleSendResetPasswordEmail function", () => {
    expect(handleSendResetPasswordEmail).toBeCalledTimes(1);
    expect(handleSendResetPasswordEmail).toHaveBeenCalledWith("user@example.com");
  });

  it("calls loginFormSetupRequest", () => {
    expect(loginFormSetupRequest).toBeCalledTimes(1);
    expect(loginFormSetupRequest).toBeCalledWith(window.IKSDK.config);
  });

  it("returns a correct value", () => {
    expect(returnedValue).toEqual({
      "@type": "success",
    });
  });
});

describe("when the email send fail after second try", () => {
  let caughtError;

  beforeEach(async () => {
    forgotPasswordSetupRequest.mockImplementationOnce(() =>
      Promise.reject(new Error("Test error #1")),
    );
    forgotPasswordSetupRequest.mockImplementationOnce(() =>
      Promise.reject(new Error("Test error #2")),
    );

    try {
      await sendResetPasswordEmail("user@example.com");
    } catch (err) {
      caughtError = err;
    }
  });

  it("calls forgotPasswordSetupRequest function", () => {
    expect(forgotPasswordSetupRequest).toBeCalledTimes(2);
  });

  it("passes the email to the handleSendResetPasswordEmail function", () => {
    expect(handleSendResetPasswordEmail).toBeCalledTimes(0);
  });

  it("calls loginFormSetupRequest", () => {
    expect(loginFormSetupRequest).toBeCalledTimes(1);
    expect(loginFormSetupRequest).toBeCalledWith(window.IKSDK.config);
  });

  it("throws an error", () => {
    expect(caughtError.message).toBe("Test error #2");
  });
});
