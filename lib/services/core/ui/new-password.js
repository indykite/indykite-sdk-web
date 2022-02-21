const { getLocalizedMessage } = require("../lib/locale-provider");
const { wrapUI } = require("./components/wrap");
const { inputWithLabel } = require("./components/inputs");
const { primaryButtonUI } = require("./components/buttons");
const { handleSendNewPassword } = require("../lib/reset-password");
const { getElementIds } = require("../lib/config");

const elementIds = getElementIds();

const newPasswordUI = ({ labels, validatePassword }) => {
  const defaultLabels = {
    newPassword: getLocalizedMessage("uisdk.new_password.password"),
    confirmNewPassword: getLocalizedMessage("uisdk.new_password.confirm_password"),
    submitButton: getLocalizedMessage("uisdk.new_password.submit_button"),
  };

  const newPasswordContainer = document.createElement("div");
  newPasswordContainer.id = elementIds.newPasswordContainer;

  const passwordContainer = document.createElement("div");
  passwordContainer.className = "form-group";
  const { label: passwrdLabel, input: passwrdInput } = inputWithLabel({
    type: "password",
    id: elementIds.inputNewPassword,
    labelText: (labels && labels.newPassword) || defaultLabels.newPassword,
    autofocus: true,
  });
  passwordContainer.appendChild(passwrdLabel);
  passwordContainer.appendChild(passwrdInput);

  const passwordConfirmContainer = document.createElement("div");
  passwordConfirmContainer.className = "form-group";
  const { label: passwrdConfirmLabel, input: passwrdConfirmInput } = inputWithLabel({
    type: "password",
    id: elementIds.inputConfirmNewPassword,
    labelText: (labels && labels.confirmNewPassword) || defaultLabels.confirmNewPassword,
  });
  passwordConfirmContainer.appendChild(passwrdConfirmLabel);
  passwordConfirmContainer.appendChild(passwrdConfirmInput);

  const submitBtn = primaryButtonUI({
    id: elementIds.submitNewPasswordBtn,
    onClick: (e) => {
      e.preventDefault();
      // check if property validatePassword exists and is a function
      if (typeof validatePassword === "function") {
        if (validatePassword(passwrdConfirmInput.value) !== true) {
          //abort if validatePassword not returns true
          // IndyRiot doesn't want to have errors
          // handleError({
          //   label: "uisdk.general.password_validation",
          // });
          return;
        }
      }
      handleSendNewPassword(null).catch((err) => {
        // The error is already printed in the console so there's no need to do anything more.
      });
    },
    label: (labels && labels.submitButton) || defaultLabels.submitButton,
  });

  newPasswordContainer.appendChild(passwordContainer);
  newPasswordContainer.appendChild(passwordConfirmContainer);
  newPasswordContainer.appendChild(submitBtn);

  return wrapUI(newPasswordContainer);
};

module.exports = newPasswordUI;
