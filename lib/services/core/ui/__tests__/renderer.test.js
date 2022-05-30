const { wrapUI } = require("../components/wrap");
const { getNotificationsState } = require("../../lib/notifications");
const messageParser = require("../messageParser");
const renderer = require("../renderer");

jest.mock("../components/wrap");
jest.mock("../../lib/notifications");
jest.mock("../messageParser");

let props;
window.IKSDK = { config: {} };

beforeEach(() => {
  jest.resetAllMocks();

  props = {
    context: {
      "@type": "mocked-type",
    },
  };

  wrapUI.mockImplementation(() => document.createElement("div"));
  getNotificationsState.mockImplementation(() => ({ mockedKey: "mockedValue" }));
});

describe("when default values are used", () => {
  let returnedValue;

  beforeEach(() => {
    returnedValue = renderer(props);
  });

  it("calls message parser with correct parameters", () => {
    expect(messageParser).toBeCalledTimes(1);
    expect(messageParser).toBeCalledWith({
      context: props.context,
      htmlContainer: expect.any(HTMLDivElement),
      labels: {
        default: {
          agreeAndRegisterButton: "Sign up",
          alreadyHaveAnAccountButton: "Already have an account",
          backToLogin: "Go back to login",
          confirmPassword: "Confirm Password",
          email: "Email Address",
          forgotPasswordButton: "Forgot password",
          forgottenPasswordSubmitButton: "Send password reset email",
          loginButton: "Login",
          loginLinkButton: "Already have an account",
          password: "Password",
          registerButton: "Sign up",
          registerLinkButton: "Create an account",
          username: "Username",
        },
      },
      paths: {},
      notes: {},
    });
  });

  it("calls wrap ui with the ui container and notification state", () => {
    const uiContainer = messageParser.mock.calls[0][0].htmlContainer;
    const notificationState = getNotificationsState.mock.results[0].value;
    expect(wrapUI).toBeCalledTimes(1);
    expect(wrapUI).toBeCalledWith(uiContainer, notificationState);
  });
});

describe("when custom values are used", () => {
  let returnedValue;

  beforeEach(() => {
    props.labels = {
      alreadyHaveAnAccountButton: "I have an account already",
    };
    props.loginApp = "login-app";
    props.loginPath = "/custom/login";
    props.registrationPath = "/custom/registration";
    props.forgotPasswordPath = "/custom/forgotten/password";
    props.redirectUri = "/redirect/me/here";
    props.onRenderComponent = jest.fn();
    props.onFailCallback = jest.fn();
    props.onSuccessCallback = jest.fn();
    props.validatePassword = jest.fn();
    props.termsAndAgreementHtmlString = "You <b>must</b> aggree!";
    props.userInputNote = "User note";
    props.passwordInputNote = "Password note";
    props.passwordCheckInputNote = "Password check note";

    returnedValue = renderer(props);
  });

  it("calls message parser with correct parameters", () => {
    expect(messageParser).toBeCalledTimes(1);
    expect(messageParser).toBeCalledWith({
      context: props.context,
      htmlContainer: expect.any(HTMLDivElement),
      labels: {
        default: {
          agreeAndRegisterButton: "Sign up",
          alreadyHaveAnAccountButton: "Already have an account",
          backToLogin: "Go back to login",
          confirmPassword: "Confirm Password",
          email: "Email Address",
          forgotPasswordButton: "Forgot password",
          forgottenPasswordSubmitButton: "Send password reset email",
          loginButton: "Login",
          loginLinkButton: "Already have an account",
          password: "Password",
          registerButton: "Sign up",
          registerLinkButton: "Create an account",
          username: "Username",
        },
        custom: {
          alreadyHaveAnAccountButton: "I have an account already",
        },
      },
      paths: {
        login: "/custom/login",
        registration: "/custom/registration",
        forgotPassword: "/custom/forgotten/password",
      },
      notes: {
        user: "User note",
        password: "Password note",
        passwordCheck: "Password check note",
      },
      loginApp: props.loginApp,
      onRenderComponent: props.onRenderComponent,
      onFailCallback: props.onFailCallback,
      onSuccessCallback: props.onSuccessCallback,
      redirectUri: "/redirect/me/here",
      termsAndAgreementHtmlString: "You <b>must</b> aggree!",
      validatePassword: props.validatePassword,
    });
  });

  it("calls wrap ui with the ui container and notification state", () => {
    const uiContainer = messageParser.mock.calls[0][0].htmlContainer;
    const notificationState = getNotificationsState.mock.results[0].value;
    expect(wrapUI).toBeCalledTimes(1);
    expect(wrapUI).toBeCalledWith(uiContainer, notificationState);
  });

  it("returns a correct value", () => {
    expect(returnedValue).toBe(wrapUI.mock.results[0].value);
  });
});
