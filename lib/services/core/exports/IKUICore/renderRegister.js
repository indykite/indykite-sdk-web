const throttleChecker = require("./throttleChecker");
const render = require("./render");

/**
 * Renders registration form.
 * @param {object} props
 * @param {string} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 * @param {object} props.labels
 * @param {string} [props.labels.username]
 * @param {string} [props.labels.password]
 * @param {string} [props.labels.confirmPassword]
 * @param {string} [props.labels.registerButton]
 * @param {string} [props.labels.alreadyHaveAnAccountButton]
 * @param {string} [props.labels.orOtherOptions]
 * @param {{ [optionId: string]: string; }} [props.loginApp]
 * @param {string} [props.redirectUri] In case you are using OIDC providers with option to register.
 * @param {string} [props.loginPath="/login"] Url where user will be redirect after clicking on login button.
 * @param {function} [props.onRegistrationFail] Callback function which is called when registration fails.
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
  render({
    ...props,
    loginPath: props.loginPath || "/login",
    arguments: {
      flow: "register",
    },
  });
};

module.exports = renderRegister;
