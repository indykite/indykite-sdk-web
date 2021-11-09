const { getCv, setCv, getThreadId, setFPThreadId, getFPThreadId } = require("./storage");
const { getCodeVerifierAndChallenge } = require("../utils/crypto");

// Locals
const { getLocalizedMessage } = require("../lib/locale-provider");
const { loginFormSetupRequest } = require("./login");
const { storeOnLoginSuccess } = require("./storage");
const { getApplicationId, getBaseUri, getElementIds, context } = require("./config");
const {
  cleanError,
  handleError,
  setNotificationsState,
  setNotification,
} = require("./notifications");
const { sendRequest } = require("../utils/helpers");

/////////////////////
///////REQUESTS//////
/////////////////////

const sendResetEmailRequest = (email) => {
  const url = `${getBaseUri()}/auth/${getApplicationId()}`;
  const data = {
    "~thread": {
      thid: getFPThreadId(),
    },
    "@type": "form",
    username: email,
  };

  return sendRequest(url, "POST", data, {
    actionName: "reset-email",
  });
};

const sendNewPaswordRequest = (newPassword) => {
  const url = `${getBaseUri()}/auth/${getApplicationId()}`;
  const data = {
    "~thread": {
      thid: getFPThreadId(),
    },
    "@type": "form",
    password: newPassword,
    // username??
  };

  return sendRequest(url, "POST", data, {
    actionName: "new-password-request",
  });
};

const sendNewPasswordVerifier = async (thid) => {
  const url = `${getBaseUri()}/auth/${getApplicationId()}`;
  const data = {
    "~thread": {
      thid: thid,
    },
    "@type": "verifier",
    cv: getCv(),
  };

  return sendRequest(url, "POST", data, {
    actionName: "new-password-verifier",
  });
};

/////////////////////
////////MAIN/////////
/////////////////////

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

/**
 * Used in for example for displaying success message element during resetting password.
 * @param message
 */
const handleForgottenPasswordTypeEmailSuccess = (message) => {
  setNotification(message, "success");
};
/**
 * Setups form for entering email to which following instructions will be sent
 * @returns {Promise<unknown>}
 */
const forgotPasswordSetupRequest = () => {
  const url = `${getBaseUri()}/auth/${getApplicationId()}`;
  const data = {
    "~thread": {
      thid: getThreadId(),
    },
    "@type": "action",
    "@id": sessionStorage.getItem("@indykite/actionsId"),
    action: "forgotten",
  };

  return new Promise((resolve, reject) => {
    sendRequest(url, "POST", data, { actionName: "forgot-password-request" })
      .then((response) => {
        if (!response || !response.data) {
          reject("No data resposne from server when getting forgotten password input step 1.");
        }

        if (!response.data["~thread"] || !response.data["~thread"].thid) {
          reject(`No thread information recieved from server on forgot password set up request.
           Please go back to login and try again.`); // TODO: Come up with better message
        }

        setFPThreadId(response.data["~thread"].thid);

        if (response.data["@type"] === "form") resolve(response.data.fields);
      })
      .catch((err) => {
        console.error(err.name, `IKUISDK Failed with forgot password flow step 1 pre-request.`);
        console.debug(err);
        reject(err);
      });
  });
};

/**
 * Fetches what fields for inserting new password should be rendered and updates the thread id in client storage.
 * @param token
 * @returns {Promise<unknown>}
 */
const setNewPasswordSetupRequest = (token) => {
  if (!token) throw { msg: "Reference id token not provided." };

  // This is completely new flow, we can generate new CV and CC
  const { codeVerifier, codeChallenge } = getCodeVerifierAndChallenge();

  const url = `${getBaseUri()}/auth/${getApplicationId()}`;
  const data = {
    cc: codeChallenge,
    "~token": token,
  };

  return new Promise((resolve, reject) => {
    sendRequest(url, "POST", data, { actionName: "set-new-password-request" })
      .then((response) => {
        if (!response || !response.data) {
          reject({
            msg: "No data resposne from server when sending set new password pre request.",
          });
        }

        if (response.data["~error"] && response.data["~error"].msg) {
          throw response.data;
        }

        if (!response.data["~thread"] || !response.data["~thread"].thid) {
          const message =
            "No thread information recieved from server when sending set new password pre request.";
          throw { msg: message };
        }

        setFPThreadId(response.data["~thread"].thid);
        setCv(codeVerifier);

        if (response.data["@type"] === "form") {
          resolve(response.data.fields);
        } else {
          reject({ ["~error"]: { msg: "Backend is not configured correctly." } });
        }
      })
      .catch((err) => {
        const message = "IKUISDK Failed with set new password pre-request.";
        console.error(message);
        reject(err);
      });
  });
};

/**
 * @typedef SuccessResponse
 * @property {string} type "@type"
 */

/**
 * @typedef ErrorObject
 * @property {string} code
 * @property {string} msg
 */

/**
 * @typedef ErrorResponse
 * @property {string} type "@type"
 * @property {ErrorObject} ~error
 */

/**
 *
 * @param {string} email
 * @param retry You do not need to worry about this parameter.
 * @returns {Promise<SuccessResponse | ErrorResponse>}
 */

const sendResetPasswordEmail = (email, retry = true) => {
  return forgotPasswordSetupRequest()
    .then(() => handleSendResetPasswordEmail(email))
    .catch((err) => {
      if (retry) {
        // This creates new thread id which might be missing. When going directly to forgot password without visiting login beforehand.
        return loginFormSetupRequest(window.IKSDK.config).then(() =>
          sendResetPasswordEmail(email, false),
        );
      } else {
        throw err;
      }
    });
};

/**
 * @typedef SuccessResponse
 * @property {string} token
 * @property {string} refresh_token
 * @property {string} token_type
 * @property {timestamp} expiration
 * @property {number} expires_in seconds
 */

/**
 * @typedef ErrorObject
 * @property {string} code
 * @property {string} msg
 */

/**
 * @typedef ErrorResponse
 * @property {string} type "@type"
 * @property {ErrorObject} ~error
 */

/**
 *
 * @param {string} referenceId
 * @param {string} newPassword
 * @returns {Promise<SuccessResponse | ErrorResponse>}
 */
const sendNewPassword = (referenceId, newPassword) => {
  return setNewPasswordSetupRequest(referenceId)
    .then(() => handleSendNewPassword(newPassword))
    .catch((err) => {
      throw err;
    });
};

module.exports = {
  handleSendNewPassword,
  handleSendResetPasswordEmail,
  forgotPasswordSetupRequest,
  setNewPasswordSetupRequest,
  sendResetPasswordEmail,
  sendNewPassword,
};
