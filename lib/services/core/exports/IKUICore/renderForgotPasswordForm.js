const { loginSetup } = require("../../lib/login");
const { forgotPasswordSetupRequest } = require("../../lib/reset-password");
const forgotPasswordUI = require("../../ui/forgot-password");
const newPasswordErrorUI = require("../../ui/new-password-error");
const throttleChecker = require("./throttleChecker");
const updateParentElement = require("./updateParentElement");

/**
 * Renders input where you enter your email address to which reset password link should be sent.
 * @param {string} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 * @param {string} [props.labels.username]
 * @param {string} [props.labels.submitButton]
 * @param {string} [props.labels.backToLogin]
 * @param {string} [props.loginPath="/login"] Url to redirect when user clicks on go back to login
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
        child: forgotPasswordUI({ fields, labels: props.labels, loginPath: props.loginPath }),
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

module.exports = renderForgotPasswordForm;
