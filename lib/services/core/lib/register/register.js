const { treatAsTypeLogical } = require("../../utils/helpers");
const handleRegister = require("./handleRegister");
const registrationFormSetupRequest = require("./registrationFormSetupRequest");

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
 * Registration handler expose the functionality which you can connect to your custom login UI.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<SuccessResponse | ErrorResponse>}
 */
const register = (email, password) => {
  return registrationFormSetupRequest(window.IKSDK.config).then((data) => {
    // In case of response @type 'form' we do not need to pass id
    const hasOptsField = treatAsTypeLogical(data);
    return handleRegister({
      id: hasOptsField ? data.opts.filter((o) => o["@type"] === "form")[0]["@id"] : undefined,
      emailValueParam: email,
      passwordValueParam: password,
    });
  });
};

module.exports = register;
