const { logoutUser, logoutAllUsers } = require("../logout");
const refresh = require("../refresh");
const storage = require("../storage");
const { sendRequest } = require("../../utils/helpers");
const { getBaseUri } = require("../config");

jest.mock("../refresh");
jest.mock("../storage");
jest.mock("../../utils/helpers", () => {
  const originalModule = jest.requireActual("../../utils/helpers");
  return {
    ...originalModule,
    sendRequest: jest.fn(),
  };
});
jest.mock("../config");

const mockedAuthUrl = "https://www.something.com";

beforeAll(() => {
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  jest.resetAllMocks();
  storage.getRefreshToken.mockImplementation(() => "refresh-token");
  sendRequest.mockImplementation(() => {
    return Promise.resolve();
  });
  getBaseUri.mockImplementation(() => mockedAuthUrl);
});

afterEach(() => {
  sendRequest.mockRestore();
});

afterAll(() => {
  console.error.mockRestore();
  console.debug.mockRestore();
});

describe("logoutUser", () => {
  const userId = "132";

  describe("when user has an accessToken", () => {
    let returnedValue;

    beforeEach(async () => {
      refresh.getValidAccessToken.mockImplementation(() => Promise.resolve("access-token"));

      returnedValue = await logoutUser(userId);
    });

    it("send a correct request", () => {
      expect(sendRequest).toBeCalledTimes(1);
      expect(sendRequest.mock.calls[0]).toEqual([
        `${mockedAuthUrl}/identity/self-service/terminate-session`,
        "POST", {
          refreshToken: "refresh-token"
        }, {
          actionName: "logout",
          headers: {
            authorization: "Bearer access-token"
          }
        },
      ]);
    });

    it("removes the tokens from local database", () => {
      expect(storage.removeUserTokens).toBeCalledTimes(1);
      expect(storage.removeUserTokens.mock.calls[0]).toEqual([userId]);
    });

    it("returns a correct value", () => {
      expect(returnedValue).toBe(true);
    });
  });

  describe("when user does not have an accessToken", () => {
    const error = new Error("No access token");
    let returnedValue;

    beforeEach(async () => {
      refresh.getValidAccessToken.mockImplementation(() => Promise.reject(error));

      returnedValue = await logoutUser(userId);
    });

    it("does not send a request", () => {
      expect(sendRequest).toBeCalledTimes(0);
    });

    it("does not remove tokens from local database", () => {
      expect(storage.removeUserTokens).toBeCalledTimes(0);
    });

    it("returns the error", () => {
      expect(returnedValue).toBe(error);
    });
  });

  describe("when user does not have neither accessToken nor refresh token", () => {
    const error = new Error("No access token");
    let returnedValue;

    beforeEach(async () => {
      refresh.getValidAccessToken.mockImplementation(() => Promise.resolve(""));
      storage.getRefreshToken.mockImplementation(() => Promise.resolve(""));

      returnedValue = await logoutUser(userId);
    });

    it("does not send a request", () => {
      expect(sendRequest).toBeCalledTimes(0);
    });

    it("does not remove tokens from local database", () => {
      expect(storage.removeUserTokens).toBeCalledTimes(0);
    });

    it("prints the error to the console", () => {
      expect(console.error).toBeCalledTimes(2);
      expect(console.error.mock.calls[0]).toEqual(["Neither accessToken or refreshToken was found.", "IKUISDK Failed to refresh the session"]);
      expect(console.error.mock.calls[1][0].message).toBe("Neither accessToken or refreshToken was found.");
    });

    it("returns an error", () => {
      expect(returnedValue.message).toBe("Neither accessToken or refreshToken was found.");
    });
  });

  describe("when sendRequest throws an error", () => {
    const error = {
      name: "Test error",
      response: {
        status: 500,
        data: {},
      },
    };
    let returnedValue;

    beforeEach(async () => {
      refresh.getValidAccessToken.mockImplementation(() => Promise.resolve("access-token"));
      sendRequest.mockImplementation(() => Promise.reject(error));

      returnedValue = await logoutUser(userId);
    });

    it("removes the tokens from local database", () => {
      expect(storage.removeUserTokens).toBeCalledTimes(1);
      expect(storage.removeUserTokens.mock.calls[0]).toEqual([userId]);
    });

    it("returns the error", () => {
      expect(returnedValue).toBe(error);
    });

    it("prints the error to the console", () => {
      expect(console.debug).toBeCalledTimes(1);
      expect(console.debug.mock.calls[0]).toEqual([error]);
      expect(console.error).toBeCalledTimes(2);
      expect(console.error.mock.calls[0]).toEqual([error.name, "Failed to terminate session", error.response.status, error.response.data]);
      expect(console.error.mock.calls[1]).toEqual([error]);
    });
  });
});

