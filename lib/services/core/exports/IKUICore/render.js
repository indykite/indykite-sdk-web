const { setupRequest } = require("../../lib/common");
const { skipIfLogged } = require("../../lib/login");
const renderer = require("../../ui/renderer");
const throttleChecker = require("./throttleChecker");
const updateParentElement = require("./updateParentElement");
const storage = require("../../lib/storage");

/**
 *  Renders screen according to the authentication flow.
 * @param {Parameters<typeof render>[0]} props
 * @param {HTMLElement} renderElement
 * @param {unknown} response
 */
const refreshUiScreen = (props, renderElement, response) => {
  storage.pushResponse(response);
  updateParentElement({
    parent: renderElement,
    child: renderer({
      context: response,
      forgotPasswordPath: props.forgotPasswordPath,
      labels: props.labels,
      loginApp: props.loginApp,
      loginPath: props.loginPath,
      redirectUri: props.redirectUri,
      onFailCallback: props.onFail,
      onRenderComponent: props.onRenderComponent,
      onSuccessCallback: (...args) => {
        const [newResponse] = args;
        if (newResponse["@type"] !== "success") {
          refreshUiScreen(props, renderElement, newResponse);
          return;
        }

        storage.clearResponses();
        props.onSuccess(...args);
      },
      passwordCheckInputNote: props.passwordCheckInputNote,
      passwordInputNote: props.passwordInputNote,
      registrationPath: props.registrationPath,
      termsAndAgreementHtmlString: props.termsAgreementSectionContent,
      userInputNote: props.userInputNote,
      validatePassword: props.validatePassword,
      formContainerClassName: "ui-container",
    }),
  });
};

/**
 *  Renders screen according to the authentication flow.
 * @param {Object} props
 * @param {Record<string, string>} props.arguments In case you want to set some custom arguments to the first request
 * @param {string} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 * @param {Object} props.labels
 * @param {string} [props.labels.username]
 * @param {string} [props.labels.password]
 * @param {string} [props.labels.loginButton]
 * @param {string} [props.labels.registerButton]
 * @param {string} [props.labels.forgotPasswordButton]
 * @param {string} [props.labels.confirmPassword]
 * @param {string} [props.labels.alreadyHaveAnAccountButton]
 * @param {{ [optionId: string]: string; }} [props.loginApp]
 * @param {string} [props.redirectUri] In case you use OIDC providers you need to specify the callback redirect Uri
 * @param {string} [props.registrationPath="/registration"] Url where user will be redirected after clicking on register button.
 * @param {string} [props.loginPath="/login"] Url where user will be redirected after clicking on login button.
 * @param {string} [props.forgotPasswordPath="/forgot/password"] Url where user will be redirected after clicking forgot password button.
 * @param {function} props.onRenderComponent Callback function through which you can use your own components.
 * @param {function} [props.onSuccessLogin] Callback function through which you can manage tokens if login is successful.
 * @param {function} [props.onLoginFail] Callback function which is called when login fails.
 * @param {function} [props.onRegistrationFail] Callback function which is called when registration fails.
 * @param {function} [props.onSuccessRegistration] Callback function through which you can manage tokens if registration is successful.
 * @param {function} [props.onSuccess] Callback function through which you can manage tokens if authentication flow finished successfully.
 * @param {function} [props.onFail] Callback function which is called when authentication flow fails.
 * @param {function} [props.validatePassword] Additional front-end password validator
 * @param {HTMLString} [props.termsAgreementSectionContent] Optional element to be displayed under submit button.
 * @param {HTMLString} [props.userInputNote] Add a note under the user input field. This configuration is temporary only and will be removed in the future!
 * @param {HTMLString} [props.passwordInputNote] Add a note under the password input field. This configuration is temporary only and will be removed in the future!
 * @param {HTMLString} [props.passwordCheckInputNote] Add a note under the password check input field. This configuration is temporary only and will be removed in the future!
 * @param {string} [props.token] You can use this property in case you have either email verification or invitation token.
 */
const render = (props) => {
  throttleChecker("render");

  const propsWithCompatibility = {
    ...props,
    onSuccess: (...args) => {
      if (props.onSuccess) {
        props.onSuccess(...args);
      }

      // TODO: Compatibility function calls below, remove later
      if (props.onSuccessLogin) {
        props.onSuccessLogin(...args);
      }
      if (props.onSuccessRegistration) {
        props.onSuccessRegistration(...args);
      }
    },
    onFail: (...args) => {
      if (props.onFail) {
        props.onFail(...args);
      }

      // TODO: Compatibility function calls below, remove later
      if (props.onLoginFail) {
        props.onLoginFail(...args);
      }
      if (props.onRegistrationFail) {
        props.onRegistrationFail(...args);
      }
    },
  };

  return setupRequest(
    Object.assign({ token: props.token || props.otpToken }, window.IKSDK.config, {
      args: props.arguments || {},
    }),
  )
    .then((response) => {
      if (skipIfLogged(response)) {
        return;
      }

      const renderElement = document.querySelector(props.renderElementSelector);
      if (!renderElement) {
        if (!props.renderElementSelector) {
          throw new Error("You have not provided any renderElementSelector prop!");
        }
        throw new Error(
          `Cannot find any element by provided renderElementSelector prop: ${props.renderElementSelector}`,
        );
      }

      storage.clearResponses();
      refreshUiScreen(propsWithCompatibility, renderElement, response);
    })
    .catch((err) => {
      console.error(err);
      propsWithCompatibility.onFail(err);
    });
};

module.exports = render;
