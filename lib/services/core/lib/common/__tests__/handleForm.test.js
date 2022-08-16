const handleForm = require("../handleForm");
const storage = require("../../storage");
const { cleanError } = require("../../notifications");
const { getElementIds, getBaseUri, getApplicationId } = require("../../config");
const { sendRequest } = require("../../../utils/helpers");

jest.mock("../../storage");
jest.mock("../../config", () => {
  const originalModule = jest.requireActual("../../config");
  return {
    ...originalModule,
    getBaseUri: jest.fn(() => "https://example.com"),
    getApplicationId: jest.fn(() => "mocked-app-id"),
  };
});
jest.mock("../../notifications");
jest.mock("../../../utils/helpers");

beforeEach(() => {
  jest.clearAllMocks();

  storage.getThreadId.mockImplementation(() => "mocked-thread-id");
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("when jarvis returns correct data", () => {
  const formFields = [
    {
      "@type": "input",
      "@id": "first",
    },
    {
      "@type": "input",
      "@id": "second",
    },
  ];
  const formContext = {
    "@id": "mocked-context",
    fields: formFields,
  };
  const formId = "mocked-form-id";

  beforeEach(() => {
    sendRequest.mockImplementation(() => {
      return Promise.resolve({
        data: {
          "~thread": {
            thid: "mocked-new-thread-id",
          },
          "@type": "verifier",
        },
      });
    });

    jest.spyOn(document, "getElementById").mockImplementation(() => {
      const formEl = document.createElement("form");
      formEl.id = formId;
      const firstInput = document.createElement("input");
      firstInput.id = `IKUISDK-input-first`;
      firstInput.value = "123";
      const secondInput = document.createElement("input");
      secondInput.id = `IKUISDK-input-second`;
      secondInput.value = "456";
      formEl.append(firstInput, secondInput);
      return formEl;
    });
  });

  afterEach(() => {
    document.getElementById.mockRestore();
  });

  describe("when no callback is specified", () => {
    let returnedValue;

    beforeEach(async () => {
      returnedValue = await handleForm({ formContext, formId });
    });

    it("returns a correct value", () => {
      expect(returnedValue).toEqual({
        "~thread": {
          thid: "mocked-new-thread-id",
        },
        "@type": "verifier",
      });
    });

    it("sends a correct request", () => {
      expect(sendRequest).toBeCalledTimes(1);
      expect(sendRequest).toBeCalledWith(
        "https://example.com/auth/mocked-app-id",
        "POST",
        {
          "~thread": {
            thid: "mocked-thread-id",
          },
          "@type": "form",
          "@id": "mocked-context",
          first: "123",
          second: "456",
        },
        {
          actionName: "form-data",
        },
      );
    });

    it("sets a new thread id", () => {
      expect(storage.setThreadId).toBeCalledTimes(1);
      expect(storage.setThreadId).toBeCalledWith("mocked-new-thread-id");
    });
  });

  describe("when a callback is specified", () => {
    let callback;

    beforeEach(async () => {
      callback = jest.fn();
      returnedValue = await handleForm({ formContext, formId, onSuccessCallback: callback });
    });

    it("calls callback with correct values", () => {
      expect(callback).toBeCalledTimes(1);
      expect(callback).toBeCalledWith({
        "~thread": {
          thid: "mocked-new-thread-id",
        },
        "@type": "verifier",
      });
    });
  });
});

describe("when jarvis does not return a new thread id", () => {
  const formFields = [
    {
      "@type": "input",
      "@id": "first",
    },
    {
      "@type": "input",
      "@id": "second",
    },
  ];
  const formContext = {
    "@id": "mocked-context",
    fields: formFields,
  };
  const formId = "mocked-form-id";

  beforeEach(() => {
    sendRequest.mockImplementation(() => {
      return Promise.resolve({
        data: {
          "@type": "success",
        },
      });
    });

    jest.spyOn(document, "getElementById").mockImplementation(() => {
      const formEl = document.createElement("form");
      formEl.id = formId;
      const firstInput = document.createElement("input");
      firstInput.id = `IKUISDK-input-first`;
      firstInput.value = "123";
      const secondInput = document.createElement("input");
      secondInput.id = `IKUISDK-input-second`;
      secondInput.value = "456";
      formEl.append(firstInput, secondInput);
      return formEl;
    });
  });

  afterEach(() => {
    document.getElementById.mockRestore();
  });

  describe("when no callback is specified", () => {
    let returnedValue;

    beforeEach(async () => {
      returnedValue = await handleForm({ formContext, formId });
    });

    it("returns a correct value", () => {
      expect(returnedValue).toEqual({
        "@type": "success",
      });
    });

    it("sends a correct request", () => {
      expect(sendRequest).toBeCalledTimes(1);
      expect(sendRequest).toBeCalledWith(
        "https://example.com/auth/mocked-app-id",
        "POST",
        {
          "~thread": {
            thid: "mocked-thread-id",
          },
          "@type": "form",
          "@id": "mocked-context",
          first: "123",
          second: "456",
        },
        {
          actionName: "form-data",
        },
      );
    });

    it("does not seta a new thread id", () => {
      expect(storage.setThreadId).toBeCalledTimes(0);
    });
  });

  describe("when a callback is specified", () => {
    let callback;

    beforeEach(async () => {
      callback = jest.fn();
      returnedValue = await handleForm({ formContext, formId, onSuccessCallback: callback });
    });

    it("calls callback with correct values", () => {
      expect(callback).toBeCalledTimes(1);
      expect(callback).toBeCalledWith({
        "@type": "success",
      });
    });
  });
});

describe("when jarvis returns an error", () => {
  const formFields = [undefined];
  const formContext = {
    "@id": "mocked-context",
    fields: formFields,
  };
  const formId = "mocked-form-id";

  beforeEach(() => {
    sendRequest.mockImplementation(() => {
      return Promise.resolve({
        data: {
          "@type": "fail",
          "~error": "Error message",
        },
      });
    });

    jest.spyOn(document, "getElementById").mockImplementation(() => {
      const formEl = document.createElement("form");
      formEl.id = formId;
      return formEl;
    });
  });

  afterEach(() => {
    document.getElementById.mockRestore();
  });

  describe("when a callback is specified", () => {
    let callback;
    let caughtError;

    beforeEach(async () => {
      callback = jest.fn();
      try {
        await handleForm({ formContext, formId, onSuccessCallback: callback });
      } catch (err) {
        caughtError = err;
      }
    });

    it("does not call callback", () => {
      expect(callback).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        "@type": "fail",
        "~error": "Error message",
      });
    });
  });
});

describe("when jarvis does not return any response", () => {
  const formContext = {};
  const formId = "mocked-form-id";

  beforeEach(() => {
    sendRequest.mockImplementation(() => {
      return Promise.resolve();
    });

    jest.spyOn(document, "getElementById").mockImplementation(() => {
      const formEl = document.createElement("form");
      formEl.id = formId;
      return formEl;
    });
  });

  afterEach(() => {
    document.getElementById.mockRestore();
  });

  describe("when a callback is specified", () => {
    let callback;
    let caughtError;

    beforeEach(async () => {
      callback = jest.fn();
      try {
        await handleForm({ formContext, formId, onSuccessCallback: callback });
      } catch (err) {
        caughtError = err;
      }
    });

    it("does not call callback", () => {
      expect(callback).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError).toEqual(
        new Error(
          "Oops something went wrong when sending credentials to the indentity provider server.",
        ),
      );
    });
  });
});
