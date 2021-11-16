const { getLocalizedMessage } = require("../lib/locale-provider");
const { wrapUI } = require("./components/wrap");
const messageParser = require("./messageParser");

const registerUI = ({
  context,
  labels: customLabels,
  loginPath = "/login",
  placeholders,
  redirectUri,
  onRenderComponent,
  onSuccessCallback,
  validatePassword,
  termsAngAgreementHtmlString,
  userInputNote,
  passwordInputNote,
  passwordCheckInputNote,
}) => {
  const defaultLabels = {
    username: getLocalizedMessage("uisdk.general.username"),
    password: getLocalizedMessage("uisdk.general.password"),
    confirmPassword: getLocalizedMessage("uisdk.register.confirm_password"),
    registerButton: getLocalizedMessage("uisdk.register.register_button"),
    agreeAndRegisterButton: getLocalizedMessage("uisdk.register.agree_and_register_button"),
    alreadyHaveAnAccountButton: getLocalizedMessage("uisdk.register.have_account_button"),
    orOtherOptions: getLocalizedMessage("uisdk.register.other_options"),
  };

  const labels = {
    default: defaultLabels,
    custom: customLabels,
  };
  const paths = {
    login: loginPath,
  };
  const notes = {
    user: userInputNote,
    password: passwordInputNote,
    passwordCheck: passwordCheckInputNote,
  };

  const registrationFormFrame = document.createElement("div");
  registrationFormFrame.className = "registration-form";
  messageParser({
    context,
    htmlContainer: registrationFormFrame,
    isRegistration: true,
    labels,
    notes,
    onRenderComponent,
    onSuccessCallback,
    paths,
    placeholders,
    redirectUri,
    termsAngAgreementHtmlString,
    validatePassword,
  });

  return wrapUI(registrationFormFrame);
};

module.exports = registerUI;
