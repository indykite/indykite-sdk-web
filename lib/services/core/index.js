const { setOidcOriginalParams } = require("./lib/storage");
const queryString = require("query-string");
const { logoutCurrentUser, logoutUser, logoutAllUsers } = require("./lib/logout");
const { getValidAccessToken } = require("./lib/refresh");
const {
  login,
  initOidcAuthorizationRequest,
  isAuthenticated,
  skipIfLogged,
  loginSetup,
  oidcSetup,
  oidcCallback,
  singleOidcSetup,
} = require("./lib/login");
const { registrationFormSetupRequest, register } = require("./lib/register");
const {
  forgotPasswordSetupRequest,
  setNewPasswordSetupRequest,
  sendResetPasswordEmail,
  sendNewPassword,
} = require("./lib/reset-password");
// UI
const forgotPasswordUI = require("./ui/forgot-password");
const loginUI = require("./ui/login");
const registerUI = require("./ui/register");
const newPasswordUI = require("./ui/new-password");
const newPasswordErrorUI = require("./ui/new-password-error");
const { getLocalizedMessage } = require("./lib/locale-provider");

/**
 * Initializes the IKUI SDK, needs to be called before using other functions.
 * @param {string} config.tenantId
 * @param {string} config.applicationId Used to be called ClientID
 * @param {string} config.baseUri
 * @param {Object} config.localeConfig
 */
const IKUIInit = (config) => {
  console.log("[IKUISDK] Init");
  window.IKSDK = { ...window.IKSDK };
  const oldConfig = window.IKSDK && window.IKSDK.config;
  window.IKSDK.config = { ...oldConfig, ...config };
};

let throttleTimer = {};
const throttleMs = 300;

/**
 * All the render functions initialize the flow with setup network requests. Calling them multiple times might cause
 * in rare cases unwanted side-effects / errors.
 *
 * @param {string} functionName
 * @returns {boolean}
 */
const throttleChecker = (functionName) => {
  if (throttleTimer[functionName]) {
    const lastCallMs = Date.now() - throttleTimer[functionName];
    if (lastCallMs < throttleMs) {
      console.warn(
        `[IDUISDK] Function ${functionName} has been called twice in the past ${lastCallMs} ms. ` +
          `There is most likely double render of components in your app. This is incorrect usage and might cause issues. ` +
          `See documentation for more information.`,
      );
    } else {
      throttleTimer[functionName] = Date.now();
    }
  } else {
    throttleTimer[functionName] = Date.now();
  }
};

/**
 * Helper function to prevent from displaying components multiple times in case of rerenders for example.
 * @param {HTMLElement} parent
 * @param {HTMLElement} child
 */
const updateParentElement = ({ parent, child }) => {
  while (parent && parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }

  parent.appendChild(child);
};

/**
 *  Renders login form.
 * @param {string} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 * @param {string} [props.labels.username]
 * @param {string} [props.labels.password]
 * @param {string} [props.labels.loginButton]
 * @param {string} [props.labels.registerButton]
 * @param {string} [props.labels.forgotPasswordButton]
 * @param {string} [props.labels.orOtherOptions]
 * @param {string} [props.placeholders.username]
 * @param {string} [props.placeholders.password]
 * @param {string} [props.redirectUri] In case you use OIDC providers you need to specify the callback redirect Uri
 * @param {string} [props.registrationPath="/registration"] Url where user will be redirect after clicking on register button.
 * @param {string} [props.forgotPasswordPath="/forgot/password"] Url where user will be redirect after clicking forgot password button.
 * @param {function} props.onRenderComponent Callback function through which you can use your own components.
 * @param {function} props.onSuccessLogin Callback function through which you can manage tokens if login is successful.
 */
