const { oidcButtonUI, navButtonUI, primaryButtonUI } = require("../buttons");
const { getLocalizedMessage } = require("../../../lib/locale-provider");

jest.mock("../../../lib/locale-provider");

beforeEach(() => {
  jest.resetAllMocks();
  getLocalizedMessage.mockImplementation((key, values) => {
    const stringifiedValues = values ? JSON.stringify(values) : "";
    return `Localized: ${key} ${stringifiedValues}`.trim();
  });

  window.IKSDK = {
    config: { disableInlineStyles: false },
  };
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
    describe("when inline styles are disabled", () => {
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
          expect(returnedButton.className).toBe("google-login-button IKUISDK-btn oidc-button");
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

    describe("when inline styles are enabled", () => {
      /**
       * @type {HTMLButtonElement}
       */
      let returnedButton;

      beforeEach(() => {
        window.IKSDK.config.disableInlineStyles = true;
        props.onClick = jest.fn();
        returnedButton = oidcButtonUI(props);
      });

      it("returns correct button", () => {
        expect(returnedButton).toBeTruthy();
        expect(returnedButton.className).toBe("google-login-button IKUISDK-btn oidc-button");
        expect(returnedButton.id).toBe("test-button");
        expect(returnedButton.innerText).toBe("Google");
        expect(returnedButton.style.cssText).toBe("");
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
      expect(returnedButton.className).toBe("provider-xy-login-button IKUISDK-btn oidc-button");
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

describe("navButtonUI", () => {
  let props;
  beforeEach(() => {
    props = {
      label: "Button label",
      href: "https://example.com/button-link",
      id: "mocked-button",
    };
  });

  describe("when neither id, onClick nor href properties are set", () => {
    beforeEach(() => {
      delete props.id;
      delete props.href;
      returnedButton = navButtonUI(props);
    });

    it("returns correct button", () => {
      expect(returnedButton).toBeTruthy();
      expect(returnedButton.className).toBe("IKUISDK-action-btn");
      expect(returnedButton.id).toBe("");
      expect(returnedButton.style.cssText).toBe(
        "font-family: 'Rubik', sans-serif; font-size: 12px; text-align: center; cursor: pointer; margin-bottom: 16px;",
      );
    });
  });

  describe("when inline styles are disabled", () => {
    describe("when 'onClick' callback is passed in", () => {
      /**
       * @type {HTMLButtonElement}
       */
      let returnedButton;

      beforeEach(() => {
        props.onClick = jest.fn();
        returnedButton = navButtonUI(props);
      });

      it("returns correct button", () => {
        expect(returnedButton).toBeTruthy();
        expect(returnedButton.className).toBe("IKUISDK-action-btn");
        expect(returnedButton.id).toBe("mocked-button");
        expect(returnedButton.querySelector("a").innerText).toBe("Button label");
        expect(returnedButton.querySelector("a").href).toBe("");
        expect(returnedButton.style.cssText).toBe(
          "font-family: 'Rubik', sans-serif; font-size: 12px; text-align: center; cursor: pointer; margin-bottom: 16px;",
        );
      });

      describe("when the button is clicked", () => {
        /**
         * @type {Event}
         */
        let clickEvent;

        beforeEach(() => {
          clickEvent = new Event("click");
          jest.spyOn(clickEvent, "preventDefault");

          returnedButton.querySelector("a").dispatchEvent(clickEvent);
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
        returnedButton = navButtonUI(props);
      });

      it("returns correct button", () => {
        expect(returnedButton).toBeTruthy();
        expect(returnedButton.className).toBe("IKUISDK-action-btn");
        expect(returnedButton.id).toBe("mocked-button");
        expect(returnedButton.querySelector("a").innerText).toBe("Button label");
        expect(returnedButton.querySelector("a").href).toBe("https://example.com/button-link");
        expect(returnedButton.style.cssText).toBe(
          "font-family: 'Rubik', sans-serif; font-size: 12px; text-align: center; cursor: pointer; margin-bottom: 16px;",
        );
      });
    });
  });

  describe("when inline styles are enabled", () => {
    /**
     * @type {HTMLButtonElement}
     */
    let returnedButton;

    beforeEach(() => {
      window.IKSDK.config.disableInlineStyles = true;
      props.onClick = jest.fn();
      returnedButton = navButtonUI(props);
    });

    it("returns correct button", () => {
      expect(returnedButton).toBeTruthy();
      expect(returnedButton.className).toBe("IKUISDK-action-btn");
      expect(returnedButton.id).toBe("mocked-button");
      expect(returnedButton.querySelector("a").innerText).toBe("Button label");
      expect(returnedButton.style.cssText).toBe("");
    });
  });
});

describe("primaryButtonUI", () => {
  let props;
  beforeEach(() => {
    props = {
      label: "Button label",
      id: "mocked-button",
    };
  });

  describe("when inline styles are disabled", () => {
    describe("when 'onClick' callback is passed in", () => {
      /**
       * @type {HTMLButtonElement}
       */
      let returnedButton;

      beforeEach(() => {
        props.onClick = jest.fn();
        returnedButton = primaryButtonUI(props);
      });

      it("returns correct button", () => {
        expect(returnedButton).toBeTruthy();
        expect(returnedButton.className).toBe("IKUISDK-primary-btn");
        expect(returnedButton.id).toBe("mocked-button");
        expect(returnedButton.style.cssText).toBe(
          "cursor: pointer; display: block; margin: 16px 0px; width: 100%; font-family: 'Rubik', sans-serif; font-size: 11px; border-radius: 5px; color: rgb(10, 10, 10); height: 32px; background: rgb(255, 183, 82);",
        );
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
        returnedButton = primaryButtonUI(props);
      });

      it("returns correct button", () => {
        expect(returnedButton).toBeTruthy();
        expect(returnedButton.className).toBe("IKUISDK-primary-btn");
        expect(returnedButton.id).toBe("mocked-button");
        expect(returnedButton.style.cssText).toBe(
          "cursor: pointer; display: block; margin: 16px 0px; width: 100%; font-family: 'Rubik', sans-serif; font-size: 11px; border-radius: 5px; color: rgb(10, 10, 10); height: 32px; background: rgb(255, 183, 82);",
        );
      });
    });
  });

  describe("when inline styles are enabled", () => {
    /**
     * @type {HTMLButtonElement}
     */
    let returnedButton;

    beforeEach(() => {
      window.IKSDK.config.disableInlineStyles = true;
      props.onClick = jest.fn();
      returnedButton = primaryButtonUI(props);
    });

    it("returns correct button", () => {
      expect(returnedButton).toBeTruthy();
      expect(returnedButton.className).toBe("IKUISDK-primary-btn");
      expect(returnedButton.id).toBe("mocked-button");
      expect(returnedButton.style.cssText).toBe("");
    });
  });
});
