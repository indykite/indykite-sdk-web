const { getLocalizedMessage } = require("../lib/locale-provider");
const { wrapUI } = require("./components/wrap");
const { getElementIds } = require("../lib/config");
const { navButtonUI, primaryButtonUI } = require("./components/buttons");
const { inputWithLabel } = require("./components/inputs");
const { divider } = require("./components/divider");
const { handleSendResetPasswordEmail } = require("../lib/reset-password");

const { loginBtn, resetPasswordEmail, resetPasswordBtn } = getElementIds();

const forgotPasswordUI = ({ fields, labels, placeholders, loginPath = "/login" }) => {
  const defaultLabels = {
    username: getLocalizedMessage("uisdk.general.email"),
    submitButton: getLocalizedMessage("uisdk.forgotten_password.submit_button"),
    backToLogin: getLocalizedMessage("uisdk.forgotten_password.back_to_login_button"),
  };

  const container = document.createElement("div");

  const forgottenPasswordForm = document.createElement("form");
  forgottenPasswordForm.className = "forgotten-password-form";

  fields.map((field, index) => {
    const { label, input } = inputWithLabel({
      type: "email",
      id: resetPasswordEmail,
      labelText: (labels && labels.username) || defaultLabels.username,
      placeholder: placeholders && placeholders.username,
      autofocus: !!index === 0,
    });

    forgottenPasswordForm.appendChild(label);
    forgottenPasswordForm.appendChild(input);
  });

  const submitBtn = primaryButtonUI({
    id: resetPasswordBtn,
    onClick: (e) => {
      e.preventDefault();
      handleSendResetPasswordEmail(null);
    },
    label: (labels && labels.submitButton) || defaultLabels.submitButton,
  });

  forgottenPasswordForm.appendChild(submitBtn);

  const hr = divider();
  forgottenPasswordForm.appendChild(hr);

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
