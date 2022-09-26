const action = require("../action");
const { createRenderComponentCallback } = require("../../../utils/helpers");
const { navButtonUI } = require("../../components/buttons");
const handleAction = require("../../../lib/handleAction");
const { setPendingResponse } = require("../../../lib/storage");

jest.mock("../../../utils/helpers");
jest.mock("../../components/buttons");
jest.mock("../../../lib/handleAction");
jest.mock("../../../lib/storage");

const originalLocation = window.location;
delete window.location;

/**
 * @type {{ htmlContainer: HTMLElement }}
 */
let props;

jest.spyOn(console, "error");

window.IKSDK = {
  config: { disableInlineStyles: false },
};

beforeEach(() => {
  jest.resetAllMocks();
  window.location = {
    search: "?mockedKey=mockedValue",
  };

  props = {
    htmlContainer: document.createElement("div"),
    labels: {
      default: {
        alreadyHaveAnAccountButton: "Already have an account",
        forgotPasswordButton: "Forgotten password?",
        registerLinkButton: "Register",
      },
    },
    // paths: {
    //   login: "/my/login/page",
    //   forgotPassword: "/my/forgot-password/page",
    //   registration: "/my/registration/path",
    // },
    onSuccessCallback: jest.fn(),
  };

  createRenderComponentCallback.mockImplementation((...args) => {
    const originalModule = jest.requireActual("../../../utils/helpers");

    return originalModule.createRenderComponentCallback(...args);
  });

  navButtonUI.mockImplementation((...args) => {
    const originalModule = jest.requireActual("../../components/buttons");

    return originalModule.navButtonUI(...args);
  });
});

afterAll(() => {
  window.location = originalLocation;
  console.error.mockRestore();
});

describe("when context has no options", () => {
  beforeEach(() => {
    action(props);
  });

  it("adds nothing to the container", () => {
    expect(props.htmlContainer.children.length).toBe(0);
  });
});

