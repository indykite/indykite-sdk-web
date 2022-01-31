let throttleTimer = {};
const throttleMs = 300;

/**
 * All the render functions initialize the flow with setup network requests. Calling them multiple times might cause
 * in rare cases unwanted side-effects / errors.
 *
 * @param {string} functionName
 * @returns {boolean}
 */
const throttleChecker = (functionName) => {
  if (throttleTimer[functionName]) {
    const lastCallMs = Date.now() - throttleTimer[functionName];
    if (lastCallMs < throttleMs) {
      console.warn(
        `[IDUISDK] Function ${functionName} has been called twice in the past ${lastCallMs} ms. ` +
          `There is most likely double render of components in your app. This is incorrect usage and might cause issues. ` +
          `See documentation for more information.`,
      );
    } else {
      throttleTimer[functionName] = Date.now();
    }
  } else {
    throttleTimer[functionName] = Date.now();
  }
};

module.exports = throttleChecker;
