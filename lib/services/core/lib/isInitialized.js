/**
 * @param {string | undefined} userId
 * @returns {Promise<boolean>}
 */
const isInitialized = () => {
  return typeof window.IKSDK !== "undefined";
};

module.exports = isInitialized;
