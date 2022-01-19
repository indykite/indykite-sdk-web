const { get: axiosGet, post: axiosPost } = require("axios");
const {
  addAuthorizationTokenToHeaders,
  createIdFromString,
  createProviderName,
  createRenderComponentCallback,
  generateRedirectUri,
  getUnixTimeStamp,
  isTokenExpired,
  treatAsTypeLogical,
  treatAsTypeOidc,
  getOidcFinalUrlWithLoginVerifier,
  sendRequest,
} = require("../helpers");
const packageJson = require("../../../../../package.json");

jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

beforeAll(() => {
  window.IKSDK = {
    config: {
      baseUri: "http://www.example.com",
      applicationId: "12345",
      tenantId: "tenant-id",
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getUnixTimeStamp", () => {
  let returnedValue;

  beforeEach(() => {
    jest.spyOn(Date, "now").mockImplementation(() => 1642070250055);
    returnedValue = getUnixTimeStamp();
  });

  afterEach(() => {
    Date.now.mockRestore();
  });

  it("returns correct timestamp", () => {
    expect(returnedValue).toBe(1642070250);
  });
});

describe("generateRedirectUri", () => {
  let originalLocation;

  beforeAll(() => {
    originalLocation = window.location;
    delete window.location;
    window.location = {
      origin: "https://www.example.com",
    };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  it("returns correct redirect URIs", () => {
    expect(generateRedirectUri("https://www.google.com")).toBe("https://www.google.com");
    expect(generateRedirectUri("//path/to/file")).toBe("https://www.example.com/path/to/file");
    expect(generateRedirectUri()).toBe("https://www.example.com");
  });
});

describe("isTokenExpired", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockImplementation(() => 1642070250055);
  });

  afterEach(() => {
    Date.now.mockRestore();
  });

  it("returns correct redirect URIs", () => {
    expect(isTokenExpired(1642070249, 0)).toBeTruthy();
    expect(isTokenExpired(1642070250, 0)).toBeFalsy();
    expect(isTokenExpired(1642070250, 1)).toBeTruthy();
    expect(isTokenExpired(1642070251, 0)).toBeFalsy();
    expect(isTokenExpired(1642070251, 1)).toBeFalsy();
    expect(isTokenExpired(1642070251, 2)).toBeTruthy();
  });
});

describe("addAuthorizationTokenToHeaders", () => {
  it("adds auth header", () => {
    expect(addAuthorizationTokenToHeaders()).toEqual({});
    expect(addAuthorizationTokenToHeaders("access-token")).toEqual({
      authorization: "Bearer access-token",
    });
    expect(addAuthorizationTokenToHeaders("access-token", { version: "1" })).toEqual({
      authorization: "Bearer access-token",
      version: "1",
    });
  });
});

describe("treatAsTypeLogical", () => {
  it("returns correct value", () => {
    expect(treatAsTypeLogical()).toBeFalsy();
    expect(treatAsTypeLogical({})).toBeFalsy();
    expect(treatAsTypeLogical({ "@type": true })).toBeFalsy();
    expect(treatAsTypeLogical({ "@type": "logical" })).toBeFalsy();
    expect(treatAsTypeLogical({ opts: true })).toBeFalsy();
    expect(treatAsTypeLogical({ opts: [] })).toBeFalsy();
    expect(treatAsTypeLogical({ "@type": "logical", opts: [] })).toBeFalsy();
    expect(treatAsTypeLogical({ "@type": true, opts: [{ type: "action" }] })).toBeFalsy();
    expect(treatAsTypeLogical({ "@type": "logical", opts: [{ type: "action" }] })).toBeTruthy();
  });
});

describe("treatAsTypeOidc", () => {
  it("returns correct value", () => {
    expect(treatAsTypeOidc()).toBeFalsy();
    expect(treatAsTypeOidc({})).toBeFalsy();
    expect(treatAsTypeOidc({ "@type": true })).toBeFalsy();
    expect(treatAsTypeOidc({ "@type": "oidc" })).toBeTruthy();
  });
});

describe("getOidcFinalUrlWithLoginVerifier", () => {
  it("returns correct url", () => {
    expect(
      getOidcFinalUrlWithLoginVerifier({ code: "123", state: "456" }, "login-verifier"),
    ).toBe(
      "http://www.example.com/o/oauth2/auth?code=123&state=456&login_verifier=login-verifier",
    );
  });
});

describe("sendRequest", () => {
  describe("when no data and config are specified", () => {
    beforeEach(() => {
      sendRequest("www.example.net", "GET");
    });

    it("sends correct request", () => {
      expect(axiosPost).toBeCalledTimes(0);
      expect(axiosGet).toBeCalledTimes(1);
      expect(axiosGet.mock.calls[0]).toEqual([
        "www.example.net",
        undefined,
        {
          headers: {
            "ikui-version": packageJson.version,
          },
        },
      ]);
    });
  });

  describe("when an action name config is specified", () => {
    beforeEach(() => {
      sendRequest("www.example.net", "GET", undefined, { actionName: "my-action" });
    });

    it("sends correct request", () => {
      expect(axiosPost).toBeCalledTimes(0);
      expect(axiosGet).toBeCalledTimes(1);
      expect(axiosGet.mock.calls[0]).toEqual([
        "www.example.net",
        undefined,
        {
          headers: {
            "ikui-version": packageJson.version,
            "ikui-action-name": "my-action",
          },
        },
      ]);
    });
  });

  describe("when headers config is specified", () => {
    beforeEach(() => {
      sendRequest("www.example.net", "GET", undefined, {
        headers: {
          authorization: "Bearer token",
        },
      });
    });

    it("sends correct request", () => {
      expect(axiosPost).toBeCalledTimes(0);
      expect(axiosGet).toBeCalledTimes(1);
      expect(axiosGet.mock.calls[0]).toEqual([
        "www.example.net",
        undefined,
        {
          headers: {
            authorization: "Bearer token",
            "ikui-version": packageJson.version,
          },
        },
      ]);
    });
  });

  describe("when an axios config is specified", () => {
    beforeEach(() => {
      sendRequest("www.example.net", "GET", undefined, {
        something: 42,
      });
    });

    it("sends correct request", () => {
      expect(axiosPost).toBeCalledTimes(0);
      expect(axiosGet).toBeCalledTimes(1);
      expect(axiosGet.mock.calls[0]).toEqual([
        "www.example.net",
        undefined,
        {
          headers: {
            "ikui-version": packageJson.version,
          },
          something: 42,
        },
      ]);
    });
  });

  describe("when POST method with data is passed", () => {
    beforeEach(() => {
      sendRequest("www.example.net", "POST", "Whatever");
    });

    it("sends correct request", () => {
      expect(axiosGet).toBeCalledTimes(0);
      expect(axiosPost).toBeCalledTimes(1);
      expect(axiosPost.mock.calls[0]).toEqual([
        "www.example.net",
        "Whatever",
        {
          headers: {
            "ikui-version": packageJson.version,
          },
        },
      ]);
    });
  });
});

describe("createRenderComponentCallback", () => {
  describe("when onRenderComponent is a function", () => {
    const replacingFunction = jest.fn();
    let returnedComponent;

    describe("when a custom function does not return a new component", () => {
      beforeEach(() => {
        returnedComponent = createRenderComponentCallback(
          replacingFunction,
          "Component X",
          "random",
          "props",
        );
      });

      it("returns the original component", () => {
        expect(replacingFunction.mock.calls[0]).toEqual(["Component X", "random", "props"]);
        expect(returnedComponent).toBe("Component X");
      });
    });

    describe("when a custom function returns a new component", () => {
      beforeEach(() => {
        replacingFunction.mockImplementation(() => "Component Y");
        returnedComponent = createRenderComponentCallback(
          replacingFunction,
          "Component X",
          "random",
          "props",
        );
      });

      it("returns the new component", () => {
        expect(replacingFunction.mock.calls[0]).toEqual(["Component X", "random", "props"]);
        expect(returnedComponent).toBe("Component Y");
      });
    });
  });

  describe("when onRenderComponent is not a function", () => {
    let returnedComponent;

    beforeEach(() => {
      returnedComponent = createRenderComponentCallback(
        undefined,
        "Component X",
        "random",
        "props",
      );
    });

    it("returns the original component", () => {
      expect(returnedComponent).toBe("Component X");
    });
  });
});

describe("createIdFromString", () => {
  it("returns correct id", () => {
    expect(createIdFromString("google.com")).toBe("google");
    expect(createIdFromString("facebook.com")).toBe("facebook");
    expect(createIdFromString("microsoft.com")).toBe("microsoft");
    expect(createIdFromString("linkedin.com")).toBe("linkedin");
    expect(createIdFromString("Indykite.me")).toBe("indykite-me");
    expect(createIdFromString("www.awesomepage007.com/subpage")).toBe(
      "www-awesomepage007-com-subpage",
    );
  });
});

describe("createProviderName", () => {
  it("returns correct id", () => {
    expect(createProviderName("google.com")).toBe("google");
    expect(createProviderName("facebook.com")).toBe("facebook");
    expect(createProviderName("microsoft.com")).toBe("microsoft");
    expect(createProviderName("linkedin.com")).toBe("linkedin");
    expect(createProviderName("Indykite.me")).toBe("indykite.me");
    expect(createProviderName("www.awesomepage007.com/subpage")).toBe(
      "www.awesomepage007.com/subpage",
    );
  });
});
