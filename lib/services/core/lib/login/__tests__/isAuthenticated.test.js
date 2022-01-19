const storage = require("../../storage");
const isAuthenticated = require("../isAuthenticated");

jest.mock("../../storage");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("when is authenticated", () => {
  let returnedValue;

  beforeEach(async () => {
    storage.getTokens.mockImplementation(() => Promise.resolve({ accessToken: "access-token" }));
    returnedValue = await isAuthenticated("user-id");
  });

  it("returns correct value", () => {
    expect(storage.getTokens).toBeCalledTimes(1);
    expect(storage.getTokens.mock.calls[0]).toEqual(["user-id"]);
    expect(returnedValue).toBeTruthy();
  });
});

describe("when is not authenticated", () => {
  let returnedValue;

  beforeEach(async () => {
    storage.getTokens.mockImplementation(() => Promise.resolve({}));
    returnedValue = await isAuthenticated("user-id");
  });

  it("returns correct value", () => {
    expect(storage.getTokens).toBeCalledTimes(1);
    expect(storage.getTokens.mock.calls[0]).toEqual(["user-id"]);
    expect(returnedValue).toBeFalsy();
  });
});
