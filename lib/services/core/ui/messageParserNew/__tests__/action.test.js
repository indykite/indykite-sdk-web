const action = require("../action");
const { createRenderComponentCallback } = require("../../../utils/helpers");
const { navButtonUI } = require("../../components/buttons");
const handleAction = require("../../../lib/handleAction");

jest.mock("../../../utils/helpers");
jest.mock("../../components/buttons");
jest.mock("../../../lib/handleAction");
jest.mock("../../../lib/storage");

/**
 * @type {{ htmlContainer: HTMLElement }}
 */
let props;

jest.spyOn(console, "error");

beforeEach(() => {
  jest.resetAllMocks();

  props = {
    htmlContainer: document.createElement("div"),
    onSuccessCallback: jest.fn(),
    onFailCallback: jest.fn(),
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

describe("when context contains 'register' option", () => {
  beforeEach(() => {
    props.context = {
      "@id": "action-id",
      opts: [
        {
          hint: "register",
          icon: "register-icon",
          locale_key: "CREATE_ACCOUNT",
        },
      ],
    };
  });

  describe("when actionLabels property is present", () => {
    beforeEach(() => {
      props.actionLabels = {
        CREATE_ACCOUNT: "Create a new account",
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
          "register",
          "Create a new account",
        );
      });

      it("creates the navigation button", () => {
        expect(navButtonUI).toBeCalledTimes(1);
        expect(navButtonUI).toBeCalledWith({
          id: "IKUISDK-btn-action-register",
          label: "Create a new account",
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

          it("does not call fail callback", () => {
            expect(props.onFailCallback).toBeCalledTimes(0);
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

          it("calls the fail callback", () => {
            expect(props.onFailCallback).toBeCalledTimes(1);
            expect(props.onFailCallback).toBeCalledWith(error);
          });

          it("prints the error to the console", () => {
            expect(console.error).toBeCalledTimes(1);
            expect(console.error).toBeCalledWith(error);
          });
        });
      });
    });
  });

  describe("when actionLabels property is not present", () => {
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
        "CREATE_ACCOUNT",
      );
    });

    it("creates the navigation button", () => {
      expect(navButtonUI).toBeCalledTimes(1);
      expect(navButtonUI).toBeCalledWith({
        id: "IKUISDK-btn-action-register",
        label: "CREATE_ACCOUNT",
        onClick: expect.any(Function),
      });
    });
  });
});
