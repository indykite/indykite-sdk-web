const storage = require("../../storage");
const singleOidcSetup = require("../singleOidcSetup");

jest.mock("../../storage");

let originalLocation;

beforeEach(() => {
  originalLocation = window.location;
  delete window.location;
  jest.resetAllMocks();
});

afterEach(() => {
  window.location = originalLocation;
});

describe("when data contains all required values", () => {
  let returnedValue;

  beforeEach(() => {
    returnedValue = singleOidcSetup({
      url: "/path/to/redirect",
      "~thread": {
        thid: "thread-id",
      },
    });
  });

  it("redirects to a different page", () => {
    expect(window.location).toBe("/path/to/redirect");
  });

  it("stores the thread ID", () => {
    expect(storage.setThreadId).toBeCalledTimes(1);
    expect(storage.setThreadId.mock.calls[0]).toEqual(["thread-id"]);
  });

  it("does not return a value", () => {
    expect(returnedValue).toBeUndefined();
  });
});

describe("when thread ID is not passed", () => {
  let returnedValue;
  let caughtError;

  beforeEach(() => {
    try {
      singleOidcSetup({
        url: "/path/to/redirect",
        "~thread": {},
      });
    } catch (err) {
      caughtError = err;
    }
  });

  it("does not redirect to a different page", () => {
    expect(window.location).toBeUndefined();
  });

  it("does not store the thread ID", () => {
    expect(storage.setThreadId).toBeCalledTimes(0);
  });

  it("does not return a value", () => {
    expect(returnedValue).toBeUndefined();
  });

  it("throws an error", () => {
    expect(caughtError).toBe("No thread id returned from the server.");
  });
});

describe("when url is not passed", () => {
  let returnedValue;
  let caughtError;

  beforeEach(() => {
    try {
      singleOidcSetup({
        "~thread": {
          thid: "thread-id",
        },
      });
    } catch (err) {
      caughtError = err;
    }
  });

  it("does not redirect to a different page", () => {
    expect(window.location).toBeUndefined();
  });

  it("does not store the thread ID", () => {
    expect(storage.setThreadId).toBeCalledTimes(0);
  });

  it("does not return a value", () => {
    expect(returnedValue).toBeUndefined();
  });

  it("throws an error", () => {
    expect(caughtError).toBe("No url to redirect.");
  });
});

describe("when no data are passed", () => {
  let returnedValue;
  let caughtError;

  beforeEach(() => {
    try {
      singleOidcSetup();
    } catch (err) {
      caughtError = err;
    }
  });

  it("does not redirect to a different page", () => {
    expect(window.location).toBeUndefined();
  });

  it("does not store the thread ID", () => {
    expect(storage.setThreadId).toBeCalledTimes(0);
  });

  it("does not return a value", () => {
    expect(returnedValue).toBeUndefined();
  });

  it("throws an error", () => {
    expect(caughtError).toBe("No data object provided.");
  });
});
