const {
  createRenderComponentCallback,
  isAssertWebauthnRequest,
} = require("../../../utils/helpers");
const handleWebAuthn = require("../../../lib/webauthn/handleWebAuthn");
const handleWebAuthnCreateOp = require("../../../lib/webauthn/handleWebAuthnCreateOp");
const webauthn = require("../webauthn");

jest.mock("../../../utils/helpers");
jest.mock("../../../lib/webauthn/handleWebAuthn");
jest.mock("../../../lib/webauthn/handleWebAuthnCreateOp");

const htmlContainer = document.createElement("div");

beforeAll(() => {
  window.IKSDK = {
    config: {
      disableInlineStyles: true,
    },
  };
});

beforeEach(() => {
  jest.resetAllMocks();
  createRenderComponentCallback.mockImplementation((fn, el) => el);
});

afterEach(() => {
  htmlContainer.childNodes.forEach((node) => htmlContainer.removeChild(node));
});

afterAll(() => {
  delete window.IKSDK;
});

const publicKey = { mockedData: 42 };

describe("when it is a creation request with no id", () => {
  const successCallback = jest.fn();
  const failCallback = jest.fn();

  beforeEach(() => {
    isAssertWebauthnRequest.mockImplementation(() => false);

    webauthn({
      onSuccessCallback: successCallback,
      onFailCallback: failCallback,
      htmlContainer,
      context: { publicKey },
    });
  });

  it("pushes a button to the container", () => {
    expect(htmlContainer.childElementCount).toBe(1);
    const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
    expect(buttonEl.innerText).toBe("Create WebAuthn");
  });

  describe("when the button is clicked", () => {
    beforeEach(() => {
      const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
      buttonEl.click();
    });

    it("calls handleWebAuthn function with correct arguments", () => {
      expect(handleWebAuthn).toBeCalledTimes(1);
      expect(handleWebAuthn).toBeCalledWith({
        publicKey,
        onFailCallback: expect.any(Function),
        onSuccessCallback: successCallback,
      });
    });
  });
});

describe("when it is a creation request with id", () => {
  const successCallback = jest.fn();
  const failCallback = jest.fn();

  beforeEach(() => {
    isAssertWebauthnRequest.mockImplementation(() => false);

    webauthn({
      onSuccessCallback: successCallback,
      onFailCallback: failCallback,
      htmlContainer,
      context: { publicKey, "@id": "4422" },
    });
  });

  it("pushes a button to the container", () => {
    expect(htmlContainer.childElementCount).toBe(1);
    const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
    expect(buttonEl.innerText).toBe("Create WebAuthn");
  });

  describe("when the button is clicked", () => {
    beforeEach(() => {
      const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
      buttonEl.click();
    });

    it("calls handleWebAuthn function with correct arguments", () => {
      expect(handleWebAuthn).toBeCalledTimes(1);
      expect(handleWebAuthn).toBeCalledWith({
        publicKey,
        onFailCallback: expect.any(Function),
        onSuccessCallback: successCallback,
        id: "4422",
      });
    });
  });
});

