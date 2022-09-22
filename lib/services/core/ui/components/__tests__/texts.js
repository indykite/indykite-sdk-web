const { message } = require("../texts");

let props;

beforeEach(() => {
  window.IKSDK = {
    config: { disableInlineStyles: false },
  };

  props = {
    type: "warn",
  };
});

describe("message", () => {
  describe("when 'label' property is present", () => {
    beforeEach(() => {
      props.label = "Message label";
    });

    describe("when 'message' property is present", () => {
      beforeEach(() => {
        props.message = "Message content";
      });

      describe("when inline styles are enabled", () => {
        /**
         * @type {HTMLElement}
         */
        let returnedValue;

        beforeEach(() => {
          returnedValue = message(props);
        });

        it("returns correct message", () => {
          expect(returnedValue.className).toBe("IKUISDK-message message message-warn");
          expect(returnedValue.innerText).toBe("Message content");
          expect(returnedValue.style.cssText).toBe(
            "margin: 16px 0px; text-align: center; font-size: 9px; font-weight: 300; color: rgb(255, 183, 82); font-family: Rubik, sans-serif;",
          );
        });
      });

      describe("when inline styles are disabled", () => {
        /**
         * @type {HTMLElement}
         */
        let returnedValue;

        beforeEach(() => {
          window.IKSDK.config.disableInlineStyles = true;
          returnedValue = message(props);
        });

        it("returns correct message", () => {
          expect(returnedValue.className).toBe("IKUISDK-message message message-warn");
          expect(returnedValue.innerText).toBe("Message content");
          expect(returnedValue.style.cssText).toBe("");
        });
      });
    });

    describe("when 'message' property is not present", () => {
      /**
       * @type {HTMLElement}
       */
      let returnedValue;

      beforeEach(() => {
        returnedValue = message(props);
      });

      it("returns correct message", () => {
        expect(returnedValue.innerText).toBe("Message label");
      });
    });
  });

  describe("when 'label' property is not present", () => {
    /**
     * @type {HTMLElement}
     */
    let returnedValue;

    beforeEach(() => {
      returnedValue = message(props);
    });

    it("returns correct message", () => {
      expect(returnedValue.innerText).toBe("");
    });
  });
});
