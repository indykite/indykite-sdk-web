/**
 * API for getting the access token
 */
const IDSDKConfig = require("./config");
const storage = require("./storage");
const {
  isTokenExpired,
  addAuthorizationTokenToHeaders,
  sendRequest,
} = require("./../utils/helpers");
const { getCodeVerifierAndChallenge } = require("./../utils/crypto");

/**
 * We don't want to allow to send multiple refresh token requests so after the first one is sent,
 * then the response waiting promise will be saved in this variable. Later sent requests which are
 * sent before the response from server is returned will return only this saved promise so no new
 * request is sent. After the response from the server is returned then this variable is reset back
 * to `null` and a new request to the server may be created.
 */
let refreshTokenPromise = null;

/**
 * Get's the valid access token. Checks if refresh token is passed and for the expiration time and does refresh
 * in case it's necessary. The promise can also be rejected in case it's not possible
 * to refresh the token. In that case, data are wiped and YOUR app should react in a way
 * that user has been logged out.
 *
 * @param {{
 *   refreshTokenParam?: string;
 *   userId?: string;
 * }} options
 * @param {string} options.refreshTokenParam Optional parameter which if passed, valid and different than the
 * one stored in sdk, there will be new access token generated and returned.
 *
 * @param {string} options.userId Optional parameter which allows you to specify what user access token you want to get.
 * If this parameter is omitted, then the access token of the last logged user is returned.
 *
 * @returns {Promise<string>}
 */
const getValidAccessToken = async (options = {}) => {
  const { refreshTokenParam, userId } = options;
  const refreshThreshold = 300; // 5 minutes
  const {
    accessToken,
    expirationTime,
    refreshToken: refreshTokenCurrent,
  } = await storage.getTokens(userId);

  return new Promise((resolve, reject) => {
    if (!refreshTokenParam && !refreshTokenCurrent) {
      console.warn("No refreshToken was found.", "IKUISDK Failed to refresh the session");
      reject(new Error("No refreshToken was found."));
      return;
    }

    const useRefreshTokenParam = Boolean(
      refreshTokenParam && refreshTokenCurrent !== refreshTokenParam,
    );

    if (
      useRefreshTokenParam || // If refresh token is passed as param and its different the refresh token stored in
      // storage.
      isTokenExpired(expirationTime, refreshThreshold)
    ) {
      // If current access_token is expired.
      const refreshToken = refreshTokenParam || refreshTokenCurrent;
      const { codeChallenge } = getCodeVerifierAndChallenge();

      refreshAccessToken(refreshToken, codeChallenge, useRefreshTokenParam)
        .then((newAccessToken) => {
          resolve(newAccessToken);
        })
        .catch(async (err) => {
          // We failed to refresh the token, the user should be logged out, let's clear all data
          await storage.removeUserTokens(userId);
          reject(err);
        });
    } else {
      // We are OK, we can return the stored accessToken
      resolve(accessToken);
    }
  });
};

/**
 * Generate new access token from refresh token. New access token is automatically saved to the storage.
 *
 * @param {string?} refreshToken Optional parameter which if passed, will be sent to the server. If not passed,
 * refresh token stored in the sdk will be used.
 * @param {string?} codeChallenge Optional parameter which if passed, will be sent to the server. If not passed,
 * one will be generated and used.
 * @param {boolean?} [omitAuthorizationHeaders] Optional parameter which if set to false, will include the
 * authorization headers in the sent request. Is set to True by default.
 * @returns {Promise<string | object>}
 */
const refreshAccessToken = async (
  refreshToken,
  codeChallenge,
  omitAuthorizationHeaders = true,
) => {
  if (refreshTokenPromise) {
    console.warn(
      "Multiple refresh token requests detected. You should not create a new request until you get a server response to the previous one.",
    );
    return refreshTokenPromise;
  }

  if (!refreshToken) {
    refreshToken = (await storage.getTokens()).refreshToken;
  }
  if (!codeChallenge) {
    codeChallenge = getCodeVerifierAndChallenge().codeChallenge;
  }

  const newRefreshTokenPromise = new Promise((resolve, reject) => {
    if (!refreshToken) {
      console.warn("No refreshToken was found.", "IKUISDK Failed to refresh the session");
      reject(new Error("No refreshToken was found."));
      return;
    }
    const url = `${IDSDKConfig.getBaseAuthUrl()}`;
    storage.getTokens().then(({ accessToken: currentAccessToken }) => {
      const data = {
        cc: codeChallenge,
        "~token": refreshToken,
      };

      // Avoid including auth headers if refreshToken is passed as param and differs from whats stored in the SDK as
      // refresh token.
      const config =
        !omitAuthorizationHeaders && currentAccessToken
          ? {
              headers: addAuthorizationTokenToHeaders(currentAccessToken),
            }
          : undefined;

      sendRequest(
        url,
        "POST",
        data,
        Object.assign(
          {
            actionName: "refresh-token",
          },
          config,
        ),
      )
        .then(async (response) => {
          refreshTokenPromise = null;
          if (response.data && response.data["@type"] === "success") {
            await storage.setTokens(
              response.data.sub,
              response.data.token,
              refreshToken,
              response.data.expiration_time,
            );

            resolve(response.data.token);
          } else {
            console.error("IKUISDK Failed to refresh the session", response.data);
            console.log(response);
            reject(response.data);
          }
        })
        .catch((err) => {
          // This can happen when the refresh token has been de-authorized from other place
          refreshTokenPromise = null;
          console.error(
            err.name,
            "IKUISDK Failed to refresh the session",
            err.response && err.response.status,
            err.response && err.response.data,
          );
          console.debug(err);
          reject(err);
        });
    });
  });

  refreshTokenPromise = newRefreshTokenPromise;

  return newRefreshTokenPromise;
};

module.exports = {
  getValidAccessToken,
  refreshAccessToken,
};
