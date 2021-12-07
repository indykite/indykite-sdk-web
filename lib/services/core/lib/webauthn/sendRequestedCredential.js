const { getBaseAuthUrl } = require("../../lib/config");
const { sendRequest } = require("../../utils/helpers");

const sendRequestedCredential = async ({ publicKeyCredential, threadId }) => {
  const url = getBaseAuthUrl();
  const data = {
    "~thread": {
      thid: threadId,
    },
    "@type": "webauthn",
    publicKeyCredential,
  };
  const { data: response } = await sendRequest(url, "POST", data, {
    actionName: "webauthn-assert-credential",
  });
  return response;
};

module.exports = sendRequestedCredential;
