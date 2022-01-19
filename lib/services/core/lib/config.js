const { enUSLocale } = require("./../locale/en-US");

/***
 * Functions for getting the config.
 * This module should be mocked with Jest tests later on.
 */

/**
 * Returns base url for indykite auth platform
 * @returns {string|undefined}
 */
const getBaseUri = () => {
  const config = window.IKSDK && window.IKSDK.config;

  if (config) {
    return config.baseUri;
  } else {
    console.error(
      "[IKUISDK] Did not find baseUri in config. Library has not been initialized probably.",
    );
    return undefined;
  }
};

/**
 *
 * @returns {string|undefined}
 */
const getApplicationId = () => {
  const config = window.IKSDK && window.IKSDK.config;

  if (config) {
    // Legacy support for both terminologies
    return config.clientId || config.applicationId;
  } else {
    console.error(
      "[IKUISDK] Did not find applicationId in config. Library has not been initialized probably.",
    );
    return undefined;
  }
};

const getTenantId = () => {
  const config = window.IKSDK && window.IKSDK.config;

  if (config) {
    return config.tenantId;
  } else {
    console.error(
      "[IKUISDK] Did not find tenantId in config. Library has not been initialized probably.",
    );
    return undefined;
  }
};

const getLocaleConfig = () => {
  const config = window.IKSDK && window.IKSDK.config;
  if (config) {
    return config.localeConfig || enUSLocale;
  } else {
    console.error("[IKUISDK] Did not find config. Library has not been initialized probably.");
    return undefined;
  }
};

const getBaseAuthUrl = () => {
  return `${getBaseUri()}/auth/${getApplicationId()}`;
};

const getElementIds = () => ({
  inputEmail: "IKUISDK-username",
  inputPassword: "IKUISDK-password",
  inputConfirmPassword: "IKUISDK-confirm-password",
  submitLoginBtn: "IKUISDK-btn-login",
  submitRegisterBtn: "IKUISDK-btn-register",
  forgotPasswordBtn: "IKUISDK-btn-to-forgot-password",
  registrationBtn: "IKUISDK-btn-to-registration",
  loginBtn: "IKUISDK-btn-to-login",
  oidcBtnPrefix: "IKUISDK-btn-oidc-",
  resetPasswordEmail: "IKUISDK-reset-password-email",
  resetPasswordBtn: "IKUISDK-reset-password-email-btn",
  errorText: "IKUISDK-error-text",
  successText: "IKUISDK-success-text",
  container: "IKUISDK-content-container",
  forgottenPasswordContainer: "IKUISDK-forgotten-password-container",
  inputNewPassword: "IKUISDK-new-password",
  inputConfirmNewPassword: "IKUISDK-confirm-new-password",
  submitNewPasswordBtn: "IKUISDK-btn-new-password",
  newPasswordContainer: "IKUISDK-new-password-container",
  notificationContainer: "IKUISDK-notification-container",
  notificationText: "IKUISDK-notification-text",
});

const context = {
  thid: null,
  oidc: null,
  ...getElementIds(),
};

module.exports = {
  getApplicationId,
  getBaseUri,
  getElementIds,
  getTenantId,
  getBaseAuthUrl,
  getLocaleConfig,
  context,
};
