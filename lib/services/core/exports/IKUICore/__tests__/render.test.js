const { skipIfLogged } = require("../../../lib/login");
const setupRequest = require("../../../lib/common/setupRequest");
const renderer = require("../../../ui/renderer");
const render = require("../render");
const updateParentElement = require("../updateParentElement");
const storage = require("../../../lib/storage");

jest.mock("../../../lib/login");
jest.mock("../../../lib/common/setupRequest");
jest.mock("../../../ui/renderer");
jest.mock("../throttleChecker");
jest.mock("../updateParentElement");
jest.mock("../../../lib/storage");

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
  },
};

let props;

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  props = {
    labels: {
      forgotPasswordButton: "Forgotten password",
      loginButton: "Login",
      password: "Password",
      registerButton: "Register",
      username: "Username",
      alreadyHaveAnAccountButton: "Already have an account?",
      confirmPassword: "Re-type the password",
    },
    onFail: jest.fn(),
    onRenderComponent: jest.fn(),
    onSuccess: jest.fn(),
    forgotPasswordPath: "/forgotten-password",
    registrationPath: "/registration",
    loginPath: "/login",
    loginApp: "login-app",
    otpToken: "otp-token",
    redirectUri: "https://example.com",
    registrationPath: "/registration",
    passwordCheckInputNote: "Password check note",
    passwordInputNote: "Password note",
    userInputNote: "User note",
    validatePassword: jest.fn(),
    termsAgreementSectionContent: "Terms & Agreement",
  };
});

afterEach(() => {
  console.error.mockRestore();
});

