const { setNotification } = require("../../notifications");
const handleForgottenPasswordTypeEmailSuccess = require("../handleForgottenPasswordTypeEmailSuccess");

jest.mock("../../notifications");

it("passes a message to setNotification function with 'success' type", () => {
  handleForgottenPasswordTypeEmailSuccess("message");
  expect(setNotification).toBeCalledTimes(1);
  expect(setNotification).toBeCalledWith("message", "success");
});
