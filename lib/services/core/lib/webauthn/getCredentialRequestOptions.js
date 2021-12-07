const { getBaseAuthUrl } = require("../../lib/config");
const { sendRequest } = require("../../utils/helpers");
const storage = require("../../lib/storage");

const getCredentialRequestOptions = async ({ name, optionId }) => {
  const url = getBaseAuthUrl();
  const data = {
    "~thread": {
      thid: storage.getThreadId(),
    },
    "@type": "webauthn",
    "@id": optionId,
    op: "assert",
    name,
  };
  const { data: response } = await sendRequest(url, "POST", data, {
    actionName: "webauthn-assert-request",
  });
  return response;
};

module.exports = getCredentialRequestOptions;
