const { getCv } = require("../storage");

// Locals
const IDSDKConfig = require("../config");
const { sendRequest } = require("../../utils/helpers");

const sendVerifierForLoginOrRegister = (callBackTHID) => {
  const codeVerifier = getCv();
  const url = `${IDSDKConfig.getBaseUri()}/auth/${IDSDKConfig.getApplicationId()}`;

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