describe("when setupRequest returns a list of login options", () => {
  const setupRequestResponse = {
    "@type": "logical",
    op: "or",
    opts: [],
  };

  beforeEach(() => {
    setupRequest.mockImplementation(() => Promise.resolve(setupRequestResponse));
  });

  describe("when a user is not logged in yet", () => {
    beforeEach(() => {
      skipIfLogged.mockImplementation(() => false);
    });

    describe("when renderElementSelector is present in props", () => {
      beforeEach(() => {
        props.renderElementSelector = "#selector";
      });

      describe("when an element matching the selector exists", () => {
        let el;

        beforeEach(async () => {
          el = document.createElement("div");
          jest.spyOn(document, "querySelector").mockImplementation((selector) => {
            return selector === "#selector" ? el : null;
          });
        });

        describe("when deprecated props are not present", () => {
          beforeEach(() => {
            return render(props);
          });

          it("calls renderer function", () => {
            expect(renderer).toBeCalledTimes(1);
            expect(renderer).toBeCalledWith({
              context: setupRequestResponse,
              labels: props.labels,
              loginApp: props.loginApp,
              redirectUri: props.redirectUri,
              onFailCallback: expect.any(Function),
              onRenderComponent: props.onRenderComponent,
              onSuccessCallback: expect.any(Function),
              forgotPasswordPath: props.forgotPasswordPath,
              registrationPath: props.registrationPath,
              formContainerClassName: "ui-container",
              loginPath: props.loginPath,
              passwordCheckInputNote: props.passwordCheckInputNote,
              passwordInputNote: props.passwordInputNote,
              userInputNote: props.userInputNote,
              termsAndAgreementHtmlString: props.termsAgreementSectionContent,
              validatePassword: expect.any(Function),
            });
          });

          it("updates container element", () => {
            expect(updateParentElement).toBeCalledTimes(1);
            expect(updateParentElement).toBeCalledWith({
              parent: el,
              child: renderer.mock.results[0].value,
            });
          });

          it("does not print anything into the console", () => {
            expect(console.error).toBeCalledTimes(0);
          });

          it("clears list of responses stored in storage", () => {
            expect(storage.clearResponses).toBeCalledTimes(1);
          });

          it("calls setupRequest with correct arguments", () => {
            expect(setupRequest).toBeCalledTimes(1);
            expect(setupRequest).toBeCalledWith({
              args: {},
              baseUri: "https://example.com",
              otpToken: "otp-token",
            });
          });

          describe("when onFailCallback is called", () => {
            const error = new Error("Test error");

            beforeEach(() => {
              const onFailCallback = renderer.mock.calls[0][0].onFailCallback;
              onFailCallback(error);
            });

            it("calls onFail callback", () => {
              expect(props.onFail).toBeCalledTimes(1);
              expect(props.onFail).toBeCalledWith(error);
            });
          });

          describe("when onSuccessCallback is called", () => {
            describe("when the message type is 'success'", () => {
              const onSuccessArgument = {
                "@type": "success",
              };

              beforeEach(() => {
                const onSuccessCallback = renderer.mock.calls[0][0].onSuccessCallback;
                onSuccessCallback(onSuccessArgument);
              });

              it("calls onSuccess callback", () => {
                expect(props.onSuccess).toBeCalledTimes(1);
                expect(props.onSuccess).toBeCalledWith(onSuccessArgument);
              });

              it("clears list of responses stored in storage", () => {
                expect(storage.clearResponses).toBeCalledTimes(2);
              });
            });

            describe("when the message type is not 'success'", () => {
              const onSuccessArgument = {
                "@type": "oidc",
                prv: "indykite.me",
              };

              beforeEach(() => {
                const onSuccessCallback = renderer.mock.calls[0][0].onSuccessCallback;
                onSuccessCallback(onSuccessArgument);
              });

              it("does not call onSuccess callback", () => {
                expect(props.onSuccess).toBeCalledTimes(0);
              });

              it("calls renderer function", () => {
                expect(renderer).toBeCalledTimes(2);
                expect(renderer).nthCalledWith(2, {
                  context: onSuccessArgument,
                  labels: props.labels,
                  loginApp: props.loginApp,
                  redirectUri: props.redirectUri,
                  onFailCallback: expect.any(Function),
                  onRenderComponent: props.onRenderComponent,
                  onSuccessCallback: expect.any(Function),
                  forgotPasswordPath: props.forgotPasswordPath,
                  registrationPath: props.registrationPath,
                  formContainerClassName: "ui-container",
                  loginPath: props.loginPath,
                  passwordCheckInputNote: props.passwordCheckInputNote,
                  passwordInputNote: props.passwordInputNote,
                  userInputNote: props.userInputNote,
                  termsAndAgreementHtmlString: props.termsAgreementSectionContent,
                  validatePassword: expect.any(Function),
                });
              });

              it("does not clear list of responses stored in storage", () => {
                expect(storage.clearResponses).toBeCalledTimes(1);
              });
            });
          });
        });

        describe("when deprecated props are present", () => {
          beforeEach(() => {
            props.onSuccessLogin = jest.fn();
            props.onSuccessRegistration = jest.fn();
            props.onLoginFail = jest.fn();
            props.onRegistrationFail = jest.fn();

            return render(props);
          });

          it("calls renderer function", () => {
            expect(renderer).toBeCalledTimes(1);
            expect(renderer).toBeCalledWith({
              context: setupRequestResponse,
              labels: props.labels,
              loginApp: props.loginApp,
              redirectUri: props.redirectUri,
              onFailCallback: expect.any(Function),
              onRenderComponent: props.onRenderComponent,
              onSuccessCallback: expect.any(Function),
              forgotPasswordPath: props.forgotPasswordPath,
              registrationPath: props.registrationPath,
              formContainerClassName: "ui-container",
              loginPath: props.loginPath,
              passwordCheckInputNote: props.passwordCheckInputNote,
              passwordInputNote: props.passwordInputNote,
              userInputNote: props.userInputNote,
              termsAndAgreementHtmlString: props.termsAgreementSectionContent,
              validatePassword: expect.any(Function),
            });
          });

          it("updates container element", () => {
            expect(updateParentElement).toBeCalledTimes(1);
            expect(updateParentElement).toBeCalledWith({
              parent: el,
              child: renderer.mock.results[0].value,
            });
          });

          it("does not print anything into the console", () => {
            expect(console.error).toBeCalledTimes(0);
          });

          it("clears list of responses stored in storage", () => {
            expect(storage.clearResponses).toBeCalledTimes(1);
          });

          describe("when onFailCallback is called", () => {
            const error = new Error("Test error");

            beforeEach(() => {
              const onFailCallback = renderer.mock.calls[0][0].onFailCallback;
              onFailCallback(error);
            });

            it("calls onFail callback", () => {
              expect(props.onFail).toBeCalledTimes(1);
              expect(props.onFail).toBeCalledWith(error);
              expect(props.onLoginFail).toBeCalledTimes(1);
              expect(props.onLoginFail).toBeCalledWith(error);
              expect(props.onRegistrationFail).toBeCalledTimes(1);
              expect(props.onRegistrationFail).toBeCalledWith(error);
            });
          });

          describe("when onSuccessCallback is called", () => {
            describe("when the message type is 'success'", () => {
              const onSuccessArgument = {
                "@type": "success",
              };

              beforeEach(() => {
                const onSuccessCallback = renderer.mock.calls[0][0].onSuccessCallback;
                onSuccessCallback(onSuccessArgument);
              });

              it("calls onSuccess callback", () => {
                expect(props.onSuccess).toBeCalledTimes(1);
                expect(props.onSuccess).toBeCalledWith(onSuccessArgument);
                expect(props.onSuccessLogin).toBeCalledTimes(1);
                expect(props.onSuccessLogin).toBeCalledWith(onSuccessArgument);
                expect(props.onSuccessRegistration).toBeCalledTimes(1);
                expect(props.onSuccessRegistration).toBeCalledWith(onSuccessArgument);
              });

              it("clears list of responses stored in storage", () => {
                expect(storage.clearResponses).toBeCalledTimes(2);
              });
            });

            describe("when the message type is not 'success'", () => {
              const onSuccessArgument = {
                "@type": "oidc",
                prv: "indykite.me",
              };

              beforeEach(() => {
                const onSuccessCallback = renderer.mock.calls[0][0].onSuccessCallback;
                onSuccessCallback(onSuccessArgument);
              });

              it("does not call onSuccess callback", () => {
                expect(props.onSuccess).toBeCalledTimes(0);
                expect(props.onSuccessLogin).toBeCalledTimes(0);
                expect(props.onSuccessRegistration).toBeCalledTimes(0);
              });

              it("calls renderer function", () => {
                expect(renderer).toBeCalledTimes(2);
                expect(renderer).nthCalledWith(2, {
                  context: onSuccessArgument,
                  labels: props.labels,
                  loginApp: props.loginApp,
                  redirectUri: props.redirectUri,
                  onFailCallback: expect.any(Function),
                  onRenderComponent: props.onRenderComponent,
                  onSuccessCallback: expect.any(Function),
                  forgotPasswordPath: props.forgotPasswordPath,
                  registrationPath: props.registrationPath,
                  formContainerClassName: "ui-container",
                  loginPath: props.loginPath,
                  passwordCheckInputNote: props.passwordCheckInputNote,
                  passwordInputNote: props.passwordInputNote,
                  userInputNote: props.userInputNote,
                  termsAndAgreementHtmlString: props.termsAgreementSectionContent,
                  validatePassword: expect.any(Function),
                });
              });

              it("does not clear list of responses stored in storage", () => {
                expect(storage.clearResponses).toBeCalledTimes(1);
              });
            });
          });
        });
      });

      describe("when an element matching the selector does not exist", () => {
        beforeEach(async () => {
          jest.spyOn(document, "querySelector").mockImplementation(() => null);

          return render(props);
        });

        it("does not call renderer function", () => {
          expect(renderer).toBeCalledTimes(0);
        });

        it("does not update container element", () => {
          expect(updateParentElement).toBeCalledTimes(0);
        });

        it("prints an error into the console", () => {
          expect(console.error).toBeCalledTimes(1);
          expect(console.error).toBeCalledWith(
            new Error(
              "Cannot find any element by provided renderElementSelector prop: #selector",
            ),
          );
        });

        it("calls onLoginFail with the error", () => {
          expect(props.onFail).toBeCalledTimes(1);
          expect(props.onFail).toBeCalledWith(
            new Error(
              "Cannot find any element by provided renderElementSelector prop: #selector",
            ),
          );
        });
      });
    });

    describe("when an element matching the selector does not exist", () => {
      beforeEach(async () => {
        jest.spyOn(document, "querySelector").mockImplementation(() => null);

        return render(props);
      });

      it("does not call renderer function", () => {
        expect(renderer).toBeCalledTimes(0);
      });

      it("does not update container element", () => {
        expect(updateParentElement).toBeCalledTimes(0);
      });

      it("prints an error into the console", () => {
        expect(console.error).toBeCalledTimes(1);
        expect(console.error).toBeCalledWith(
          new Error("You have not provided any renderElementSelector prop!"),
        );
      });

      it("calls onLoginFail with the error", () => {
        expect(props.onFail).toBeCalledTimes(1);
        expect(props.onFail).toBeCalledWith(
          new Error("You have not provided any renderElementSelector prop!"),
        );
      });
    });
  });

  describe("when a user is already logged in", () => {
    beforeEach(async () => {
      skipIfLogged.mockImplementation(() => true);

      return render(props);
    });

    it("does not call loginUI function", () => {
      expect(renderer).toBeCalledTimes(0);
    });

    it("does not update container element", () => {
      expect(updateParentElement).toBeCalledTimes(0);
    });

    it("does not print an error into the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });
});

describe("when setupRequest throws an error", () => {
  const error = new Error("Test error");

  beforeEach(async () => {
    setupRequest.mockImplementation(() => Promise.reject(error));

    return render(props);
  });

  it("does not call loginUI function", () => {
    expect(renderer).toBeCalledTimes(0);
  });

  it("does not update container element", () => {
    expect(updateParentElement).toBeCalledTimes(0);
  });

  it("prints an error into the console", () => {
    expect(console.error).toBeCalledTimes(1);
    expect(console.error).toBeCalledWith(error);
  });
});
