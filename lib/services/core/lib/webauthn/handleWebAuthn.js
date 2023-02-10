const Utils = require("../../utils/helpers");
const { sendVerifierForLoginOrRegister } = require("../common");
const { setNotification, cleanAllNotifications } = require("../notifications");
const storage = require("../storage");
const handleAssertCredentials = require("./handleAssertCredentials");
const handleCreateCredentials = require("./handleCreateCredentials");

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

const handleWebAuthn = async ({ publicKey, onFailCallback, onSuccessCallback }) => {
  try {
    let response;
    if (Utils.isAssertWebauthnRequest(publicKey)) {
      response = await handleAssertCredentials(publicKey);
    } else {
      response = await handleCreateCredentials(publicKey);
    }

    const processedMessage = await processVerifierMessage(response.data);
    onSuccessCallback(processedMessage);
  } catch (err) {
    onFailCallback(err);
    setNotification(err.message, "error");
  }
};

module.exports = handleWebAuthn;
