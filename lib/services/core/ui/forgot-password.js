const { getLocalizedMessage } = require("../lib/locale-provider");
const { wrapUI } = require("./components/wrap");
const { getElementIds } = require("../lib/config");
const { navButtonUI, primaryButtonUI } = require("./components/buttons");
const { inputWithLabel } = require("./components/inputs");
const { handleSendResetPasswordEmail } = require("../lib/reset-password");

const { loginBtn, resetPasswordEmail, resetPasswordBtn } = getElementIds();

const forgotPasswordUI = ({ fields, labels, loginPath = "/login" }) => {
  const defaultLabels = {
    username: getLocalizedMessage("uisdk.general.email"),
    submitButton: getLocalizedMessage("uisdk.forgotten_password.submit_button"),
    backToLogin: getLocalizedMessage("uisdk.forgotten_password.back_to_login_button"),
  };

  const container = document.createElement("div");

  const forgottenPasswordForm = document.createElement("form");
  forgottenPasswordForm.className = "forgotten-password-form";

  const usernameLabel = (labels && labels.username) || defaultLabels.username;
  fields.forEach((field) => {
    const { label, input } = inputWithLabel({
      type: field["@id"] === "username" ? "email" : "text",
      id: field["@id"] === "username" ? resetPasswordEmail : field["@id"],
      labelText: field["@id"] === "username" ? usernameLabel : field["@id"],
      autofocus: true,
      context: field,
    });

    forgottenPasswordForm.appendChild(label);
    forgottenPasswordForm.appendChild(input);
  });

  const submitBtn = primaryButtonUI({
    id: resetPasswordBtn,
    onClick: (e) => {
      e.preventDefault();
      handleSendResetPasswordEmail(null).catch((err) => {
        // The error is already printed in the console so there's no need to do anything more.
      });
    },
    label: (labels && labels.submitButton) || defaultLabels.submitButton,
  });

  forgottenPasswordForm.appendChild(submitBtn);

  const goBackToLoginBtn = navButtonUI({
    href: loginPath,
    label: (labels && labels.backToLogin) || defaultLabels.backToLogin,
    id: loginBtn,
  });
  forgottenPasswordForm.appendChild(goBackToLoginBtn);
  container.appendChild(forgottenPasswordForm);

  return wrapUI(container);
};

module.exports = forgotPasswordUI;
