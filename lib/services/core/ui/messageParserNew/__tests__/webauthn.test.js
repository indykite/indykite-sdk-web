const {
  createRenderComponentCallback,
  isAssertWebauthnRequest,
} = require("../../../utils/helpers");
const { primaryButtonUI } = require("../../components/buttons");
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

describe("when it is a creation request", () => {
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
    expect(buttonEl.innerText).toBe("WebAuthn");
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
        onFailCallback: failCallback,
        onSuccessCallback: successCallback,
      });
    });
  });
});

describe("when it is an assert request", () => {
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
    expect(htmlContainer.childElementCount).toBe(2);
    const assertButtonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn");
    expect(assertButtonEl.innerText).toBe("WebAuthn");
    const createButtonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn-create");
    expect(createButtonEl.innerText).toBe("Create WebAuthn credentials");
  });

  describe("when the create button is clicked", () => {
    beforeEach(() => {
      const buttonEl = htmlContainer.querySelector("button#IKUISDK-btn-webauthn-create");
      buttonEl.click();
    });

    it("calls handleWebAuthn function with correct arguments", () => {
      expect(handleWebAuthn).toBeCalledTimes(0);
      expect(handleWebAuthnCreateOp).toBeCalledTimes(1);
      expect(handleWebAuthnCreateOp).toBeCalledWith({
        onFailCallback: failCallback,
        onSuccessCallback: successCallback,
      });
    });
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
        onFailCallback: failCallback,
        onSuccessCallback: successCallback,
      });
    });
  });
});
