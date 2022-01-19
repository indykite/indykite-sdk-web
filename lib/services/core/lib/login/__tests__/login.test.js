const handleLogin = require("../handleLogin");
const login = require("../login");
const loginSetup = require("../loginSetup");

jest.mock("../handleLogin");
jest.mock("../loginSetup");

let params;
let returnedValue;

beforeAll(() => {
  window.IKSDK = {
    config: {
      baseUri: "http://www.example.com",
      applicationId: "application-id",
      tenantId: "tenant-id",
    },
  };
});

beforeEach(() => {
  params = undefined;
  returnedValue = undefined;
  jest.resetAllMocks();
  handleLogin.mockImplementation(() => "value-returned-from-handleLogin");
});

describe("when setup data are set", () => {
  beforeEach(() => {
    params = {
      "@id": "12345",
    };
  });

  describe("when the data have logical type and contain options", () => {
    beforeEach(async () => {
      params["@type"] = "logical";
      params.opts = [
        {
          "@type": "form",
          "@id": "333",
        },
      ];

      returnedValue = await login("email", "password", params);
    });

    it("correctly calls handleLogin function", () => {
      expect(handleLogin).toBeCalledTimes(1);
      expect(handleLogin.mock.calls[0]).toEqual([
        {
          id: "333",
          emailValueParam: "email",
          passwordValueParam: "password",
        },
      ]);
      expect(returnedValue).toBe("value-returned-from-handleLogin");
    });

    it("does not call loginSetup", () => {
      expect(loginSetup).toBeCalledTimes(0);
    });
  });

  describe("when the data does not have options and type", () => {
    beforeEach(async () => {
      returnedValue = await login("email", "password", params);
    });

    it("correctly calls handleLogin function", () => {
      expect(handleLogin).toBeCalledTimes(1);
      expect(handleLogin.mock.calls[0]).toEqual([
        {
          id: undefined,
          emailValueParam: "email",
          passwordValueParam: "password",
        },
      ]);
      expect(returnedValue).toBe("value-returned-from-handleLogin");
    });

    it("does not call loginSetup", () => {
      expect(loginSetup).toBeCalledTimes(0);
    });
  });
});

describe("when setup data are not set", () => {
  beforeEach(async () => {
    loginSetup.mockImplementation(() =>
      Promise.resolve({
        "@type": "logical",
        opts: [
          {
            "@type": "form",
            "@id": "111",
          },
        ],
      }),
    );

    returnedValue = await login("email", "password");
  });

  it("correctly calls handleLogin function", () => {
    expect(handleLogin).toBeCalledTimes(1);
    expect(handleLogin.mock.calls[0]).toEqual([
      {
        id: "111",
        emailValueParam: "email",
        passwordValueParam: "password",
      },
    ]);
    expect(returnedValue).toBe("value-returned-from-handleLogin");
  });

  it("correctly calls loginSetup", () => {
    expect(loginSetup).toBeCalledTimes(1);
    expect(loginSetup.mock.calls[0]).toEqual([window.IKSDK.config]);
  });
});
