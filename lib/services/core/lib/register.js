const { getLocalizedMessage } = require("../lib/locale-provider");
const storage = require("./storage");
const {
  setupRequest,
  sendCredentialsForLoginOrRegister,
  sendVerifierForLoginOrRegister,
} = require("./common");
const { getElementIds } = require("./config");
const { cleanAllNotifications, cleanError, handleError } = require("./notifications");
const { flowTypes } = require("../constants");
const { treatAsTypeLogical, getOidcFinalUrlWithLoginVerifier } = require("../utils/helpers");

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
 * Registration handler expose the functionality which you can connect to your custom login UI.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<SuccessResponse | ErrorResponse>}
 */
const register = (email, password) => {
  return registrationFormSetupRequest(window.IKSDK.config)
    .then((data) => {
      // In case of response @type 'form' we do not need to pass id
      const hasOptsField = treatAsTypeLogical(data);
      return handleRegister({
        id: hasOptsField ? data.opts.filter((o) => o["@type"] === "form")[0]["@id"] : undefined,
        emailValueParam: email,
        passwordValueParam: password,
      });
    })
    .catch((err) => {
      throw err;
    });
};

const handleRegister = async ({ id, onSuccessCallback, emailValueParam, passwordValueParam }) => {
  cleanError();
  const originalParams = storage.getOidcOriginalParams(); // If there is data we are in oidc flow
  const valuesFromParameters = emailValueParam !== null || passwordValueParam !== null;

  const {
    inputEmail: inputEmailId,
    inputPassword: inputPasswordId,
    inputConfirmPassword: inputConfirmPasswordId,
  } = getElementIds();
  const inputEmail = document.querySelector(`#${inputEmailId}`);
  const inputPassword = document.querySelector(`#${inputPasswordId}`);
  const inputRePassword = document.querySelector(`#${inputConfirmPasswordId}`);

  if (
    !valuesFromParameters &&
    inputPassword &&
    inputRePassword &&
    inputPassword.value !== inputRePassword.value
  ) {
    const message = getLocalizedMessage("uisd.register.password_confirmation_failed");
    return handleError({ msg: message });
  }

  try {
    // Sending credentials
    const response = await sendCredentialsForLoginOrRegister({
      emailValueParam: valuesFromParameters ? emailValueParam : inputEmail.value,
      passwordValueParam: valuesFromParameters ? passwordValueParam : inputPassword.value,
      id,
    });

    console.log("RESP FROM CREDENTIALS");
    console.log(response);
    if (!response || !response.data) {
      throw "Oops something went wrong when sending credentials to the indentity provider server.";
    }

    if (response.data["~error"]) {
      throw response.data;
    }

    // Verifier
    const callBackTHID = response.data["~thread"] && response.data["~thread"].thid;
    const secondResponse = await sendVerifierForLoginOrRegister(callBackTHID);

    // TODO: Does this ever work?
    if (secondResponse.data["~error"]) {
      throw secondResponse.data;
    }

    await storage.storeOnLoginSuccess(secondResponse.data);
    cleanAllNotifications();

    if (originalParams) {
      storage.clearOidcData();

      window.location = getOidcFinalUrlWithLoginVerifier(originalParams, response.data.verifier);
      return;
    }

    // Callback hooks when using built-in UI
    if (onSuccessCallback) {
      onSuccessCallback(secondResponse.data);
    } else if (window.IKSDK.registeredCallback) {
      window.IKSDK.registeredCallback(secondResponse.data);
    }

    return secondResponse.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Initiates authentication flow. And returns setupData object.
 * @param config
 * @returns {Promise<setupObject>}
 */
const registrationFormSetupRequest = (config) => setupRequest(config, flowTypes.register);

module.exports = {
  handleRegister,
  register,
  registrationFormSetupRequest,
};
