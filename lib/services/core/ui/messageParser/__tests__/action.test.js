const action = require("../action");
const { createRenderComponentCallback } = require("../../../utils/helpers");
const { navButtonUI } = require("../../components/buttons");

jest.mock("../../../utils/helpers");
jest.mock("../../components/buttons");

const originalLocation = window.location;
delete window.location;

/**
 * @type {{ htmlContainer: HTMLElement }}
 */
let props;

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
        registerButton: "Register",
      },
    },
    paths: {
      login: "/my/login/page",
      forgotPassword: "/my/forgot-password/page",
      registration: "/my/registration/path",
    },
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
});

describe("when the action is in the 'registration' section", () => {
  beforeEach(() => {
    props.isRegistration = true;
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
        "/my/login/page?mockedKey=mockedValue",
      );
    });

    it("creates the navigation button", () => {
      expect(navButtonUI).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledWith({
        id: "IKUISDK-btn-to-login",
        label: "Already have an account",
        href: "/my/login/page?mockedKey=mockedValue",
      });
    });
  });

  describe("when custom label is used used", () => {
    beforeEach(() => {
      props.labels.custom = {
        alreadyHaveAnAccountButton: "I have an account",
      };

      action(props);
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
        href: "/my/login/page?mockedKey=mockedValue",
      });
    });
  });
});

describe("when the action is not in the 'registration' section", () => {
  beforeEach(() => {
    props.isRegistration = false;
  });

  describe("when context has no options", () => {
    beforeEach(() => {
      action(props);
    });

    it("adds nothing to the container", () => {
      expect(props.htmlContainer.children.length).toBe(0);
    });
  });

  describe("when context contains 'forgotten' options", () => {
    beforeEach(() => {
      props.context = {
        opts: [
          {
            hint: "forgotten",
          },
        ],
      };
    });

    describe("when no custom labels are used", () => {
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
          "/my/forgot-password/page?mockedKey=mockedValue",
        );
      });

      it("creates the navigation button", () => {
        expect(navButtonUI).toBeCalledTimes(1);
        expect(navButtonUI).toBeCalledWith({
          id: "IKUISDK-btn-to-forgot-password",
          label: "Forgotten password?",
          href: "/my/forgot-password/page?mockedKey=mockedValue",
        });
      });
    });

    describe("when custom labels are used", () => {
      beforeEach(() => {
        props.labels.custom = {
          forgotPasswordButton: "Reset password",
        };

        action(props);
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
          href: "/my/forgot-password/page?mockedKey=mockedValue",
        });
      });
    });
  });

  describe("when context contains 'register' options", () => {
    beforeEach(() => {
      props.context = {
        opts: [
          {
            hint: "register",
          },
        ],
      };
    });

    describe("when no custom labels are used", () => {
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
          "/my/registration/path",
        );
      });

      it("creates the navigation button", () => {
        expect(navButtonUI).toBeCalledTimes(1);
        expect(navButtonUI).toBeCalledWith({
          id: "IKUISDK-btn-to-registration",
          label: "Register",
          href: "/my/registration/path",
        });
      });
    });

    describe("when custom labels are used", () => {
      beforeEach(() => {
        props.labels.custom = {
          registerButton: "Registration",
        };

        action(props);
      });

      it("calls createRenderComponentCallback with correct arguments", () => {
        expect(createRenderComponentCallback).toBeCalledTimes(1);
        expect(navButtonUI).toBeCalledTimes(1);
        expect(createRenderComponentCallback).toBeCalledWith(
          undefined,
          navButtonUI.mock.results[0].value,
          "action",
          "register",
          "Registration",
          "/my/registration/path",
        );
      });

      it("creates the navigation button", () => {
        expect(navButtonUI).toBeCalledTimes(1);
        expect(navButtonUI).toBeCalledWith({
          id: "IKUISDK-btn-to-registration",
          label: "Registration",
          href: "/my/registration/path",
        });
      });
    });
  });
});
