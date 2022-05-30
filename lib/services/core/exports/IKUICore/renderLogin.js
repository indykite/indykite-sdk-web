const render = require("./render");
const throttleChecker = require("./throttleChecker");

/**
 *  Renders login form.
 * @param {Object} props
 * @param {string} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 * @param {Object} props.labels
 * @param {string} [props.labels.username]
 * @param {string} [props.labels.password]
 * @param {string} [props.labels.loginButton]
 * @param {string} [props.labels.registerButton]
 * @param {string} [props.labels.forgotPasswordButton]
 * @param {{ [optionId: string]: string; }} [props.loginApp]
 * @param {string} [props.redirectUri] In case you use OIDC providers you need to specify the callback redirect URI
 * @param {string} [props.registrationPath="/registration"] Url where user will be redirect after clicking on register button.
 * @param {string} [props.forgotPasswordPath="/forgot/password"] URL where user will be redirect after clicking forgot password button.
 * @param {function} props.onRenderComponent Callback function through which you can use your own components.
 * @param {function} props.onSuccessLogin Callback function through which you can manage tokens if login is successful.
 * @param {function} [props.onLoginFail] Callback function which is called when login fails.
 */
const renderLogin = (props) => {
  throttleChecker("renderLogin");
  render({
    ...props,
    arguments: {
      flow: "customer",
    },
    registrationPath: props.registrationPath || "/registration",
    forgotPasswordPath: props.forgotPasswordPath || "/forgot/password",
  });
};

module.exports = renderLogin;
