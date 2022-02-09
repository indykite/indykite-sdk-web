const { skipIfLogged, loginSetup } = require("../../../lib/login");
const loginUI = require("../../../ui/login");
const renderLogin = require("../renderLogin");
const updateParentElement = require("../updateParentElement");

jest.mock("../../../lib/login");
jest.mock("../../../ui/login");
jest.mock("../throttleChecker");
jest.mock("../updateParentElement");

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
      orOtherOptions: "or other options",
      password: "Password",
      registerButton: "Register",
      username: "Username",
    },
    onLoginFail: jest.fn(),
    onRenderComponent: jest.fn(),
    onSuccessLogin: jest.fn(),
    forgotPasswordPath: "/forgotten-password",
    loginApp: "login-app",
    redirectUri: "https://example.com",
    registrationPath: "/registration",
  };
});

afterEach(() => {
  console.error.mockRestore();
});

describe("when loginSetup returns a list of login options", () => {
  const loginOptionsResponse = {
    "@type": "logical",
    op: "or",
    opts: [],
  };

  beforeEach(() => {
    loginSetup.mockImplementation(() => Promise.resolve(loginOptionsResponse));
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

          return renderLogin(props);
        });

        it("calls loginUI function", () => {
          expect(loginUI).toBeCalledTimes(1);
          expect(loginUI).toBeCalledWith({
            context: loginOptionsResponse,
            labels: props.labels,
            loginApp: props.loginApp,
            redirectUri: props.redirectUri,
            onFailCallback: props.onLoginFail,
            onRenderComponent: props.onRenderComponent,
            onSuccessCallback: props.onSuccessLogin,
            oidc: false,
            forgotPasswordPath: props.forgotPasswordPath,
            registrationPath: props.registrationPath,
          });
        });

        it("updates container element", () => {
          expect(updateParentElement).toBeCalledTimes(1);
          expect(updateParentElement).toBeCalledWith({
            parent: el,
            child: loginUI.mock.results[0].value,
          });
        });

        it("does not print anything into the console", () => {
          expect(console.error).toBeCalledTimes(0);
        });
      });

      describe("when an element matching the selector does not exist", () => {
        beforeEach(async () => {
          jest.spyOn(document, "querySelector").mockImplementation(() => null);

          return renderLogin(props);
        });

        it("does not call loginUI function", () => {
          expect(loginUI).toBeCalledTimes(0);
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
          expect(props.onLoginFail).toBeCalledTimes(1);
          expect(props.onLoginFail).toBeCalledWith(
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

        return renderLogin(props);
      });

      it("does not call loginUI function", () => {
        expect(loginUI).toBeCalledTimes(0);
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
        expect(props.onLoginFail).toBeCalledTimes(1);
        expect(props.onLoginFail).toBeCalledWith(
          new Error("You have not provided any renderElementSelector prop!"),
        );
      });
    });
  });

  describe("when a user is already logged in", () => {
    beforeEach(async () => {
      skipIfLogged.mockImplementation(() => true);

      return renderLogin(props);
    });

    it("does not call loginUI function", () => {
      expect(loginUI).toBeCalledTimes(0);
    });

    it("does not update container element", () => {
      expect(updateParentElement).toBeCalledTimes(0);
    });

    it("does not print an error into the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });
});

describe("when loginSetup throws an error", () => {
  const error = new Error("Test error");

  beforeEach(async () => {
    loginSetup.mockImplementation(() => Promise.reject(error));

    return renderLogin(props);
  });

  it("does not call loginUI function", () => {
    expect(loginUI).toBeCalledTimes(0);
  });

  it("does not update container element", () => {
    expect(updateParentElement).toBeCalledTimes(0);
  });

  it("prints an error into the console", () => {
    expect(console.error).toBeCalledTimes(1);
    expect(console.error).toBeCalledWith(error);
  });
});
