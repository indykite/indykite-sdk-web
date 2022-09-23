const { createRenderComponentCallback, createRandomId } = require("../../../utils/helpers");
const { handleLogin } = require("../../../lib/login");
const { handleForm } = require("../../../lib/common");
const { handleError, setNotification } = require("../../../lib/notifications");
const { handleRegister } = require("../../../lib/register");
const { inputWithLabel } = require("../../components/inputs");
const form = require("../form");
const { handleSendResetPasswordEmail } = require("../../../lib/reset-password");
const storage = require("../../../lib/storage");
const { getLocalizedMessage } = require("../../../lib/locale-provider");

jest.mock("../../../lib/common");
jest.mock("../../../utils/helpers");
jest.mock("../../../lib/notifications");
jest.mock("../../components/inputs");
jest.mock("../../../lib/register");
jest.mock("../../../lib/reset-password");
jest.mock("../../../lib/storage");
jest.mock("../../../lib/locale-provider");

/**
 * @type {HTMLDivElement}
 */
let container;
let props;

const mockedRandomFormId = "654321";
const mockedHandleFormSuccessResponse = { "@type": "success" };

beforeEach(() => {
  jest.resetAllMocks();
  container = document.createElement("div");
  container.classList.add("container");
  props = {
    context: {},
    labels: {
      default: {
        username: "Username mock",
        email: "Email mock",
        loginButton: "Login mock",
        password: "Password mock",
        registerButton: "Register mock",
        confirmPassword: "Confirm password mock",
        agreeAndRegisterButton: "Sign up mock",
        forgottenPasswordSubmitButton: "Reset password mock",
        backToLogin: "Back to login mock",
        newPassword: "New password mock",
        confirmNewPassword: "Confirm new password mock",
        setNewPasswordButton: "Set new password mock",
        forgotPasswordButton: "Reset password mock",
      },
    },
    htmlContainer: container,
    onRenderComponent: jest.fn(),
    onSuccessCallback: jest.fn(),
  };

  createRenderComponentCallback.mockImplementation((onRender, component) => component);
  handleForm.mockImplementation(({ onSuccessCallback }) => {
    onSuccessCallback(mockedHandleFormSuccessResponse);
    return Promise.resolve();
  });
  handleRegister.mockImplementation(() => Promise.resolve());
  inputWithLabel.mockImplementation(jest.requireActual("../../components/inputs").inputWithLabel);
  handleSendResetPasswordEmail.mockImplementation(() => Promise.resolve());
  createRandomId.mockImplementation(() => mockedRandomFormId);
  getLocalizedMessage.mockImplementation((key) => `Localized: ${key}`);
});

