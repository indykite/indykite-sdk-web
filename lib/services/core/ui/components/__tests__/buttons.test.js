const { oidcButtonUI } = require("../buttons");

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
        expect(returnedButton.innerText).toBe("google");
        expect(returnedButton.style.display).toBe("block");
        expect(returnedButton.style.width).toBe("100%");
        expect(returnedButton.style.cursor).toBe("pointer");
        expect(returnedButton.style.fontFamily).toBe("'Raleway', sans-serif");
        expect(returnedButton.style.fontSize).toBe("16px");
        expect(returnedButton.style.border).toBe("");
        expect(returnedButton.style.borderRadius).toBe("6px");
        expect(returnedButton.style.color).toBe("rgb(115, 115, 115)");
        expect(returnedButton.style.height).toBe("50px");
        expect(returnedButton.style.marginBottom).toBe("20px");
        expect(returnedButton.style.backgroundColor).toBe("rgb(255, 255, 255)");
        expect(returnedButton.style.position).toBe("relative");
        expect(returnedButton.style.textTransform).toBe("capitalize");
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
      expect(returnedButton.style.fontFamily).toBe("'Raleway', sans-serif");
      expect(returnedButton.style.fontSize).toBe("16px");
      expect(returnedButton.style.border).toBe("");
      expect(returnedButton.style.borderRadius).toBe("6px");
      expect(returnedButton.style.color).toBe("rgb(255, 255, 255)");
      expect(returnedButton.style.height).toBe("50px");
      expect(returnedButton.style.marginBottom).toBe("20px");
      expect(returnedButton.style.backgroundColor).toBe("rgb(43, 130, 180)");
      expect(returnedButton.style.position).toBe("relative");
      expect(returnedButton.style.textTransform).toBe("capitalize");
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
