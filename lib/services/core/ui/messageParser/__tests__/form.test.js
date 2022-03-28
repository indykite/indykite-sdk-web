const { createRenderComponentCallback } = require("../../../utils/helpers");
const { handleLogin } = require("../../../lib/login");
const { handleError } = require("../../../lib/notifications");
const { handleRegister } = require("../../../lib/register");
const { inputWithLabel } = require("../../components/inputs");
const form = require("../form");
const { handleSendResetPasswordEmail } = require("../../../lib/reset-password");
const storage = require("../../../lib/storage");

jest.mock("../../../lib/login");
jest.mock("../../../utils/helpers");
jest.mock("../../../lib/notifications");
jest.mock("../../components/inputs");
jest.mock("../../../lib/register");
jest.mock("../../../lib/reset-password");
jest.mock("../../../lib/storage");

/**
 * @type {HTMLDivElement}
 */
let container;
let props;

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
        agreeAndRegisterButton: "Agree & Register mock",
        forgottenPasswordSubmitButton: "Reset password mock",
        backToLogin: "Back to login mock",
      },
    },
    htmlContainer: container,
    onRenderComponent: jest.fn(),
    onSuccessCallback: jest.fn(),
  };

  createRenderComponentCallback.mockImplementation((onRender, component) => component);
  handleLogin.mockImplementation(() => Promise.resolve());
  handleRegister.mockImplementation(() => Promise.resolve());
  inputWithLabel.mockImplementation(jest.requireActual("../../components/inputs").inputWithLabel);
  handleSendResetPasswordEmail.mockImplementation(() => Promise.resolve());
});

