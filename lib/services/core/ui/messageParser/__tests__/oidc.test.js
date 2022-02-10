const oidc = require("../oidc");
const { oidcButtonUI } = require("../../components/buttons");
const { createRenderComponentCallback } = require("../../../utils/helpers");
const oidcSetup = require("../../../lib/login/oidcSetup");

jest.mock("../../components/buttons");
jest.mock("../../../lib/login/oidcSetup");
jest.mock("../../../utils/helpers", () => {
  const originalModule = jest.requireActual("../../../utils/helpers");
  return {
    ...originalModule,
    createRenderComponentCallback: jest.fn(),
  };
});

let props;

beforeEach(() => {
  jest.resetAllMocks();

  const mockedButton = document.createElement("button");
  oidcButtonUI.mockImplementation(() => mockedButton);

  createRenderComponentCallback.mockImplementation((...args) => {
    const originalModule = jest.requireActual("../../../utils/helpers");
    return originalModule.createRenderComponentCallback(...args);
  });

  props = {
    context: {
      "@id": "12345",
      prv: "indykite.id",
      url: "https://example.com",
    },
    htmlContainer: document.createElement("div"),
    redirectUri: "https:/address.com/to/redirect",
  };
});

describe("when provider has a name", () => {
  beforeEach(() => {
    props.context.name = "indykite.me";
  });

  describe("when loginApp prop is not specified", () => {
    describe("when onRenderComponent prop is used", () => {
      beforeEach(() => {
        const onRenderComponent = jest.fn();
        props.onRenderComponent = onRenderComponent;
      });

      describe("when onRenderComponent does not return a new component", () => {
        beforeEach(() => {
          return oidc(props);
        });

        it("creates a correct default button", () => {
          expect(oidcButtonUI).toBeCalledTimes(1);
          expect(oidcButtonUI).toBeCalledWith({
            id: "IKUISDK-btn-oidc-indykite-me",
            data: props.context,
            onClick: expect.any(Function),
          });
        });

        it("appends the correct component to the container", () => {
          expect(createRenderComponentCallback).toBeCalledTimes(1);
          expect(createRenderComponentCallback).toBeCalledWith(
            props.onRenderComponent,
            oidcButtonUI.mock.results[0].value,
            "oidcButton",
            props.context.prv,
            expect.any(Function),
            props.context["@id"],
            props.context.url,
          );

          // Default onClick handler should be passed to the onRenderComponent function
          expect(oidcButtonUI.mock.calls[0][0].onClick).toBe(
            createRenderComponentCallback.mock.calls[0][4],
          );

          expect(props.htmlContainer.childElementCount).toBe(1);
          expect(props.htmlContainer.children.item(0)).toBe(oidcButtonUI.mock.results[0].value);
        });

        describe("when the button is clicked", () => {
          beforeEach(() => {
            oidcButtonUI.mock.calls[0][0].onClick();
          });

          it("calls oidcSetup with correct parameters", () => {
            expect(oidcSetup).toBeCalledTimes(1);
            expect(oidcSetup).toBeCalledWith({
              id: "12345",
              redirectUri: "https:/address.com/to/redirect",
            });
          });
        });
      });

      describe("when onRenderComponent returns a new component", () => {
        beforeEach(() => {
          props.onRenderComponent.mockImplementation(
            (defaultButton, componentType, provider, clickHanlder) => {
              const customButton = document.createElement("button");
              customButton.classList.add("custom");
              customButton.addEventListener("click", clickHanlder);
              return customButton;
            },
          );

          return oidc(props);
        });

        it("appends the correct component to the container", () => {
          expect(props.htmlContainer.childElementCount).toBe(1);
          expect(props.htmlContainer.children.item(0)).toBe(
            props.onRenderComponent.mock.results[0].value,
          );
        });

        describe("when the button is clicked", () => {
          beforeEach(() => {
            props.onRenderComponent.mock.results[0].value.click();
          });

          it("calls oidcSetup with correct parameters", () => {
            expect(oidcSetup).toBeCalledTimes(1);
            expect(oidcSetup).toBeCalledWith({
              id: "12345",
              redirectUri: "https:/address.com/to/redirect",
            });
          });
        });
      });
    });

    describe("when onRenderComponent prop is not used", () => {
      beforeEach(() => {
        return oidc(props);
      });

      describe("when the button is clicked", () => {
        beforeEach(() => {
          oidcButtonUI.mock.calls[0][0].onClick();
        });

        it("calls oidcSetup with correct parameters", () => {
          expect(oidcSetup).toBeCalledTimes(1);
          expect(oidcSetup).toBeCalledWith({
            id: "12345",
            redirectUri: "https:/address.com/to/redirect",
          });
        });
      });
    });
  });

  describe("when loginApp prop is specified", () => {
    beforeEach(() => {
      props.loginApp = {
        12345: "custom-app",
      };
      return oidc(props);
    });

    it("creates a correct default button", () => {
      expect(oidcButtonUI).toBeCalledTimes(1);
      expect(oidcButtonUI).toBeCalledWith({
        id: "IKUISDK-btn-oidc-indykite-me",
        data: props.context,
        onClick: expect.any(Function),
      });
    });

    it("appends the correct component to the container", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        props.onRenderComponent,
        oidcButtonUI.mock.results[0].value,
        "oidcButton",
        props.context.prv,
        expect.any(Function),
        props.context["@id"],
        props.context.url,
      );

      // Default onClick handler should be passed to the onRenderComponent function
      expect(oidcButtonUI.mock.calls[0][0].onClick).toBe(
        createRenderComponentCallback.mock.calls[0][4],
      );

      expect(props.htmlContainer.childElementCount).toBe(1);
      expect(props.htmlContainer.children.item(0)).toBe(oidcButtonUI.mock.results[0].value);
    });

    describe("when the button is clicked", () => {
      beforeEach(() => {
        oidcButtonUI.mock.calls[0][0].onClick();
      });

      it("calls oidcSetup with correct parameters", () => {
        expect(oidcSetup).toBeCalledTimes(1);
        expect(oidcSetup).toBeCalledWith({
          id: "12345",
          redirectUri: "https:/address.com/to/redirect",
          loginApp: "custom-app",
        });
      });
    });
  });
});

describe("when provider does not have a name", () => {
  beforeEach(() => {
    return oidc(props);
  });

  it("creates a correct default button", () => {
    expect(oidcButtonUI).toBeCalledTimes(1);
    expect(oidcButtonUI).toBeCalledWith({
      id: "IKUISDK-btn-oidc-indykite-id",
      data: props.context,
      onClick: expect.any(Function),
    });
  });
});