describe("when the UI context is 'password#default'", () => {
  beforeEach(() => {
    props.context["~ui"] = "password#default";
  });

  describe("when no props are provided", () => {
    let caughtError;

    beforeEach(() => {
      props = {};

      try {
        form(props);
      } catch (err) {
        caughtError = err;
      }
    });

    it("throws an error", () => {
      expect(caughtError).toEqual(
        new Error("You have to pass a 'htmlContainer' to this function."),
      );
    });
  });

  describe("when the form has no fields", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
      };
      return form(props);
    });

    it("renders a correct form", () => {
      const formEl = container.getElementsByTagName("form")[0];
      const labels = formEl.getElementsByTagName("label");
      const inputs = formEl.getElementsByTagName("input");
      const buttons = formEl.getElementsByTagName("button");
      expect(labels).toHaveLength(0);
      expect(inputs).toHaveLength(0);
      expect(buttons).toHaveLength(1);
      expect(buttons[0].id).toBe("IKUISDK-btn-submit");
      expect(buttons[0].innerText).toBe("Login mock");
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(createRenderComponentCallback).nthCalledWith(
        1,
        props.onRenderComponent,
        expect.any(HTMLButtonElement),
        "form",
        "submit",
        expect.any(Function),
        "Login mock",
        props.context,
      );
    });

    describe("when the button is clicked", () => {
      let clickEvent;

      beforeEach(() => {
        const formEl = container.getElementsByTagName("form")[0];
        const button = formEl.getElementsByTagName("button")[0];
        clickEvent = new Event("click");
        jest.spyOn(clickEvent, "preventDefault");

        button.dispatchEvent(clickEvent);
      });

      it("prevents default event callback", () => {
        expect(clickEvent.preventDefault).toBeCalledTimes(1);
      });

      it("calls handleForm function", () => {
        expect(handleForm).toBeCalledTimes(1);
        expect(handleForm).toBeCalledWith({
          formContext: props.context,
          formId: `IKUISDK-form-${mockedRandomFormId}`,
          onSuccessCallback: expect.any(Function),
          passwordMatchPairIds: [],
        });
      });

      it("calls onSuccessCallback function", () => {
        expect(props.onSuccessCallback).toBeCalledTimes(1);
        expect(props.onSuccessCallback).toBeCalledWith(mockedHandleFormSuccessResponse);
      });

      it("does not handle the error", () => {
        expect(handleError).toBeCalledTimes(0);
      });
    });
  });

  describe("when 'email' is the only field in the form", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
        fields: [
          {
            "@id": "username",
            hint: "email",
          },
        ],
      };
    });

    describe("when a custom label is not provided", () => {
      beforeEach(() => {
        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(1);
        expect(labels[0].innerText).toBe("Username mock");
        expect(inputs).toHaveLength(1);
        expect(inputs[0].id).toBe("IKUISDK-input-username");
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-submit");
        expect(buttons[0].innerText).toBe("Login mock");
        expect(inputWithLabel).toBeCalledTimes(1);
        expect(inputWithLabel).toBeCalledWith({
          type: "email",
          id: "IKUISDK-input-username",
          labelText: "Username mock",
          context: props.context.fields[0],
        });
        expect(createRenderComponentCallback).toBeCalledTimes(2);
        expect(createRenderComponentCallback).nthCalledWith(
          1,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "email",
          "Username mock",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Login mock",
          props.context,
        );
      });
    });

    describe("when a custom label is provided", () => {
      beforeEach(() => {
        props.labels.custom = {
          username: "Custom username",
          loginButton: "Custom login",
        };

        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(1);
        expect(labels[0].innerText).toBe("Custom username");
        expect(inputs).toHaveLength(1);
        expect(inputs[0].id).toBe("IKUISDK-input-username");
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-submit");
        expect(buttons[0].innerText).toBe("Custom login");
        expect(inputWithLabel).toBeCalledTimes(1);
        expect(inputWithLabel).toBeCalledWith({
          type: "email",
          id: "IKUISDK-input-username",
          labelText: "Custom username",
          context: props.context.fields[0],
        });
        expect(createRenderComponentCallback).toBeCalledTimes(2);
        expect(createRenderComponentCallback).nthCalledWith(
          1,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "email",
          "Custom username",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Custom login",
          props.context,
        );
      });

      describe("when the handleForm succeeds", () => {
        describe("when the button is clicked", () => {
          let clickEvent;

          beforeEach(() => {
            const formEl = container.getElementsByTagName("form")[0];
            const button = formEl.getElementsByTagName("button")[0];
            clickEvent = new Event("click");
            jest.spyOn(clickEvent, "preventDefault");
            button.dispatchEvent(clickEvent);
          });

          it("calls handleForm function", () => {
            expect(handleForm).toBeCalledTimes(1);
            expect(handleForm).toBeCalledWith({
              formContext: props.context,
              formId: `IKUISDK-form-${mockedRandomFormId}`,
              onSuccessCallback: expect.any(Function),
              passwordMatchPairIds: [],
            });
          });

          it("calls onSuccessCallback function", () => {
            expect(props.onSuccessCallback).toBeCalledTimes(1);
            expect(props.onSuccessCallback).toBeCalledWith(mockedHandleFormSuccessResponse);
          });
        });
      });

      describe("when the handleForm fails", () => {
        const error = {
          "~error": new Error("Error mock"),
        };

        beforeEach(() => {
          handleForm.mockImplementation(() => {
            return Promise.reject(error);
          });
        });

        describe("when the button is clicked", () => {
          let clickEvent;

          beforeEach(() => {
            const formEl = container.getElementsByTagName("form")[0];
            const button = formEl.getElementsByTagName("button")[0];
            clickEvent = new Event("click");
            jest.spyOn(clickEvent, "preventDefault");
            button.dispatchEvent(clickEvent);
          });

          it("handles an error", () => {
            expect(handleError).toBeCalledTimes(1);
            expect(handleError).toBeCalledWith(error["~error"]);
          });
        });
      });
    });
  });

  describe("when 'unknown' is the only field in the form", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
        fields: [
          {
            "@id": "unknown",
            hint: "unknown",
          },
        ],
      };

      return form(props);
    });

    it("renders a correct form", () => {
      const formEl = container.getElementsByTagName("form")[0];
      const labels = formEl.getElementsByTagName("label");
      const inputs = formEl.getElementsByTagName("input");
      const buttons = formEl.getElementsByTagName("button");
      expect(labels).toHaveLength(1);
      expect(labels[0].innerText).toBe(" ");
      expect(inputs).toHaveLength(1);
      expect(inputs[0].id).toBe("IKUISDK-input-unknown");
      expect(buttons).toHaveLength(1);
      expect(buttons[0].id).toBe("IKUISDK-btn-submit");
      expect(buttons[0].innerText).toBe("Login mock");
      expect(inputWithLabel).toBeCalledTimes(1);
      expect(inputWithLabel).toBeCalledWith({
        type: "unknown",
        id: "IKUISDK-input-unknown",
        labelText: " ",
        context: props.context.fields[0],
      });
      expect(createRenderComponentCallback).toBeCalledTimes(2);
      expect(createRenderComponentCallback).nthCalledWith(
        1,
        props.onRenderComponent,
        expect.any(HTMLDivElement),
        "form",
        "unknown",
        " ",
        props.context.fields[0],
        props.context,
      );
      expect(createRenderComponentCallback).nthCalledWith(
        2,
        props.onRenderComponent,
        expect.any(HTMLButtonElement),
        "form",
        "submit",
        expect.any(Function),
        "Login mock",
        props.context,
      );
    });
  });
});

