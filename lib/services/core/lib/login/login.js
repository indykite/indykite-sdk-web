const { treatAsTypeLogical } = require("../../utils/helpers");
const handleLogin = require("./handleLogin");
const loginSetup = require("./loginSetup");

/**
 * @typedef SuccessResponse
 * @property {string} token
 * @property {string} refresh_token
 * @property {string} token_type
 * @property {timestamp} expiration
 * @property {number} expires_in seconds
 */

/**
 * @typedef ErrorObject
 * @property {string} code
 * @property {string} msg
 */

/**
 * @typedef ErrorResponse
 * @property {string} type "@type"
 * @property {ErrorObject} ~error
 */

/**
 * Login handler expose the functionality which you can connect to your custom login UI.
 * @param {string} email
 * @param {string} password
 * @param {object} setupData Result of the function loginSetup
 * @returns {Promise<SuccessResponse | ErrorResponse>}
 */
const login = async (email, password, setupData = null) => {
  if (setupData && typeof setupData === "object") {
    const data = setupData;
    const hasOptsField = treatAsTypeLogical(data);
    return handleLogin({
      id: hasOptsField ? data.opts.filter((o) => o["@type"] === "form")[0]["@id"] : undefined,
      emailValueParam: email,
      passwordValueParam: password,
    });
  } else {
    const data = await loginSetup(window.IKSDK.config);
    return login(email, password, data);
  }
};

module.exports = login;
