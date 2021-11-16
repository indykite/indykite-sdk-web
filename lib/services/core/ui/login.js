const { getLocalizedMessage } = require("../lib/locale-provider");

const { wrapUI } = require("./components/wrap");
const { getNotificationsState } = require("../lib/notifications");
const messageParser = require("./messageParser");

const getDefaultLabels = () => ({
  username: getLocalizedMessage("uisdk.general.username"),
  password: getLocalizedMessage("uisdk.general.password"),
  loginButton: getLocalizedMessage("uisdk.login.login"),
  registerButton: getLocalizedMessage("uisdk.login.register_button"),
  forgotPasswordButton: getLocalizedMessage("uisdk.login.forgot_password_button"),
  orOtherOptions: getLocalizedMessage("uisdk.login.other_options"),
});

const loginUI = ({
  context,
  labels: customLabels,
  placeholders,
  redirectUri,
  onRenderComponent,
  onSuccessCallback,
  registrationPath = "/registration",
  forgotPasswordPath = "/forgot/password",
}) => {
  const defaultLabels = getDefaultLabels();
  const loginFormFrame = document.createElement("div");

  const labels = {
    default: defaultLabels,
    custom: customLabels,
  };
  const paths = {
    registration: registrationPath,
    forgotPassword: forgotPasswordPath,
  };

  messageParser({
    context,
    htmlContainer: loginFormFrame,
    labels,
    onRenderComponent,
    onSuccessCallback,
    paths,
    placeholders,
    redirectUri,
  });

  const notificationState = getNotificationsState();
  return wrapUI(loginFormFrame, notificationState);
};

module.exports = loginUI;