describe("when the UI context is 'passwordCreate#default'", () => {
  beforeEach(() => {
    props.context["~ui"] = "passwordCreate#default";
  });

  describe("when the form has no fields", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
      };
      return form(props);
    });

    it("renders a correct form", () => {
      const formEl = container.getElementsByTagName("form")[0];
      const labels = formEl.getElementsByTagName("label");
      const inputs = formEl.getElementsByTagName("input");
      const buttons = formEl.getElementsByTagName("button");
      expect(labels).toHaveLength(0);
      expect(inputs).toHaveLength(0);
      expect(buttons).toHaveLength(1);
      expect(buttons[0].id).toBe("IKUISDK-btn-submit");
      expect(buttons[0].innerText).toBe("Register mock");
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(createRenderComponentCallback).nthCalledWith(
        1,
        props.onRenderComponent,
        expect.any(HTMLButtonElement),
        "form",
        "submit",
        expect.any(Function),
        "Register mock",
        props.context,
      );
    });

    describe("when the button is clicked", () => {
      let clickEvent;

      beforeEach(() => {
        const formEl = container.getElementsByTagName("form")[0];
        const button = formEl.getElementsByTagName("button")[0];
        clickEvent = new Event("click");
        jest.spyOn(clickEvent, "preventDefault");

        button.dispatchEvent(clickEvent);
      });

      it("prevents default event callback", () => {
        expect(clickEvent.preventDefault).toBeCalledTimes(1);
      });

      it("calls handleForm function", () => {
        expect(handleForm).toBeCalledTimes(1);
        expect(handleForm).toBeCalledWith({
          formContext: props.context,
          formId: `IKUISDK-form-${mockedRandomFormId}`,
          onSuccessCallback: expect.any(Function),
          passwordMatchPairIds: [],
        });
      });

      it("calls onSuccessCallback function", () => {
        expect(props.onSuccessCallback).toBeCalledTimes(1);
        expect(props.onSuccessCallback).toBeCalledWith(mockedHandleFormSuccessResponse);
      });

      it("does not handle the error", () => {
        expect(handleError).toBeCalledTimes(0);
      });
    });
  });

  describe("when 'password' is the only field in the form", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
        fields: [
          {
            "@id": "password",
            hint: "password",
          },
        ],
      };
    });

    describe("when a custom label is not provided", () => {
      beforeEach(() => {
        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(2);
        expect(labels[0].innerText).toBe("Password mock");
        expect(labels[1].innerText).toBe("Confirm password mock");
        expect(inputs).toHaveLength(2);
        expect(inputs[0].id).toBe("IKUISDK-input-password");
        expect(inputs[1].id).toBe("IKUISDK-input-password-confirm");
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-submit");
        expect(buttons[0].innerText).toBe("Register mock");
        expect(inputWithLabel).toBeCalledTimes(2);
        expect(inputWithLabel).nthCalledWith(1, {
          type: "password",
          id: "IKUISDK-input-password",
          labelText: "Password mock",
          context: props.context.fields[0],
        });
        expect(inputWithLabel).nthCalledWith(2, {
          type: "password",
          id: "IKUISDK-input-password-confirm",
          labelText: "Confirm password mock",
          context: props.context.fields[0],
        });
        expect(createRenderComponentCallback).toBeCalledTimes(3);
        expect(createRenderComponentCallback).nthCalledWith(
          1,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "password",
          "Password mock",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "password-confirm",
          "Confirm password mock",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          3,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Register mock",
          props.context,
        );
      });
    });

    describe("when a custom label is provided", () => {
      beforeEach(() => {
        props.labels.custom = {
          confirmPassword: "Custom confirm password",
          password: "Custom password",
          registerButton: "Custom register",
        };

        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(2);
        expect(labels[0].innerText).toBe("Custom password");
        expect(labels[1].innerText).toBe("Custom confirm password");
        expect(inputs).toHaveLength(2);
        expect(inputs[0].id).toBe("IKUISDK-input-password");
        expect(inputs[1].id).toBe("IKUISDK-input-password-confirm");
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-submit");
        expect(buttons[0].innerText).toBe("Custom register");
        expect(inputWithLabel).toBeCalledTimes(2);
        expect(inputWithLabel).nthCalledWith(1, {
          type: "password",
          id: "IKUISDK-input-password",
          labelText: "Custom password",
          context: props.context.fields[0],
        });
        expect(inputWithLabel).nthCalledWith(2, {
          type: "password",
          id: "IKUISDK-input-password-confirm",
          labelText: "Custom confirm password",
          context: props.context.fields[0],
        });
        expect(createRenderComponentCallback).toBeCalledTimes(3);
        expect(createRenderComponentCallback).nthCalledWith(
          1,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "password",
          "Custom password",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "password-confirm",
          "Custom confirm password",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          3,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Custom register",
          props.context,
        );
      });

      describe("when the button is clicked", () => {
        let clickEvent;

        beforeEach(() => {
          const formEl = container.getElementsByTagName("form")[0];
          const button = formEl.getElementsByTagName("button")[0];
          clickEvent = new Event("click");
          jest.spyOn(clickEvent, "preventDefault");
          button.dispatchEvent(clickEvent);
        });

        it("calls handleForm function", () => {
          expect(handleForm).toBeCalledTimes(1);
          expect(handleForm).toBeCalledWith({
            formContext: props.context,
            formId: `IKUISDK-form-${mockedRandomFormId}`,
            onSuccessCallback: expect.any(Function),
            passwordMatchPairIds: [["IKUISDK-input-password", "IKUISDK-input-password-confirm"]],
          });
        });

        it("calls onSuccessCallback function", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(1);
          expect(props.onSuccessCallback).toBeCalledWith(mockedHandleFormSuccessResponse);
        });
      });
    });
  });
});