describe("when it is an assert request with no id", () => {
  const successCallback = jest.fn();
  const failCallback = jest.fn();

  beforeEach(() => {
    isAssertWebauthnRequest.mockImplementation(() => true);

    webauthn({
      onSuccessCallback: successCallback,
      onFailCallback: failCallback,
      htmlContainer,
      context: { publicKey },
    });
  });

  it("pushes two buttons to the container", () => {
    expect(htmlContainer.childElementCount).toBe(1);
    const assertButtonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
    expect(assertButtonEl.innerText).toBe("WebAuthn");
  });

  describe("when the assert button is clicked", () => {
    beforeEach(() => {
      const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
      buttonEl.click();
    });

    it("calls handleWebAuthn function with correct arguments", () => {
      expect(handleWebAuthnCreateOp).toBeCalledTimes(0);
      expect(handleWebAuthn).toBeCalledTimes(1);
      expect(handleWebAuthn).toBeCalledWith({
        publicKey,
        onFailCallback: expect.any(Function),
        onSuccessCallback: successCallback,
      });
    });
  });

  describe("when the assert button is clicked and an error is returned", () => {
    describe("when the error is timeout", () => {
      beforeEach(() => {
        handleWebAuthn.mockImplementation(({ onFailCallback }) => {
          onFailCallback(new Error("The operation either timed out or was aborted."));
        });
        const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
        buttonEl.click();
      });

      it("calls handleWebAuthnCreateOp function with correct arguments", () => {
        expect(handleWebAuthn).toBeCalledTimes(1);
        expect(handleWebAuthnCreateOp).toBeCalledTimes(1);
        expect(handleWebAuthnCreateOp).toBeCalledWith({
          onFailCallback: failCallback,
          onSuccessCallback: successCallback,
        });
      });
    });

    describe("when it is a diffreent error", () => {
      beforeEach(() => {
        handleWebAuthn.mockImplementation(({ onFailCallback }) => {
          onFailCallback(new Error("Unknown error."));
        });
        const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
        buttonEl.click();
      });

      it("calls handleWebAuthnCreateOp function with correct arguments", () => {
        expect(handleWebAuthn).toBeCalledTimes(1);
        expect(handleWebAuthnCreateOp).toBeCalledTimes(0);
        expect(failCallback).nthCalledWith(1, new Error("Unknown error."));
      });
    });
  });
});

describe("when it is an assert request with id", () => {
  const successCallback = jest.fn();
  const failCallback = jest.fn();

  beforeEach(() => {
    isAssertWebauthnRequest.mockImplementation(() => true);

    webauthn({
      onSuccessCallback: successCallback,
      onFailCallback: failCallback,
      htmlContainer,
      context: { publicKey, "@id": "4422" },
    });
  });

  it("pushes two buttons to the container", () => {
    expect(htmlContainer.childElementCount).toBe(1);
    const assertButtonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
    expect(assertButtonEl.innerText).toBe("WebAuthn");
  });

  describe("when the assert button is clicked", () => {
    beforeEach(() => {
      const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
      buttonEl.click();
    });

    it("calls handleWebAuthn function with correct arguments", () => {
      expect(handleWebAuthnCreateOp).toBeCalledTimes(0);
      expect(handleWebAuthn).toBeCalledTimes(1);
      expect(handleWebAuthn).toBeCalledWith({
        publicKey,
        onFailCallback: expect.any(Function),
        onSuccessCallback: successCallback,
        id: "4422",
      });
    });
  });

  describe("when the assert button is clicked and an error is returned", () => {
    describe("when the error is timeout", () => {
      beforeEach(() => {
        handleWebAuthn.mockImplementation(({ onFailCallback }) => {
          onFailCallback(new Error("The operation either timed out or was aborted."));
        });
        const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
        buttonEl.click();
      });

      it("calls handleWebAuthnCreateOp function with correct arguments", () => {
        expect(handleWebAuthn).toBeCalledTimes(1);
        expect(handleWebAuthnCreateOp).toBeCalledTimes(1);
        expect(handleWebAuthnCreateOp).toBeCalledWith({
          onFailCallback: failCallback,
          onSuccessCallback: successCallback,
          id: "4422",
        });
      });
    });

    describe("when it is a diffreent error", () => {
      beforeEach(() => {
        handleWebAuthn.mockImplementation(({ onFailCallback }) => {
          onFailCallback(new Error("Unknown error."));
        });
        const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
        buttonEl.click();
      });

      it("calls handleWebAuthnCreateOp function with correct arguments", () => {
        expect(handleWebAuthn).toBeCalledTimes(1);
        expect(handleWebAuthnCreateOp).toBeCalledTimes(0);
        expect(failCallback).nthCalledWith(1, new Error("Unknown error."));
      });
    });
  });
});
