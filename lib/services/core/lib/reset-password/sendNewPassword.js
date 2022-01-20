const setNewPasswordSetupRequest = require("./setNewPasswordSetupRequest");
const handleSendNewPassword = require("./handleSendNewPassword");

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
 *
 * @param {string} referenceId
 * @param {string} newPassword
 * @returns {Promise<SuccessResponse | ErrorResponse>}
 */
const sendNewPassword = async (referenceId, newPassword) => {
  return setNewPasswordSetupRequest(referenceId)
    .then(() => handleSendNewPassword(newPassword))
    .catch((err) => {
      throw err;
    });
};

module.exports = sendNewPassword;
