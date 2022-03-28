const { getThreadId, setFPThreadId, getPendingResponse } = require("../../storage");
const { sendRequest } = require("../../../utils/helpers");
const forgotPasswordSetupRequest = require("../forgotPasswordSetupRequest");

jest.mock("../../storage");
jest.mock("../../../utils/helpers");

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
    applicationId: "357",
  },
};

beforeEach(() => {
  jest.resetAllMocks();
  getThreadId.mockImplementation(() => "stored-thread-id");
  sessionStorage.clear();
  sessionStorage.setItem("@indykite/actionsId", "action-id");
  jest.spyOn(console, "debug").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.debug.mockRestore();
  console.error.mockRestore();
});

describe("when request returns a correct response", () => {
  const dataFields = [];
  let returnedValue;

  beforeEach(() => {
    sendRequest.mockImplementation(() =>
      Promise.resolve({
        data: {
          "~thread": {
            thid: "new-thread-id",
          },
          "@type": "form",
          fields: dataFields,
        },
      }),
    );
  });

  describe("when there is no pending response", () => {
    beforeEach(async () => {
      returnedValue = await forgotPasswordSetupRequest();
    });

    it("sends a correct request", () => {
      expect(sendRequest).toBeCalledTimes(1);
      expect(sendRequest).toBeCalledWith(
        "https://example.com/auth/357",
        "POST",
        {
          "@id": "action-id",
          "@type": "action",
          action: "forgotten",
          "~thread": {
            thid: "stored-thread-id",
          },
        },
        {
          actionName: "forgot-password-request",
        },
      );
    });

    it("sets forgotten password thread ID", () => {
      expect(setFPThreadId).toBeCalledTimes(1);
      expect(setFPThreadId).toBeCalledWith("new-thread-id");
    });

    it("returns a correct value", () => {
      expect(returnedValue).toBe(dataFields);
    });

    it("does not print anything into console", () => {
      expect(console.debug).toBeCalledTimes(0);
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when there is a pending response", () => {
    beforeEach(async () => {
      getPendingResponse.mockImplementation(() => ({
        "~thread": {
          thid: "new-thread-id",
        },
        "@type": "form",
        fields: dataFields,
      }));

      returnedValue = await forgotPasswordSetupRequest();
    });

    it("does not send any request", () => {
      expect(sendRequest).toBeCalledTimes(0);
    });

    it("sets forgotten password thread ID", () => {
      expect(setFPThreadId).toBeCalledTimes(1);
      expect(setFPThreadId).toBeCalledWith("new-thread-id");
    });

    it("returns a correct value", () => {
      expect(returnedValue).toBe(dataFields);
    });

    it("does not print anything into console", () => {
      expect(console.debug).toBeCalledTimes(0);
      expect(console.error).toBeCalledTimes(0);
    });
  });
});

describe("when request does not return 'form' type", () => {
  let caughtError;

  beforeEach(async () => {
    sendRequest.mockImplementation(() =>
      Promise.resolve({
        data: {
          "~thread": {
            thid: "new-thread-id",
          },
          "@type": "fail",
        },
      }),
    );

    try {
      await forgotPasswordSetupRequest();
    } catch (err) {
      caughtError = err;
    }
  });

  it("sets forgotten password thread ID", () => {
    expect(setFPThreadId).toBeCalledTimes(1);
    expect(setFPThreadId).toBeCalledWith("new-thread-id");
  });

  it("throws an error", () => {
    expect(caughtError).toEqual(new Error("IKUISDK Received incorrect data type."));
  });

  it("does not print anything into console", () => {
    expect(console.debug).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });
});

describe("when request does not return thread ID", () => {
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
      await forgotPasswordSetupRequest();
    } catch (err) {
      caughtError = err;
    }
  });

  it("does not set forgotten password thread ID", () => {
    expect(setFPThreadId).toBeCalledTimes(0);
  });

  it("throws an error", () => {
    expect(caughtError).toEqual(
      new Error(
        "No thread information recieved from server on forgot password set up request. Please go back to login and try again.",
      ),
    );
  });

  it("does not print anything into console", () => {
    expect(console.debug).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });
});

describe("when request does not return any data", () => {
  let caughtError;

  beforeEach(async () => {
    sendRequest.mockImplementation(() => Promise.resolve({}));

    try {
      await forgotPasswordSetupRequest();
    } catch (err) {
      caughtError = err;
    }
  });

  it("does not set forgotten password thread ID", () => {
    expect(setFPThreadId).toBeCalledTimes(0);
  });

  it("throws an error", () => {
    expect(caughtError).toEqual(
      new Error("No data response from server when getting forgotten password input step 1."),
    );
  });

  it("does not print anything into console", () => {
    expect(console.debug).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });
});

describe("when request throws an error", () => {
  const error = new Error("Test error");
  error.name = "Error name";
  let caughtError;

  beforeEach(async () => {
    sendRequest.mockImplementation(() => Promise.reject(error));

    try {
      await forgotPasswordSetupRequest();
    } catch (err) {
      caughtError = err;
    }
  });

  it("does not set forgotten password thread ID", () => {
    expect(setFPThreadId).toBeCalledTimes(0);
  });

  it("throws an error", () => {
    expect(caughtError).toBe(error);
  });

  it("prints the error into console", () => {
    expect(console.debug).toBeCalledTimes(1);
    expect(console.debug).toBeCalledWith(error);
    expect(console.error).toBeCalledTimes(1);
    expect(console.error).toBeCalledWith(
      "Error name",
      "IKUISDK Failed with forgot password flow step 1 pre-request.",
    );
  });
});
