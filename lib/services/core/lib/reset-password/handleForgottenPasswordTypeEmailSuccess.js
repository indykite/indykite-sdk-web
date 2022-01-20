const { setNotification } = require("../notifications");

/**
 * Used in for example for displaying success message element during resetting password.
 * @param message
 */
const handleForgottenPasswordTypeEmailSuccess = (message) => {
  setNotification(message, "success");
};

module.exports = handleForgottenPasswordTypeEmailSuccess;
