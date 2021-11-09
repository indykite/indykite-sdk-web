const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const CryptoJSCore = require("crypto-js/core");

const normalizeBase64 = (message) => {
  return message.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

/**
 *
 * @returns {{codeVerifier: string, codeChallenge: string}}
 */
const getCodeVerifierAndChallenge = () => {
  const nonce = CryptoJSCore.lib.WordArray.random(32);
  const codeVerifier = normalizeBase64(nonce.toString(encBase64));
  const codeChallenge = normalizeBase64(SHA256(nonce).toString(encBase64));

  return {
    codeVerifier,
    codeChallenge,
  };
};

module.exports = {
  getCodeVerifierAndChallenge,
  normalizeBase64,
};