describe("logoutAllUsers", () => {
  beforeEach(() => {
    storage.getAllUserTokens.mockImplementation(() => Promise.resolve({
      "user-id-1": {
        accessToken: "access-token-1",
        refreshToken: "refresh-token-1",
      },
      "user-id-2": {
        accessToken: "access-token-2",
        refreshToken: "refresh-token-2",
      },
    }));
  });

  describe("when all users have an access token", () => {
    let returnedValue;

    beforeEach(async () => {
      returnedValue = await logoutAllUsers();
    });

    it("send a correct request", () => {
      expect(sendRequest).toBeCalledTimes(2);
      expect(sendRequest.mock.calls[0]).toEqual([
        `${mockedAuthUrl}/identity/self-service/terminate-session`,
        "POST", {
          refreshToken: "refresh-token-1"
        }, {
          actionName: "logout",
          headers: {
            authorization: "Bearer access-token-1"
          }
        },
      ]);
      expect(sendRequest.mock.calls[1]).toEqual([
        `${mockedAuthUrl}/identity/self-service/terminate-session`,
        "POST", {
          refreshToken: "refresh-token-2"
        }, {
          actionName: "logout",
          headers: {
            authorization: "Bearer access-token-2"
          }
        },
      ]);
    });

    it("removes the tokens from local database", () => {
      expect(storage.removeUserTokens).toBeCalledTimes(2);
      expect(storage.removeUserTokens.mock.calls[0]).toEqual(["user-id-1"]);
      expect(storage.removeUserTokens.mock.calls[1]).toEqual(["user-id-2"]);
    });

    it("returns a correct value", () => {
      expect(returnedValue).toEqual({
        "user-id-1": true,
        "user-id-2": true,
      });
    });
  });

  describe("when sendRequest throws an error", () => {
    const error = {
      name: "Test error",
      response: {
        status: 500,
        data: {},
      },
    };
    let returnedValue;

    beforeEach(async () => {
      sendRequest.mockImplementation(() => Promise.reject(error));

      returnedValue = await logoutAllUsers();
    });

    it("removes the tokens from local database", () => {
      expect(storage.removeUserTokens).toBeCalledTimes(2);
      expect(storage.removeUserTokens.mock.calls[0]).toEqual(["user-id-1"]);
      expect(storage.removeUserTokens.mock.calls[1]).toEqual(["user-id-2"]);
    });

    it("returns empty results", () => {
      expect(returnedValue).toEqual({});
    });

    it("prints the error to the console", () => {
      expect(console.debug).toBeCalledTimes(2);
      expect(console.debug.mock.calls[0]).toEqual([error]);
      expect(console.debug.mock.calls[1]).toEqual([error]);
      expect(console.error).toBeCalledTimes(2);
      expect(console.error.mock.calls[0]).toEqual([error.name, "Failed to terminate session", error.response.status, error.response.data]);
      expect(console.error.mock.calls[1]).toEqual([error.name, "Failed to terminate session", error.response.status, error.response.data]);
    });
  });

  describe("when getAllUserTokens throws an error", () => {
    const error = new Error("Test error");
    let returnedValue;

    beforeEach(async () => {
      storage.getAllUserTokens.mockImplementation(() => Promise.reject(error));

      returnedValue = await logoutAllUsers();
    });

    it("does not remove the tokens from local database", () => {
      expect(storage.removeUserTokens).toBeCalledTimes(0);
    });

    it("returns the error", () => {
      expect(returnedValue).toBe(error);
    });

    it("prints the error to the console", () => {
      expect(console.debug).toBeCalledTimes(0);
      expect(console.error).toBeCalledTimes(1);
      expect(console.error.mock.calls[0]).toEqual([error]);
    });
  });
});
