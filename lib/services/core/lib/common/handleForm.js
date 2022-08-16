const storage = require("../storage");
const { cleanError } = require("../notifications");
const { getElementIds, getBaseUri, getApplicationId } = require("../config");
const { sendRequest } = require("../../utils/helpers");

const handleForm = async ({ onSuccessCallback, formContext, formId }) => {
  cleanError();

  try {
    // Sending credentials
    const thid = storage.getThreadId();
    const url = `${getBaseUri()}/auth/${getApplicationId()}`;

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
