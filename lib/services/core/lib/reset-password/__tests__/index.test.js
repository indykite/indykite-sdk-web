const handleSendNewPassword = require("../handleSendNewPassword");
const handleSendResetPasswordEmail = require("../handleSendResetPasswordEmail");
const forgotPasswordSetupRequest = require("../forgotPasswordSetupRequest");
const setNewPasswordSetupRequest = require("../setNewPasswordSetupRequest");
const sendResetPasswordEmail = require("../sendResetPasswordEmail");
const sendNewPassword = require("../sendNewPassword");
const index = require("../index");

it("refers to a correct module", () => {
  expect(index.handleSendNewPassword).toBe(handleSendNewPassword);
  expect(index.handleSendResetPasswordEmail).toBe(handleSendResetPasswordEmail);
  expect(index.forgotPasswordSetupRequest).toBe(forgotPasswordSetupRequest);
  expect(index.setNewPasswordSetupRequest).toBe(setNewPasswordSetupRequest);
  expect(index.sendResetPasswordEmail).toBe(sendResetPasswordEmail);
  expect(index.sendNewPassword).toBe(sendNewPassword);
});
