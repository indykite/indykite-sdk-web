const { loginFormSetupRequest } = require("../login");
const handleSendResetPasswordEmail = require("./handleSendResetPasswordEmail");
const forgotPasswordSetupRequest = require("./forgotPasswordSetupRequest");

/**
 * @typedef SuccessResponse
 * @property {string} type "@type"
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
 * @param {string} email
 * @param retry You do not need to worry about this parameter.
 * @returns {Promise<SuccessResponse | ErrorResponse>}
 */

const sendResetPasswordEmail = (email, retry = true) => {
  return forgotPasswordSetupRequest()
    .then(() => handleSendResetPasswordEmail(email))
    .catch((err) => {
      if (retry) {
        // This creates new thread id which might be missing. When going directly to forgot password without visiting login beforehand.
        return loginFormSetupRequest(window.IKSDK.config).then(() =>
          sendResetPasswordEmail(email, false),
        );
      } else {
        throw err;
      }
    });
};

module.exports = sendResetPasswordEmail;