describe("when context contains 'login' option", () => {
  beforeEach(() => {
    props.context = {
      "@id": "action-id",
      opts: [
        {
          hint: "login",
        },
      ],
    };
  });

  describe("when no non-required props are used", () => {
    beforeEach(() => {
      action(props);
    });

    it("adds an element to the container", () => {
      expect(props.htmlContainer.children.length).toBeGreaterThan(0);
    });

    it("calls createRenderComponentCallback with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        undefined,
        navButtonUI.mock.results[0].value,
        "action",
        "alreadyRegistered",
        "Already have an account",
        undefined,
      );
    });

    it("creates the navigation button", () => {
      expect(navButtonUI).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledWith({
        id: "IKUISDK-btn-to-login",
        label: "Already have an account",
        onClick: expect.any(Function),
      });
    });

    describe("when the button is clicked", () => {
      describe("when the action is handled successfully", () => {
        const handleActionResponse = {
          "~thread": {
            thid: "thread-id",
          },
          "@type": "oidc",
          prv: "indykite.me",
        };

        beforeEach(() => {
          handleAction.mockImplementation(() => handleActionResponse);

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("handles action with correct arguments", () => {
          expect(handleAction).toBeCalledTimes(1);
          expect(handleAction).toBeCalledWith({
            id: "action-id",
            action: "login",
          });
        });

        it("calls success callback with the response", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(1);
          expect(props.onSuccessCallback).toBeCalledWith(handleActionResponse);
        });

        it("does not store any pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(0);
        });

        it("does not do any redirection", () => {
          expect(window.location.href).toBeUndefined();
        });

        it("does not print any errors to the console", () => {
          expect(console.error).toBeCalledTimes(0);
        });
      });

      describe("when the action handler throws an error", () => {
        const error = new Error("Test error");

        beforeEach(() => {
          handleAction.mockImplementation(() => Promise.reject(error));

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("does not store any pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(0);
        });

        it("does not do any redirection", () => {
          expect(window.location.href).toBeUndefined();
        });

        it("prints the error to the console", () => {
          expect(console.error).toBeCalledTimes(1);
          expect(console.error).toBeCalledWith(error);
        });
      });
    });
  });

  describe("when custom path and labels are used", () => {
    beforeEach(() => {
      props.paths = {
        login: "/my/login/page",
      };

      props.labels.custom = {
        alreadyHaveAnAccountButton: "I have an account",
      };

      action(props);
    });

    it("adds an element to the container", () => {
      expect(props.htmlContainer.children.length).toBeGreaterThan(0);
    });

    it("calls createRenderComponentCallback with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        undefined,
        navButtonUI.mock.results[0].value,
        "action",
        "alreadyRegistered",
        "I have an account",
        "/my/login/page?mockedKey=mockedValue",
      );
    });

    it("creates the navigation button", () => {
      expect(navButtonUI).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledWith({
        id: "IKUISDK-btn-to-login",
        label: "I have an account",
        onClick: expect.any(Function),
      });
    });

    describe("when the button is clicked", () => {
      describe("when the action is handled successfully", () => {
        const handleActionResponse = {
          "~thread": {
            thid: "thread-id",
          },
          "@type": "oidc",
          prv: "indykite.me",
        };

        beforeEach(() => {
          handleAction.mockImplementation(() => handleActionResponse);

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("handles action with correct arguments", () => {
          expect(handleAction).toBeCalledTimes(1);
          expect(handleAction).toBeCalledWith({
            id: "action-id",
            action: "login",
          });
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("stores pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(1);
          expect(setPendingResponse).toBeCalledWith(handleActionResponse);
        });

        it("redirects page to a new url", () => {
          expect(window.location.href).toBe("/my/login/page?mockedKey=mockedValue");
        });

        it("does not print any errors to the console", () => {
          expect(console.error).toBeCalledTimes(0);
        });
      });

      describe("when the action handler throws an error", () => {
        const error = new Error("Test error");

        beforeEach(() => {
          handleAction.mockImplementation(() => Promise.reject(error));

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("does not store any pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(0);
        });

        it("redirects page to a new url", () => {
          expect(window.location.href).toBe("/my/login/page?mockedKey=mockedValue");
        });

        it("prints the error to the console", () => {
          expect(console.error).toBeCalledTimes(2);
          expect(console.error).nthCalledWith(
            1,
            "Temporary fallback: Redirection will not work in the future. Make sure your authentication flow is setup correctly (action node outputs must not be empty).",
          );
          expect(console.error).nthCalledWith(2, error);
        });
      });
    });
  });

  describe("when custom path and labels are used and location has no search value", () => {
    beforeEach(() => {
      props.paths = {
        login: "/my/login/page",
      };

      props.labels.custom = {
        alreadyHaveAnAccountButton: "I have an account",
      };

      window.location = {};

      action(props);
    });

    it("adds an element to the container", () => {
      expect(props.htmlContainer.children.length).toBeGreaterThan(0);
    });

    it("calls createRenderComponentCallback with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        undefined,
        navButtonUI.mock.results[0].value,
        "action",
        "alreadyRegistered",
        "I have an account",
        "/my/login/page",
      );
    });

    it("creates the navigation button", () => {
      expect(navButtonUI).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledWith({
        id: "IKUISDK-btn-to-login",
        label: "I have an account",
        onClick: expect.any(Function),
      });
    });

    describe("when the button is clicked", () => {
      describe("when the action is handled successfully", () => {
        const handleActionResponse = {
          "~thread": {
            thid: "thread-id",
          },
          "@type": "oidc",
          prv: "indykite.me",
        };

        beforeEach(() => {
          handleAction.mockImplementation(() => handleActionResponse);

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("handles action with correct arguments", () => {
          expect(handleAction).toBeCalledTimes(1);
          expect(handleAction).toBeCalledWith({
            id: "action-id",
            action: "login",
          });
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("stores pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(1);
          expect(setPendingResponse).toBeCalledWith(handleActionResponse);
        });

        it("redirects page to a new url", () => {
          expect(window.location.href).toBe("/my/login/page");
        });

        it("does not print any errors to the console", () => {
          expect(console.error).toBeCalledTimes(0);
        });
      });

      describe("when the action handler throws an error", () => {
        const error = new Error("Test error");

        beforeEach(() => {
          handleAction.mockImplementation(() => Promise.reject(error));

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("does not store any pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(0);
        });

        it("redirects page to a new url", () => {
          expect(window.location.href).toBe("/my/login/page");
        });

        it("prints the error to the console", () => {
          expect(console.error).toBeCalledTimes(2);
          expect(console.error).nthCalledWith(
            1,
            "Temporary fallback: Redirection will not work in the future. Make sure your authentication flow is setup correctly (action node outputs must not be empty).",
          );
          expect(console.error).nthCalledWith(2, error);
        });
      });
    });
  });
});

describe("when context contains 'register' option", () => {
  beforeEach(() => {
    props.context = {
      "@id": "action-id",
      opts: [
        {
          hint: "register",
        },
      ],
    };
    props.onFailCallback = jest.fn();
  });

  describe("when no non-required props are used", () => {
    beforeEach(() => {
      action(props);
    });

    it("adds an element to the container", () => {
      expect(props.htmlContainer.children.length).toBeGreaterThan(0);
    });

    it("calls createRenderComponentCallback with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        undefined,
        navButtonUI.mock.results[0].value,
        "action",
        "register",
        "Register",
        undefined,
      );
    });

    it("creates the navigation button", () => {
      expect(navButtonUI).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledWith({
        id: "IKUISDK-btn-to-registration",
        label: "Register",
        onClick: expect.any(Function),
      });
    });

    describe("when the button is clicked", () => {
      describe("when the action is handled successfully", () => {
        const handleActionResponse = {
          "~thread": {
            thid: "thread-id",
          },
          "@type": "oidc",
          prv: "indykite.me",
        };

        beforeEach(() => {
          handleAction.mockImplementation(() => handleActionResponse);

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("handles action with correct arguments", () => {
          expect(handleAction).toBeCalledTimes(1);
          expect(handleAction).toBeCalledWith({
            id: "action-id",
            action: "register",
          });
        });

        it("calls success callback with the response", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(1);
          expect(props.onSuccessCallback).toBeCalledWith(handleActionResponse);
        });

        it("does not store any pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(0);
        });

        it("does not do any redirection", () => {
          expect(window.location.href).toBeUndefined();
        });

        it("does not print any errors to the console", () => {
          expect(console.error).toBeCalledTimes(0);
        });
      });

      describe("when the action handler throws an error", () => {
        const error = new Error("Test error");

        beforeEach(() => {
          handleAction.mockImplementation(() => Promise.reject(error));

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("does not store any pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(0);
        });

        it("does not do any redirection", () => {
          expect(window.location.href).toBeUndefined();
        });

        it("prints the error to the console", () => {
          expect(console.error).toBeCalledTimes(1);
          expect(console.error).toBeCalledWith(error);
        });

        it("calls the fail callback", () => {
          expect(props.onFailCallback).toBeCalledTimes(1);
          expect(props.onFailCallback).toBeCalledWith(error);
        });
      });
    });
  });

  describe("when custom path and labels are used", () => {
    beforeEach(() => {
      props.paths = {
        registration: "/my/registration/page",
      };

      props.labels.custom = {
        registerLinkButton: "Register me",
      };

      action(props);
    });

    it("adds an element to the container", () => {
      expect(props.htmlContainer.children.length).toBeGreaterThan(0);
    });

    it("calls createRenderComponentCallback with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        undefined,
        navButtonUI.mock.results[0].value,
        "action",
        "register",
        "Register me",
        "/my/registration/page?mockedKey=mockedValue",
      );
    });

    it("creates the navigation button", () => {
      expect(navButtonUI).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledWith({
        id: "IKUISDK-btn-to-registration",
        label: "Register me",
        onClick: expect.any(Function),
      });
    });

    describe("when the button is clicked", () => {
      describe("when the action is handled successfully", () => {
        const handleActionResponse = {
          "~thread": {
            thid: "thread-id",
          },
          "@type": "oidc",
          prv: "indykite.me",
        };

        beforeEach(() => {
          handleAction.mockImplementation(() => handleActionResponse);

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("handles action with correct arguments", () => {
          expect(handleAction).toBeCalledTimes(1);
          expect(handleAction).toBeCalledWith({
            id: "action-id",
            action: "register",
          });
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("stores pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(1);
          expect(setPendingResponse).toBeCalledWith(handleActionResponse);
        });

        it("redirects page to a new url", () => {
          expect(window.location.href).toBe("/my/registration/page?mockedKey=mockedValue");
        });

        it("does not print any errors to the console", () => {
          expect(console.error).toBeCalledTimes(0);
        });
      });

      describe("when the action handler throws an error", () => {
        const error = new Error("Test error");

        beforeEach(() => {
          handleAction.mockImplementation(() => Promise.reject(error));

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("does not store any pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(0);
        });

        it("redirects page to a new url", () => {
          expect(window.location.href).toBe("/my/registration/page?mockedKey=mockedValue");
        });

        it("prints the error to the console", () => {
          expect(console.error).toBeCalledTimes(2);
          expect(console.error).nthCalledWith(
            1,
            "Temporary fallback: Redirection will not work in the future. Make sure your authentication flow is setup correctly (action node outputs must not be empty).",
          );
          expect(console.error).nthCalledWith(2, error);
        });

        it("does not call the fail callback", () => {
          expect(props.onFailCallback).toBeCalledTimes(0);
        });
      });
    });
  });
});

describe("when context contains 'forgotten' option", () => {
  beforeEach(() => {
    props.context = {
      "@id": "action-id",
      opts: [
        {
          hint: "forgotten",
        },
      ],
    };
  });

  describe("when no non-required props are used", () => {
    beforeEach(() => {
      action(props);
    });

    it("adds an element to the container", () => {
      expect(props.htmlContainer.children.length).toBeGreaterThan(0);
    });

    it("calls createRenderComponentCallback with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        undefined,
        navButtonUI.mock.results[0].value,
        "action",
        "forgotten",
        "Forgotten password?",
        undefined,
      );
    });

    it("creates the navigation button", () => {
      expect(navButtonUI).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledWith({
        id: "IKUISDK-btn-to-forgot-password",
        label: "Forgotten password?",
        onClick: expect.any(Function),
      });
    });

    describe("when the button is clicked", () => {
      describe("when the action is handled successfully", () => {
        const handleActionResponse = {
          "~thread": {
            thid: "thread-id",
          },
          "@type": "oidc",
          prv: "indykite.me",
        };

        beforeEach(() => {
          handleAction.mockImplementation(() => handleActionResponse);

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("handles action with correct arguments", () => {
          expect(handleAction).toBeCalledTimes(1);
          expect(handleAction).toBeCalledWith({
            id: "action-id",
            action: "forgotten",
          });
        });

        it("calls success callback with the response", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(1);
          expect(props.onSuccessCallback).toBeCalledWith(handleActionResponse);
        });

        it("does not store any pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(0);
        });

        it("does not do any redirection", () => {
          expect(window.location.href).toBeUndefined();
        });

        it("does not print any errors to the console", () => {
          expect(console.error).toBeCalledTimes(0);
        });
      });

      describe("when the action handler throws an error", () => {
        const error = new Error("Test error");

        beforeEach(() => {
          handleAction.mockImplementation(() => Promise.reject(error));

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("does not store any pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(0);
        });

        it("does not do any redirection", () => {
          expect(window.location.href).toBeUndefined();
        });

        it("prints the error to the console", () => {
          expect(console.error).toBeCalledTimes(1);
          expect(console.error).toBeCalledWith(error);
        });
      });
    });
  });

  describe("when custom path and labels are used", () => {
    beforeEach(() => {
      props.paths = {
        forgotPassword: "/my/forgot-password/page",
      };

      props.labels.custom = {
        forgotPasswordButton: "Reset password",
      };

      action(props);
    });

    it("adds an element to the container", () => {
      expect(props.htmlContainer.children.length).toBeGreaterThan(0);
    });

    it("calls createRenderComponentCallback with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        undefined,
        navButtonUI.mock.results[0].value,
        "action",
        "forgotten",
        "Reset password",
        "/my/forgot-password/page?mockedKey=mockedValue",
      );
    });

    it("creates the navigation button", () => {
      expect(navButtonUI).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledWith({
        id: "IKUISDK-btn-to-forgot-password",
        label: "Reset password",
        onClick: expect.any(Function),
      });
    });

    describe("when the button is clicked", () => {
      describe("when the action is handled successfully", () => {
        const handleActionResponse = {
          "~thread": {
            thid: "thread-id",
          },
          "@type": "oidc",
          prv: "indykite.me",
        };

        beforeEach(() => {
          handleAction.mockImplementation(() => handleActionResponse);

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("handles action with correct arguments", () => {
          expect(handleAction).toBeCalledTimes(1);
          expect(handleAction).toBeCalledWith({
            id: "action-id",
            action: "forgotten",
          });
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("stores pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(1);
          expect(setPendingResponse).toBeCalledWith(handleActionResponse);
        });

        it("redirects page to a new url", () => {
          expect(window.location.href).toBe("/my/forgot-password/page?mockedKey=mockedValue");
        });

        it("does not print any errors to the console", () => {
          expect(console.error).toBeCalledTimes(0);
        });
      });

      describe("when the action handler throws an error", () => {
        const error = new Error("Test error");

        beforeEach(() => {
          handleAction.mockImplementation(() => Promise.reject(error));

          return navButtonUI.mock.calls[0][0].onClick();
        });

        it("does not call success callback", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(0);
        });

        it("does not store any pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(0);
        });

        it("redirects page to a new url", () => {
          expect(window.location.href).toBe("/my/forgot-password/page?mockedKey=mockedValue");
        });

        it("prints the error to the console", () => {
          expect(console.error).toBeCalledTimes(2);
          expect(console.error).nthCalledWith(
            1,
            "Temporary fallback: Redirection will not work in the future. Make sure your authentication flow is setup correctly (action node outputs must not be empty).",
          );
          expect(console.error).nthCalledWith(2, error);
        });
      });
    });
  });
});

describe("when context contains custom option", () => {
  beforeEach(() => {
    props.context = {
      "@id": "action-id",
      opts: [
        {
          hint: "test",
          locale_key: "Test Option",
        },
      ],
    };

    action(props);
  });

  it("adds an element to the container", () => {
    expect(props.htmlContainer.children.length).toBeGreaterThan(0);
  });

  it("calls createRenderComponentCallback with correct arguments", () => {
    expect(createRenderComponentCallback).toBeCalledTimes(1);
    expect(navButtonUI).toBeCalledTimes(1);
    expect(createRenderComponentCallback).toBeCalledWith(
      undefined,
      navButtonUI.mock.results[0].value,
      "action",
      "test",
      "Test Option",
      undefined,
    );
  });

  it("creates the navigation button", () => {
    expect(navButtonUI).toBeCalledTimes(1);
    expect(navButtonUI).toBeCalledWith({
      label: "Test Option",
      onClick: expect.any(Function),
    });
  });

  describe("when the button is clicked", () => {
    describe("when the action is handled successfully", () => {
      const handleActionResponse = {
        "~thread": {
          thid: "thread-id",
        },
        "@type": "oidc",
        prv: "indykite.me",
      };

      beforeEach(() => {
        handleAction.mockImplementation(() => handleActionResponse);

        return navButtonUI.mock.calls[0][0].onClick();
      });

      it("handles action with correct arguments", () => {
        expect(handleAction).toBeCalledTimes(1);
        expect(handleAction).toBeCalledWith({
          id: "action-id",
          action: "test",
        });
      });

      it("calls success callback with the response", () => {
        expect(props.onSuccessCallback).toBeCalledTimes(1);
        expect(props.onSuccessCallback).toBeCalledWith(handleActionResponse);
      });

      it("does not store any pending response", () => {
        expect(setPendingResponse).toBeCalledTimes(0);
      });

      it("does not do any redirection", () => {
        expect(window.location.href).toBeUndefined();
      });

      it("does not print any errors to the console", () => {
        expect(console.error).toBeCalledTimes(0);
      });
    });

    describe("when the action handler throws an error", () => {
      const error = new Error("Test error");

      beforeEach(() => {
        handleAction.mockImplementation(() => Promise.reject(error));

        return navButtonUI.mock.calls[0][0].onClick();
      });

      it("does not call success callback", () => {
        expect(props.onSuccessCallback).toBeCalledTimes(0);
      });

      it("does not store any pending response", () => {
        expect(setPendingResponse).toBeCalledTimes(0);
      });

      it("does not do any redirection", () => {
        expect(window.location.href).toBeUndefined();
      });

      it("prints the error to the console", () => {
        expect(console.error).toBeCalledTimes(1);
        expect(console.error).toBeCalledWith(error);
      });
    });
  });
});

// describe("when context contains 'forgotten' option", () => {
//   beforeEach(() => {
//     props.context = {
//       opts: [
//         {
//           hint: "forgotten",
//         },
//       ],
//     };
//   });

//   describe("when no custom labels are used", () => {
//     beforeEach(() => {
//       action(props);
//     });

//     it("adds an element to the container", () => {
//       expect(props.htmlContainer.children.length).toBeGreaterThan(0);
//     });

//     it("calls createRenderComponentCallback with correct arguments", () => {
//       expect(createRenderComponentCallback).toBeCalledTimes(1);
//       expect(navButtonUI).toBeCalledTimes(1);
//       expect(createRenderComponentCallback).toBeCalledWith(
//         undefined,
//         navButtonUI.mock.results[0].value,
//         "action",
//         "forgotten",
//         "Forgotten password?",
//         "/my/forgot-password/page?mockedKey=mockedValue",
//       );
//     });

//     it("creates the navigation button", () => {
//       expect(navButtonUI).toBeCalledTimes(1);
//       expect(navButtonUI).toBeCalledWith({
//         id: "IKUISDK-btn-to-forgot-password",
//         label: "Forgotten password?",
//         href: "/my/forgot-password/page?mockedKey=mockedValue",
//       });
//     });
//   });

//   describe("when custom labels are used", () => {
//     beforeEach(() => {
//       props.labels.custom = {
//         forgotPasswordButton: "Reset password",
//       };

//       action(props);
//     });

//     it("calls createRenderComponentCallback with correct arguments", () => {
//       expect(createRenderComponentCallback).toBeCalledTimes(1);
//       expect(navButtonUI).toBeCalledTimes(1);
//       expect(createRenderComponentCallback).toBeCalledWith(
//         undefined,
//         navButtonUI.mock.results[0].value,
//         "action",
//         "forgotten",
//         "Reset password",
//         "/my/forgot-password/page?mockedKey=mockedValue",
//       );
//     });

//     it("creates the navigation button", () => {
//       expect(navButtonUI).toBeCalledTimes(1);
//       expect(navButtonUI).toBeCalledWith({
//         id: "IKUISDK-btn-to-forgot-password",
//         label: "Reset password",
//         href: "/my/forgot-password/page?mockedKey=mockedValue",
//       });
//     });
//   });
// });

// describe("when context contains 'register' option", () => {
//   beforeEach(() => {
//     props.context = {
//       opts: [
//         {
//           hint: "register",
//         },
//       ],
//     };
//   });

//   describe("when no custom labels are used", () => {
//     beforeEach(() => {
//       action(props);
//     });

//     it("adds an element to the container", () => {
//       expect(props.htmlContainer.children.length).toBeGreaterThan(0);
//     });

//     it("calls createRenderComponentCallback with correct arguments", () => {
//       expect(createRenderComponentCallback).toBeCalledTimes(1);
//       expect(navButtonUI).toBeCalledTimes(1);
//       expect(createRenderComponentCallback).toBeCalledWith(
//         undefined,
//         navButtonUI.mock.results[0].value,
//         "action",
//         "register",
//         "Register",
//         "/my/registration/path",
//       );
//     });

//     it("creates the navigation button", () => {
//       expect(navButtonUI).toBeCalledTimes(1);
//       expect(navButtonUI).toBeCalledWith({
//         id: "IKUISDK-btn-to-registration",
//         label: "Register",
//         href: "/my/registration/path",
//       });
//     });
//   });

//   describe("when custom labels are used", () => {
//     beforeEach(() => {
//       props.labels.custom = {
//         registerButton: "Registration",
//       };

//       action(props);
//     });

//     it("calls createRenderComponentCallback with correct arguments", () => {
//       expect(createRenderComponentCallback).toBeCalledTimes(1);
//       expect(navButtonUI).toBeCalledTimes(1);
//       expect(createRenderComponentCallback).toBeCalledWith(
//         undefined,
//         navButtonUI.mock.results[0].value,
//         "action",
//         "register",
//         "Registration",
//         "/my/registration/path",
//       );
//     });

//     it("creates the navigation button", () => {
//       expect(navButtonUI).toBeCalledTimes(1);
//       expect(navButtonUI).toBeCalledWith({
//         id: "IKUISDK-btn-to-registration",
//         label: "Registration",
//         href: "/my/registration/path",
//       });
//     });
//   });
// });
