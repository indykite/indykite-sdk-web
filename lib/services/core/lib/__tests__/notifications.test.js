const {
  getNotificationsState,
  cleanAllNotifications,
  setNotificationsState,
  setNotification,
  cleanError,
  handleError,
} = require("../notifications");
const { notificationUI } = require("../../ui/components/notification");
const { getLocalizedMessage } = require("../../lib/locale-provider");

jest.mock("../../ui/components/notification");
jest.mock("../../lib/locale-provider");

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();

  notificationUI.mockImplementation((text, type) => {
    return `<div class="mock ${type}">${text}</div>`;
  });

  getLocalizedMessage.mockImplementation((msg) => `Localized: ${msg}`);
});

describe("getNotificationsState", () => {
  let returnedValue;

  describe("when local storage contains no notifications", () => {
    beforeEach(() => {
      returnedValue = getNotificationsState();
    });

    it("returns null value", () => {
      expect(returnedValue).toBeNull();
    });
  });

  describe("when local storage contains a notification", () => {
    beforeEach(() => {
      localStorage.setItem(
        "IKUISDK/notifciations",
        JSON.stringify([{ title: "Error message", type: "error" }]),
      );

      returnedValue = getNotificationsState();
    });

    it("returns null value", () => {
      expect(returnedValue).toEqual([{ title: "Error message", type: "error" }]);
    });
  });
});

describe("cleanAllNotifications", () => {
  beforeEach(() => {
    localStorage.setItem(
      "IKUISDK/notifciations",
      JSON.stringify([{ title: "Error message", type: "error" }]),
    );

    cleanAllNotifications();
  });

  it("clears notifications", () => {
    expect(localStorage.getItem("IKUISDK/notifciations")).toBeNull();
  });
});

describe("setNotificationsState", () => {
  beforeEach(() => {
    localStorage.setItem(
      "IKUISDK/notifciations",
      JSON.stringify([{ title: "Old message", type: "info" }]),
    );
  });

  describe("when notification object is not passed", () => {
    beforeEach(() => {
      setNotificationsState();
    });

    it("clears notifications", () => {
      expect(localStorage.getItem("IKUISDK/notifciations")).toBeNull();
    });
  });

  describe("when notification object is passed", () => {
    beforeEach(() => {
      setNotificationsState({ title: "New message", type: "success" });
    });

    it("updates the notifications", () => {
      expect(localStorage.getItem("IKUISDK/notifciations")).toBe(
        JSON.stringify([{ title: "New message", type: "success" }]),
      );
    });
  });
});

describe("setNotification", () => {
  beforeEach(() => {
    jest.spyOn(document, "querySelector").mockImplementation(() => undefined);
  });

  afterEach(() => {
    document.querySelector.mockRestore();
  });

  describe("when container element exists", () => {
    let containerElement;

    beforeEach(() => {
      containerElement = document.createElement("div");
      jest.spyOn(document, "querySelector").mockImplementation(() => containerElement);
    });

    describe("when text message is defined", () => {
      const message = "Text message";
      const type = "info";
      let returnedValue;

      beforeEach(() => {
        returnedValue = setNotification(message, type);
      });

      it("puts the message into the container", () => {
        expect(containerElement.innerHTML).toBe('<div class="mock info">Text message</div>');
      });

      it("returns a correct value", () => {
        expect(returnedValue).toBe('<div class="mock info">Text message</div>');
      });

      it("queries a correct element", () => {
        expect(document.querySelector).toBeCalledTimes(1);
        expect(document.querySelector.mock.calls[0]).toEqual(["#IKUISDK-notification-container"]);
      });

      it("calls notificationUI with correct arguments", () => {
        expect(notificationUI).toBeCalledTimes(1);
        expect(notificationUI.mock.calls[0]).toEqual([message, type]);
      });
    });

    describe("when text message is not defined", () => {
      let returnedValue;

      beforeEach(() => {
        returnedValue = setNotification();
      });

      it("cleans the content of the container", () => {
        expect(containerElement.innerHTML).toBe("");
      });

      it("returns a correct value", () => {
        expect(returnedValue).toBeNull();
      });
    });
  });

  describe("when container element does not exist", () => {
    beforeEach(() => {
      returnedValue = setNotification();
    });

    it("returns a correct value", () => {
      expect(returnedValue).toBeUndefined();
    });
  });
});

