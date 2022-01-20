const { getThreadId, setFPThreadId } = require("../storage");

// Locals
const { getApplicationId, getBaseUri } = require("../config");
const { sendRequest } = require("../../utils/helpers");

/**
 * Setups form for entering email to which following instructions will be sent
 * @returns {Promise<unknown>}
 */
const forgotPasswordSetupRequest = () => {
  const url = `${getBaseUri()}/auth/${getApplicationId()}`;
  const data = {
    "~thread": {
      thid: getThreadId(),
    },
    "@type": "action",
    "@id": sessionStorage.getItem("@indykite/actionsId"),
    action: "forgotten",
  };

  return new Promise((resolve, reject) => {
    sendRequest(url, "POST", data, { actionName: "forgot-password-request" })
      .then((response) => {
        if (!response || !response.data) {
          reject("No data resposne from server when getting forgotten password input step 1.");
        }

        if (!response.data["~thread"] || !response.data["~thread"].thid) {
          reject(`No thread information recieved from server on forgot password set up request.
           Please go back to login and try again.`); // TODO: Come up with better message
        }

        setFPThreadId(response.data["~thread"].thid);

        if (response.data["@type"] === "form") resolve(response.data.fields);
      })
      .catch((err) => {
        console.error(err.name, `IKUISDK Failed with forgot password flow step 1 pre-request.`);
        console.debug(err);
        reject(err);
      });
  });
};

module.exports = forgotPasswordSetupRequest;
