const storage = require("../storage");

/**
 * @param {string | undefined} userId
 * @returns {Promise<boolean>}
 */
const isAuthenticated = async (userId) => {
  const { accessToken } = await storage.getTokens(userId);
  return !!accessToken;
};

module.exports = isAuthenticated;
