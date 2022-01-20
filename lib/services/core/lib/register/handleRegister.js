const { getLocalizedMessage } = require("../../lib/locale-provider");
const storage = require("../storage");
const {
  sendCredentialsForLoginOrRegister,
  sendVerifierForLoginOrRegister,
} = require("../common");
const { getElementIds } = require("../config");
const { cleanAllNotifications, cleanError, handleError } = require("../notifications");
const { getOidcFinalUrlWithLoginVerifier } = require("../../utils/helpers");

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

module.exports = handleRegister;
