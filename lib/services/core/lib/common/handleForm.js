const storage = require("../storage");
const { cleanError } = require("../notifications");
const { getElementIds, getBaseAuthUrl } = require("../config");
const { sendRequest } = require("../../utils/helpers");
const { getLocalizedMessage } = require("../locale-provider");

const handleForm = async ({
  onSuccessCallback,
  formContext,
  formId,
  passwordMatchPairIds = [],
}) => {
  cleanError();

  try {
    // Sending credentials
    const thid = storage.getThreadId();
    const url = getBaseAuthUrl();

    const formFields = formContext.fields || [];
    const formInputFields = formFields.filter((field = {}) => field["@type"] === "input");
    const inputValues = {};
    const formEl = document.getElementById(formId);
    formInputFields.forEach((field) => {
      const inputEl = formEl.querySelector(
        `input[id="${getElementIds().inputPrefix}-${field["@id"]}"]`,
      );
      inputValues[field["@id"]] = (inputEl || {}).value;
    });

    const passwordMatches = passwordMatchPairIds.reduce((matches, [fieldId1, fieldId2]) => {
      if (!matches) return false;
      const input1 = formEl.querySelector(`input[id="${fieldId1}"]`);
      const input2 = formEl.querySelector(`input[id="${fieldId2}"]`);
      const input1Value = (input1 || {}).value;
      const input2Value = (input2 || {}).value;

      return input1Value === input2Value;
    }, true);

    if (!passwordMatches) {
      const message = getLocalizedMessage("uisd.register.password_confirmation_failed");
      throw new Error(message);
    }

    const response = await sendRequest(
      url,
      "POST",
      {
        "~thread": {
          thid: thid,
        },
        "@type": "form",
        "@id": formContext["@id"],
        ...inputValues,
      },
      {
        actionName: "form-data",
      },
    );

    if (!response || !response.data) {
      throw new Error(
        "Oops something went wrong when sending credentials to the indentity provider server.",
      );
    }

    if (response.data["~error"]) {
      throw response.data;
    }

    if (response.data["~thread"] && response.data["~thread"].thid) {
      storage.setThreadId(response.data["~thread"].thid);
    }

    if (onSuccessCallback) {
      onSuccessCallback(response.data);
    }
    return response.data;
  } catch (err) {
    throw err;
  }
};

module.exports = handleForm;
