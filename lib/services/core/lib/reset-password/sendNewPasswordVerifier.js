const { getCv } = require("../storage");

// Locals
const { getBaseAuthUrl } = require("../config");
const { sendRequest } = require("../../utils/helpers");

const sendNewPasswordVerifier = async (thid) => {
  const url = getBaseAuthUrl();
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
