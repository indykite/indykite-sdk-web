const storage = require("./storage");
const IDSDKConfig = require("./config");
const refresh = require("./refresh");
const { addAuthorizationTokenToHeaders, sendRequest } = require("../utils/helpers");

/**
 * Terminates the session of the current user.
 * @returns {Promise<boolean>}
 * @deprecated
 */
const logoutCurrentUser = async () => {
  return refresh
    .getValidAccessToken()
    .then(async (accessToken) => {
      const refreshToken = await storage.getRefreshToken();
      return terminateSession(accessToken, refreshToken);
    })
    .catch((err) => {
      console.error(err);
      return err;
    });
};

/**
 * Terminates the session of the last logged or selected user.
 * @param {string | undefined} userId The ID of the user you want to log out. If omitted then
 * the last logged user will be logged out.
 * @returns {Promise<boolean>}
 */
const logoutUser = async (userId) => {
  return refresh
    .getValidAccessToken({ userId })
    .then(async (accessToken) => {
      const refreshToken = await storage.getRefreshToken(userId);
      return terminateSession(accessToken, refreshToken, userId);
    })
    .catch((err) => {
      console.error(err);
      return err;
    });
};

/**
 * Terminates the session of all logged users.
 * @returns {Promise<{[userId: string]: boolean;}>}
 */
const logoutAllUsers = async () => {
  try {
    const userTokensById = await storage.getAllUserTokens();
    const userIds = Object.keys(userTokensById);
    const terminateSessionResults = {};
    for (let i = 0; i < userIds.length; ++i) {
      const { accessToken, refreshToken } = userTokensById[userIds[i]];
      try {
        terminateSessionResults[userIds[i]] = await terminateSession(
          accessToken,
          refreshToken,
          userIds[i],
        );
      } catch (err) {
        console.error(err);
      }
    }
    return terminateSessionResults;
  } catch (err) {
    console.error(err);
    return err;
  }
};

/**
 *
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {string | undefined} userId
 * @returns {Promise<boolean>}
 */
const terminateSession = async (accessToken, refreshToken, userId) => {
  const terminateUrl = `${IDSDKConfig.getBaseUri()}/identity/self-service/terminate-session`;
  const config = {
    headers: addAuthorizationTokenToHeaders(accessToken),
    actionName: "logout",
  };
  const data = {
    refreshToken: refreshToken,
  };

  return new Promise((resolve, reject) => {
    if (!accessToken || !refreshToken) {
      console.error(
        "Neither accessToken or refreshToken was found.",
        "IKUISDK Failed to refresh the session",
      );
      reject(new Error("Neither accessToken or refreshToken was found."));
      return;
    }

    sendRequest(terminateUrl, "POST", data, config)
      .then(async (response) => {
        // Session has been successfully terminated, let's wipe storage
        await storage.removeUserTokens(userId);
        resolve(true);
      })
      .catch(async (err) => {
        // Clear the local storage regardless of the result
        await storage.removeUserTokens(userId);
        console.error(
          err.name,
          "Failed to terminate session",
          err.response.status,
          err.response.data,
        );
        console.debug(err);
        reject(err);
      });
  });
};

module.exports = {
  logoutAllUsers,
  logoutCurrentUser,
  logoutUser,
};
