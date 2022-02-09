const { setNotificationsState } = require("../../../lib/notifications");
const fail = require("../fail");

jest.mock("../../../lib/notifications");

let props;
beforeEach(() => {
  jest.resetAllMocks();
  props = {};
});

describe("when onFailCallback prop is present", () => {
  beforeEach(() => {
    props.onFailCallback = jest.fn();
    fail(props);
  });

  it("sets notification state", () => {
    expect(setNotificationsState).toBeCalledTimes(1);
    expect(setNotificationsState).toBeCalledWith({
      title: "Unable to get a list of login/registration options",
      type: "error",
    });
  });

  it("calls onFailCallback prop", () => {
    expect(props.onFailCallback).toBeCalledTimes(1);
    expect(props.onFailCallback).toBeCalledWith(
      new Error("Unable to get a list of login/registration options"),
    );
  });
});

describe("when onFailCallback prop is not present", () => {
  beforeEach(() => {
    fail(props);
  });

  it("sets notification state", () => {
    expect(setNotificationsState).toBeCalledTimes(1);
    expect(setNotificationsState).toBeCalledWith({
      title: "Unable to get a list of login/registration options",
      type: "error",
    });
  });
});
