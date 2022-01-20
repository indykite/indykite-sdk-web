const { getCv } = require("../storage");

// Locals
const { getApplicationId, getBaseUri } = require("../config");
const { sendRequest } = require("../../utils/helpers");

const sendNewPasswordVerifier = async (thid) => {
  const url = `${getBaseUri()}/auth/${getApplicationId()}`;
  const data = {
    "~thread": {
      thid: thid,
    },
    "@type": "verifier",
    cv: getCv(),
  };

  return sendRequest(url, "POST", data, {
    actionName: "new-password-verifier",
  });
};

module.exports = sendNewPasswordVerifier;
