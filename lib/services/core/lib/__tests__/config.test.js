const {
  getBaseUri,
  getApplicationId,
  getTenantId,
  getLocaleConfig,
  getBaseAuthUrl,
} = require("../config");
const { enUSLocale } = require("../../../../services/core/locale/en-US");

const originalConsole = window.console;

beforeEach(() => {
  window.IKSDK = {
    config: {
      baseUri: "http://www.example.com",
      applicationId: "12345",
      tenantId: "tenant-id",
      localeConfig: {
        locale: "sk-SK",
        messages: {},
      },
    },
  };

  window.console = {
    error: jest.fn(),
  };
});

afterAll(() => {
  window.console = originalConsole;
});

describe("getBaseUri", () => {
  describe("when config exists", () => {
    it("returns correct URI", () => {
      expect(getBaseUri()).toBe("http://www.example.com");
    });

    it("does not print an error to the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when config does not exist", () => {
    beforeEach(() => {
      delete window.IKSDK;
      getBaseUri();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error.mock.calls[0]).toEqual([
        "[IKUISDK] Did not find baseUri in config. Library has not been initialized probably.",
      ]);
    });
  });
});

describe("getApplicationId", () => {
  describe("when config exists", () => {
    it("returns correct application ID", () => {
      expect(getApplicationId()).toBe("12345");
    });

    it("does not print an error to the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when config does not exist", () => {
    beforeEach(() => {
      delete window.IKSDK;
      getApplicationId();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error.mock.calls[0]).toEqual([
        "[IKUISDK] Did not find applicationId in config. Library has not been initialized probably.",
      ]);
    });
  });
});

describe("getTenantId", () => {
  describe("when config exists", () => {
    it("returns correct tenant ID", () => {
      expect(getTenantId()).toBe("tenant-id");
    });

    it("does not print an error to the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when config does not exist", () => {
    beforeEach(() => {
      delete window.IKSDK;
      getTenantId();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error.mock.calls[0]).toEqual([
        "[IKUISDK] Did not find tenantId in config. Library has not been initialized probably.",
      ]);
    });
  });
});

describe("getLocaleConfig", () => {
  describe("when config exists", () => {
    it("returns correct locale", () => {
      expect(getLocaleConfig()).toEqual({
        locale: "sk-SK",
        messages: {},
      });
    });

    it("does not print an error to the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when locale config does not exist", () => {
    beforeEach(() => {
      delete window.IKSDK.config.localeConfig;
    });

    it("returns default locale", () => {
      expect(getLocaleConfig()).toEqual(enUSLocale);
    });

    it("does not print an error to the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when config does not exist", () => {
    beforeEach(() => {
      delete window.IKSDK;
      getLocaleConfig();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error.mock.calls[0]).toEqual([
        "[IKUISDK] Did not find config. Library has not been initialized probably.",
      ]);
    });
  });
});

describe("getBaseAuthUrl", () => {
  it("returns correct auth URL", () => {
    expect(getBaseAuthUrl()).toBe("http://www.example.com/auth/12345");
  });
});
