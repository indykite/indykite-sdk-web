const { getLocalizedMessage } = require("../../lib/locale-provider");
const { storeOnLoginSuccess } = require("../storage");
const { getElementIds } = require("../config");
const { cleanError, handleError, setNotificationsState } = require("../notifications");
const sendNewPaswordRequest = require("./sendNewPaswordRequest");
const sendNewPasswordVerifier = require("./sendNewPasswordVerifier");

/**
 *
 * @param {null | string} newPasswordValueParam New password can be passed as a param and in this case SDK will not extract value from its input fields
 * @returns {Promise<AxiosResponse<any>|*>}
 */
const handleSendNewPassword = async (newPasswordValueParam) => {
  cleanError();
  try {
    const newPasswordGivenViaParam = newPasswordValueParam !== null;

    let newPassword;
    let newPasswordCheck;

    if (!newPasswordGivenViaParam) {
      // If password extracted from our UI.
      const { inputNewPassword, inputConfirmNewPassword } = getElementIds();
      const newPasswordInput = document.querySelector(`#${inputNewPassword}`);
      const newPasswordCheckInput = document.querySelector(`#${inputConfirmNewPassword}`);

      if (newPasswordInput) newPassword = newPasswordInput.value;
      if (newPasswordCheckInput) newPasswordCheck = newPasswordCheckInput.value;

      if (!newPassword || !newPasswordCheck || newPassword !== newPasswordCheck) {
        const message = getLocalizedMessage("uisdk.reset_password.missing_new_password");
        handleError({ msg: message });
        throw message;
      }
    }

    // Sending new password to server
    const response = await sendNewPaswordRequest(
      newPasswordGivenViaParam ? newPasswordValueParam : newPassword,
    );

    if (!response || !response.data) {
      const message = getLocalizedMessage("uisdk.reset_password.no_server_response");
      handleError({ msg: message });
      throw { msg: message };
    }

    if (!response.data["~thread"] || !response.data["~thread"].thid) {
      const message = getLocalizedMessage("uisdk.reset_password.missing_thid");
      handleError({ msg: message });
      throw { msg: message };
    }

    if (response.data["~error"]) {
      handleError(response.data["~error"]);
      throw response.data;
    }

    // Not specified error
    if (response.data["@type"] === "fail") {
      const message = getLocalizedMessage("uisdk.general.email");
      handleError({ msg: message });
      throw { msg: message };
    }

    if (response.data["@type"] === "verifier") {
      // TODO: How to avoid this if?
      const verifierResponse = await sendNewPasswordVerifier(response.data["~thread"].thid);
      if (!verifierResponse || !verifierResponse.data) {
        const message = getLocalizedMessage("uisdk.reset_password.missing_verifier");
        handleError({ msg: message });
        throw { msg: message };
      }

      if (verifierResponse["~error"]) {
        throw verifierResponse["~error"];
      }

      // In case server returns fail but no error specification.
      if (verifierResponse.data["@type"] === "fail") {
        const message = getLocalizedMessage("uisdk.reset_password.fail_message");
        handleError({ msg: message });
        throw { msg: message };
      }

      if (verifierResponse.data["@type"] === "success") {
        await storeOnLoginSuccess(verifierResponse.data);

        if (newPasswordGivenViaParam) {
          // If using SDK built-in UI - redirect to login section.
          return verifierResponse.data;
        }

        setNotificationsState({
          title: getLocalizedMessage("uisdk.reset_password.success_message"),
          type: "success",
        });
        window.location.href = `${window.location.origin}/login`;
      }
    }
  } catch (err) {
    throw err;
  }
};

module.exports = handleSendNewPassword;
