const { sendRequest } = require("../../utils/helpers");
const { sendVerifierForLoginOrRegister } = require("../common");
const { getBaseAuthUrl } = require("../config");
const { setNotification, cleanAllNotifications } = require("../notifications");
const storage = require("../storage");

const processVerifierMessage = async (message) => {
  if (message["@type"] !== "verifier") return message;

  const callBackTHID = message["~thread"] && message["~thread"].thid;
  const secondResponse = await sendVerifierForLoginOrRegister(callBackTHID);

  if (secondResponse.data["~error"]) {
    throw new Error(secondResponse.data["~error"]);
  }

  await storage.storeOnLoginSuccess(secondResponse.data);
  cleanAllNotifications();

  return secondResponse.data;
};

const handleWebAuthnCreateOp = async ({ onFailCallback, onSuccessCallback }) => {
  try {
    const url = getBaseAuthUrl();
    const response = await sendRequest(
      url,
      "POST",
      {
        "~thread": {
          thid: storage.getThreadId(),
        },
        "@type": "webauthn",
        op: "create",
      },
      {
        actionName: "webauthn-create-op",
      },
    );

    const processedMessage = await processVerifierMessage(response.data);
    onSuccessCallback(processedMessage);
  } catch (err) {
    onFailCallback(err);
    setNotification(err.message, "error");
  }
};

module.exports = handleWebAuthnCreateOp;
