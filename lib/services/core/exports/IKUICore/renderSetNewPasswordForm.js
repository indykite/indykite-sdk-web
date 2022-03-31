const { setNewPasswordSetupRequest } = require("../../lib/reset-password");
const newPasswordUI = require("../../ui/new-password");
const newPasswordErrorUI = require("../../ui/new-password-error");
const { getLocalizedMessage } = require("../../lib/locale-provider");
const throttleChecker = require("./throttleChecker");
const updateParentElement = require("./updateParentElement");

/**
 * Renders form for entering your new password.
 * @param {object} props
 * @param {string} props.token Reference id token received from your auth service.
 * @param {object} [props.labels]
 * @param {string} [props.labels.newPassword]
 * @param {string} [props.labels.confirmNewPassword]
 * @param {string} [props.labels.submitButton]
 * @param {function} props.validatePassword Additional front-end password validator
 * @param {string} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 */
const renderSetNewPasswordForm = (props) => {
  throttleChecker("renderSetNewPasswordForm");

  return setNewPasswordSetupRequest(props.token)
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
        child: newPasswordUI({
          labels: props.labels,
          validatePassword: props.validatePassword,
          fields,
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

module.exports = renderSetNewPasswordForm;
