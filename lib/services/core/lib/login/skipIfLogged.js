const storage = require("../storage");
const { getOidcFinalUrlWithLoginVerifier } = require("../../utils/helpers");

const skipIfLogged = (data) => {
  if (data && data["@type"] === "success" && data.verifier) {
    const originalParams = storage.getOidcOriginalParams();
    storage.clearOidcData();
    if (originalParams) {
      window.location = getOidcFinalUrlWithLoginVerifier(originalParams, data.verifier);
    }
    return true;
  }

  return false;
};

module.exports = skipIfLogged;
