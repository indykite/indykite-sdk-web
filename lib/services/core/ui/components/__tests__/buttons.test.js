const { oidcButtonUI } = require("../buttons");
const { getLocalizedMessage } = require("../../../lib/locale-provider");

jest.mock("../../../lib/locale-provider");

beforeEach(() => {
  jest.resetAllMocks();
  getLocalizedMessage.mockImplementation((key, values) => {
    const stringifiedValues = values ? JSON.stringify(values) : "";
    return `Localized: ${key} ${stringifiedValues}`.trim();
  });
});

describe("oidcButtonUI", () => {
  let props;
  beforeEach(() => {
    props = {
      data: {
        prv: "google.com",
      },
      id: "test-button",
    };
  });

  describe("when the OIDC service does not have a name", () => {
    describe("when 'onClick' callback is passed in", () => {
      /**
       * @type {HTMLButtonElement}
       */
      let returnedButton;

      beforeEach(() => {
        props.onClick = jest.fn();
        returnedButton = oidcButtonUI(props);
      });

      it("returns correct button", () => {
        expect(returnedButton).toBeTruthy();
        expect(returnedButton.className).toBe("google-login-button oidc-button");
        expect(returnedButton.id).toBe("test-button");
        expect(returnedButton.innerText).toBe("Google");
        expect(returnedButton.style.display).toBe("block");
        expect(returnedButton.style.width).toBe("100%");
        expect(returnedButton.style.cursor).toBe("pointer");
        expect(returnedButton.style.fontFamily).toBe("'Rubik', sans-serif");
        expect(returnedButton.style.fontSize).toBe("11px");
        expect(returnedButton.style.border).toBe("");
        expect(returnedButton.style.borderRadius).toBe("5px");
        expect(returnedButton.style.color).toBe("rgb(10, 10, 10)");
        expect(returnedButton.style.height).toBe("32px");
        expect(returnedButton.style.marginBottom).toBe("8px");
        expect(returnedButton.style.backgroundColor).toBe("rgb(255, 255, 255)");
        expect(returnedButton.style.position).toBe("relative");
      });

      describe("when the button is clicked", () => {
        /**
         * @type {Event}
         */
        let clickEvent;

        beforeEach(() => {
          clickEvent = new Event("click");
          jest.spyOn(clickEvent, "preventDefault");

          returnedButton.dispatchEvent(clickEvent);
        });

        it("prevents the default callback", () => {
          expect(clickEvent.preventDefault).toBeCalledTimes(1);
        });

        it("calls the custom callback", () => {
          expect(props.onClick).toBeCalledTimes(1);
        });
      });
    });

    describe("when 'onClick' callback is not passed in", () => {
      /**
       * @type {HTMLButtonElement}
       */
      let returnedButton;

      beforeEach(() => {
        returnedButton = oidcButtonUI(props);
      });

      describe("when the button is clicked", () => {
        /**
         * @type {Event}
         */
        let clickEvent;

        beforeEach(() => {
          clickEvent = new Event("click");
          jest.spyOn(clickEvent, "preventDefault");

          returnedButton.dispatchEvent(clickEvent);
        });

        it("prevents the default callback", () => {
          expect(clickEvent.preventDefault).toBeCalledTimes(1);
        });
      });
    });
  });

  describe("when the OIDC service has a name", () => {
    beforeEach(() => {
      props.data.name = "provider.xy";
    });

    /**
     * @type {HTMLButtonElement}
     */
    let returnedButton;

    beforeEach(() => {
      returnedButton = oidcButtonUI(props);
    });

    it("returns correct button", () => {
      expect(returnedButton).toBeTruthy();
      expect(returnedButton.className).toBe("provider-xy-login-button oidc-button");
      expect(returnedButton.id).toBe("test-button");
      expect(returnedButton.innerText).toBe("provider.xy");
      expect(returnedButton.style.display).toBe("block");
      expect(returnedButton.style.width).toBe("100%");
      expect(returnedButton.style.cursor).toBe("pointer");
      expect(returnedButton.style.fontFamily).toBe("'Rubik', sans-serif");
      expect(returnedButton.style.fontSize).toBe("11px");
      expect(returnedButton.style.border).toBe("");
      expect(returnedButton.style.borderRadius).toBe("5px");
      expect(returnedButton.style.color).toBe("rgb(10, 10, 10)");
      expect(returnedButton.style.height).toBe("32px");
      expect(returnedButton.style.marginBottom).toBe("8px");
      expect(returnedButton.style.backgroundColor).toBe("rgb(255, 255, 255)");
      expect(returnedButton.style.position).toBe("relative");
    });

    describe("when the button is clicked", () => {
      /**
       * @type {Event}
       */
      let clickEvent;

      beforeEach(() => {
        clickEvent = new Event("click");
        jest.spyOn(clickEvent, "preventDefault");

        returnedButton.dispatchEvent(clickEvent);
      });

      it("prevents the default callback", () => {
        expect(clickEvent.preventDefault).toBeCalledTimes(1);
      });
    });
  });
});
