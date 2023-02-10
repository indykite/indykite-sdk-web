const { isAssertWebauthnRequest } = require("../../../utils/helpers");
const { sendVerifierForLoginOrRegister } = require("../../common");
const handleCreateCredentials = require("../handleCreateCredentials");
const handleAssertCredentials = require("../handleAssertCredentials");
const handleWebAuthn = require("../handleWebAuthn");
const { setNotification, cleanAllNotifications } = require("../../notifications");

jest.mock("../../common/index", () => {
  return {
    sendVerifierForLoginOrRegister: jest.fn(),
  };
});
jest.mock("../../config");
jest.mock("../../storage");
jest.mock("../../../ui/components/dialogs");
jest.mock("../handleCreateCredentials");
jest.mock("../handleAssertCredentials");
jest.mock("../../../utils/helpers");
jest.mock("../../notifications", () => {
  return {
    setNotification: jest.fn(),
    cleanAllNotifications: jest.fn(),
  };
});

beforeEach(() => {});

afterEach(() => {
  jest.resetAllMocks();
});

const request = {
  "@type": "webauthn",
  publicKey: {
    challenge: "Y2hhbGxlbmdlVG9rZW4",
  },
};

describe("when it is a create WebAuthn request", () => {
  const onSuccessCallback = jest.fn();
  const onFailCallback = jest.fn();

  beforeEach(() => {
    isAssertWebauthnRequest.mockImplementation(() => false);
  });

  describe("when server does not respond with a verifier message", () => {
    beforeEach(async () => {
      handleCreateCredentials.mockImplementation(() => ({
        data: {
          "@type": "fail",
        },
      }));

      await handleWebAuthn({ publicKey: request.publicKey, onSuccessCallback, onFailCallback });
    });

    it("calls correct handler", () => {
      expect(handleCreateCredentials).toBeCalledTimes(1);
      expect(handleCreateCredentials).toBeCalledWith(request.publicKey);
      expect(handleAssertCredentials).toBeCalledTimes(0);
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
      handleCreateCredentials.mockImplementation(() => ({
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

      await handleWebAuthn({ publicKey: request.publicKey, onSuccessCallback, onFailCallback });
    });

    it("calls correct handler", () => {
      expect(handleCreateCredentials).toBeCalledTimes(1);
      expect(handleCreateCredentials).toBeCalledWith(request.publicKey);
      expect(handleAssertCredentials).toBeCalledTimes(0);
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
      handleCreateCredentials.mockImplementation(() => ({
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

      await handleWebAuthn({ publicKey: request.publicKey, onSuccessCallback, onFailCallback });
    });

    it("calls correct handler", () => {
      expect(handleCreateCredentials).toBeCalledTimes(1);
      expect(handleCreateCredentials).toBeCalledWith(request.publicKey);
      expect(handleAssertCredentials).toBeCalledTimes(0);
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
});

describe("when it is an assert WebAuthn request", () => {
  const onSuccessCallback = jest.fn();
  const onFailCallback = jest.fn();

  beforeEach(() => {
    isAssertWebauthnRequest.mockImplementation(() => true);
  });

  describe("when server does not respond with a verifier message", () => {
    beforeEach(async () => {
      handleAssertCredentials.mockImplementation(() => ({
        data: {
          "@type": "fail",
        },
      }));

      await handleWebAuthn({ publicKey: request.publicKey, onSuccessCallback, onFailCallback });
    });

    it("calls correct handler", () => {
      expect(handleAssertCredentials).toBeCalledTimes(1);
      expect(handleAssertCredentials).toBeCalledWith(request.publicKey);
      expect(handleCreateCredentials).toBeCalledTimes(0);
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
});
