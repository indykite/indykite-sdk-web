const queryString = require("query-string").default;
const { initOidcAuthorizationRequest, oidcCallback } = require("../../lib/login");
const oidcSetup = require("../../lib/login/oidcSetup");
const singleOidcSetup = require("../../lib/login/singleOidcSetup");
const handleOidcOriginalParamsAndRedirect = require("./handleOidcOriginalParamsAndRedirect");
const handleOauth2Callback = require("./handleOauth2Callback");

const IKUIOidc = {
  initOidcAuthorizationRequest,
  handleOidcOriginalParamsAndRedirect,
  handleOauth2Callback,
  oidcCallback,
  oidcSetup,
  singleOidcSetup,
};

module.exports = IKUIOidc;
