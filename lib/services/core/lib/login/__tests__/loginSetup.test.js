const { setupRequest } = require("../../common");
const loginSetup = require("../loginSetup");
const skipIfLogged = require("../skipIfLogged");

jest.mock("../../common");
jest.mock("../skipIfLogged");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("when setup request returns an object", () => {
  const config = { value: 42 };
  const setupResult = {
    value: "object-returned-from-setupRequest",
  };
  let returnedValue;

  beforeEach(async () => {
    setupRequest.mockImplementation(() => setupResult);

    returnedValue = await loginSetup(config);
  });

  it("calls setupRequest", () => {
    expect(setupRequest).toBeCalledTimes(1);
    expect(setupRequest.mock.calls[0]).toEqual([config]);
  });

  it("calls skipIfLogged", () => {
    expect(skipIfLogged).toBeCalledTimes(1);
    expect(skipIfLogged.mock.calls[0]).toEqual([setupResult]);
  });

  it("returns a correct value", () => {
    expect(returnedValue).toBe(setupResult);
  });
});

describe("when setup request throws an error", () => {
  const config = { value: 42 };
  const error = new Error("Test error");
  let caughtError;

  beforeEach(async () => {
    setupRequest.mockImplementation(() => Promise.reject(error));
    jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      await loginSetup(config);
    } catch (err) {
      caughtError = err;
    }
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("calls setupRequest", () => {
    expect(setupRequest).toBeCalledTimes(1);
    expect(setupRequest.mock.calls[0]).toEqual([config]);
  });

  it("prints the error into console", () => {
    expect(console.error).toBeCalledTimes(1);
    expect(console.error.mock.calls[0]).toEqual([error]);
  });

  it("throws the error", () => {
    expect(caughtError).toBe(error);
  });
});