describe("when the UI context is 'forgottenPassword#default'", () => {
  beforeEach(() => {
    props.context["~ui"] = "forgottenPassword";
  });

  describe("when 'username' is the only field in the form", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
        fields: [
          {
            "@id": "username",
            hint: "username",
          },
        ],
      };
    });

    describe("when a custom label is not provided", () => {
      beforeEach(() => {
        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(1);
        expect(labels[0].innerText).toBe("Email mock");
        expect(inputs).toHaveLength(1);
        expect(inputs[0].id).toBe("IKUISDK-input-username");
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-submit");
        expect(buttons[0].innerText).toBe("Reset password mock");
        expect(inputWithLabel).toBeCalledTimes(1);
        expect(inputWithLabel).nthCalledWith(1, {
          type: "username",
          id: "IKUISDK-input-username",
          labelText: "Email mock",
          context: props.context.fields[0],
        });
        expect(createRenderComponentCallback).toBeCalledTimes(2);
        expect(createRenderComponentCallback).nthCalledWith(
          1,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "username",
          "Email mock",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Reset password mock",
          props.context,
        );
      });
    });

    describe("when a custom label is provided", () => {
      beforeEach(() => {
        props.labels.custom = {
          email: "Custom email",
          forgotPasswordButton: "Custom reset password mock",
        };

        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(1);
        expect(labels[0].innerText).toBe("Custom email");
        expect(inputs).toHaveLength(1);
        expect(inputs[0].id).toBe("IKUISDK-input-username");
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-submit");
        expect(buttons[0].innerText).toBe("Custom reset password mock");
        expect(inputWithLabel).toBeCalledTimes(1);
        expect(inputWithLabel).nthCalledWith(1, {
          type: "username",
          id: "IKUISDK-input-username",
          labelText: "Custom email",
          context: props.context.fields[0],
        });
        expect(createRenderComponentCallback).toBeCalledTimes(2);
        expect(createRenderComponentCallback).nthCalledWith(
          1,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "username",
          "Custom email",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Custom reset password mock",
          props.context,
        );
      });

      describe("when the button is clicked", () => {
        let clickEvent;

        describe("when the password is reset successfully", () => {
          beforeEach(() => {
            const formEl = container.getElementsByTagName("form")[0];
            const button = formEl.getElementsByTagName("button")[0];
            clickEvent = new Event("click");
            jest.spyOn(clickEvent, "preventDefault");
            button.dispatchEvent(clickEvent);
          });

          it("calls handleForm function", () => {
            expect(handleForm).toBeCalledTimes(1);
            expect(handleForm).toBeCalledWith({
              formContext: props.context,
              formId: `IKUISDK-form-${mockedRandomFormId}`,
              onSuccessCallback: expect.any(Function),
              passwordMatchPairIds: [],
            });
          });

          it("does not call onSuccessCallback function", () => {
            expect(props.onSuccessCallback).toBeCalledTimes(0);
          });

          it("sets notification", () => {
            expect(setNotification).toBeCalledTimes(1);
            expect(setNotification).toBeCalledWith(
              "Localized: uisdk.reset_password.email_send",
              "success",
            );
          });
        });

        describe("when the password reset fails", () => {
          beforeEach(() => {
            handleForm.mockImplementation(({ onSuccessCallback }) => {
              onSuccessCallback({ "@type": "fail" });
              return Promise.resolve();
            });
            const formEl = container.getElementsByTagName("form")[0];
            const button = formEl.getElementsByTagName("button")[0];
            clickEvent = new Event("click");
            jest.spyOn(clickEvent, "preventDefault");
            button.dispatchEvent(clickEvent);
          });

          it("calls handleForm function", () => {
            expect(handleForm).toBeCalledTimes(1);
            expect(handleForm).toBeCalledWith({
              formContext: props.context,
              formId: `IKUISDK-form-${mockedRandomFormId}`,
              onSuccessCallback: expect.any(Function),
              passwordMatchPairIds: [],
            });
          });

          it("does not call onSuccessCallback function", () => {
            expect(props.onSuccessCallback).toBeCalledTimes(0);
          });

          it("sets notification", () => {
            expect(setNotification).toBeCalledTimes(1);
            expect(setNotification).toBeCalledWith(
              "Localized: uisdk.reset_password.fail_message",
              "error",
            );
          });
        });
      });
    });
  });

  describe("when 'unknown' is the only field in the form", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
        fields: [
          {
            "@id": "unknown",
            hint: "unknown",
            placeholder: "email",
          },
        ],
      };

      return form(props);
    });

    it("renders a correct form", () => {
      const formEl = container.getElementsByTagName("form")[0];
      const labels = formEl.getElementsByTagName("label");
      const inputs = formEl.getElementsByTagName("input");
      const buttons = formEl.getElementsByTagName("button");
      expect(labels).toHaveLength(1);
      expect(labels[0].innerText).toBe("Email");
      expect(inputs).toHaveLength(1);
      expect(inputs[0].id).toBe("IKUISDK-input-unknown");
      expect(buttons).toHaveLength(1);
      expect(buttons[0].id).toBe("IKUISDK-btn-submit");
      expect(buttons[0].innerText).toBe("Reset password mock");
      expect(inputWithLabel).toBeCalledTimes(1);
      expect(inputWithLabel).toBeCalledWith({
        type: "unknown",
        id: "IKUISDK-input-unknown",
        labelText: "Email",
        context: props.context.fields[0],
      });
      expect(createRenderComponentCallback).toBeCalledTimes(2);
      expect(createRenderComponentCallback).nthCalledWith(
        1,
        props.onRenderComponent,
        expect.any(HTMLDivElement),
        "form",
        "unknown",
        "Email",
        props.context.fields[0],
        props.context,
      );
      expect(createRenderComponentCallback).nthCalledWith(
        2,
        props.onRenderComponent,
        expect.any(HTMLButtonElement),
        "form",
        "submit",
        expect.any(Function),
        "Reset password mock",
        props.context,
      );
    });
  });
});

