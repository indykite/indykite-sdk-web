const render = require("../render");
const renderRegister = require("../renderRegister");

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
    props.loginPath = "/my/login";

    renderRegister(props);
  });

  it("calls render function with correct arguments", () => {
    expect(render).toBeCalledTimes(1);
    expect(render).toBeCalledWith({
      loginApp: "login-app",
      arguments: {
        flow: "register",
      },
      loginPath: "/my/login",
    });
  });
});

describe("when custom paths are not provided", () => {
  beforeEach(() => {
    renderRegister(props);
  });

  it("calls render function with correct arguments", () => {
    expect(render).toBeCalledTimes(1);
    expect(render).toBeCalledWith({
      loginApp: "login-app",
      arguments: {
        flow: "register",
      },
      loginPath: "/login",
    });
  });
});
