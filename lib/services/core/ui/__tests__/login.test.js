const { wrapUI } = require("../components/wrap");
const { getNotificationsState } = require("../../lib/notifications");
const messageParser = require("../messageParser");
const loginUI = require("../login");

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
    returnedValue = loginUI(props);
  });

  it("calls message parser with correct parameters", () => {
    expect(messageParser).toBeCalledTimes(1);
    expect(messageParser).toBeCalledWith({
      context: props.context,
      htmlContainer: expect.any(HTMLDivElement),
      labels: {
        default: {
          forgotPasswordButton: "Forgot password",
          loginButton: "Login",
          orOtherOptions: "Or continue with",
          password: "Password",
          registerButton: "Create an account",
          username: "Username",
        },
      },
      paths: {
        forgotPassword: "/forgot/password",
        registration: "/registration",
      },
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
      registerButton: "Register a new account",
    };
    props.loginApp = "login-app";
    props.redirectUri = "/redirect/me/here";
    props.onRenderComponent = jest.fn();
    props.onFailCallback = jest.fn();
    props.onSuccessCallback = jest.fn();
    props.registrationPath = "/custom/registration";
    props.forgotPasswordPath = "/custom/forgotten-password";

    returnedValue = loginUI(props);
  });

  it("calls message parser with correct parameters", () => {
    expect(messageParser).toBeCalledTimes(1);
    expect(messageParser).toBeCalledWith({
      context: props.context,
      htmlContainer: expect.any(HTMLDivElement),
      labels: {
        default: {
          forgotPasswordButton: "Forgot password",
          loginButton: "Login",
          orOtherOptions: "Or continue with",
          password: "Password",
          registerButton: "Create an account",
          username: "Username",
        },
        custom: {
          registerButton: "Register a new account",
        },
      },
      paths: {
        forgotPassword: "/custom/forgotten-password",
        registration: "/custom/registration",
      },
      loginApp: props.loginApp,
      onRenderComponent: props.onRenderComponent,
      onFailCallback: props.onFailCallback,
      onSuccessCallback: props.onSuccessCallback,
      redirectUri: "/redirect/me/here",
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
