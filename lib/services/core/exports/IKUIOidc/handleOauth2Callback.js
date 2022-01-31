const queryString = require("query-string");

// I used this only for testing. Probably won't be needed. Unless third party applications want to use this SDK too.
const handleOauth2Callback = () => {
  return queryString.parse(window.location.search);
};

module.exports = handleOauth2Callback;
