const render = require("../render");
const renderLogin = require("../renderLogin");

jest.mock("../throttleChecker");
jest.mock("../render");

let props;

beforeEach(() => {
  jest.resetAllMocks();
  props = {
    loginApp: "login-app",
  };
});

describe("when custom paths are provided", () => {
  beforeEach(() => {
    props.registrationPath = "/my/registration";
    props.forgotPasswordPath = "/my/forgot-password";

    renderLogin(props);
  });

  it("calls render function with correct arguments", () => {
    expect(render).toBeCalledTimes(1);
    expect(render).toBeCalledWith({
      loginApp: "login-app",
      arguments: {
        flow: "customer",
      },
      registrationPath: "/my/registration",
      forgotPasswordPath: "/my/forgot-password",
    });
  });
});

describe("when custom paths are not provided", () => {
  beforeEach(() => {
    renderLogin(props);
  });

  it("calls render function with correct arguments", () => {
    expect(render).toBeCalledTimes(1);
    expect(render).toBeCalledWith({
      loginApp: "login-app",
      arguments: {
        flow: "customer",
      },
      registrationPath: "/registration",
      forgotPasswordPath: "/forgot/password",
    });
  });
});