describe("cleanError", () => {
  beforeEach(() => {
    jest.spyOn(document, "querySelector").mockImplementation(() => undefined);
  });

  afterEach(() => {
    document.querySelector.mockRestore();
  });

  describe("when container element exists", () => {
    let containerElement;
    let returnedValue;

    beforeEach(() => {
      containerElement = document.createElement("div");
      containerElement.innerHTML = '<div class="mock">Old message</div>';
      jest.spyOn(document, "querySelector").mockImplementation(() => containerElement);

      returnedValue = cleanError();
    });

    it("cleans the content of the container", () => {
      expect(containerElement.innerHTML).toBe("");
    });

    it("returns a correct value", () => {
      expect(returnedValue).toBeNull();
    });
  });
});

describe("handleError", () => {
  let containerElement;

  beforeEach(() => {
    containerElement = document.createElement("div");
    jest.spyOn(document, "querySelector").mockImplementation(() => containerElement);
  });

  afterEach(() => {
    document.querySelector.mockRestore();
  });

  describe("when global config contains an error callback", () => {
    const error = new Error("Test error");

    beforeEach(() => {
      window.IKSDK = {
        config: {
          onError: jest.fn(),
        },
      };

      handleError(error);
    });

    afterAll(() => {
      delete window.IKSDK;
    });

    it("calls the callback with the error", () => {
      expect(window.IKSDK.config.onError).toBeCalledTimes(1);
      expect(window.IKSDK.config.onError.mock.calls[0]).toEqual([error]);
    });
  });

  describe("when the error contains a label", () => {
    const error = new Error("Test error");
    error.label = "Error label";

    beforeEach(() => {
      handleError(error);
    });

    it("updates the notification conatiner", () => {
      expect(getLocalizedMessage).toBeCalledTimes(1);
      expect(getLocalizedMessage.mock.calls[0]).toEqual(["Error label", {}]);
      expect(containerElement.innerHTML).toBe(
        '<div class="mock error">Localized: Error label</div>',
      );
    });
  });

  describe("when the error contains a message", () => {
    const error = new Error("Test error");
    error.msg = "Error message";

    beforeEach(() => {
      handleError(error);
    });

    it("updates the notification conatiner", () => {
      expect(getLocalizedMessage).toBeCalledTimes(0);
      expect(containerElement.innerHTML).toBe('<div class="mock error">Error message</div>');
    });
  });

  describe("when the error contains a label and extensions", () => {
    const error = new Error("Test error");
    error.label = "Error label";
    error.extensions = { value: 42 };

    beforeEach(() => {
      handleError(error);
    });

    it("updates the notification conatiner", () => {
      expect(getLocalizedMessage).toBeCalledTimes(1);
      expect(getLocalizedMessage.mock.calls[0]).toEqual(["Error label", { value: 42 }]);
      expect(containerElement.innerHTML).toBe(
        '<div class="mock error">Localized: Error label</div>',
      );
    });
  });

  describe("when the error contains an unknown label", () => {
    const error = new Error("Test error");
    error.label = "Unknown label";

    beforeEach(() => {
      getLocalizedMessage.mockImplementationOnce(() => "");
      getLocalizedMessage.mockImplementationOnce(
        (type) => type === "uisdk.general.error" && "General error",
      );

      handleError(error);
    });

    it("updates the notification conatiner", () => {
      expect(getLocalizedMessage).toBeCalledTimes(2);
      expect(getLocalizedMessage.mock.calls[0]).toEqual(["Unknown label", {}]);
      expect(getLocalizedMessage.mock.calls[1]).toEqual(["uisdk.general.error"]);
      expect(containerElement.innerHTML).toBe('<div class="mock error">General error</div>');
    });
  });
});
