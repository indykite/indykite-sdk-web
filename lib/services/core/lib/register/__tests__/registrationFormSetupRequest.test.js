const { setupRequest } = require("../../common");
const registrationFormSetupRequest = require("../registrationFormSetupRequest");

jest.mock("../../common");

const config = {
  customKey: "customValue",
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("when setupRequest succeeds", () => {
  let returnedValue;

  beforeEach(async () => {
    setupRequest.mockImplementation(() =>
      Promise.resolve({
        "@type": "success",
      }),
    );

    returnedValue = await registrationFormSetupRequest(config);
  });

  it("returns a correct value", () => {
    expect(returnedValue).toEqual({
      "@type": "success",
    });
  });

  it("calls setupRequest with correct arguments", () => {
    expect(setupRequest).toBeCalledTimes(1);
    expect(setupRequest).toBeCalledWith({
      ...config,
      args: { flow: "register" },
    });
  });
});

describe("when setupRequest throws an error", () => {
  const error = new Error("Test error");
  let caughtError;

  beforeEach(async () => {
    setupRequest.mockImplementation(() => Promise.reject(error));

    try {
      await registrationFormSetupRequest(config);
    } catch (err) {
      caughtError = err;
    }
  });

  it("throws the error", () => {
    expect(caughtError).toBe(error);
  });
});
