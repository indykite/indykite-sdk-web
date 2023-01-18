const { base64ToArrayBuffer, arrayBufferToBase64, sendRequest } = require("../../utils/helpers");
const { getBaseAuthUrl } = require("../config");
const storage = require("../storage");

const createCredentials = async (publicKey) => {
  const objectWithBuffers = {
    ...(publicKey || {}),
    challenge: base64ToArrayBuffer(publicKey.challenge),
    user: {
      ...publicKey.user,
      id: base64ToArrayBuffer(publicKey.user.id),
      displayName: publicKey.user.displayName || publicKey.user.name,
    },
  };

  const creds = await navigator.credentials.create({ publicKey: objectWithBuffers });
  return {
    authenticatorAttachment: creds.authenticatorAttachment,
    id: creds.id,
    rawId: arrayBufferToBase64(creds.rawId),
    response: {
      attestationObject: arrayBufferToBase64(creds.response.attestationObject),
      clientDataJSON: arrayBufferToBase64(creds.response.clientDataJSON),
    },
    type: creds.type,
  };
};

const handleCreateCredentials = async (publicKey) => {
  const url = getBaseAuthUrl();
  const publicKeyCreds = await createCredentials(publicKey);
  return sendRequest(
    url,
    "POST",
    {
      "~thread": {
        thid: storage.getThreadId(),
      },
      "@type": "webauthn",
      publicKeyCredential: publicKeyCreds,
    },
    {
      actionName: "webauthn-create",
    },
  );
};

module.exports = handleCreateCredentials;
