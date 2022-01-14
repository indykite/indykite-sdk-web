const initOidcAuthorizationRequest = require("../initOidcAuthorizationRequest");
const isConfigMissingField = require("../isConfigMissingField");

jest.mock("../isConfigMissingField");

const originalLocation = window.location;

beforeAll(() => {
  delete window.location;
});

beforeEach(() => {
  window.location = undefined;
  jest.resetAllMocks();
});

afterAll(() => {
  window.location = originalLocation;
});

describe("when all fields are speciifed", () => {
  let returnedValue;

  beforeEach(() => {
    isConfigMissingField.mockImplementation(() => {});
    returnedValue = initOidcAuthorizationRequest("https://example.com", { scopes: "mobile" });
  });

  it("changes location", () => {
    expect(window.location).toBe("https://example.com/o/oauth2/auth?scopes=mobile");
  });

  it("does not return a value", () => {
    expect(returnedValue).toBeUndefined();
  });
});

describe("when not all fields are speciifed", () => {
  let returnedValue;

  beforeEach(() => {
    isConfigMissingField.mockImplementation(() => "state");
    returnedValue = initOidcAuthorizationRequest("https://example.com", { scopes: "mobile" });
  });

  it("does not change location", () => {
    expect(window.location).toBeUndefined();
  });

  it("returns an error value", () => {
    expect(returnedValue).toBe(
      "Your config is not complete. Please provide state base on documentation.",
    );
  });
});
