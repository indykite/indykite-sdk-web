const { setCv, setFPThreadId } = require("../../storage");
const { getCodeVerifierAndChallenge } = require("../../../utils/crypto");
const { getApplicationId, getBaseUri } = require("../../config");
const { sendRequest } = require("../../../utils/helpers");
const setNewPasswordSetupRequest = require("../setNewPasswordSetupRequest");

jest.mock("../../storage");
jest.mock("../../../utils/crypto");
jest.mock("../../config");
jest.mock("../../../utils/helpers");

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
    applicationId: "123",
  },
};

const dataFields = [];

beforeEach(() => {
  jest.resetAllMocks();
  getCodeVerifierAndChallenge.mockImplementation(() => ({
    codeVerifier: "code-verifier",
    codeChallenge: "code-challenge",
  }));
  sendRequest.mockImplementation(() =>
    Promise.resolve({
      data: {
        "~thread": {
          thid: "thread-id",
        },
        "@type": "form",
        fields: dataFields,
      },
    }),
  );

  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe("when token is provided", () => {
  const token = "token";

  describe("when sendRequest returns a list of form fields", () => {
    let returnedValue;

    beforeEach(async () => {
      returnedValue = await setNewPasswordSetupRequest(token);
    });

    it("sets forgotten password thread ID", () => {
      expect(setFPThreadId).toBeCalledTimes(1);
      expect(setFPThreadId).toBeCalledWith("thread-id");
    });

    it("sets code verifier", () => {
      expect(setCv).toBeCalledTimes(1);
      expect(setCv).toBeCalledWith("code-verifier");
    });

    it("returns a correct value", () => {
      expect(returnedValue).toBe(dataFields);
    });

    it("does not print anything into the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when sendRequest returns a 'fail' type response", () => {
    let caughtError;

    beforeEach(async () => {
      sendRequest.mockImplementation(() =>
        Promise.resolve({
          data: {
            "~thread": {
              thid: "thread-id",
            },
            "@type": "fail",
          },
        }),
      );

      try {
        await setNewPasswordSetupRequest(token);
      } catch (err) {
        caughtError = err;
      }
    });

    it("sets forgotten password thread ID", () => {
      expect(setFPThreadId).toBeCalledTimes(1);
      expect(setFPThreadId).toBeCalledWith("thread-id");
    });

    it("sets code verifier", () => {
      expect(setCv).toBeCalledTimes(1);
      expect(setCv).toBeCalledWith("code-verifier");
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        "~error": {
          msg: "Backend is not configured correctly.",
        },
      });
    });

    it("does not print anything into the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when sendRequest does not return thread ID", () => {
    let caughtError;

    beforeEach(async () => {
      sendRequest.mockImplementation(() =>
        Promise.resolve({
          data: {
            "@type": "fail",
          },
        }),
      );

      try {
        await setNewPasswordSetupRequest(token);
      } catch (err) {
        caughtError = err;
      }
    });

    it("does not set forgotten password thread ID", () => {
      expect(setFPThreadId).toBeCalledTimes(0);
    });

    it("does not set code verifier", () => {
      expect(setCv).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        msg:
          "No thread information recieved from server when sending set new password pre request.",
      });
    });

    it("prints an error into the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith("IKUISDK Failed with set new password pre-request.");
    });
  });

  describe("when sendRequest response contains an error", () => {
    let caughtError;

    beforeEach(async () => {
      sendRequest.mockImplementation(() =>
        Promise.resolve({
          data: {
            "~error": {
              msg: "Test error",
            },
            "@type": "fail",
          },
        }),
      );

      try {
        await setNewPasswordSetupRequest(token);
      } catch (err) {
        caughtError = err;
      }
    });

    it("does not set forgotten password thread ID", () => {
      expect(setFPThreadId).toBeCalledTimes(0);
    });

    it("does not set code verifier", () => {
      expect(setCv).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        "~error": {
          msg: "Test error",
        },
        "@type": "fail",
      });
    });

    it("prints an error into the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith("IKUISDK Failed with set new password pre-request.");
    });
  });

  describe("when sendRequest response contains no data", () => {
    let caughtError;

    beforeEach(async () => {
      sendRequest.mockImplementation(() => Promise.resolve());

      try {
        await setNewPasswordSetupRequest(token);
      } catch (err) {
        caughtError = err;
      }
    });

    it("does not set forgotten password thread ID", () => {
      expect(setFPThreadId).toBeCalledTimes(0);
    });

    it("does not set code verifier", () => {
      expect(setCv).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        msg: "No data resposne from server when sending set new password pre request.",
      });
    });

    it("does not print anything into the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });
});

describe("when token is not set", () => {
  let caughtError;

  beforeEach(async () => {
    try {
      await setNewPasswordSetupRequest();
    } catch (err) {
      caughtError = err;
    }
  });

  it("does not set forgotten password thread ID", () => {
    expect(setFPThreadId).toBeCalledTimes(0);
  });

  it("does not set code verifier", () => {
    expect(setCv).toBeCalledTimes(0);
  });

  it("throws an error", () => {
    expect(caughtError).toEqual({
      msg: "Reference id token not provided.",
    });
  });

  it("does not print anything into the console", () => {
    expect(console.error).toBeCalledTimes(0);
  });
});
