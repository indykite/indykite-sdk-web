const { getBaseAuthUrl } = require("../../lib/config");
const { sendRequest } = require("../../utils/helpers");
const storage = require("../../lib/storage");

const getCredentialCreationOptions = async ({ displayName, name, optionId }) => {
  const url = getBaseAuthUrl();
  const data = {
    "~thread": {
      thid: storage.getThreadId(),
    },
    "@type": "webauthn",
    "@id": optionId,
    op: "create",
    name,
    displayName,
  };
  const { data: response } = await sendRequest(url, "POST", data, {
    actionName: "webauthn-register-request",
  });
  return response;
};

module.exports = getCredentialCreationOptions;
