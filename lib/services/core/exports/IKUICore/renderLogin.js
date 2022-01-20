const { skipIfLogged, loginSetup } = require("../../lib/login");
const loginUI = require("../../ui/login");
const throttleChecker = require("./throttleChecker");
const updateParentElement = require("./updateParentElement");

/**
 *  Renders login form.
 * @param {string} props.renderElementSelector Used for finding the container element where the form should be rendered in. For example "#registration-container-id"
 * @param {string} [props.labels.username]
 * @param {string} [props.labels.password]
 * @param {string} [props.labels.loginButton]
 * @param {string} [props.labels.registerButton]
 * @param {string} [props.labels.forgotPasswordButton]
 * @param {string} [props.labels.orOtherOptions]
 * @param {{ [optionId: string]: string; }} [props.loginApp]
 * @param {string} [props.redirectUri] In case you use OIDC providers you need to specify the callback redirect Uri
 * @param {string} [props.registrationPath="/registration"] Url where user will be redirect after clicking on register button.
 * @param {string} [props.forgotPasswordPath="/forgot/password"] Url where user will be redirect after clicking forgot password button.
 * @param {function} props.onRenderComponent Callback function through which you can use your own components.
 * @param {function} props.onSuccessLogin Callback function through which you can manage tokens if login is successful.
 */
const renderLogin = (props) => {
  throttleChecker("renderLogin");

  loginSetup(window.IKSDK.config)
    .then((response) => {
      if (skipIfLogged(response)) {
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
      updateParentElement({
        parent: renderElement,
        child: loginUI({
          context: response,
          labels: props.labels,
          loginApp: props.loginApp,
          redirectUri: props.redirectUri,
          onRenderComponent: props.onRenderComponent,
          onSuccessCallback: props.onSuccessLogin,
          oidc: false,
          forgotPasswordPath: props.forgotPasswordPath,
          registrationPath: props.registrationPath,
        }),
      });
    })
    .catch((err) => console.error(err));
};

module.exports = renderLogin;
