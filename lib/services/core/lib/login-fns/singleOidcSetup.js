const storage = require("../storage");

/**
 * Call this function with data of type oidc returned by IKUIUserAPI.loginSetup()
 * @param {string} data.url Url of the Login application.
 * @param {string} data.thread.thid data["~thread"].thid Thread id.
 */
 const singleOidcSetup = (data) => {
  // TODO: How to call this better?
  if (!data || typeof data !== "object") {
    throw "No data object provided.";
  }

  if (!data.url) {
    throw "No url to redirect.";
  }

  if (!data["~thread"] || !data["~thread"].thid) {
    throw "No thread id returned from the server.";
  }

  storage.setThreadId(data["~thread"].thid);

  window.location = data.url;
};

module.exports = singleOidcSetup;
