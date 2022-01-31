const setNewPasswordSetupRequest = require("../setNewPasswordSetupRequest");
const handleSendNewPassword = require("../handleSendNewPassword");
const sendNewPassword = require("../sendNewPassword");

jest.mock("../setNewPasswordSetupRequest");
jest.mock("../handleSendNewPassword");

const referenceId = "reference-id";
const newPassword = "new-password";

beforeEach(() => {
  jest.resetAllMocks();
  setNewPasswordSetupRequest.mockImplementation(() => Promise.resolve());
  handleSendNewPassword.mockImplementation(() =>
    Promise.resolve({
      "@type": "success",
      sub: "user-id",
      token: "access-token",
    }),
  );
});

describe("when setNewPasswordSetupRequest returns form fields", () => {
  describe("when handleSendNewPassword returns an access token", () => {
    let returnedValue;

    beforeEach(async () => {
      returnedValue = await sendNewPassword(referenceId, newPassword);
    });

    it("passes a correct argument to setNewPasswordSetupRequest function", () => {
      expect(setNewPasswordSetupRequest).toBeCalledTimes(1);
      expect(setNewPasswordSetupRequest).toBeCalledWith(referenceId);
    });

    it("passes a correct argument to handleSendNewPassword function", () => {
      expect(handleSendNewPassword).toBeCalledTimes(1);
      expect(handleSendNewPassword).toBeCalledWith(newPassword);
    });

    it("returns a correct value", () => {
      expect(returnedValue).toEqual({
        "@type": "success",
        sub: "user-id",
        token: "access-token",
      });
    });
  });

  describe("when handleSendNewPassword throws an error", () => {
    const error = new Error("Test error");
    let caughtError;

    beforeEach(async () => {
      handleSendNewPassword.mockImplementation(() => Promise.reject(error));

      try {
        await sendNewPassword(referenceId, newPassword);
      } catch (err) {
        caughtError = err;
      }
    });

    it("passes a correct argument to setNewPasswordSetupRequest function", () => {
      expect(setNewPasswordSetupRequest).toBeCalledTimes(1);
      expect(setNewPasswordSetupRequest).toBeCalledWith(referenceId);
    });

    it("passes a correct argument to handleSendNewPassword function", () => {
      expect(handleSendNewPassword).toBeCalledTimes(1);
      expect(handleSendNewPassword).toBeCalledWith(newPassword);
    });

    it("throws the error", () => {
      expect(caughtError).toBe(error);
    });
  });
});

describe("when setNewPasswordSetupRequest throws an error", () => {
  const error = new Error("Test error");
  let caughtError;

  beforeEach(async () => {
    setNewPasswordSetupRequest.mockImplementation(() => Promise.reject(error));

    try {
      await sendNewPassword(referenceId, newPassword);
    } catch (err) {
      caughtError = err;
    }
  });

  it("passes a correct argument to setNewPasswordSetupRequest function", () => {
    expect(setNewPasswordSetupRequest).toBeCalledTimes(1);
    expect(setNewPasswordSetupRequest).toBeCalledWith(referenceId);
  });

  it("does not call handleSendNewPassword function", () => {
    expect(handleSendNewPassword).toBeCalledTimes(0);
  });

  it("throws the error", () => {
    expect(caughtError).toBe(error);
  });
});
