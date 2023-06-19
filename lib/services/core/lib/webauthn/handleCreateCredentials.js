const modalDialog = require("../../ui/components/dialogs");
const { base64ToArrayBuffer, arrayBufferToBase64, sendRequest } = require("../../utils/helpers");
const { getBaseAuthUrl } = require("../config");
const storage = require("../storage");

const getUsernames = async (username, displayName) => {
  const askForUsername = username === "[ASK]";
  const askForDisplayName = displayName === "[ASK]";

  if (askForUsername || askForDisplayName) {
    username = "";
    displayName = "";
    const usernameId = `IKUISDK-modal-username`;
    const displayNameId = `IKUISDK-modal-displayName`;
    while ((askForUsername && !username) || (askForDisplayName && !displayName)) {
      const requests = [];
      if (askForUsername) {
        requests.push({
          type: "input",
          label: "Enter your username",
          id: usernameId,
          value: username,
        });
      }
      if (askForDisplayName) {
        requests.push({
          type: "input",
          label: "Enter your display name",
          id: displayNameId,
          value: displayName,
        });
      }
      const values = await modalDialog([
        ...requests,
        {
          type: "submit",
          label: "Confirm",
        },
      ]);
      username = values[usernameId] || "";
      displayName = values[displayNameId] || "";
    }
  }

  return { username, displayName };
};

const createCredentials = async (publicKey) => {
  const { username, displayName } = await getUsernames(
    publicKey.user.name,
    publicKey.user.displayName,
  );

  const objectWithBuffers = {
    ...publicKey,
    challenge: base64ToArrayBuffer(publicKey.challenge),
    user: {
      ...publicKey.user,
      name: username,
      id: base64ToArrayBuffer(publicKey.user.id),
      displayName: displayName || username,
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

const handleCreateCredentials = async (publicKey, id) => {
  const url = getBaseAuthUrl();
  const publicKeyCreds = await createCredentials(publicKey);
  const request = {
    "~thread": {
      thid: storage.getThreadId(),
    },
    "@type": "webauthn",
    publicKeyCredential: publicKeyCreds,
  };
  if (id) {
    request["@id"] = id;
  }
  return sendRequest(url, "POST", request, {
    actionName: "webauthn-create",
  });
};

module.exports = handleCreateCredentials;
