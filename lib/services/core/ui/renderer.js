const { getLocalizedMessage } = require("../lib/locale-provider");
const { getNotificationsState } = require("../lib/notifications");
const { wrapUI } = require("./components/wrap");
const messageParser = require("./messageParser");
const messageParserNew = require("./messageParserNew");

const renderer = ({
  actionLabels,
  context,
  forgotPasswordPath,
  formContainerClassName,
  labels: customLabels,
  loginApp,
  loginPath,
  onFailCallback,
  onRenderComponent,
  onSuccessCallback,
  passwordInputNote,
  passwordCheckInputNote,
  redirectUri,
  registrationPath,
  termsAndAgreementHtmlString,
  userInputNote,
  validatePassword,

  useNewVersion,
}) => {
  const defaultLabels = {
    username: getLocalizedMessage("uisdk.general.username"),
    password: getLocalizedMessage("uisdk.general.password"),
    email: getLocalizedMessage("uisdk.general.email"),
    confirmPassword: getLocalizedMessage("uisdk.register.confirm_password"),
    registerButton: getLocalizedMessage("uisdk.register.register_button"),
    agreeAndRegisterButton: getLocalizedMessage("uisdk.register.agree_and_register_button"),
    loginLinkButton: getLocalizedMessage("uisdk.register.have_account_button"),
    loginButton: getLocalizedMessage("uisdk.login.login"),
    registerLinkButton: getLocalizedMessage("uisdk.login.register_button"),
    forgotPasswordButton: getLocalizedMessage("uisdk.login.forgot_password_button"),
    alreadyHaveAnAccountButton: getLocalizedMessage("uisdk.register.have_account_button"),
    forgottenPasswordSubmitButton: getLocalizedMessage("uisdk.forgotten_password.submit_button"),
    backToLogin: getLocalizedMessage("uisdk.forgotten_password.back_to_login_button"),
    newPassword: getLocalizedMessage("uisdk.new_password.password"),
    confirmNewPassword: getLocalizedMessage("uisdk.new_password.confirm_password"),
    setNewPasswordButton: getLocalizedMessage("uisdk.new_password.submit_button"),
  };

  const labels = {
    default: defaultLabels,
    custom: customLabels,
  };
  const notes = {
    user: userInputNote,
    password: passwordInputNote,
    passwordCheck: passwordCheckInputNote,
  };
  const paths = {
    login: loginPath,
    registration: registrationPath,
    forgotPassword: forgotPasswordPath,
  };

  const formContainer = document.createElement("div");
  formContainer.className = formContainerClassName;

  const parser = useNewVersion ? messageParserNew : messageParser;

  parser({
    actionLabels,
    context,
    htmlContainer: formContainer,
    labels,
    loginApp,
    notes,
    onFailCallback,
    onRenderComponent,
    onSuccessCallback,
    paths,
    redirectUri,
    termsAndAgreementHtmlString,
    validatePassword,
  });

  const notificationState = getNotificationsState();
  return wrapUI(formContainer, notificationState);
};

module.exports = renderer;
