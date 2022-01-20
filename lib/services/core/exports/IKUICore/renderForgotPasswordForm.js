const { loginSetup } = require("../../lib/login");
const { forgotPasswordSetupRequest } = require("../../lib/reset-password");
const forgotPasswordUI = require("../../ui/forgot-password");
const newPasswordErrorUI = require("../../ui/new-password-error");
const throttleChecker = require("./throttleChecker");
const updateParentElement = require("./updateParentElement");

const renderForgotPasswordFormWithRetry = async (props, retry = true) => {
  throttleChecker("renderForgotPasswordForm");

  return forgotPasswordSetupRequest()
    .then((fields) => {
      const renderElement = document.querySelector(props.renderElementSelector);
      if (!renderElement) {
        if (!props.renderElementSelector) {
          console.error("You have not provided any renderElementSelector prop!");
          return;
        }
        console.error(
          `Cannot find any element by provided renderElementSelector prop: ${props.renderElementSelector}`,
        );
        return;
      }
      updateParentElement({
        parent: renderElement,
        child: forgotPasswordUI({ fields, labels: props.labels, loginPath: props.loginPath }),
      });
    })
    .catch((err) => {
      if (retry) {
        return loginSetup(window.IKSDK.config).then(() =>
          renderForgotPasswordFormWithRetry(props, false),
        );
      }
      const renderElement = document.querySelector(props.renderElementSelector);
      if (!renderElement) {
        if (!props.renderElementSelector) {
          console.error("You have not provided any renderElementSelector prop!");
          return;
        }
        console.error(
          `Cannot find any element by provided renderElementSelector prop: ${props.renderElementSelector}`,
        );
        return;
      }
      renderElement.innerHTML = newPasswordErrorUI(err);
      console.error(err);
    });
};

/**
 * Renders input where you enter your email address to which reset password link should be sent.
 * @param {Object} props
 * @param {() => void} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 * @param {Object} [props.labels]
 * @param {string} [props.labels.username]
 * @param {string} [props.labels.submitButton]
 * @param {string} [props.labels.backToLogin]
 * @param {string} [props.loginPath="/login"] Url to redirect when user clicks on go back to login
 */
const renderForgotPasswordForm = async (props) => {
  return renderForgotPasswordFormWithRetry(props);
};

module.exports = renderForgotPasswordForm;
