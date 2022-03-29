const { getThreadId } = require("../storage");

// Locals
const { getApplicationId, getBaseUri } = require("../config");
const { sendRequest } = require("../../utils/helpers");

const sendResetEmailRequest = (email) => {
  const url = `${getBaseUri()}/auth/${getApplicationId()}`;
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
