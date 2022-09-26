const { createRenderComponentCallback } = require("../../../utils/helpers");
const message = require("../message");

jest.mock("../../../utils/helpers", () => {
  const originalModule = jest.requireActual("../../../utils/helpers");
  return {
    ...originalModule,
    createRenderComponentCallback: jest.fn().mockImplementation((cb, component) => component),
  };
});

window.IKSDK = {
  config: { disableInlineStyles: false },
};

let props;

beforeEach(() => {
  createRenderComponentCallback.mockClear();
  props = {
    htmlContainer: document.createElement("div"),
    onRenderComponent: jest.fn(),
  };
});

describe("when message style is 'info'", () => {
  beforeEach(() => {
    props.context = {
      style: "info",
      "~ui": "message#default",
    };
  });

  describe("when neither message nor label is present", () => {
    beforeEach(() => {
      return message(props);
    });

    it("creates correct message element", () => {
      expect(createRenderComponentCallback).toBeCalled();

      /** @type {HTMLElement} */
      const messageEl = createRenderComponentCallback.mock.calls[0][1];
      expect(messageEl.className).toBe("IKUISDK-message message message-info");
      expect(messageEl.innerText).toBe("");
      expect(messageEl.style.color).toBe("rgb(250, 250, 250)");
    });

    it("calls 'createRenderComponentCallback' with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        props.onRenderComponent,
        expect.any(HTMLElement),
        "message",
        {
          style: "info",
          ui: "message#default",
        },
      );
    });
  });

  describe("when message is present", () => {
    beforeEach(() => {
      props.context.msg = "Message content";

      return message(props);
    });

    it("creates correct message element", () => {
      expect(createRenderComponentCallback).toBeCalled();

      /** @type {HTMLElement} */
      const messageEl = createRenderComponentCallback.mock.calls[0][1];
      expect(messageEl.className).toBe("IKUISDK-message message message-info");
      expect(messageEl.innerText).toBe("Message content");
      expect(messageEl.style.color).toBe("rgb(250, 250, 250)");
    });

    it("calls 'createRenderComponentCallback' with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        props.onRenderComponent,
        expect.any(HTMLElement),
        "message",
        {
          style: "info",
          ui: "message#default",
          msg: "Message content",
        },
      );
    });
  });

  describe("when label is present", () => {
    beforeEach(() => {
      props.context.label = "UI_I18N_LABEL";

      return message(props);
    });

    it("creates correct message element", () => {
      expect(createRenderComponentCallback).toBeCalled();

      /** @type {HTMLElement} */
      const messageEl = createRenderComponentCallback.mock.calls[0][1];
      expect(messageEl.className).toBe("IKUISDK-message message message-info");
      expect(messageEl.innerText).toBe("UI_I18N_LABEL");
      expect(messageEl.style.color).toBe("rgb(250, 250, 250)");
    });

    it("calls 'createRenderComponentCallback' with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        props.onRenderComponent,
        expect.any(HTMLElement),
        "message",
        {
          style: "info",
          ui: "message#default",
          label: "UI_I18N_LABEL",
        },
      );
    });
  });

  describe("when both message and label are present", () => {
    beforeEach(() => {
      props.context.msg = "Message content";
      props.context.label = "UI_I18N_LABEL";

      return message(props);
    });

    it("creates correct message element", () => {
      expect(createRenderComponentCallback).toBeCalled();

      /** @type {HTMLElement} */
      const messageEl = createRenderComponentCallback.mock.calls[0][1];
      expect(messageEl.className).toBe("IKUISDK-message message message-info");
      expect(messageEl.innerText).toBe("Message content");
      expect(messageEl.style.color).toBe("rgb(250, 250, 250)");
    });

    it("calls 'createRenderComponentCallback' with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        props.onRenderComponent,
        expect.any(HTMLElement),
        "message",
        {
          style: "info",
          ui: "message#default",
          msg: "Message content",
          label: "UI_I18N_LABEL",
        },
      );
    });
  });

  describe("when extensions and id are present", () => {
    id = "00000000-0000-4000-8000-000000000000";

    beforeEach(() => {
      props.context.extensions = {
        first: true,
        second: 42,
      };
      props.context["@id"] = id;

      return message(props);
    });

    it("creates correct message element", () => {
      expect(createRenderComponentCallback).toBeCalled();

      /** @type {HTMLElement} */
      const messageEl = createRenderComponentCallback.mock.calls[0][1];
      expect(messageEl.className).toBe("IKUISDK-message message message-info");
      expect(messageEl.innerText).toBe("");
      expect(messageEl.style.color).toBe("rgb(250, 250, 250)");
    });

    it("calls 'createRenderComponentCallback' with correct arguments", () => {
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(createRenderComponentCallback).toBeCalledWith(
        props.onRenderComponent,
        expect.any(HTMLElement),
        "message",
        {
          style: "info",
          ui: "message#default",
          extensions: props.context.extensions,
          id,
        },
      );
    });
  });
});

describe("when message style is 'warn'", () => {
  beforeEach(() => {
    props.context = {
      style: "warn",
      "~ui": "message#default",
      msg: "Message content",
    };

    return message(props);
  });

  it("creates correct message element", () => {
    expect(createRenderComponentCallback).toBeCalled();

    /** @type {HTMLElement} */
    const messageEl = createRenderComponentCallback.mock.calls[0][1];
    expect(messageEl.className).toBe("IKUISDK-message message message-warn");
    expect(messageEl.innerText).toBe("Message content");
    expect(messageEl.style.color).toBe("rgb(255, 183, 82)");
  });

  it("calls 'createRenderComponentCallback' with correct arguments", () => {
    expect(createRenderComponentCallback).toBeCalledTimes(1);
    expect(createRenderComponentCallback).toBeCalledWith(
      props.onRenderComponent,
      expect.any(HTMLElement),
      "message",
      {
        style: "warn",
        ui: "message#default",
        msg: "Message content",
      },
    );
  });
});

describe("when message style is 'error'", () => {
  beforeEach(() => {
    props.context = {
      style: "error",
      "~ui": "message#default",
      msg: "Message content",
    };

    return message(props);
  });

  it("creates correct message element", () => {
    expect(createRenderComponentCallback).toBeCalled();

    /** @type {HTMLElement} */
    const messageEl = createRenderComponentCallback.mock.calls[0][1];
    expect(messageEl.className).toBe("IKUISDK-message message message-error");
    expect(messageEl.innerText).toBe("Message content");
    expect(messageEl.style.color).toBe("rgb(240, 93, 85)");
  });

  it("calls 'createRenderComponentCallback' with correct arguments", () => {
    expect(createRenderComponentCallback).toBeCalledTimes(1);
    expect(createRenderComponentCallback).toBeCalledWith(
      props.onRenderComponent,
      expect.any(HTMLElement),
      "message",
      {
        style: "error",
        ui: "message#default",
        msg: "Message content",
      },
    );
  });
});