describe("when the UI context is 'password#default'", () => {
  beforeEach(() => {
    props.context["~ui"] = "password#default";
  });

  describe("when no custom labels are provided", () => {
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
        const notes = formEl.getElementsByClassName("note");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(0);
        expect(inputs).toHaveLength(0);
        expect(notes).toHaveLength(0);
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-login");
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

        it("calls handleLogin function", () => {
          expect(handleLogin).toBeCalledTimes(1);
          expect(handleLogin).toBeCalledWith({
            id: "form-id",
            emailValueParam: null,
            passwordValueParam: null,
            onSuccessCallback: props.onSuccessCallback,
          });
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
              hint: "email",
            },
          ],
        };
      });

      describe("when a custom note is not provided", () => {
        beforeEach(() => {
          return form(props);
        });

        it("renders a correct form", () => {
          const formEl = container.getElementsByTagName("form")[0];
          const labels = formEl.getElementsByTagName("label");
          const inputs = formEl.getElementsByTagName("input");
          const notes = formEl.getElementsByClassName("note");
          const buttons = formEl.getElementsByTagName("button");
          expect(labels).toHaveLength(1);
          expect(labels[0].innerText).toBe("Username mock");
          expect(inputs).toHaveLength(1);
          expect(inputs[0].id).toBe("IKUISDK-username");
          expect(notes).toHaveLength(0);
          expect(buttons).toHaveLength(1);
          expect(buttons[0].id).toBe("IKUISDK-btn-login");
          expect(buttons[0].innerText).toBe("Login mock");
          expect(inputWithLabel).toBeCalledTimes(1);
          expect(inputWithLabel).toBeCalledWith({
            type: "email",
            id: "IKUISDK-username",
            labelText: "Username mock",
            autofocus: true,
            noteText: undefined,
          });
          expect(createRenderComponentCallback).toBeCalledTimes(2);
          expect(createRenderComponentCallback).nthCalledWith(
            1,
            props.onRenderComponent,
            expect.any(HTMLDivElement),
            "form",
            "username",
            "Username mock",
            props.context.fields[0],
          );
          expect(createRenderComponentCallback).nthCalledWith(
            2,
            props.onRenderComponent,
            expect.any(HTMLButtonElement),
            "form",
            "submit",
            expect.any(Function),
            "Login mock",
          );
        });

        describe("when the button is clicked", () => {
          describe("when handleLogin does not throw an error", () => {
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

            it("calls handleLogin function", () => {
              expect(handleLogin).toBeCalledTimes(1);
              expect(handleLogin).toBeCalledWith({
                id: "form-id",
                emailValueParam: null,
                passwordValueParam: null,
                onSuccessCallback: props.onSuccessCallback,
              });
            });

            it("does not handle the error", () => {
              expect(handleError).toBeCalledTimes(0);
            });
          });

          describe("when handleLogin throws an object error", () => {
            const error = {
              "~error": "Test error",
            };

            beforeEach(() => {
              handleLogin.mockImplementation(() => Promise.reject(error));

              const formEl = container.getElementsByTagName("form")[0];
              const button = formEl.getElementsByTagName("button")[0];

              button.click();
            });

            it("handles the error", () => {
              expect(handleError).toBeCalledTimes(1);
              expect(handleError).toBeCalledWith("Test error");
            });
          });

          describe("when handleLogin throws an error instance", () => {
            const error = new Error("Test error");

            beforeEach(() => {
              handleLogin.mockImplementation(() => Promise.reject(error));

              const formEl = container.getElementsByTagName("form")[0];
              const button = formEl.getElementsByTagName("button")[0];

              button.click();
            });

            it("does not handle the error", () => {
              expect(handleError).toBeCalledTimes(0);
            });
          });
        });
      });

      describe("when a custom note is provided", () => {
        beforeEach(() => {
          props.notes = {
            user: "User note",
          };

          return form(props);
        });

        it("renders a correct form", () => {
          const formEl = container.getElementsByTagName("form")[0];
          const labels = formEl.getElementsByTagName("label");
          const inputs = formEl.getElementsByTagName("input");
          const notes = formEl.getElementsByClassName("note");
          const buttons = formEl.getElementsByTagName("button");
          expect(labels).toHaveLength(1);
          expect(labels[0].innerText).toBe("Username mock");
          expect(inputs).toHaveLength(1);
          expect(inputs[0].id).toBe("IKUISDK-username");
          expect(notes).toHaveLength(1);
          expect(notes[0].innerHTML).toBe("User note");
          expect(buttons).toHaveLength(1);
          expect(buttons[0].id).toBe("IKUISDK-btn-login");
          expect(buttons[0].innerText).toBe("Login mock");
          expect(inputWithLabel).toBeCalledTimes(1);
          expect(inputWithLabel).toBeCalledWith({
            type: "email",
            id: "IKUISDK-username",
            labelText: "Username mock",
            autofocus: true,
            noteText: "User note",
          });
          expect(createRenderComponentCallback).toBeCalledTimes(2);
          expect(createRenderComponentCallback).nthCalledWith(
            1,
            props.onRenderComponent,
            expect.any(HTMLDivElement),
            "form",
            "username",
            "Username mock",
            props.context.fields[0],
          );
          expect(createRenderComponentCallback).nthCalledWith(
            2,
            props.onRenderComponent,
            expect.any(HTMLButtonElement),
            "form",
            "submit",
            expect.any(Function),
            "Login mock",
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

          it("calls handleLogin function", () => {
            expect(handleLogin).toBeCalledTimes(1);
            expect(handleLogin).toBeCalledWith({
              id: "form-id",
              emailValueParam: null,
              passwordValueParam: null,
              onSuccessCallback: props.onSuccessCallback,
            });
          });

          it("does not handle the error", () => {
            expect(handleError).toBeCalledTimes(0);
          });
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
          const notes = formEl.getElementsByClassName("note");
          const buttons = formEl.getElementsByTagName("button");
          expect(labels).toHaveLength(1);
          expect(labels[0].innerText).toBe("Custom username");
          expect(inputs).toHaveLength(1);
          expect(inputs[0].id).toBe("IKUISDK-username");
          expect(notes).toHaveLength(0);
          expect(buttons).toHaveLength(1);
          expect(buttons[0].id).toBe("IKUISDK-btn-login");
          expect(buttons[0].innerText).toBe("Custom login");
          expect(inputWithLabel).toBeCalledTimes(1);
          expect(inputWithLabel).toBeCalledWith({
            type: "email",
            id: "IKUISDK-username",
            labelText: "Custom username",
            autofocus: true,
          });
          expect(createRenderComponentCallback).toBeCalledTimes(2);
          expect(createRenderComponentCallback).nthCalledWith(
            1,
            props.onRenderComponent,
            expect.any(HTMLDivElement),
            "form",
            "username",
            "Custom username",
            props.context.fields[0],
          );
          expect(createRenderComponentCallback).nthCalledWith(
            2,
            props.onRenderComponent,
            expect.any(HTMLButtonElement),
            "form",
            "submit",
            expect.any(Function),
            "Custom login",
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

          it("calls handleLogin function", () => {
            expect(handleLogin).toBeCalledTimes(1);
            expect(handleLogin).toBeCalledWith({
              id: "form-id",
              emailValueParam: null,
              passwordValueParam: null,
              onSuccessCallback: props.onSuccessCallback,
            });
          });
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
              hint: "password",
            },
          ],
        };
      });

      describe("when a custom note is not provided", () => {
        beforeEach(() => {
          return form(props);
        });

        it("renders a correct form", () => {
          const formEl = container.getElementsByTagName("form")[0];
          const labels = formEl.getElementsByTagName("label");
          const inputs = formEl.getElementsByTagName("input");
          const notes = formEl.getElementsByClassName("note");
          const buttons = formEl.getElementsByTagName("button");
          expect(labels).toHaveLength(1);
          expect(labels[0].innerText).toBe("Password mock");
          expect(inputs).toHaveLength(1);
          expect(inputs[0].id).toBe("IKUISDK-password");
          expect(notes).toHaveLength(0);
          expect(buttons).toHaveLength(1);
          expect(buttons[0].id).toBe("IKUISDK-btn-login");
          expect(buttons[0].innerText).toBe("Login mock");
          expect(inputWithLabel).toBeCalledTimes(1);
          expect(inputWithLabel).toBeCalledWith({
            type: "password",
            id: "IKUISDK-password",
            labelText: "Password mock",
            noteText: undefined,
          });
          expect(createRenderComponentCallback).toBeCalledTimes(2);
          expect(createRenderComponentCallback).nthCalledWith(
            1,
            props.onRenderComponent,
            expect.any(HTMLDivElement),
            "form",
            "password",
            "Password mock",
            props.context.fields[0],
          );
          expect(createRenderComponentCallback).nthCalledWith(
            2,
            props.onRenderComponent,
            expect.any(HTMLButtonElement),
            "form",
            "submit",
            expect.any(Function),
            "Login mock",
          );
        });
      });

      describe("when a custom note is provided", () => {
        beforeEach(() => {
          props.notes = {
            password: "Password note",
          };

          return form(props);
        });

        it("renders a correct form", () => {
          const formEl = container.getElementsByTagName("form")[0];
          const labels = formEl.getElementsByTagName("label");
          const inputs = formEl.getElementsByTagName("input");
          const notes = formEl.getElementsByClassName("note");
          const buttons = formEl.getElementsByTagName("button");
          expect(labels).toHaveLength(1);
          expect(labels[0].innerText).toBe("Password mock");
          expect(inputs).toHaveLength(1);
          expect(inputs[0].id).toBe("IKUISDK-password");
          expect(notes).toHaveLength(1);
          expect(notes[0].innerHTML).toBe("Password note");
          expect(buttons).toHaveLength(1);
          expect(buttons[0].id).toBe("IKUISDK-btn-login");
          expect(buttons[0].innerText).toBe("Login mock");
          expect(inputWithLabel).toBeCalledTimes(1);
          expect(inputWithLabel).toBeCalledWith({
            type: "password",
            id: "IKUISDK-password",
            labelText: "Password mock",
            noteText: "Password note",
          });
          expect(createRenderComponentCallback).toBeCalledTimes(2);
          expect(createRenderComponentCallback).nthCalledWith(
            1,
            props.onRenderComponent,
            expect.any(HTMLDivElement),
            "form",
            "password",
            "Password mock",
            props.context.fields[0],
          );
          expect(createRenderComponentCallback).nthCalledWith(
            2,
            props.onRenderComponent,
            expect.any(HTMLButtonElement),
            "form",
            "submit",
            expect.any(Function),
            "Login mock",
          );
        });
      });

      describe("when a custom label is provided", () => {
        beforeEach(() => {
          props.labels.custom = {
            password: "Custom password",
            loginButton: "Custom login",
          };

          return form(props);
        });

        it("renders a correct form", () => {
          const formEl = container.getElementsByTagName("form")[0];
          const labels = formEl.getElementsByTagName("label");
          const inputs = formEl.getElementsByTagName("input");
          const notes = formEl.getElementsByClassName("note");
          const buttons = formEl.getElementsByTagName("button");
          expect(labels).toHaveLength(1);
          expect(labels[0].innerText).toBe("Custom password");
          expect(inputs).toHaveLength(1);
          expect(inputs[0].id).toBe("IKUISDK-password");
          expect(notes).toHaveLength(0);
          expect(buttons).toHaveLength(1);
          expect(buttons[0].id).toBe("IKUISDK-btn-login");
          expect(buttons[0].innerText).toBe("Custom login");
          expect(inputWithLabel).toBeCalledTimes(1);
          expect(inputWithLabel).toBeCalledWith({
            type: "password",
            id: "IKUISDK-password",
            labelText: "Custom password",
          });
          expect(createRenderComponentCallback).toBeCalledTimes(2);
          expect(createRenderComponentCallback).nthCalledWith(
            1,
            props.onRenderComponent,
            expect.any(HTMLDivElement),
            "form",
            "password",
            "Custom password",
            props.context.fields[0],
          );
          expect(createRenderComponentCallback).nthCalledWith(
            2,
            props.onRenderComponent,
            expect.any(HTMLButtonElement),
            "form",
            "submit",
            expect.any(Function),
            "Custom login",
          );
        });
      });
    });
  });
});