describe("when the UI context is 'changePassword#default'", () => {
  beforeEach(() => {
    props.context["~ui"] = "changePassword#default";
  });

  describe("when the form has no fields", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
      };
      return form(props);
    });

    it("renders a correct form", () => {
      const formEl = container.getElementsByTagName("form")[0];
      const labels = formEl.getElementsByTagName("label");
      const inputs = formEl.getElementsByTagName("input");
      const buttons = formEl.getElementsByTagName("button");
      expect(labels).toHaveLength(0);
      expect(inputs).toHaveLength(0);
      expect(buttons).toHaveLength(1);
      expect(buttons[0].id).toBe("IKUISDK-btn-submit");
      expect(buttons[0].innerText).toBe("Set new password mock");
      expect(createRenderComponentCallback).toBeCalledTimes(1);
      expect(createRenderComponentCallback).nthCalledWith(
        1,
        props.onRenderComponent,
        expect.any(HTMLButtonElement),
        "form",
        "submit",
        expect.any(Function),
        "Set new password mock",
        props.context,
      );
    });

    describe("when the button is clicked", () => {
      let clickEvent;

      beforeEach(() => {
        const formEl = container.getElementsByTagName("form")[0];
        const button = formEl.getElementsByTagName("button")[0];
        clickEvent = new Event("click");
        jest.spyOn(clickEvent, "preventDefault");

        button.dispatchEvent(clickEvent);
      });

      it("prevents default event callback", () => {
        expect(clickEvent.preventDefault).toBeCalledTimes(1);
      });

      it("calls handleForm function", () => {
        expect(handleForm).toBeCalledTimes(1);
        expect(handleForm).toBeCalledWith({
          formContext: props.context,
          formId: `IKUISDK-form-${mockedRandomFormId}`,
          onSuccessCallback: expect.any(Function),
          passwordMatchPairIds: [],
        });
      });

      it("calls onSuccessCallback function", () => {
        expect(props.onSuccessCallback).toBeCalledTimes(1);
        expect(props.onSuccessCallback).toBeCalledWith(mockedHandleFormSuccessResponse);
      });

      it("does not handle the error", () => {
        expect(handleError).toBeCalledTimes(0);
      });
    });
  });

  describe("when 'password' is the only field in the form", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
        fields: [
          {
            "@id": "password",
            hint: "password",
          },
        ],
      };
    });

    describe("when a custom label is not provided", () => {
      beforeEach(() => {
        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(2);
        expect(labels[0].innerText).toBe("New password mock");
        expect(labels[1].innerText).toBe("Confirm new password mock");
        expect(inputs).toHaveLength(2);
        expect(inputs[0].id).toBe("IKUISDK-input-password");
        expect(inputs[1].id).toBe("IKUISDK-input-password-confirm");
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-submit");
        expect(buttons[0].innerText).toBe("Set new password mock");
        expect(inputWithLabel).toBeCalledTimes(2);
        expect(inputWithLabel).nthCalledWith(1, {
          type: "password",
          id: "IKUISDK-input-password",
          labelText: "New password mock",
          context: props.context.fields[0],
        });
        expect(inputWithLabel).nthCalledWith(2, {
          type: "password",
          id: "IKUISDK-input-password-confirm",
          labelText: "Confirm new password mock",
          context: props.context.fields[0],
        });
        expect(createRenderComponentCallback).toBeCalledTimes(3);
        expect(createRenderComponentCallback).nthCalledWith(
          1,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "password",
          "New password mock",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "password-confirm",
          "Confirm new password mock",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          3,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Set new password mock",
          props.context,
        );
      });
    });

    describe("when custom labels are provided", () => {
      beforeEach(() => {
        props.labels.custom = {
          confirmNewPassword: "Custom confirm password",
          newPassword: "Custom password",
          setNewPasswordButton: "Custom register",
        };

        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(2);
        expect(labels[0].innerText).toBe("Custom password");
        expect(labels[1].innerText).toBe("Custom confirm password");
        expect(inputs).toHaveLength(2);
        expect(inputs[0].id).toBe("IKUISDK-input-password");
        expect(inputs[1].id).toBe("IKUISDK-input-password-confirm");
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-submit");
        expect(buttons[0].innerText).toBe("Custom register");
        expect(inputWithLabel).toBeCalledTimes(2);
        expect(inputWithLabel).nthCalledWith(1, {
          type: "password",
          id: "IKUISDK-input-password",
          labelText: "Custom password",
          context: props.context.fields[0],
        });
        expect(inputWithLabel).nthCalledWith(2, {
          type: "password",
          id: "IKUISDK-input-password-confirm",
          labelText: "Custom confirm password",
          context: props.context.fields[0],
        });
        expect(createRenderComponentCallback).toBeCalledTimes(3);
        expect(createRenderComponentCallback).nthCalledWith(
          1,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "password",
          "Custom password",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "password-confirm",
          "Custom confirm password",
          props.context.fields[0],
          props.context,
        );
        expect(createRenderComponentCallback).nthCalledWith(
          3,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Custom register",
          props.context,
        );
      });

      describe("when the button is clicked", () => {
        let clickEvent;

        beforeEach(() => {
          const formEl = container.getElementsByTagName("form")[0];
          const button = formEl.getElementsByTagName("button")[0];
          clickEvent = new Event("click");
          jest.spyOn(clickEvent, "preventDefault");
          button.dispatchEvent(clickEvent);
        });

        it("calls handleForm function", () => {
          expect(handleForm).toBeCalledTimes(1);
          expect(handleForm).toBeCalledWith({
            formContext: props.context,
            formId: `IKUISDK-form-${mockedRandomFormId}`,
            onSuccessCallback: expect.any(Function),
            passwordMatchPairIds: [["IKUISDK-input-password", "IKUISDK-input-password-confirm"]],
          });
        });

        it("calls onSuccessCallback function", () => {
          expect(props.onSuccessCallback).toBeCalledTimes(1);
          expect(props.onSuccessCallback).toBeCalledWith(mockedHandleFormSuccessResponse);
        });
      });
    });
  });

  describe("when 'unknown' is the only field in the form", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
        fields: [
          {
            "@id": "unknown",
            hint: "unknown",
            placeholder: "username",
          },
        ],
      };

      return form(props);
    });

    it("renders a correct form", () => {
      const formEl = container.getElementsByTagName("form")[0];
      const labels = formEl.getElementsByTagName("label");
      const inputs = formEl.getElementsByTagName("input");
      const buttons = formEl.getElementsByTagName("button");
      expect(labels).toHaveLength(1);
      expect(labels[0].innerText).toBe("Username");
      expect(inputs).toHaveLength(1);
      expect(inputs[0].id).toBe("IKUISDK-input-unknown");
      expect(buttons).toHaveLength(1);
      expect(buttons[0].id).toBe("IKUISDK-btn-submit");
      expect(buttons[0].innerText).toBe("Set new password mock");
      expect(inputWithLabel).toBeCalledTimes(1);
      expect(inputWithLabel).toBeCalledWith({
        type: "unknown",
        id: "IKUISDK-input-unknown",
        labelText: "Username",
        context: props.context.fields[0],
      });
      expect(createRenderComponentCallback).toBeCalledTimes(2);
      expect(createRenderComponentCallback).nthCalledWith(
        1,
        props.onRenderComponent,
        expect.any(HTMLDivElement),
        "form",
        "unknown",
        "Username",
        props.context.fields[0],
        props.context,
      );
      expect(createRenderComponentCallback).nthCalledWith(
        2,
        props.onRenderComponent,
        expect.any(HTMLButtonElement),
        "form",
        "submit",
        expect.any(Function),
        "Set new password mock",
        props.context,
      );
    });
  });
});