const renderLogin = (props) => {
  throttleChecker("renderLogin");

  loginSetup(window.IKSDK.config)
    .then((response) => {
      skipIfLogged(response);
      const renderElement = document.querySelector(props.renderElementSelector);
      if (!renderElement) {
        if (!props.renderElementSelector)
          return console.error("You have not provided any renderElementSelector prop!");
        return console.error(
          `Cannot find any element by provided renderElementSelector prop: ${props.renderElementSelector}`,
        );
      }
      updateParentElement({
        parent: renderElement,
        child: loginUI({
          context: response,
          labels: props.labels,
          placeholders: props.placeholders,
          redirectUri: props.redirectUri,
          onRenderComponent: props.onRenderComponent,
          onSuccessCallback: props.onSuccessLogin,
          oidc: false,
          forgotPasswordPath: props.forgotPasswordPath,
          registrationPath: props.registrationPath,
        }),
      });
    })
    .catch((err) => console.error(err));
};

/**
 * Renders registration form.
 * @param {string} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 * @param {string} [props.labels.username]
 * @param {string} [props.labels.password]
 * @param {string} [props.labels.confirmPassword]
 * @param {string} [props.labels.registerButton]
 * @param {string} [props.labels.alreadyHaveAnAccountButton]
 * @param {string} [props.labels.orOtherOptions]
 * @param {string} [props.placeholders.username]
 * @param {string} [props.placeholders.password]
 * @param {string} [props.placeholders.confirmPassword]
 * @param {string} [props.redirectUri] In case you are using OIDC providers with option to register.
 * @param {function} props.onRenderComponent Callback function through which you can use your own components.
 * @param {function} props.onSuccessRegistration Callback function through which you can manage tokens if registration is successful.
 * @param {function} props.validatePassword Additional front-end password validator
 * @param {HTMLString} props.termsAgreementSectionContent Optional element to be displayed under submit button.
 * @param {HTMLString} props.userInputNote Add a note under the user input field. This configuration is temporary only and will be removed in the future!
 * @param {HTMLString} props.passwordInputNote Add a note under the password input field. This configuration is temporary only and will be removed in the future!
 * @param {HTMLString} props.passwordCheckInputNote Add a note under the password check input field. This configuration is temporary only and will be removed in the future!
 */
const renderRegister = (props) => {
  throttleChecker("renderRegister");

  registrationFormSetupRequest(window.IKSDK.config)
    .then((response) => {
      const renderElement = document.querySelector(props.renderElementSelector);
      if (!renderElement) {
        if (!props.renderElementSelector)
          return console.error("You have not provided any renderElementSelector prop!");
        return console.error(
          `Cannot find any element by provided renderElementSelector prop: ${props.renderElementSelector}`,
        );
      }
      updateParentElement({
        parent: renderElement,
        child: registerUI({
          context: response,
          labels: props.labels,
          placeholders: props.placeholders,
          redirectUri: props.redirectUri,
          onRenderComponent: props.onRenderComponent,
          onSuccessCallback: props.onSuccessRegistration,
          validatePassword: props.validatePassword,
          termsAngAgreementHtmlString: props.termsAgreementSectionContent,
          userInputNote: props.userInputNote,
          passwordInputNote: props.passwordInputNote,
          passwordCheckInputNote: props.passwordCheckInputNote,
        }),
      });
    })
    .catch((err) => console.error(err));
};

/**
 * Renders input where you enter your email address to which reset password link should be sent.
 * @param {string} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 * @param {string} [props.labels.username]
 * @param {string} [props.labels.submitButton]
 * @param {string} [props.labels.backToLogin]
 * @param {string} [props.loginPath="/login"] Url to redirect when user clicks on go back to login
 * @param {string} [props.placeholders.username]
 * @param {string} retry This parameter is set automatically when needed. Do not use it by your self.
 */
