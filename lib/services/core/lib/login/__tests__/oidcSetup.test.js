const {
  getOidcFinalUrlWithLoginVerifier,
  sendRequest,
  generateRedirectUri,
} = require("../../../utils/helpers");
const storage = require("../../storage");
const { getBaseAuthUrl } = require("../../config");
const singleOidcSetup = require("../singleOidcSetup");
const oidcSetup = require("../oidcSetup");

jest.mock("../../../utils/helpers");
jest.mock("../../storage");
jest.mock("../../config");
jest.mock("../singleOidcSetup");

const mockedAuthUrl = "https://example.com/auth/123";

beforeEach(() => {
  jest.resetAllMocks();
  storage.getThreadId.mockImplementation(() => "stored-thread-id");
  generateRedirectUri.mockImplementation((url) => url);
  getBaseAuthUrl.mockImplementation(() => mockedAuthUrl);
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe("when parameters are passed as an object", () => {
  let returnedValue;

  describe("when no parameters are specified", () => {
    const response = {
      data: {
        "@type": "oidc",
        name: "slugworth",
      },
    };

    beforeEach(async () => {
      sendRequest.mockImplementation(() => response);

      returnedValue = await oidcSetup({});
    });

    it("sends a correct request", () => {
      expect(sendRequest).toBeCalledTimes(1);
      expect(sendRequest.mock.calls[0]).toEqual([
        mockedAuthUrl,
        "POST",
        {
          "@type": "oidc",
          "~thread": {
            thid: "stored-thread-id",
          },
        },
        {
          actionName: "oidc-setup",
        },
      ]);
    });

    it("calls single OIDC setup", () => {
      expect(singleOidcSetup).toBeCalledTimes(1);
      expect(singleOidcSetup.mock.calls[0]).toEqual([response.data]);
    });
  });

  describe("when all parameters are specified", () => {
    const response = {
      data: {
        "@type": "oidc",
        name: "slugworth",
      },
    };

    beforeEach(async () => {
      sendRequest.mockImplementation(() => response);

      returnedValue = await oidcSetup({
        id: "555",
        redirectUri: "https://redirect.to",
        loginApp: "my-app",
        threadId: "custom-thread-id",
      });
    });

    it("sends a correct request", () => {
      expect(sendRequest).toBeCalledTimes(1);
      expect(sendRequest.mock.calls[0]).toEqual([
        mockedAuthUrl,
        "POST",
        {
          "@type": "oidc",
          "~thread": {
            thid: "custom-thread-id",
          },
          "@id": "555",
          redirectUri: "https://redirect.to",
          params: {
            login_app: "my-app",
          },
        },
        {
          actionName: "oidc-setup",
        },
      ]);
    });

    it("calls single OIDC setup", () => {
      expect(singleOidcSetup).toBeCalledTimes(1);
      expect(singleOidcSetup.mock.calls[0]).toEqual([response.data]);
    });
  });

  describe("when sendRequest throws an error", () => {
    const error = new Error("Test error");

    beforeEach(async () => {
      sendRequest.mockImplementation(() => Promise.reject(error));

      await oidcSetup();
    });

    it("prints the error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error.mock.calls[0]).toEqual([error]);
    });

    it("does not call single OIDC setup", () => {
      expect(singleOidcSetup).toBeCalledTimes(0);
    });
  });
});

describe("when parameters are passed as arguments", () => {
  let returnedValue;

  describe("when no parameters are specified", () => {
    const response = {
      data: {
        "@type": "oidc",
        name: "slugworth",
      },
    };

    beforeEach(async () => {
      sendRequest.mockImplementation(() => response);

      returnedValue = await oidcSetup();
    });

    it("sends a correct request", () => {
      expect(sendRequest).toBeCalledTimes(1);
      expect(sendRequest.mock.calls[0]).toEqual([
        mockedAuthUrl,
        "POST",
        {
          "@type": "oidc",
          "~thread": {
            thid: "stored-thread-id",
          },
        },
        {
          actionName: "oidc-setup",
        },
      ]);
    });

    it("calls single OIDC setup", () => {
      expect(singleOidcSetup).toBeCalledTimes(1);
      expect(singleOidcSetup.mock.calls[0]).toEqual([response.data]);
    });
  });

  describe("when all parameters are specified", () => {
    const response = {
      data: {
        "@type": "oidc",
        name: "slugworth",
      },
    };

    beforeEach(async () => {
      sendRequest.mockImplementation(() => response);

      returnedValue = await oidcSetup("444", "https://redirect.to", "new-thread-id");
    });

    it("sends a correct request", () => {
      expect(sendRequest).toBeCalledTimes(1);
      expect(sendRequest.mock.calls[0]).toEqual([
        mockedAuthUrl,
        "POST",
        {
          "@type": "oidc",
          "~thread": {
            thid: "new-thread-id",
          },
          "@id": "444",
          redirectUri: "https://redirect.to",
        },
        {
          actionName: "oidc-setup",
        },
      ]);
    });

    it("calls single OIDC setup", () => {
      expect(singleOidcSetup).toBeCalledTimes(1);
      expect(singleOidcSetup.mock.calls[0]).toEqual([response.data]);
    });
  });
});