describe("when the UI context is 'newContext#default'", () => {
  beforeEach(() => {
    props.context["~ui"] = "newContext#default";
  });

  describe("when 'username' is the only field in the form", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
        fields: [
          {
            "@id": "password",
            hint: "password",
            placeholder: "password",
          },
        ],
      };

      return form(props);
    });

    it("renders a correct form", () => {
      const formEl = container.getElementsByTagName("form")[0];
      const labels = formEl.getElementsByTagName("label");
      const inputs = formEl.getElementsByTagName("input");
      const buttons = formEl.getElementsByTagName("button");
      expect(labels).toHaveLength(1);
      expect(labels[0].innerText).toBe("Password");
      expect(inputs).toHaveLength(1);
      expect(inputs[0].id).toBe("IKUISDK-input-password");
      expect(buttons).toHaveLength(1);
      expect(buttons[0].id).toBe("IKUISDK-btn-submit");
      expect(buttons[0].innerText).toBe("Submit");
      expect(inputWithLabel).toBeCalledTimes(1);
      expect(inputWithLabel).nthCalledWith(1, {
        type: "password",
        id: "IKUISDK-input-password",
        labelText: "Password",
        context: props.context.fields[0],
      });
      expect(createRenderComponentCallback).toBeCalledTimes(2);
      expect(createRenderComponentCallback).nthCalledWith(
        1,
        props.onRenderComponent,
        expect.any(HTMLDivElement),
        "form",
        "password",
        "Password",
        props.context.fields[0],
        props.context,
      );
      expect(createRenderComponentCallback).nthCalledWith(
        2,
        props.onRenderComponent,
        expect.any(HTMLButtonElement),
        "form",
        "submit",
        expect.any(Function),
        "Submit",
        props.context,
      );
    });
  });
});
