const requiredQueryParams = [
  "login_app", // dashboard uri/pathname
  "redirect_uri", // where we want to end up on success
  "response_type",
  "client_id",
  "state",
  "scope",
  "nonce",
];

const isConfigMissingField = (config, requiredFields = requiredQueryParams) => {
  return requiredFields.find((field) => !config[field]);
};

module.exports = isConfigMissingField;
