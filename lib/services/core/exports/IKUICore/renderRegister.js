const { registrationFormSetupRequest } = require("../../lib/register");
const registerUI = require("../../ui/register");
const throttleChecker = require("./throttleChecker");
const updateParentElement = require("./updateParentElement");

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

  registrationFormSetupRequest(window.IKSDK.config)
    .then((response) => {
      const renderElement = document.querySelector(props.renderElementSelector);
      if (!renderElement) {
        if (!props.renderElementSelector) {
          throw new Error("You have not provided any renderElementSelector prop!");
        }

        throw new Error(
          `Cannot find any element by provided renderElementSelector prop: ${props.renderElementSelector}`,
        );
      }
      updateParentElement({
        parent: renderElement,
        child: registerUI({
          context: response,
          labels: props.labels,
          loginApp: props.loginApp,
          redirectUri: props.redirectUri,
          onFailCallback: props.onRegistrationFail,
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
    .catch((err) => {
      console.error(err);
      if (props.onRegistrationFail) {
        props.onRegistrationFail(err);
      }
    });
};

module.exports = renderRegister;
