const handleLogin = require("./handleLogin");
const isAuthenticated = require("./isAuthenticated");
const login = require("./login");
const loginSetup = require("./loginSetup");
const initOidcAuthorizationRequest = require("./initOidcAuthorizationRequest");
const skipIfLogged = require("./skipIfLogged");
const oidcCallback = require("./oidcCallback");

module.exports = {
  handleLogin,
  isAuthenticated,
  login,
  loginFormSetupRequest: loginSetup,
  initOidcAuthorizationRequest,
  skipIfLogged,
  loginSetup,
  oidcCallback,
};
