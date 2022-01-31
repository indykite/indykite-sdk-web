const { getLocalizedMessage } = require("../../lib/locale-provider");
const { getElementIds } = require("../config");
const { cleanError, handleError } = require("../notifications");
const sendResetEmailRequest = require("./sendResetEmailRequest");
const handleForgottenPasswordTypeEmailSuccess = require("./handleForgottenPasswordTypeEmailSuccess");

/**
 * Used for getting reset email to entered email address.
 * @param {null | string} emailValueParam Email address can be passed as a param and in this case SDK will not extract value from its input fields. To avoid this behavior set its value to null!
 * @returns {Promise<void>}
 */
const handleSendResetPasswordEmail = async (emailValueParam) => {
  cleanError();
  try {
    const emailGivenViaParams = emailValueParam !== null;
    const resetPasswordEmailInput = document.querySelector(
      `#${getElementIds().resetPasswordEmail}`,
    );

    if (!emailGivenViaParams) {
      // Email address is not given via params so we have to extract the value from our email address input field.
      if (!resetPasswordEmailInput) {
        throw "No reset password input found.";
      }

      if (!resetPasswordEmailInput.value) {
        const message = getLocalizedMessage("uisdk.reset_password.missing_email");
        handleError({ msg: message });
        throw message;
      }
    }

    const response = await sendResetEmailRequest(
      emailGivenViaParams ? emailValueParam : resetPasswordEmailInput.value,
    );

    if (!response || !response.data) {
      const message = getLocalizedMessage("uisdk.reset_password.no_server_response");
      handleError({ msg: message });
      throw { msg: message };
    }

    if (response.data["~error"]) {
      handleError(response.data["~error"]);
      throw response.data["~error"];
    }

    if (response.data["@type"] === "fail") {
      const message = getLocalizedMessage("uisdk.general.error");
      handleError({ msg: message });
      throw { msg: message };
    }

    if (response.data["@type"] === "success") {
      // Display success message element
      const message = getLocalizedMessage("uisdk.reset_password.email_send");
      handleForgottenPasswordTypeEmailSuccess(message);
    }
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = handleSendResetPasswordEmail;
