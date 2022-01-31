const handleRegister = require("../handleRegister");
const register = require("../register");
const registrationFormSetupRequest = require("../registrationFormSetupRequest");

jest.mock("../handleRegister");
jest.mock("../registrationFormSetupRequest");

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
  },
};

beforeEach(() => {
  jest.resetAllMocks();

  handleRegister.mockImplementation(() =>
    Promise.resolve({
      "@type": "success",
    }),
  );
});

describe("when registrationFormSetupRequest returns a 'logical' type with a 'form' option", () => {
  let returnedValue;

  beforeEach(async () => {
    registrationFormSetupRequest.mockImplementation(() =>
      Promise.resolve({
        "@type": "logical",
        op: "or",
        opts: [
          {
            "@type": "oidc",
            prv: "google.com",
          },
          {
            "@type": "form",
            "@id": "form-option-id",
          },
        ],
      }),
    );

    returnedValue = await register("user@example.com", "password-12345");
  });

  it("returns a correct value", () => {
    expect(returnedValue).toEqual({
      "@type": "success",
    });
  });

  it("calls registrationFormSetupRequest with correct arguments", () => {
    expect(registrationFormSetupRequest).toBeCalledTimes(1);
    expect(registrationFormSetupRequest).toBeCalledWith(window.IKSDK.config);
  });

  it("calls handleRegister with correct arguments", () => {
    expect(handleRegister).toBeCalledTimes(1);
    expect(handleRegister).toBeCalledWith({
      id: "form-option-id",
      emailValueParam: "user@example.com",
      passwordValueParam: "password-12345",
    });
  });
});

describe("when registrationFormSetupRequest returns an 'oidc' type", () => {
  let returnedValue;

  beforeEach(async () => {
    registrationFormSetupRequest.mockImplementation(() =>
      Promise.resolve({
        "@type": "oidc",
        prv: "google.com",
      }),
    );

    returnedValue = await register("user@example.com", "password-12345");
  });

  it("returns a correct value", () => {
    expect(returnedValue).toEqual({
      "@type": "success",
    });
  });

  it("calls registrationFormSetupRequest with correct arguments", () => {
    expect(registrationFormSetupRequest).toBeCalledTimes(1);
    expect(registrationFormSetupRequest).toBeCalledWith(window.IKSDK.config);
  });

  it("calls handleRegister with correct arguments", () => {
    expect(handleRegister).toBeCalledTimes(1);
    expect(handleRegister).toBeCalledWith({
      emailValueParam: "user@example.com",
      passwordValueParam: "password-12345",
    });
  });
});

describe("when registrationFormSetupRequest throws an error", () => {
  const error = new Error("Test error");
  let caughtError;

  beforeEach(async () => {
    registrationFormSetupRequest.mockImplementation(() => Promise.reject(error));

    try {
      await register("user@example.com", "password-12345");
    } catch (err) {
      caughtError = err;
    }
  });

  it("throws the error", () => {
    expect(caughtError).toBe(error);
  });

  it("calls registrationFormSetupRequest with correct arguments", () => {
    expect(registrationFormSetupRequest).toBeCalledTimes(1);
    expect(registrationFormSetupRequest).toBeCalledWith(window.IKSDK.config);
  });

  it("does not call handleRegister with correct arguments", () => {
    expect(handleRegister).toBeCalledTimes(0);
  });
});
