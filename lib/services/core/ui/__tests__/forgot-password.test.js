const { wrapUI } = require("../components/wrap");
const forgotPasswordUI = require("../forgot-password");
const { handleSendResetPasswordEmail } = require("../../lib/reset-password");
const buttons = require("../components/buttons");

jest.mock("../components/wrap");
jest.mock("../../lib/reset-password");

let props;
window.IKSDK = { config: {} };

beforeEach(() => {
  jest.resetAllMocks();
  wrapUI.mockImplementation((el) => {
    const wrapper = document.createElement("div");
    wrapper.className = "mocked-wrapper";
    wrapper.appendChild(el);
    return wrapper;
  });

  props = {
    fields: [
      {
        "@id": "username",
        "@type": "input",
        autocomplete: true,
        hint: "text",
        maxlength: 128,
        minlength: 8,
        pattern: "^.{8,128}$",
        placeholder: "username",
        required: true,
        "~ord": 0,
      },
    ],
  };

  handleSendResetPasswordEmail.mockImplementation(() => Promise.resolve());
});

describe("when fields prop is specified only", () => {
  /**
   * @type {HTMLElement}
   */
  let returnedValue;

  beforeEach(() => {
    returnedValue = forgotPasswordUI(props);
  });

  it("returns correct form", () => {
    expect(returnedValue.className).toBe("mocked-wrapper");
    const wrappedEl = returnedValue.children.item(0);
    expect(wrappedEl.children.length).toBe(1);
    const form = wrappedEl.children.item(0);
    expect(form.tagName.toLowerCase()).toBe("form");
    expect(form.className).toBe("forgotten-password-form");

    expect(form.childElementCount).toBe(4);
    expect(form.children.item(0).tagName.toLowerCase()).toBe("label");
    expect(form.children.item(0).htmlFor).toBe("IKUISDK-reset-password-email");
    expect(form.children.item(0).innerText).toBe("Email Address");
    expect(form.children.item(1).tagName.toLowerCase()).toBe("input");
    expect(form.children.item(1).id).toBe("IKUISDK-reset-password-email");
    expect(form.children.item(2).tagName.toLowerCase()).toBe("button");
    expect(form.children.item(2).type).toBe("submit");
    expect(form.children.item(2).id).toBe("IKUISDK-reset-password-email-btn");
    expect(form.children.item(2).innerText).toBe("Send password reset email");
    expect(form.children.item(3).children.item(0).innerText).toBe("Go back to login");
    expect(form.children.item(3).children.item(0).href).toBe(
      new URL("/login", location.href).toString(),
    );
  });

  describe("when the submit button is pressed with empty email", () => {
    describe("when handleSendResetPasswordEmail succeeds", () => {
      let spiedPreventDefault;

      beforeEach(() => {
        const button = returnedValue.getElementsByTagName("button")[0];
        const event = new Event("click");
        spiedPreventDefault = jest.spyOn(event, "preventDefault");
        button.dispatchEvent(event);
      });

      it("prevents the default click behavior", () => {
        expect(spiedPreventDefault).toBeCalledTimes(1);
      });

      it("sends the email", () => {
        expect(handleSendResetPasswordEmail).toBeCalledTimes(1);
        expect(handleSendResetPasswordEmail).toBeCalledWith(null);
      });
    });

    describe("when handleSendResetPasswordEmail fails", () => {
      let spiedPreventDefault;

      beforeEach(() => {
        handleSendResetPasswordEmail.mockImplementation(() => Promise.reject("Test error"));

        const button = returnedValue.getElementsByTagName("button")[0];
        const event = new Event("click");
        spiedPreventDefault = jest.spyOn(event, "preventDefault");
        button.dispatchEvent(event);
      });

      it("prevents the default click behavior", () => {
        expect(spiedPreventDefault).toBeCalledTimes(1);
      });

      it("sends the email", () => {
        expect(handleSendResetPasswordEmail).toBeCalledTimes(1);
        expect(handleSendResetPasswordEmail).toBeCalledWith(null);
      });
    });
  });

  describe("when the submit button is pressed with non-empty email", () => {
    let spiedPreventDefault;

    beforeEach(() => {
      returnedValue.querySelector("input").value = "user@example.com";

      const button = returnedValue.getElementsByTagName("button")[0];
      const event = new Event("click");
      spiedPreventDefault = jest.spyOn(event, "preventDefault");
      button.dispatchEvent(event);
    });

    it("prevents the default click behavior", () => {
      expect(spiedPreventDefault).toBeCalledTimes(1);
    });

    it("sends the email", () => {
      expect(handleSendResetPasswordEmail).toBeCalledTimes(1);
      expect(handleSendResetPasswordEmail).toBeCalledWith(null);
    });
  });
});

describe("when custom labels are specified", () => {
  /**
   * @type {HTMLElement}
   */
  let returnedValue;

  beforeEach(() => {
    props.labels = {
      username: "Put your username",
      submitButton: "Reset email",
      backToLogin: "Back to login",
    };

    returnedValue = forgotPasswordUI(props);
  });

  it("returns correct form", () => {
    expect(returnedValue.className).toBe("mocked-wrapper");
    const wrappedEl = returnedValue.children.item(0);
    expect(wrappedEl.children.length).toBe(1);
    const form = wrappedEl.children.item(0);
    expect(form.tagName.toLowerCase()).toBe("form");
    expect(form.className).toBe("forgotten-password-form");

    // Input label
    expect(form.children.item(0).tagName.toLowerCase()).toBe("label");
    expect(form.children.item(0).htmlFor).toBe("IKUISDK-reset-password-email");
    expect(form.children.item(0).innerText).toBe("Put your username");
    expect(form.children.item(1).tagName.toLowerCase()).toBe("input");
    expect(form.children.item(1).id).toBe("IKUISDK-reset-password-email");
    expect(form.children.item(2).tagName.toLowerCase()).toBe("button");
    expect(form.children.item(2).type).toBe("submit");
    expect(form.children.item(2).id).toBe("IKUISDK-reset-password-email-btn");
    expect(form.children.item(2).innerText).toBe("Reset email");
    expect(form.children.item(3).children.item(0).innerText).toBe("Back to login");
    expect(form.children.item(3).children.item(0).href).toBe(
      new URL("/login", location.href).toString(),
    );
  });
});

