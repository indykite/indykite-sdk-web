const storage = require("../../lib/storage");
const { sendVerifierForLoginOrRegister } = require("../../lib/common");
const { cleanAllNotifications } = require("../../lib/notifications");
const { getThreadId } = require("../../lib/storage");
const { getOidcFinalUrlWithLoginVerifier } = require("../../utils/helpers");

/**
 * @param {{
 *   context: {
 *     "@id": string;
 *     style: string;
 *     label?: string;
 *     msg?: string;
 *     "~ui"?: string;
 *     extensions?: Object;
 *   };
 *   htmlContainer: HTMLElement;
 * }} arguments
 */
const verifier = async ({ onSuccessCallback } = {}) => {
  const originalParams = storage.getOidcOriginalParams(); // If there is data we are in oidc flow
  const thid = getThreadId();
  const response = await sendVerifierForLoginOrRegister(thid);

  if (!response.data || response.data["@type"] !== "success") {
    throw response.data;
  }

  cleanAllNotifications();

  if (originalParams) {
    storage.clearOidcData();
    window.location = getOidcFinalUrlWithLoginVerifier(originalParams, response.data.verifier);
    return;
  } else {
    await storage.storeOnLoginSuccess(response.data);
  }

  // Callback hooks when using built-in UI
  if (onSuccessCallback) {
    onSuccessCallback(response.data);
  } else if (window.IKSDK && typeof window.IKSDK.registeredCallback === "function") {
    window.IKSDK.registeredCallback(response.data);
  }

  return response.data;
};

module.exports = verifier;
