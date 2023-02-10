const { sendRequest } = require("../../../utils/helpers");
const { sendVerifierForLoginOrRegister } = require("../../common");
const handleWebAuthnCreateOp = require("../handleWebAuthnCreateOp");
const { setNotification } = require("../../notifications");
const { getBaseAuthUrl } = require("../../config");
const { getThreadId } = require("../../storage");

jest.mock("../../common/index", () => {
  return {
    sendVerifierForLoginOrRegister: jest.fn(),
  };
});
jest.mock("../../config");
jest.mock("../../storage");
jest.mock("../../../ui/components/dialogs");
jest.mock("../../../utils/helpers");
jest.mock("../../notifications", () => {
  return {
    setNotification: jest.fn(),
    cleanAllNotifications: jest.fn(),
  };
});

beforeEach(() => {
  getBaseAuthUrl.mockImplementation(() => "https://example.com");
  getThreadId.mockImplementation(() => "thread-token");
});

afterEach(() => {
  jest.resetAllMocks();
});

const request = {
  "@type": "webauthn",
  publicKey: {
    challenge: "Y2hhbGxlbmdlVG9rZW4",
  },
};

const onSuccessCallback = jest.fn();
const onFailCallback = jest.fn();

describe("when server does not respond with a verifier message", () => {
  beforeEach(async () => {
    sendRequest.mockImplementation(() => ({
      data: {
        "@type": "fail",
      },
    }));

    await handleWebAuthnCreateOp({
      publicKey: request.publicKey,
      onSuccessCallback,
      onFailCallback,
    });
  });

  it("sends correct request", () => {
    expect(sendRequest).toBeCalledTimes(1);
    expect(sendRequest).toBeCalledWith(
      "https://example.com",
      "POST",
      {
        "~thread": {
          thid: "thread-token",
        },
        "@type": "webauthn",
        op: "create",
      },
      {
        actionName: "webauthn-create-op",
      },
    );
  });

  it("calls onSuccessCallback with the response", () => {
    expect(onSuccessCallback).toBeCalledTimes(1);
    expect(onSuccessCallback).toBeCalledWith({ "@type": "fail" });
  });

  it("does not call onFailCallback", () => {
    expect(onFailCallback).toBeCalledTimes(0);
  });

  it("does not set any notification", () => {
    expect(setNotification).toBeCalledTimes(0);
  });
});

describe("when server responds with a verifier message", () => {
  beforeEach(async () => {
    sendRequest.mockImplementation(() => ({
      data: {
        "@type": "verifier",
        "~thread": {
          thid: "thread-id",
        },
      },
    }));

    sendVerifierForLoginOrRegister.mockImplementation(() => ({
      data: {
        "@type": "success",
        token: "access-token",
      },
    }));

    await handleWebAuthnCreateOp({
      publicKey: request.publicKey,
      onSuccessCallback,
      onFailCallback,
    });
  });

  it("sends correct request", () => {
    expect(sendRequest).toBeCalledTimes(1);
    expect(sendRequest).toBeCalledWith(
      "https://example.com",
      "POST",
      {
        "~thread": {
          thid: "thread-token",
        },
        "@type": "webauthn",
        op: "create",
      },
      {
        actionName: "webauthn-create-op",
      },
    );
  });

  it("calls onSuccessCallback with the response", () => {
    expect(onSuccessCallback).toBeCalledTimes(1);
    expect(onSuccessCallback).toBeCalledWith({ "@type": "success", token: "access-token" });
  });

  it("does not call onFailCallback", () => {
    expect(onFailCallback).toBeCalledTimes(0);
  });

  it("does not set any notification", () => {
    expect(setNotification).toBeCalledTimes(0);
  });
});

describe("when server responds with a verifier message, but the second request fails", () => {
  beforeEach(async () => {
    sendRequest.mockImplementation(() => ({
      data: {
        "@type": "verifier",
        "~thread": {
          thid: "thread-id",
        },
      },
    }));

    sendVerifierForLoginOrRegister.mockImplementation(() => ({
      data: {
        "@type": "fail",
        "~error": "Mocked error",
      },
    }));

    await handleWebAuthnCreateOp({
      publicKey: request.publicKey,
      onSuccessCallback,
      onFailCallback,
    });
  });

  it("sends correct request", () => {
    expect(sendRequest).toBeCalledTimes(1);
    expect(sendRequest).toBeCalledWith(
      "https://example.com",
      "POST",
      {
        "~thread": {
          thid: "thread-token",
        },
        "@type": "webauthn",
        op: "create",
      },
      {
        actionName: "webauthn-create-op",
      },
    );
  });

  it("does not call onSuccessCallback", () => {
    expect(onSuccessCallback).toBeCalledTimes(0);
  });

  it("calls onFailCallback", () => {
    expect(onFailCallback).toBeCalledTimes(1);
    expect(onFailCallback).toBeCalledWith(new Error("Mocked error"));
  });

  it("sets an error notification", () => {
    expect(setNotification).toBeCalledTimes(1);
    expect(setNotification).toBeCalledWith("Mocked error", "error");
  });
});
