const { sendRequest } = require("../../utils/helpers");
const { sendVerifierForLoginOrRegister } = require("../common");
const { getBaseAuthUrl } = require("../config");
const { setNotification, cleanAllNotifications } = require("../notifications");
const storage = require("../storage");

const processVerifierMessage = async (message) => {
  if (message["@type"] !== "verifier") return message;
  const secondResponse = await sendVerifierForLoginOrRegister(storage.getThreadId());

  if (secondResponse.data["~error"]) {
    throw new Error(secondResponse.data["~error"]);
  }

  await storage.storeOnLoginSuccess(secondResponse.data);
  cleanAllNotifications();

  return secondResponse.data;
};

const handleWebAuthnCreateOp = async ({ id, onFailCallback, onSuccessCallback }) => {
  try {
    const url = getBaseAuthUrl();
    const request = {
      "~thread": {
        thid: storage.getThreadId(),
      },
      "@type": "webauthn",
      op: "create",
    };
    if (id) {
      request["@id"] = id;
    }
    const response = await sendRequest(url, "POST", request, {
      actionName: "webauthn-create-op",
    });

    const threadId = response.data?.["~thread"] && response.data?.["~thread"]?.thid;
    if (threadId) {
      storage.setThreadId(threadId);
    }

    const processedMessage = await processVerifierMessage(response.data);
    onSuccessCallback(processedMessage);
  } catch (err) {
    onFailCallback(err);
    setNotification(err.message, "error");
  }
};

module.exports = handleWebAuthnCreateOp;
