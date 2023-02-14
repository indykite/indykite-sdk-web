const {
  getThreadId,
  setThreadId,
  getPendingResponse,
  setPendingResponse,
} = require("../storage");

// Locals
const { getBaseAuthUrl } = require("../config");
const { sendRequest } = require("../../utils/helpers");

/**
 * Setups form for entering email to which following instructions will be sent
 * @returns {Promise<unknown>}
 */
const forgotPasswordSetupRequest = async () => {
  const url = getBaseAuthUrl();

  // This is required when we got a response on a different endpoint and now we need to continue in the flow.
  const pendingResponse = getPendingResponse();
  const pendingResponseObject = pendingResponse && { data: pendingResponse };
  if (pendingResponse) {
    setPendingResponse(null);
  }

  const data = {
    "~thread": {
      thid: getThreadId(),
    },
    "@type": "action",
    "@id": sessionStorage.getItem("@indykite/actionsId"),
    action: "forgotten",
  };

  let response;
  try {
    response =
      pendingResponseObject ||
      (await sendRequest(url, "POST", data, { actionName: "forgot-password-request" }));
  } catch (err) {
    console.error(err.name, `IKUISDK Failed with forgot password flow step 1 pre-request.`);
    console.debug(err);
    throw err;
  }

  if (!response || !response.data) {
    throw new Error("No data response from server when getting forgotten password input step 1.");
  }

  if (!response.data["~thread"] || !response.data["~thread"].thid) {
    throw new Error(
      "No thread information recieved from server on forgot password set up request. " +
        "Please go back to login and try again.",
    ); // TODO: Come up with better message
  }

  setThreadId(response.data["~thread"].thid);

  if (response.data["@type"] === "form") {
    return response.data.fields;
  } else {
    throw new Error("IKUISDK Received incorrect data type.");
  }
};

module.exports = forgotPasswordSetupRequest;
