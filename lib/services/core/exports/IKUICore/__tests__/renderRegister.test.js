const { registrationFormSetupRequest } = require("../../../lib/register");
const registerUI = require("../../../ui/register");
const renderRegister = require("../renderRegister");
const updateParentElement = require("../updateParentElement");

jest.mock("../../../lib/register");
jest.mock("../../../ui/register");
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
      orOtherOptions: "or other options",
      password: "Password",
      registerButton: "Register",
      username: "Username",
      alreadyHaveAnAccountButton: "Already have an account?",
      confirmPassword: "Re-type the password",
    },
    onRegistrationFail: jest.fn(),
    onRenderComponent: jest.fn(),
    onSuccessRegistration: jest.fn(),
    passwordCheckInputNote: "Password check note",
    passwordInputNote: "Password note",
    termsAgreementSectionContent: "Terms & Agreement",
    userInputNote: "User note",
    validatePassword: jest.fn(),
    loginApp: "login-app",
    redirectUri: "https://example.com",
  };
});

afterEach(() => {
  console.error.mockRestore();
});

describe("when registrationFormSetupRequest returns a list of registration options", () => {
  const registrationOptionsResponse = {
    "@type": "logical",
    op: "or",
    opts: [],
  };

  beforeEach(() => {
    registrationFormSetupRequest.mockImplementation(() =>
      Promise.resolve(registrationOptionsResponse),
    );
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

        return renderRegister(props);
      });

      it("calls registerUI function", () => {
        expect(registerUI).toBeCalledTimes(1);
        expect(registerUI).toBeCalledWith({
          context: registrationOptionsResponse,
          labels: props.labels,
          loginApp: props.loginApp,
          redirectUri: props.redirectUri,
          onFailCallback: props.onRegistrationFail,
          onRenderComponent: props.onRenderComponent,
          onSuccessCallback: props.onSuccessRegistration,
          validatePassword: props.validatePassword,
          termsAngAgreementHtmlString: props.termsAgreementSectionContent,
          userInputNote: props.userInputNote,
          passwordInputNote: props.passwordInputNote,
          passwordCheckInputNote: props.passwordCheckInputNote,
        });
      });

      it("updates container element", () => {
        expect(updateParentElement).toBeCalledTimes(1);
        expect(updateParentElement).toBeCalledWith({
          parent: el,
          child: registerUI.mock.results[0].value,
        });
      });

      it("does not print anything into the console", () => {
        expect(console.error).toBeCalledTimes(0);
      });
    });

    describe("when an element matching the selector does not exist", () => {
      beforeEach(async () => {
        jest.spyOn(document, "querySelector").mockImplementation(() => null);

        return renderRegister(props);
      });

      it("does not call registerUI function", () => {
        expect(registerUI).toBeCalledTimes(0);
      });

      it("does not update container element", () => {
        expect(updateParentElement).toBeCalledTimes(0);
      });

      it("prints an error into the console", () => {
        expect(console.error).toBeCalledTimes(1);
        expect(console.error).toBeCalledWith(
          new Error("Cannot find any element by provided renderElementSelector prop: #selector"),
        );
      });
    });
  });

  describe("when an element matching the selector does not exist", () => {
    beforeEach(async () => {
      jest.spyOn(document, "querySelector").mockImplementation(() => null);

      return renderRegister(props);
    });

    it("does not call registerUI function", () => {
      expect(registerUI).toBeCalledTimes(0);
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
  });
});

describe("when registrationFormSetupRequest throws an error", () => {
  const error = new Error("Test error");

  beforeEach(async () => {
    registrationFormSetupRequest.mockImplementation(() => Promise.reject(error));

    return renderRegister(props);
  });

  it("does not call registerUI function", () => {
    expect(registerUI).toBeCalledTimes(0);
  });

  it("does not update container element", () => {
    expect(updateParentElement).toBeCalledTimes(0);
  });

  it("prints an error into the console", () => {
    expect(console.error).toBeCalledTimes(1);
    expect(console.error).toBeCalledWith(error);
  });
});
