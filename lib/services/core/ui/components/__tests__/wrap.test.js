const { wrapUI } = require("../wrap");
const { cleanAllNotifications } = require("../../../lib/notifications");

jest.mock("../../../lib/notifications");

beforeEach(() => {
  window.IKSDK = {
    config: { disableInlineStyles: false },
  };

  jest.resetAllMocks();
});

describe("wrapUI", () => {
  describe("when notifications are not specified", () => {
    describe("when children are not specified", () => {
      describe("when inline styles are enabled", () => {
        /**
         * @type {HTMLElement}
         */
        let returnedValue;

        beforeEach(() => {
          returnedValue = wrapUI();
        });

        it("returns correct wrapper", () => {
          expect(returnedValue.tagName.toLowerCase()).toBe("section");
          expect(returnedValue.className).toBe("indykite-login-section IKUISDK-form-section");
          expect(returnedValue.children.length).toBe(1);

          /** @type {HTMLElement} */
          const containerEl = returnedValue.children.item(0);
          expect(containerEl.tagName.toLowerCase()).toBe("div");
          expect(containerEl.className).toBe("indykite-login-container IKUISDK-form-container");
          expect(containerEl.style.cssText).toBe(
            "background-color: rgb(38, 38, 38); color: rgb(250, 250, 250); border-radius: 5px;",
          );

          /** @type {HTMLElement} */
          const notificationContainerEl = containerEl.children.item(0);
          expect(notificationContainerEl.tagName.toLowerCase()).toBe("div");
          expect(notificationContainerEl.className).toBe("IKUISDK-notification-container");
          expect(notificationContainerEl.id).toBe("IKUISDK-notification-container");
          expect(notificationContainerEl.children.length).toBe(0);
          expect(notificationContainerEl.style.cssText).toBe(
            "height: auto; padding: 40px 20px 0px 20px;",
          );
          expect(notificationContainerEl.innerHTML).toBe("");

          /** @type {HTMLElement} */
          const innerContainerEl = containerEl.children.item(1);
          expect(innerContainerEl.className).toBe(
            "inner-indykite-login-container IKUISDK-form-content",
          );
          expect(innerContainerEl.id).toBe("IKUISDK-content-container");
          expect(innerContainerEl.children.length).toBe(0);
          expect(innerContainerEl.style.cssText).toBe(
            "padding: 0px 26px 40px 26px; color: rgb(250, 250, 250);",
          );
        });

        it("does not clean notifications", () => {
          expect(cleanAllNotifications).toBeCalledTimes(0);
        });
      });

      describe("when inline styles are disabled", () => {
        /**
         * @type {HTMLElement}
         */
        let returnedValue;

        beforeEach(() => {
          window.IKSDK.config.disableInlineStyles = true;
          returnedValue = wrapUI();
        });

        it("returns correct wrapper", () => {
          expect(returnedValue.tagName.toLowerCase()).toBe("section");
          expect(returnedValue.className).toBe("indykite-login-section IKUISDK-form-section");
          expect(returnedValue.children.length).toBe(1);

          /** @type {HTMLElement} */
          const containerEl = returnedValue.children.item(0);
          expect(containerEl.tagName.toLowerCase()).toBe("div");
          expect(containerEl.className).toBe("indykite-login-container IKUISDK-form-container");
          expect(containerEl.style.cssText).toBe("");

          /** @type {HTMLElement} */
          const notificationContainerEl = containerEl.children.item(0);
          expect(notificationContainerEl.tagName.toLowerCase()).toBe("div");
          expect(notificationContainerEl.className).toBe("IKUISDK-notification-container");
          expect(notificationContainerEl.id).toBe("IKUISDK-notification-container");
          expect(notificationContainerEl.children.length).toBe(0);
          expect(notificationContainerEl.style.cssText).toBe("");

          /** @type {HTMLElement} */
          const innerContainerEl = containerEl.children.item(1);
          expect(innerContainerEl.className).toBe(
            "inner-indykite-login-container IKUISDK-form-content",
          );
          expect(innerContainerEl.id).toBe("IKUISDK-content-container");
          expect(innerContainerEl.children.length).toBe(0);
          expect(innerContainerEl.style.cssText).toBe("");
        });

        it("does not clean notifications", () => {
          expect(cleanAllNotifications).toBeCalledTimes(0);
        });
      });
    });

    describe("when children are specified", () => {
      /**
       * @type {HTMLElement}
       */
      let returnedValue;
      const children = document.createElement("div");

      beforeEach(() => {
        returnedValue = wrapUI(children);
      });

      it("returns correct wrapper", () => {
        expect(returnedValue.tagName.toLowerCase()).toBe("section");
        expect(returnedValue.className).toBe("indykite-login-section IKUISDK-form-section");
        expect(returnedValue.children.length).toBe(1);

        const containerEl = returnedValue.children.item(0);
        expect(containerEl.tagName.toLowerCase()).toBe("div");
        expect(containerEl.className).toBe("indykite-login-container IKUISDK-form-container");

        const notificationContainerEl = containerEl.children.item(0);
        expect(notificationContainerEl.tagName.toLowerCase()).toBe("div");
        expect(notificationContainerEl.className).toBe("IKUISDK-notification-container");
        expect(notificationContainerEl.id).toBe("IKUISDK-notification-container");
        expect(notificationContainerEl.children.length).toBe(0);

        const innerContainerEl = containerEl.children.item(1);
        expect(innerContainerEl.className).toBe(
          "inner-indykite-login-container IKUISDK-form-content",
        );
        expect(innerContainerEl.id).toBe("IKUISDK-content-container");
        expect(innerContainerEl.children.length).toBe(1);
        expect(innerContainerEl.children.item(0)).toBe(children);
      });

      it("does not clean notifications", () => {
        expect(cleanAllNotifications).toBeCalledTimes(0);
      });
    });
  });

  describe("when notifications are specified", () => {
    describe("when inline styles are enabled", () => {
      /**
       * @type {HTMLElement}
       */
      let returnedValue;
      const children = document.createElement("div");
      const notifications = [
        {
          title: "Mocked notification",
          type: "info",
        },
      ];

      beforeEach(() => {
        returnedValue = wrapUI(children, notifications);
      });

      it("returns correct wrapper", () => {
        expect(returnedValue.tagName.toLowerCase()).toBe("section");
        expect(returnedValue.className).toBe("indykite-login-section IKUISDK-form-section");
        expect(returnedValue.children.length).toBe(1);

        /** @type {HTMLElement} */
        const containerEl = returnedValue.children.item(0);
        expect(containerEl.tagName.toLowerCase()).toBe("div");
        expect(containerEl.className).toBe("indykite-login-container IKUISDK-form-container");

        /** @type {HTMLElement} */
        const notificationContainerEl = containerEl.children.item(0);
        expect(notificationContainerEl.tagName.toLowerCase()).toBe("div");
        expect(notificationContainerEl.className).toBe("IKUISDK-notification-container");
        expect(notificationContainerEl.id).toBe("IKUISDK-notification-container");
        expect(notificationContainerEl.children.length).toBe(1);
        const notificationTextEl = notificationContainerEl.querySelector(
          "[id='IKUISDK-notification-text']",
        );
        expect(notificationTextEl.outerHTML).toBe(
          '<span id="IKUISDK-notification-text" class="message-content type-info" style="color: rgb(250, 250, 250)">Mocked notification</span>',
        );

        /** @type {HTMLElement} */
        const innerContainerEl = containerEl.children.item(1);
        expect(innerContainerEl.className).toBe(
          "inner-indykite-login-container IKUISDK-form-content",
        );
        expect(innerContainerEl.id).toBe("IKUISDK-content-container");
        expect(innerContainerEl.children.length).toBe(1);
        expect(innerContainerEl.children.item(0)).toBe(children);
      });

      it("cleans notifications", () => {
        expect(cleanAllNotifications).toBeCalledTimes(1);
      });
    });

    describe("when inline styles are disabled", () => {
      /**
       * @type {HTMLElement}
       */
      let returnedValue;
      const children = document.createElement("div");
      const notifications = [
        {
          title: "Mocked notification",
          type: "info",
        },
      ];

      beforeEach(() => {
        window.IKSDK.config.disableInlineStyles = true;
        returnedValue = wrapUI(children, notifications);
      });

      it("returns correct wrapper", () => {
        expect(returnedValue.tagName.toLowerCase()).toBe("section");
        expect(returnedValue.className).toBe("indykite-login-section IKUISDK-form-section");
        expect(returnedValue.children.length).toBe(1);

        /** @type {HTMLElement} */
        const containerEl = returnedValue.children.item(0);
        expect(containerEl.tagName.toLowerCase()).toBe("div");
        expect(containerEl.className).toBe("indykite-login-container IKUISDK-form-container");

        /** @type {HTMLElement} */
        const notificationContainerEl = containerEl.children.item(0);
        expect(notificationContainerEl.tagName.toLowerCase()).toBe("div");
        expect(notificationContainerEl.className).toBe("IKUISDK-notification-container");
        expect(notificationContainerEl.id).toBe("IKUISDK-notification-container");
        expect(notificationContainerEl.children.length).toBe(1);
        const notificationTextEl = notificationContainerEl.querySelector(
          "[id='IKUISDK-notification-text']",
        );
        expect(notificationTextEl.outerHTML).toBe(
          '<span id="IKUISDK-notification-text" class="message-content type-info">Mocked notification</span>',
        );

        /** @type {HTMLElement} */
        const innerContainerEl = containerEl.children.item(1);
        expect(innerContainerEl.className).toBe(
          "inner-indykite-login-container IKUISDK-form-content",
        );
        expect(innerContainerEl.id).toBe("IKUISDK-content-container");
        expect(innerContainerEl.children.length).toBe(1);
        expect(innerContainerEl.children.item(0)).toBe(children);
      });

      it("cleans notifications", () => {
        expect(cleanAllNotifications).toBeCalledTimes(1);
      });
    });
  });
});
