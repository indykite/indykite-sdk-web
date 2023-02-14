const { getFPThreadId } = require("../storage");

// Locals
const { getBaseAuthUrl } = require("../config");
const { sendRequest } = require("../../utils/helpers");

const sendNewPasswordRequest = (newPassword) => {
  const url = getBaseAuthUrl();
  const data = {
    "~thread": {
      thid: getFPThreadId(),
    },
    "@type": "form",
    password: newPassword,
    // username??
  };

  return sendRequest(url, "POST", data, {
    actionName: "new-password-request",
  });
};

module.exports = sendNewPasswordRequest;
