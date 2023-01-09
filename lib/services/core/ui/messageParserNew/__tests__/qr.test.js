const { qr: qrComponent } = require("../../components/qr");
const { createRenderComponentCallback, wait } = require("../../../utils/helpers");
/**
 * @type {jest.MockInstance}
 */
const handleAction = require("../../../lib/handleAction");
const qr = require("../qr");

jest.mock("../../components/qr");
jest.mock("../../../utils/helpers");
jest.mock("../../../lib/handleAction");

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "debug").mockImplementation(() => {});
});

afterEach(() => {
  console.debug.mockRestore();
});

const successResponse = { "@type": "success" };
const pongResponse = {
  "@type": "action",
  opts: [
    {
      hint: "pong",
    },
  ],
};

describe("when a correct response is returned immediatelly", () => {
  let successCallback;

  beforeEach(() => {
    successCallback = jest.fn();
    handleAction.mockReturnValue(successResponse);
    qrComponent.mockReturnValue(document.createElement("canvas"));
    createRenderComponentCallback.mockImplementation((fn, el) => el);
    qr({ onSuccessCallback: successCallback, htmlContainer: document.createElement("div") });
  });

  it("calls onSuccessfulCallback with the response", () => {
    expect(successCallback).toBeCalledWith(successResponse);
  });

  it("was waiting for 5 seconds", () => {
    expect(wait).toBeCalledTimes(1);
    expect(wait).toBeCalledWith(5);
  });
});

describe("when the pong response is returned", () => {
  let successCallback;

  beforeEach(() => {
    successCallback = jest.fn();
    handleAction.mockReturnValueOnce(pongResponse);
    qrComponent.mockReturnValue(document.createElement("canvas"));
    createRenderComponentCallback.mockImplementation((fn, el) => el);
  });

  describe("when the correct response is returned", () => {
    const successResponse = { "@type": "success" };

    beforeEach(() => {
      handleAction.mockReturnValueOnce(successResponse);
      qr({ onSuccessCallback: successCallback, htmlContainer: document.createElement("div") });
    });

    it("calls onSuccessfulCallback with the response", () => {
      expect(successCallback).toBeCalledWith(successResponse);
    });

    it("was waiting for 10 seconds", () => {
      expect(wait).toBeCalledTimes(2);
      expect(wait).nthCalledWith(1, 5);
      expect(wait).nthCalledWith(2, 5);
    });
  });
});

describe("when an error is thrown", () => {
  const error = new Error("Error mock");
  let successCallback;

  beforeEach(() => {
    successCallback = jest.fn();
    handleAction.mockRejectedValueOnce(error);
    qrComponent.mockReturnValue(document.createElement("canvas"));
    createRenderComponentCallback.mockImplementation((fn, el) => el);
  });

  describe("when the correct response is returned", () => {
    const successResponse = { "@type": "success" };

    beforeEach(() => {
      handleAction.mockReturnValueOnce(successResponse);
      qr({ onSuccessCallback: successCallback, htmlContainer: document.createElement("div") });
    });

    it("calls onSuccessfulCallback with the response", () => {
      expect(successCallback).toBeCalledWith(successResponse);
    });

    it("was waiting for 7 seconds", () => {
      expect(wait).toBeCalledTimes(2);
      expect(wait).nthCalledWith(1, 5);
      expect(wait).nthCalledWith(2, 2);
    });
  });
});
