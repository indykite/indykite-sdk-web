const { logoutCurrentUser, logoutUser, logoutAllUsers } = require("../../lib/logout");
const { getValidAccessToken, refreshAccessToken } = require("../../lib/refresh");
const { login, isAuthenticated, loginSetup } = require("../../lib/login");
const { registrationFormSetupRequest, register } = require("../../lib/register");
const { sendResetPasswordEmail, sendNewPassword } = require("../../lib/reset-password");

const IKUIUserAPI = {
  isAuthenticated,
  logoutCurrentUser,
  logoutUser,
  logoutAllUsers,
  login,
  getValidAccessToken,
  refreshAccessToken,
  register,
  sendResetPasswordEmail,
  sendNewPassword,
  loginSetup,
  registerSetup: registrationFormSetupRequest,
};

module.exports = IKUIUserAPI;