const renderForgotPasswordForm = (props, retry = true) => {
  throttleChecker("renderForgotPasswordForm");

  forgotPasswordSetupRequest()
    .then((fields) => {
      const renderElement = document.querySelector(props.renderElementSelector);
      if (!renderElement) {
        if (!props.renderElementSelector)
          return console.error("You have not provided any renderElementSelector prop!");
        return console.error(
          `Cannot find any element by provided renderElementSelector prop: ${props.renderElementSelector}`,
        );
      }
      updateParentElement({
        parent: renderElement,
        child: forgotPasswordUI({
          fields,
          labels: props.labels,
          loginPath: props.loginPath,
          placeholders: props.placeholders,
        }),
      });
    })
    .catch((err) => {
      if (retry) {
        loginSetup(window.IKSDK.config).then(() => renderForgotPasswordForm(props, false));

        return;
      }
      const renderElement = document.querySelector(props.renderElementSelector);
      if (!renderElement) {
        if (!props.renderElementSelector)
          return console.error("You have not provided any renderElementSelector prop!");
        return console.error(
          `Cannot find any element by provided renderElementSelector prop: ${props.renderElementSelector}`,
        );
      }
      renderElement.innerHTML = newPasswordErrorUI(err);
      console.error(err);
    });
};

/**
 * Renders form for entering your new password.
 * @param {string} props.token Reference id token received from your auth service.
 * @param {string} [props.labels.newPassword]
 * @param {string} [props.labels.confirmNewPassword]
 * @param {string} [props.labels.submitButton]
 * @param {string} [props.placeholders.newPassword]
 * @param {string} [props.placeholders.confirmNewPassword]
 * @param {function} props.validatePassword Additional front-end password validator
 * @param {string} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 */
const renderSetNewPasswordForm = (props) => {
  throttleChecker("renderSetNewPasswordForm");

  setNewPasswordSetupRequest(props.token)
    .then(() => {
      const renderElement = document.querySelector(props.renderElementSelector);
      if (!renderElement) {
        if (!props.renderElementSelector)
          return console.error("You have not provided any renderElementSelector prop!");
        return console.error(
          `Cannot find any element by provided renderElementSelector prop: ${props.renderElementSelector}`,
        );
      }
      updateParentElement({
        parent: renderElement,
        child: newPasswordUI({
          labels: props.labels,
          placeholders: props.placeholders,
          validatePassword: props.validatePassword,
        }),
      });
    })
    .catch((err) => {
      const renderElement = document.querySelector(props.renderElementSelector);
      if (!renderElement) {
        if (!props.renderElementSelector)
          return console.error("You have not provided any renderElementSelector prop!");
        return console.error(
          `Cannot find any element by provided renderElementSelector prop: ${props.renderElementSelector}`,
        );
      }

      const errorMessage =
        (err["~error"] && err["~error"].msg) || getLocalizedMessage("uisdk.general.error");
      renderElement.innerHTML = newPasswordErrorUI(errorMessage);
      console.error(err);
    });
};

/**
 * This function should be called after user is redirected to the login application. The SDK extracts the login
 * challenge from url and other params and keeps.
 */
const handleOidcOriginalParamsAndRedirect = () => {
  const parsedQuery = queryString.parse(window.location.search);

  setOidcOriginalParams(parsedQuery);
  window.location.pathname = "/login";
};

// I used this only for testing. Probably won't be needed. Unless third party applications want to use this SDK too.
const handleOauth2Callback = () => {
  return queryString.parse(window.location.search);
};

const IKUICore = {
  renderLogin,
  renderRegister,
  renderForgotPasswordForm,
  renderSetNewPasswordForm,
};

const IKUIUserAPI = {
  isAuthenticated,
  logoutCurrentUser,
  logoutUser,
  logoutAllUsers,
  login,
  getValidAccessToken,
  register,
  sendResetPasswordEmail,
  sendNewPassword,
  loginSetup,
  registerSetup: registrationFormSetupRequest,
};

const IKUIOidc = {
  initOidcAuthorizationRequest,
  handleOidcOriginalParamsAndRedirect,
  handleOauth2Callback,
  oidcCallback,
  oidcSetup,
  singleOidcSetup,
};

module.exports = {
  IKUIInit,
  IKUICore,
  IKUIOidc,
  IKUIUserAPI,
};
