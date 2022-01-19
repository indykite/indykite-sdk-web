const queryString = require("query-string");
const isConfigMissingField = require("./isConfigMissingField");

/**
 * This would be used by third party application which wants to have possibility to authenticate its users
 * against other identity provider server. Through the params you can config the initial redirecting query
 * respecting official oauth2 protocol. You have to make sure the server will cooperate with your application.
 * @param {string} oauth2Host
 * @param {string} queryParams.login_app
 * @param {string} queryParams.redirect_uri
 * @param {string} queryParams.response_type OAuth 2.0 Response Type value that determines the authorization
 * processing flow to be used, including what parameters are returned from the endpoints used. When using the Authorization Code Flow, this value is code.
 * @param {string} queryParams.client_id OAuth 2.0 Client Identifier valid at the Authorization Server.
 * @param {string} queryParams.state Opaque value used to maintain state between the request and the callback. Typically, Cross-Site Request Forgery (CSRF, XSRF) mitigation is done by cryptographically binding the value of this parameter with a browser cookie.
 * @param {string} queryParams.scope
 * @param {string} queryParams.nonce
 * @returns {string | void} Returns name of missing config if any.
 */
const initOidcAuthorizationRequest = (oauth2Host, queryParams) => {
  const missingField = isConfigMissingField(queryParams);
  if (missingField) {
    return `Your config is not complete. Please provide ${missingField} base on documentation.`;
  }

  const queryParamsStringified = queryString.stringify(queryParams);

  window.location = `${oauth2Host}/o/oauth2/auth?${queryParamsStringified}`;
};

module.exports = initOidcAuthorizationRequest;
