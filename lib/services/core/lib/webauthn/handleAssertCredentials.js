const { base64ToArrayBuffer, arrayBufferToBase64, sendRequest } = require("../../utils/helpers");
const { getBaseAuthUrl } = require("../config");
const storage = require("../storage");

const assertCredentials = async (publicKey) => {
  const objectWithBuffers = {
    ...publicKey,
    challenge: base64ToArrayBuffer(publicKey.challenge),
  };
  if (Array.isArray(publicKey.allowCredentials)) {
    objectWithBuffers.allowCredentials = publicKey.allowCredentials.map(({ id, ...rest }) => ({
      ...rest,
      id: base64ToArrayBuffer(id),
    }));
  }

  try {
    const creds = await navigator.credentials.get({ publicKey: objectWithBuffers });
    return {
      authenticatorAttachment: creds.authenticatorAttachment,
      id: creds.id,
      rawId: arrayBufferToBase64(creds.rawId),
      response: {
        authenticatorData: arrayBufferToBase64(creds.response.authenticatorData),
        clientDataJSON: arrayBufferToBase64(creds.response.clientDataJSON),
        signature: arrayBufferToBase64(creds.response.signature),
        userHandle: arrayBufferToBase64(creds.response.userHandle),
      },
      type: creds.type,
    };
  } catch (err) {
    const isAbortError = /operation either timed out or was not allowed/.test(err.message);
    if (isAbortError) {
      throw new Error("The operation either timed out or was aborted.");
    }
  }
};

const handleAssertCredentials = async (publicKey) => {
  const url = getBaseAuthUrl();
  const publicKeyCreds = await assertCredentials(publicKey);
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
      actionName: "webauthn-assert",
    },
  );
};

module.exports = handleAssertCredentials;