describe("when fields contains more entries", () => {
  /**
   * @type {HTMLElement}
   */
  let returnedValue;

  beforeEach(() => {
    props.fields.push({
      "@id": "unknown",
      "@type": "input",
      autocomplete: true,
      hint: "text",
      maxlength: 128,
      minlength: 8,
      pattern: "^.{8,128}$",
      placeholder: "unknown-placeholder",
      required: true,
      "~ord": 1,
    });
    returnedValue = forgotPasswordUI(props);
  });

  it("returns correct form", () => {
    expect(returnedValue.className).toBe("mocked-wrapper");
    const wrappedEl = returnedValue.children.item(0);
    expect(wrappedEl.children.length).toBe(1);
    const form = wrappedEl.children.item(0);
    expect(form.tagName.toLowerCase()).toBe("form");
    expect(form.className).toBe("forgotten-password-form");

    expect(form.childElementCount).toBe(6);
    expect(form.children.item(0).tagName.toLowerCase()).toBe("label");
    expect(form.children.item(0).htmlFor).toBe("IKUISDK-reset-password-email");
    expect(form.children.item(0).innerText).toBe("Email Address");
    expect(form.children.item(1).tagName.toLowerCase()).toBe("input");
    expect(form.children.item(1).id).toBe("IKUISDK-reset-password-email");
    expect(form.children.item(2).tagName.toLowerCase()).toBe("label");
    expect(form.children.item(2).htmlFor).toBe("unknown");
    expect(form.children.item(2).innerText).toBe("unknown");
    expect(form.children.item(3).tagName.toLowerCase()).toBe("input");
    expect(form.children.item(3).id).toBe("unknown");
    expect(form.children.item(4).tagName.toLowerCase()).toBe("button");
    expect(form.children.item(4).type).toBe("submit");
    expect(form.children.item(4).id).toBe("IKUISDK-reset-password-email-btn");
    expect(form.children.item(4).innerText).toBe("Send password reset email");
    expect(form.children.item(5).children.item(0).innerText).toBe("Go back to login");
    expect(form.children.item(5).children.item(0).href).toBe(
      new URL("/login", location.href).toString(),
    );
  });
});

describe("when custom relative login path is specified specified", () => {
  /**
   * @type {HTMLElement}
   */
  let returnedValue;

  beforeEach(() => {
    props.loginPath = "/my/login/path";

    returnedValue = forgotPasswordUI(props);
  });

  it("returns correct form", () => {
    expect(returnedValue.className).toBe("mocked-wrapper");
    const wrappedEl = returnedValue.children.item(0);
    expect(wrappedEl.children.length).toBe(1);
    const form = wrappedEl.children.item(0);
    expect(form.tagName.toLowerCase()).toBe("form");
    expect(form.className).toBe("forgotten-password-form");

    expect(form.children.item(0).tagName.toLowerCase()).toBe("label");
    expect(form.children.item(0).htmlFor).toBe("IKUISDK-reset-password-email");
    expect(form.children.item(0).innerText).toBe("Email Address");
    expect(form.children.item(1).tagName.toLowerCase()).toBe("input");
    expect(form.children.item(1).id).toBe("IKUISDK-reset-password-email");
    expect(form.children.item(2).tagName.toLowerCase()).toBe("button");
    expect(form.children.item(2).type).toBe("submit");
    expect(form.children.item(2).id).toBe("IKUISDK-reset-password-email-btn");
    expect(form.children.item(2).innerText).toBe("Send password reset email");
    expect(form.children.item(3).children.item(0).innerText).toBe("Go back to login");
    expect(form.children.item(3).children.item(0).href).toBe(
      new URL("/my/login/path", location.href).toString(),
    );
  });
});

describe("when custom absolute login path is specified specified", () => {
  /**
   * @type {HTMLElement}
   */
  let returnedValue;

  beforeEach(() => {
    props.loginPath = "https://awesome.indykite.me/login";

    returnedValue = forgotPasswordUI(props);
  });

  it("returns correct form", () => {
    expect(returnedValue.className).toBe("mocked-wrapper");
    const wrappedEl = returnedValue.children.item(0);
    expect(wrappedEl.children.length).toBe(1);
    const form = wrappedEl.children.item(0);
    expect(form.tagName.toLowerCase()).toBe("form");
    expect(form.className).toBe("forgotten-password-form");

    expect(form.children.item(0).tagName.toLowerCase()).toBe("label");
    expect(form.children.item(0).htmlFor).toBe("IKUISDK-reset-password-email");
    expect(form.children.item(0).innerText).toBe("Email Address");
    expect(form.children.item(1).tagName.toLowerCase()).toBe("input");
    expect(form.children.item(1).id).toBe("IKUISDK-reset-password-email");
    expect(form.children.item(2).tagName.toLowerCase()).toBe("button");
    expect(form.children.item(2).type).toBe("submit");
    expect(form.children.item(2).id).toBe("IKUISDK-reset-password-email-btn");
    expect(form.children.item(2).innerText).toBe("Send password reset email");
    expect(form.children.item(3).children.item(0).innerText).toBe("Go back to login");
    expect(form.children.item(3).children.item(0).href).toBe("https://awesome.indykite.me/login");
  });
});
