const { wrapUI } = require("../wrap");
const { cleanAllNotifications } = require("../../../lib/notifications");

jest.mock("../../../lib/notifications");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("wrapUI", () => {
  describe("when notifications are not specified", () => {
    describe("when children are not specified", () => {
      /**
       * @type {HTMLElement}
       */
      let returnedValue;

      beforeEach(() => {
        returnedValue = wrapUI();
      });

      it("returns correct wrapper", () => {
        expect(returnedValue.tagName.toLowerCase()).toBe("section");
        expect(returnedValue.className).toBe("indykite-login-section");
        expect(returnedValue.children.length).toBe(1);

        const containerEl = returnedValue.children.item(0);
        expect(containerEl.tagName.toLowerCase()).toBe("div");
        expect(containerEl.className).toBe("indykite-login-container");

        const notificationContainerEl = containerEl.children.item(0);
        expect(notificationContainerEl.tagName.toLowerCase()).toBe("div");
        expect(notificationContainerEl.className).toBe("IKUISDK-notification-container");
        expect(notificationContainerEl.id).toBe("IKUISDK-notification-container");
        expect(notificationContainerEl.children.length).toBe(0);

        const innerContainerEl = containerEl.children.item(1);
        expect(innerContainerEl.className).toBe("inner-indykite-login-container");
        expect(innerContainerEl.id).toBe("IKUISDK-content-container");
        expect(innerContainerEl.children.length).toBe(0);
      });

      it("does not clean notifications", () => {
        expect(cleanAllNotifications).toBeCalledTimes(0);
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
        expect(returnedValue.className).toBe("indykite-login-section");
        expect(returnedValue.children.length).toBe(1);

        const containerEl = returnedValue.children.item(0);
        expect(containerEl.tagName.toLowerCase()).toBe("div");
        expect(containerEl.className).toBe("indykite-login-container");

        const notificationContainerEl = containerEl.children.item(0);
        expect(notificationContainerEl.tagName.toLowerCase()).toBe("div");
        expect(notificationContainerEl.className).toBe("IKUISDK-notification-container");
        expect(notificationContainerEl.id).toBe("IKUISDK-notification-container");
        expect(notificationContainerEl.children.length).toBe(0);

        const innerContainerEl = containerEl.children.item(1);
        expect(innerContainerEl.className).toBe("inner-indykite-login-container");
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
      expect(returnedValue.className).toBe("indykite-login-section");
      expect(returnedValue.children.length).toBe(1);

      const containerEl = returnedValue.children.item(0);
      expect(containerEl.tagName.toLowerCase()).toBe("div");
      expect(containerEl.className).toBe("indykite-login-container");

      const notificationContainerEl = containerEl.children.item(0);
      expect(notificationContainerEl.tagName.toLowerCase()).toBe("div");
      expect(notificationContainerEl.className).toBe("IKUISDK-notification-container");
      expect(notificationContainerEl.id).toBe("IKUISDK-notification-container");
      expect(notificationContainerEl.children.length).toBe(1);
      const notificationTextEl = notificationContainerEl.querySelector(
        "[id='IKUISDK-notification-text']",
      );
      expect(notificationTextEl.textContent).toBe("Mocked notification");

      const innerContainerEl = containerEl.children.item(1);
      expect(innerContainerEl.className).toBe("inner-indykite-login-container");
      expect(innerContainerEl.id).toBe("IKUISDK-content-container");
      expect(innerContainerEl.children.length).toBe(1);
      expect(innerContainerEl.children.item(0)).toBe(children);
    });

    it("cleans notifications", () => {
      expect(cleanAllNotifications).toBeCalledTimes(1);
    });
  });
});
