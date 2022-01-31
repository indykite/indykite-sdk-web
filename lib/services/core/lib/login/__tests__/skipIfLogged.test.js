const storage = require("../../storage");
const skipIfLogged = require("../skipIfLogged");
const { getOidcFinalUrlWithLoginVerifier } = require("../../../utils/helpers");

jest.mock("../../storage");
jest.mock("../../../utils/helpers");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("when data are not present", () => {
  let returnedValue;

  beforeEach(() => {
    returnedValue = skipIfLogged();
  });

  it("returns correct value", () => {
    expect(returnedValue).toBeFalsy();
  });
});

describe("when data are present", () => {
  let originalLocation;
  let returnedValue;

  beforeEach(() => {
    originalLocation = window.location;
    delete window.location;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe("when original parameters are set", () => {
    beforeEach(() => {
      storage.getOidcOriginalParams.mockImplementation(() => ({
        customKey: "customValue",
      }));

      getOidcFinalUrlWithLoginVerifier.mockImplementation(() => "/path/to/redirect");

      returnedValue = skipIfLogged({
        "@type": "success",
        verifier: "login-verifier-token",
      });
    });

    it("returns correct value", () => {
      expect(storage.clearOidcData).toBeCalledTimes(1);
      expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(1);
      expect(getOidcFinalUrlWithLoginVerifier.mock.calls[0]).toEqual([
        {
          customKey: "customValue",
        },
        "login-verifier-token",
      ]);
      expect(returnedValue).toBeTruthy();
    });

    it("redirects to a different page", () => {
      expect(window.location).toBe("/path/to/redirect");
    });
  });

  describe("when original parameters are not set", () => {
    beforeEach(() => {
      returnedValue = skipIfLogged({
        "@type": "success",
        verifier: "login-verifier-token",
      });
    });

    it("returns correct value", () => {
      expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(0);
      expect(returnedValue).toBeFalsy();
    });

    it("does not redirect to a different page", () => {
      expect(window.location).toBeUndefined();
    });
  });
});
