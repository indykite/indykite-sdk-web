const storage = require("./storage");
const { getBaseAuthUrl } = require("./config");
const { cleanError } = require("./notifications");
const { sendRequest } = require("../utils/helpers");

const handleAction = async ({ id, action, timeout }) => {
  cleanError();

  const threadId = storage.getThreadId();
  if (!threadId) {
    throw new Error("Thread ID not found.");
  }

  const request = {
    "~thread": {
      thid: threadId,
    },
    "@type": "action",
    action,
  };

  if (id) {
    request["@id"] = id;
  }

  const response = await sendRequest(getBaseAuthUrl(), "POST", request, {
    actionName: "action-handle",
    timeout,
  });
  if (!response.data) {
    throw new Error("Response contains no data");
  }

  if (!response.data["~thread"] || !response.data["~thread"].thid) {
    throw new Error("Response contains no thread data");
  }

  storage.setThreadId(response.data["~thread"].thid);

  return response.data;
};

module.exports = handleAction;
