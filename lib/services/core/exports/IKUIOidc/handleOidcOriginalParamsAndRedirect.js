const { setOidcOriginalParams } = require("../../lib/storage");
const queryString = require("query-string");

/**
 * This function should be called after user is redirected to the login application. The SDK extracts the login
 * challenge from url and other params and keeps.
 */
const handleOidcOriginalParamsAndRedirect = () => {
  const parsedQuery = queryString.parse(window.location.search);

  setOidcOriginalParams(parsedQuery);
  window.location.pathname = "/login";
};

module.exports = handleOidcOriginalParamsAndRedirect;
