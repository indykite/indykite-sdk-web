const { setCv, setFPThreadId } = require("../storage");
const { getCodeVerifierAndChallenge } = require("../../utils/crypto");

// Locals
const { getBaseAuthUrl } = require("../config");
const { sendRequest } = require("../../utils/helpers");

/**
 * Fetches what fields for inserting new password should be rendered and updates the thread id in client storage.
 * @param token
 * @returns {Promise<unknown>}
 */
const setNewPasswordSetupRequest = (token) => {
  if (!token) throw { msg: "Reference id token not provided." };

  // This is completely new flow, we can generate new CV and CC
  const { codeVerifier, codeChallenge } = getCodeVerifierAndChallenge();

  const url = getBaseAuthUrl();
  const data = {
    cc: codeChallenge,
    "~token": token,
  };

  return new Promise((resolve, reject) => {
    sendRequest(url, "POST", data, { actionName: "set-new-password-request" })
      .then((response) => {
        if (!response || !response.data) {
          reject({
            msg: "No data resposne from server when sending set new password pre request.",
          });
          return;
        }

        if (response.data["~error"] && response.data["~error"].msg) {
          throw response.data;
        }

        if (!response.data["~thread"] || !response.data["~thread"].thid) {
          const message =
            "No thread information recieved from server when sending set new password pre request.";
          throw { msg: message };
        }

        setFPThreadId(response.data["~thread"].thid);
        setCv(codeVerifier);

        if (response.data["@type"] === "form") {
          resolve(response.data.fields);
        } else {
          reject({ ["~error"]: { msg: "Backend is not configured correctly." } });
        }
      })
      .catch((err) => {
        const message = "IKUISDK Failed with set new password pre-request.";
        console.error(message);
        reject(err);
      });
  });
};

module.exports = setNewPasswordSetupRequest;