describe("when the UI context is 'passwordCreate#default'", () => {
  beforeEach(() => {
    props.context["~ui"] = "passwordCreate#default";
  });

  describe("when 'email' is the only field in the form", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
        fields: [
          {
            hint: "email",
          },
        ],
      };
    });

    describe("when terms & conditions are not specified", () => {
      describe("when validatePassword function is not passed", () => {
        describe("when a custom note is not provided", () => {
          beforeEach(() => {
            return form(props);
          });

          it("renders a correct form", () => {
            const formEl = container.getElementsByTagName("form")[0];
            const labels = formEl.getElementsByTagName("label");
            const inputs = formEl.getElementsByTagName("input");
            const notes = formEl.getElementsByClassName("note");
            const buttons = formEl.getElementsByTagName("button");
            expect(labels).toHaveLength(1);
            expect(labels[0].innerText).toBe("Username mock");
            expect(inputs).toHaveLength(1);
            expect(inputs[0].id).toBe("IKUISDK-username");
            expect(notes).toHaveLength(0);
            expect(buttons).toHaveLength(1);
            expect(buttons[0].id).toBe("IKUISDK-btn-register");
            expect(buttons[0].innerText).toBe("Register mock");
            expect(inputWithLabel).toBeCalledTimes(1);
            expect(inputWithLabel).toBeCalledWith({
              type: "email",
              id: "IKUISDK-username",
              labelText: "Username mock",
              autofocus: true,
              noteText: undefined,
            });
            expect(createRenderComponentCallback).toBeCalledTimes(2);
            expect(createRenderComponentCallback).nthCalledWith(
              1,
              props.onRenderComponent,
              expect.any(HTMLDivElement),
              "form",
              "username",
              "Username mock",
              props.context.fields[0],
            );
            expect(createRenderComponentCallback).nthCalledWith(
              2,
              props.onRenderComponent,
              expect.any(HTMLButtonElement),
              "form",
              "submit",
              expect.any(Function),
              "Register mock",
            );
          });

          describe("when the button is clicked", () => {
            describe("when handleRegister does not throw an error", () => {
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

              it("calls handleRegister function", () => {
                expect(handleRegister).toBeCalledTimes(1);
                expect(handleRegister).toBeCalledWith({
                  id: "form-id",
                  emailValueParam: null,
                  passwordValueParam: null,
                  onSuccessCallback: props.onSuccessCallback,
                });
              });

              it("does not handle the error", () => {
                expect(handleError).toBeCalledTimes(0);
              });
            });

            describe("when handleRegister throws an object error", () => {
              const error = {
                "~error": "Test error",
              };

              beforeEach(() => {
                handleRegister.mockImplementation(() => Promise.reject(error));

                const formEl = container.getElementsByTagName("form")[0];
                const button = formEl.getElementsByTagName("button")[0];

                button.click();
              });

              it("handles the error", () => {
                expect(handleError).toBeCalledTimes(1);
                expect(handleError).toBeCalledWith("Test error");
              });
            });

            describe("when handleRegister throws an error instance", () => {
              const error = new Error("Test error");

              beforeEach(() => {
                handleRegister.mockImplementation(() => Promise.reject(error));

                const formEl = container.getElementsByTagName("form")[0];
                const button = formEl.getElementsByTagName("button")[0];

                button.click();
              });

              it("does not handle the error", () => {
                expect(handleError).toBeCalledTimes(0);
              });
            });
          });
        });

        describe("when a custom note is provided", () => {
          beforeEach(() => {
            props.notes = {
              user: "User note",
            };

            return form(props);
          });

          it("renders a correct form", () => {
            const formEl = container.getElementsByTagName("form")[0];
            const labels = formEl.getElementsByTagName("label");
            const inputs = formEl.getElementsByTagName("input");
            const notes = formEl.getElementsByClassName("note");
            const buttons = formEl.getElementsByTagName("button");
            expect(labels).toHaveLength(1);
            expect(labels[0].innerText).toBe("Username mock");
            expect(inputs).toHaveLength(1);
            expect(inputs[0].id).toBe("IKUISDK-username");
            expect(notes).toHaveLength(1);
            expect(notes[0].innerHTML).toBe("User note");
            expect(buttons).toHaveLength(1);
            expect(buttons[0].id).toBe("IKUISDK-btn-register");
            expect(buttons[0].innerText).toBe("Register mock");
            expect(inputWithLabel).toBeCalledTimes(1);
            expect(inputWithLabel).toBeCalledWith({
              type: "email",
              id: "IKUISDK-username",
              labelText: "Username mock",
              autofocus: true,
              noteText: "User note",
            });
            expect(createRenderComponentCallback).toBeCalledTimes(2);
            expect(createRenderComponentCallback).nthCalledWith(
              1,
              props.onRenderComponent,
              expect.any(HTMLDivElement),
              "form",
              "username",
              "Username mock",
              props.context.fields[0],
            );
            expect(createRenderComponentCallback).nthCalledWith(
              2,
              props.onRenderComponent,
              expect.any(HTMLButtonElement),
              "form",
              "submit",
              expect.any(Function),
              "Register mock",
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

            it("calls handleRegister function", () => {
              expect(handleRegister).toBeCalledTimes(1);
              expect(handleRegister).toBeCalledWith({
                id: "form-id",
                emailValueParam: null,
                passwordValueParam: null,
                onSuccessCallback: props.onSuccessCallback,
              });
            });

            it("does not handle the error", () => {
              expect(handleError).toBeCalledTimes(0);
            });
          });
        });

        describe("when a custom label is provided", () => {
          beforeEach(() => {
            props.labels.custom = {
              username: "Custom username",
              registerButton: "Custom register",
            };

            return form(props);
          });

          it("renders a correct form", () => {
            const formEl = container.getElementsByTagName("form")[0];
            const labels = formEl.getElementsByTagName("label");
            const inputs = formEl.getElementsByTagName("input");
            const notes = formEl.getElementsByClassName("note");
            const buttons = formEl.getElementsByTagName("button");
            expect(labels).toHaveLength(1);
            expect(labels[0].innerText).toBe("Custom username");
            expect(inputs).toHaveLength(1);
            expect(inputs[0].id).toBe("IKUISDK-username");
            expect(notes).toHaveLength(0);
            expect(buttons).toHaveLength(1);
            expect(buttons[0].id).toBe("IKUISDK-btn-register");
            expect(buttons[0].innerText).toBe("Custom register");
            expect(inputWithLabel).toBeCalledTimes(1);
            expect(inputWithLabel).toBeCalledWith({
              type: "email",
              id: "IKUISDK-username",
              labelText: "Custom username",
              autofocus: true,
            });
            expect(createRenderComponentCallback).toBeCalledTimes(2);
            expect(createRenderComponentCallback).nthCalledWith(
              1,
              props.onRenderComponent,
              expect.any(HTMLDivElement),
              "form",
              "username",
              "Custom username",
              props.context.fields[0],
            );
            expect(createRenderComponentCallback).nthCalledWith(
              2,
              props.onRenderComponent,
              expect.any(HTMLButtonElement),
              "form",
              "submit",
              expect.any(Function),
              "Custom register",
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

            it("calls handleRegister function", () => {
              expect(handleRegister).toBeCalledTimes(1);
              expect(handleRegister).toBeCalledWith({
                id: "form-id",
                emailValueParam: null,
                passwordValueParam: null,
                onSuccessCallback: props.onSuccessCallback,
              });
            });
          });
        });
      });

      describe("when validatePassword function is present", () => {
        describe("when validatePassword returns 'true'", () => {
          beforeEach(() => {
            props.validatePassword = jest.fn().mockReturnValue(true);

            return form(props);
          });

          describe("when the button is clicked", () => {
            let clickEvent;

            beforeEach(() => {
              const formEl = container.getElementsByTagName("form")[0];
              const button = formEl.getElementsByTagName("button")[0];
              clickEvent = new Event("click");
              jest.spyOn(clickEvent, "preventDefault");
              const originalQuerySelector = formEl.querySelector;
              jest.spyOn(formEl, "querySelector").mockImplementation((selector) => {
                return selector === "input[type='password']"
                  ? { value: "pa33w0rd" }
                  : originalQuerySelector.call(formEl, selector);
              });

              button.dispatchEvent(clickEvent);
            });

            it("prevents default event callback", () => {
              expect(clickEvent.preventDefault).toBeCalledTimes(1);
            });

            it("calls handleRegister function", () => {
              expect(handleRegister).toBeCalledTimes(1);
              expect(handleRegister).toBeCalledWith({
                id: "form-id",
                emailValueParam: null,
                passwordValueParam: null,
                onSuccessCallback: props.onSuccessCallback,
              });
            });

            it("does not handle the error", () => {
              expect(handleError).toBeCalledTimes(0);
            });

            it("calls validatePassword with a correct argument", () => {
              expect(props.validatePassword).toBeCalledTimes(1);
              expect(props.validatePassword).toBeCalledWith("pa33w0rd");
            });
          });
        });

        describe("when validatePassword returns 'false'", () => {
          beforeEach(() => {
            props.validatePassword = jest.fn().mockReturnValue(false);

            return form(props);
          });

          describe("when the button is clicked", () => {
            let clickEvent;

            beforeEach(() => {
              const formEl = container.getElementsByTagName("form")[0];
              const button = formEl.getElementsByTagName("button")[0];
              clickEvent = new Event("click");
              jest.spyOn(clickEvent, "preventDefault");
              const originalQuerySelector = formEl.querySelector;
              jest.spyOn(formEl, "querySelector").mockImplementation((selector) => {
                return selector === "input[type='password']"
                  ? { value: "pa33w0rd" }
                  : originalQuerySelector.call(formEl, selector);
              });

              button.dispatchEvent(clickEvent);
            });

            it("prevents default event callback", () => {
              expect(clickEvent.preventDefault).toBeCalledTimes(1);
            });

            it("does not call handleRegister function", () => {
              expect(handleRegister).toBeCalledTimes(0);
            });

            it("does not handle the error", () => {
              expect(handleError).toBeCalledTimes(0);
            });

            it("calls validatePassword with a correct argument", () => {
              expect(props.validatePassword).toBeCalledTimes(1);
              expect(props.validatePassword).toBeCalledWith("pa33w0rd");
            });
          });
        });
      });
    });

    describe("when terms & conditions are specified", () => {
      beforeEach(() => {
        props.termsAndAgreementHtmlString = "Mocked terms & conditions";

        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const notes = formEl.getElementsByClassName("note");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(1);
        expect(labels[0].innerText).toBe("Username mock");
        expect(inputs).toHaveLength(1);
        expect(inputs[0].id).toBe("IKUISDK-username");
        expect(notes).toHaveLength(0);
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-register");
        expect(buttons[0].innerText).toBe("Agree & Register mock");
        expect(inputWithLabel).toBeCalledTimes(1);
        expect(inputWithLabel).toBeCalledWith({
          type: "email",
          id: "IKUISDK-username",
          labelText: "Username mock",
          autofocus: true,
          noteText: undefined,
        });
        expect(createRenderComponentCallback).toBeCalledTimes(3);
        expect(createRenderComponentCallback).nthCalledWith(
          1,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "username",
          "Username mock",
          props.context.fields[0],
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Agree & Register mock",
        );
        expect(createRenderComponentCallback).nthCalledWith(
          3,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "termsAndAgreement",
          "Mocked terms & conditions",
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

        it("calls handleRegister function", () => {
          expect(handleRegister).toBeCalledTimes(1);
          expect(handleRegister).toBeCalledWith({
            id: "form-id",
            emailValueParam: null,
            passwordValueParam: null,
            onSuccessCallback: props.onSuccessCallback,
          });
        });

        it("does not handle the error", () => {
          expect(handleError).toBeCalledTimes(0);
        });
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
            hint: "password",
          },
        ],
      };
    });

    describe("when a custom note is not provided", () => {
      beforeEach(() => {
        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const notes = formEl.getElementsByClassName("note");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(2);
        expect(labels[0].innerText).toBe("Password mock");
        expect(labels[1].innerText).toBe("Confirm password mock");
        expect(inputs).toHaveLength(2);
        expect(inputs[0].id).toBe("IKUISDK-password");
        expect(inputs[1].id).toBe("IKUISDK-confirm-password");
        expect(notes).toHaveLength(0);
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-register");
        expect(buttons[0].innerText).toBe("Register mock");
        expect(inputWithLabel).toBeCalledTimes(2);
        expect(inputWithLabel).nthCalledWith(1, {
          type: "password",
          id: "IKUISDK-password",
          labelText: "Password mock",
          noteText: undefined,
        });
        expect(inputWithLabel).nthCalledWith(2, {
          type: "password",
          id: "IKUISDK-confirm-password",
          labelText: "Confirm password mock",
          noteText: undefined,
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
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "passwordCheck",
          "Confirm password mock",
          props.context.fields[0],
        );
        expect(createRenderComponentCallback).nthCalledWith(
          3,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Register mock",
        );
      });
    });

    describe("when a custom note is provided", () => {
      beforeEach(() => {
        props.notes = {
          password: "Password note",
          passwordCheck: "Password check note",
        };

        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const notes = formEl.getElementsByClassName("note");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(2);
        expect(labels[0].innerText).toBe("Password mock");
        expect(labels[1].innerText).toBe("Confirm password mock");
        expect(inputs).toHaveLength(2);
        expect(inputs[0].id).toBe("IKUISDK-password");
        expect(inputs[1].id).toBe("IKUISDK-confirm-password");
        expect(notes).toHaveLength(2);
        expect(notes[0].innerHTML).toBe("Password note");
        expect(notes[1].innerHTML).toBe("Password check note");
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-register");
        expect(buttons[0].innerText).toBe("Register mock");
        expect(inputWithLabel).toBeCalledTimes(2);
        expect(inputWithLabel).nthCalledWith(1, {
          type: "password",
          id: "IKUISDK-password",
          labelText: "Password mock",
          noteText: "Password note",
        });
        expect(inputWithLabel).nthCalledWith(2, {
          type: "password",
          id: "IKUISDK-confirm-password",
          labelText: "Confirm password mock",
          noteText: "Password check note",
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
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "passwordCheck",
          "Confirm password mock",
          props.context.fields[0],
        );
        expect(createRenderComponentCallback).nthCalledWith(
          3,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Register mock",
        );
      });
    });

    describe("when a custom label is provided", () => {
      beforeEach(() => {
        props.labels.custom = {
          password: "Custom password",
          confirmPassword: "Custom confirm password",
          registerButton: "Custom register",
        };

        return form(props);
      });

      it("renders a correct form", () => {
        const formEl = container.getElementsByTagName("form")[0];
        const labels = formEl.getElementsByTagName("label");
        const inputs = formEl.getElementsByTagName("input");
        const notes = formEl.getElementsByClassName("note");
        const buttons = formEl.getElementsByTagName("button");
        expect(labels).toHaveLength(2);
        expect(labels[0].innerText).toBe("Custom password");
        expect(labels[1].innerText).toBe("Custom confirm password");
        expect(inputs).toHaveLength(2);
        expect(inputs[0].id).toBe("IKUISDK-password");
        expect(inputs[1].id).toBe("IKUISDK-confirm-password");
        expect(notes).toHaveLength(0);
        expect(buttons).toHaveLength(1);
        expect(buttons[0].id).toBe("IKUISDK-btn-register");
        expect(buttons[0].innerText).toBe("Custom register");
        expect(inputWithLabel).toBeCalledTimes(2);
        expect(inputWithLabel).nthCalledWith(1, {
          type: "password",
          id: "IKUISDK-password",
          labelText: "Custom password",
        });
        expect(inputWithLabel).nthCalledWith(2, {
          type: "password",
          id: "IKUISDK-confirm-password",
          labelText: "Custom confirm password",
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
        );
        expect(createRenderComponentCallback).nthCalledWith(
          2,
          props.onRenderComponent,
          expect.any(HTMLDivElement),
          "form",
          "passwordCheck",
          "Custom confirm password",
          props.context.fields[0],
        );
        expect(createRenderComponentCallback).nthCalledWith(
          3,
          props.onRenderComponent,
          expect.any(HTMLButtonElement),
          "form",
          "submit",
          expect.any(Function),
          "Custom register",
        );
      });
    });
  });
});

describe("when the UI context is 'passwordCreate' (without scope)", () => {
  beforeEach(() => {
    props.context["~ui"] = "passwordCreate";
  });

  describe("when 'email' is the only field in the form", () => {
    beforeEach(() => {
      props.context = {
        ...props.context,
        "@type": "form",
        "@id": "form-id",
        fields: [
          {
            hint: "email",
          },
        ],
      };

      return form(props);
    });

    it("renders a correct form", () => {
      const formEl = container.getElementsByTagName("form")[0];
      const labels = formEl.getElementsByTagName("label");
      const inputs = formEl.getElementsByTagName("input");
      const notes = formEl.getElementsByClassName("note");
      const buttons = formEl.getElementsByTagName("button");
      expect(labels).toHaveLength(1);
      expect(labels[0].innerText).toBe("Username mock");
      expect(inputs).toHaveLength(1);
      expect(inputs[0].id).toBe("IKUISDK-username");
      expect(notes).toHaveLength(0);
      expect(buttons).toHaveLength(1);
      expect(buttons[0].id).toBe("IKUISDK-btn-register");
      expect(buttons[0].innerText).toBe("Register mock");
      expect(inputWithLabel).toBeCalledTimes(1);
      expect(inputWithLabel).toBeCalledWith({
        type: "email",
        id: "IKUISDK-username",
        labelText: "Username mock",
        autofocus: true,
        noteText: undefined,
      });
      expect(createRenderComponentCallback).toBeCalledTimes(2);
      expect(createRenderComponentCallback).nthCalledWith(
        1,
        props.onRenderComponent,
        expect.any(HTMLDivElement),
        "form",
        "username",
        "Username mock",
        props.context.fields[0],
      );
      expect(createRenderComponentCallback).nthCalledWith(
        2,
        props.onRenderComponent,
        expect.any(HTMLButtonElement),
        "form",
        "submit",
        expect.any(Function),
        "Register mock",
      );
    });
  });
});

describe("when the UI context is 'forgottenPassword#default'", () => {
  beforeEach(() => {
    props.context["~ui"] = "forgottenPassword#default";
  });

  describe("when no custom labels are provided", () => {
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

    describe("when 'text' is the only field in the form", () => {
      beforeEach(() => {
        props.context = {
          ...props.context,
          "@type": "form",
          "@id": "form-id",
          fields: [
            {
              hint: "text",
            },
          ],
        };
      });

      describe("when a custom note is not provided", () => {
        beforeEach(() => {
          return form(props);
        });

        it("renders a correct form", () => {
          const formEl = container.getElementsByTagName("form")[0];
          const labels = formEl.getElementsByTagName("label");
          const inputs = formEl.getElementsByTagName("input");
          const notes = formEl.getElementsByClassName("note");
          const buttons = formEl.getElementsByTagName("button");
          const links = formEl.getElementsByTagName("a");
          expect(labels).toHaveLength(1);
          expect(labels[0].innerText).toBe("Email mock");
          expect(inputs).toHaveLength(1);
          expect(inputs[0].id).toBe("IKUISDK-reset-password-email");
          expect(links).toHaveLength(1);
          expect(links[0].innerText).toBe("Back to login mock");
          expect(notes).toHaveLength(0);
          expect(buttons).toHaveLength(1);
          expect(buttons[0].id).toBe("IKUISDK-reset-password-email-btn");
          expect(buttons[0].innerText).toBe("Reset password mock");
          expect(inputWithLabel).toBeCalledTimes(1);
          expect(inputWithLabel).toBeCalledWith({
            type: "text",
            id: "IKUISDK-reset-password-email",
            labelText: "Email mock",
            autofocus: true,
            noteText: undefined,
          });
          expect(createRenderComponentCallback).toBeCalledTimes(2);
          expect(createRenderComponentCallback).nthCalledWith(
            1,
            props.onRenderComponent,
            expect.any(HTMLDivElement),
            "form",
            "email",
            "Email mock",
            props.context.fields[0],
          );
          expect(createRenderComponentCallback).nthCalledWith(
            2,
            props.onRenderComponent,
            expect.any(HTMLButtonElement),
            "form",
            "submit",
            expect.any(Function),
            "Reset password mock",
          );
        });

        describe("when the button is clicked", () => {
          describe("when handleSendResetPasswordEmail does not throw an error", () => {
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

            it("calls handleSendResetPasswordEmail function", () => {
              expect(handleSendResetPasswordEmail).toBeCalledTimes(1);
              expect(handleSendResetPasswordEmail).toBeCalledWith(null);
            });

            it("does not handle the error", () => {
              expect(handleError).toBeCalledTimes(0);
            });
          });

          describe("when handleSendResetPasswordEmail throws an error instance", () => {
            const error = new Error("Test error");

            beforeEach(() => {
              handleSendResetPasswordEmail.mockImplementation(() => Promise.reject(error));

              const formEl = container.getElementsByTagName("form")[0];
              const button = formEl.getElementsByTagName("button")[0];

              button.click();
            });

            it("does not handle the error", () => {
              expect(handleError).toBeCalledTimes(0);
            });
          });
        });
      });

      describe("when a custom note is provided", () => {
        beforeEach(() => {
          props.notes = {
            user: "User note",
          };

          return form(props);
        });

        it("renders a correct form", () => {
          const formEl = container.getElementsByTagName("form")[0];
          const labels = formEl.getElementsByTagName("label");
          const inputs = formEl.getElementsByTagName("input");
          const notes = formEl.getElementsByClassName("note");
          const buttons = formEl.getElementsByTagName("button");
          const links = formEl.getElementsByTagName("a");
          expect(labels).toHaveLength(1);
          expect(labels[0].innerText).toBe("Email mock");
          expect(inputs).toHaveLength(1);
          expect(inputs[0].id).toBe("IKUISDK-reset-password-email");
          expect(links).toHaveLength(1);
          expect(links[0].innerText).toBe("Back to login mock");
          expect(notes).toHaveLength(1);
          expect(notes[0].innerHTML).toBe("User note");
          expect(buttons).toHaveLength(1);
          expect(buttons[0].id).toBe("IKUISDK-reset-password-email-btn");
          expect(buttons[0].innerText).toBe("Reset password mock");
          expect(inputWithLabel).toBeCalledTimes(1);
          expect(inputWithLabel).toBeCalledWith({
            type: "text",
            id: "IKUISDK-reset-password-email",
            labelText: "Email mock",
            autofocus: true,
            noteText: "User note",
          });
          expect(createRenderComponentCallback).toBeCalledTimes(2);
          expect(createRenderComponentCallback).nthCalledWith(
            1,
            props.onRenderComponent,
            expect.any(HTMLDivElement),
            "form",
            "email",
            "Email mock",
            props.context.fields[0],
          );
          expect(createRenderComponentCallback).nthCalledWith(
            2,
            props.onRenderComponent,
            expect.any(HTMLButtonElement),
            "form",
            "submit",
            expect.any(Function),
            "Reset password mock",
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

          it("calls handleSendResetPasswordEmail function", () => {
            expect(handleSendResetPasswordEmail).toBeCalledTimes(1);
            expect(handleSendResetPasswordEmail).toBeCalledWith(null);
          });

          it("does not handle the error", () => {
            expect(handleError).toBeCalledTimes(0);
          });
        });
      });

      describe("when a custom label is provided", () => {
        beforeEach(() => {
          props.labels.custom = {
            email: "Custom email",
            forgottenPasswordSubmitButton: "Custom submit",
            backToLogin: "Custom back to login",
          };

          return form(props);
        });

        it("renders a correct form", () => {
          const formEl = container.getElementsByTagName("form")[0];
          const labels = formEl.getElementsByTagName("label");
          const inputs = formEl.getElementsByTagName("input");
          const notes = formEl.getElementsByClassName("note");
          const buttons = formEl.getElementsByTagName("button");
          expect(labels).toHaveLength(1);
          expect(labels[0].innerText).toBe("Custom email");
          expect(inputs).toHaveLength(1);
          expect(inputs[0].id).toBe("IKUISDK-reset-password-email");
          expect(notes).toHaveLength(0);
          expect(buttons).toHaveLength(1);
          expect(buttons[0].id).toBe("IKUISDK-reset-password-email-btn");
          expect(buttons[0].innerText).toBe("Custom submit");
          expect(inputWithLabel).toBeCalledTimes(1);
          expect(inputWithLabel).toBeCalledWith({
            type: "text",
            id: "IKUISDK-reset-password-email",
            labelText: "Custom email",
            autofocus: true,
          });
          expect(createRenderComponentCallback).toBeCalledTimes(2);
          expect(createRenderComponentCallback).nthCalledWith(
            1,
            props.onRenderComponent,
            expect.any(HTMLDivElement),
            "form",
            "email",
            "Custom email",
            props.context.fields[0],
          );
          expect(createRenderComponentCallback).nthCalledWith(
            2,
            props.onRenderComponent,
            expect.any(HTMLButtonElement),
            "form",
            "submit",
            expect.any(Function),
            "Custom submit",
          );
        });

        describe("when the submit button is clicked", () => {
          let clickEvent;

          beforeEach(() => {
            const formEl = container.getElementsByTagName("form")[0];
            const button = formEl.getElementsByTagName("button")[0];
            clickEvent = new Event("click");
            jest.spyOn(clickEvent, "preventDefault");
            button.dispatchEvent(clickEvent);
          });

          it("calls handleSendResetPasswordEmail function", () => {
            expect(handleSendResetPasswordEmail).toBeCalledTimes(1);
            expect(handleSendResetPasswordEmail).toBeCalledWith(null);
          });
        });

        describe("when the back to login button is clicked", () => {
          let clickEvent;

          beforeEach(() => {
            storage.popResponse.mockImplementationOnce(() => ({
              info: "Reset password response",
            }));
            storage.popResponse.mockImplementationOnce(() => ({
              info: "Previous response",
            }));

            const formEl = container.getElementsByTagName("form")[0];
            const button = formEl.getElementsByTagName("a")[0];
            clickEvent = new Event("click");
            jest.spyOn(clickEvent, "preventDefault");
            button.dispatchEvent(clickEvent);
          });

          it("calls onSuccessCallback function with correct argument", () => {
            expect(props.onSuccessCallback).toBeCalledTimes(1);
            expect(props.onSuccessCallback).toBeCalledWith({
              info: "Previous response",
            });
          });
        });
      });
    });
  });
});
