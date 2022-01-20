const { getFPThreadId } = require("../storage");

// Locals
const { getApplicationId, getBaseUri } = require("../config");
const { sendRequest } = require("../../utils/helpers");

const sendNewPaswordRequest = (newPassword) => {
  const url = `${getBaseUri()}/auth/${getApplicationId()}`;
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

module.exports = sendNewPaswordRequest;
