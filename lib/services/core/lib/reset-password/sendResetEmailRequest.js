const { getThreadId } = require("../storage");

// Locals
const { getBaseAuthUrl } = require("../config");
const { sendRequest } = require("../../utils/helpers");

const sendResetEmailRequest = (email) => {
  const url = getBaseAuthUrl();
  const data = {
    "~thread": {
      thid: getThreadId(),
    },
    "@type": "form",
    username: email,
  };

  return sendRequest(url, "POST", data, {
    actionName: "reset-email",
  });
};

module.exports = sendResetEmailRequest;
