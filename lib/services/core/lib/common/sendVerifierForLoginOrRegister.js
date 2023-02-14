const { getCv } = require("../storage");

// Locals
const IDSDKConfig = require("../config");
const { sendRequest } = require("../../utils/helpers");

/**
 * @param {string} callBackTHID
 * @returns
 */
const sendVerifierForLoginOrRegister = (callBackTHID) => {
  const codeVerifier = getCv();
  const url = IDSDKConfig.getBaseAuthUrl();

  return sendRequest(
    url,
    "POST",
    {
      "~thread": {
        thid: callBackTHID,
      },
      "@type": "verifier",
      cv: codeVerifier,
    },
    {
      actionName: "send-verifier",
    },
  );
};

module.exports = sendVerifierForLoginOrRegister;
