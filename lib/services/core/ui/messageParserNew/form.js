const { getElementIds } = require("../../lib/config");
const { handleError, setNotification } = require("../../lib/notifications");
const { createRenderComponentCallback, createRandomId } = require("../../utils/helpers");
const { primaryButtonUI } = require("../components/buttons");
const { inputWithLabel } = require("../components/inputs");
const { handleForm } = require("../../lib/common");
const { getLocalizedMessage } = require("../../lib/locale-provider");

/**
 * @typedef {{
 *   password: string;
 *   username: string;
 *   confirmPassword: string;
 *   registerButton: string;
 *   agreeAndRegisterButton: string;
 *   loginButton: string;
 *   newPassword: string;
 *   confirmNewPassword: string;
 *   setNewPasswordButton: string;
 * }} Labels
 */

const handleResetPasswordResponse = (response) => {
  if (response["@type"] === "success") {
    const message = getLocalizedMessage("uisdk.reset_password.email_send");
    setNotification(message, "success");
  } else {
    const message = getLocalizedMessage("uisdk.reset_password.fail_message");
    setNotification(message, "error");
  }
};

const getInputLabel = (uiContext, fieldId, placeholder, defaultLabels, customLabels) => {
  if (uiContext === "password" || uiContext === "passwordCreate") {
    if (fieldId === "username") {
      return (customLabels && customLabels.username) || defaultLabels.username;
    }
    if (fieldId === "password") {
      return (customLabels && customLabels.password) || defaultLabels.password;
    }
  }
  if (uiContext === "forgottenPassword") {
    if (fieldId === "username") {
      return (customLabels && customLabels.email) || defaultLabels.email;
    }
  }
  if (uiContext === "changePassword") {
    if (fieldId === "password") {
      return (customLabels && customLabels.newPassword) || defaultLabels.newPassword;
    }
  }

  const placeholderArray = Array.from(placeholder || " ");
  placeholderArray[0] = placeholderArray[0].toUpperCase();
  return placeholderArray.join("");
};

const getSubmitButtonLabel = (uiContext, defaultLabels, customLabels) => {
  if (uiContext === "password") {
    return (customLabels && customLabels.loginButton) || defaultLabels.loginButton;
  }
  if (uiContext === "passwordCreate") {
    return (customLabels && customLabels.registerButton) || defaultLabels.registerButton;
  }
  if (uiContext === "forgottenPassword") {
    return (
      (customLabels && customLabels.forgotPasswordButton) || defaultLabels.forgotPasswordButton
    );
  }
  if (uiContext === "changePassword") {
    return (
      (customLabels && customLabels.setNewPasswordButton) || defaultLabels.setNewPasswordButton
    );
  }

  return "Submit";
};

/**
 * @param {{
 *   context: {
 *     "@id": string;
 *     "@type": "form";
 *     "~ord": number;
 *     "~ui": string;
 *     fields: {
 *       "@id": string;
 *       "@type": string;
 *       autocomplete: boolean;
 *       hint: string;
 *       maxlength: number;
 *       minlength: number;
 *       pattern: string;
 *       placeholder: string;
 *       required: boolean;
 *     }[];
 *   };
 *   htmlContainer: HTMLElement;
 *   labels: {
 *     default: Labels;
 *     custom?: Partial<Labels>;
 *   };
 *   onRenderComponent?: () => HTMLElement|undefined;
 *   onSuccessCallback: () => void;
 * }} arguments
 */
const form = ({
  context = {},
  htmlContainer,
  labels = {},
  onRenderComponent,
  onSuccessCallback,
}) => {
  if (!htmlContainer) {
    throw new Error("You have to pass a 'htmlContainer' to this function.");
  }
  const elementIds = getElementIds();
  const { default: defaultLabels, custom: customLabels = {} } = labels;
  const form = document.createElement("form");
  form.id = `${elementIds.formPrefix}-${createRandomId()}`;
  const uiContext = context["~ui"].includes("#") ? context["~ui"].split("#")[0] : context["~ui"];
  const isRegistration = uiContext === "passwordCreate";
  const isResetPassword = uiContext === "forgottenPassword";
  const isSetNewPassword = uiContext === "changePassword";

  (context.fields || []).forEach((formField) => {
    const labelText = getInputLabel(
      uiContext,
      formField["@id"],
      formField.placeholder,
      defaultLabels,
      customLabels,
    );
    const { label, input } = inputWithLabel({
      type: formField.hint,
      id: `${elementIds.inputPrefix}-${formField["@id"]}`,
      labelText,
      context: formField,
    });
    const el = document.createElement("div");
    el.appendChild(label);
    el.appendChild(input);
    form.appendChild(
      createRenderComponentCallback(
        onRenderComponent,
        el,
        "form",
        formField.hint,
        labelText,
        formField,
        context,
      ),
    );

    if (formField.hint === "password") {
      if (isRegistration || isSetNewPassword) {
        let labelText;
        if (isRegistration) {
          labelText =
            (customLabels && customLabels.confirmPassword) || defaultLabels.confirmPassword;
        } else {
          labelText =
            (customLabels && customLabels.confirmNewPassword) || defaultLabels.confirmNewPassword;
        }

        const { label, input } = inputWithLabel({
          type: formField.hint,
          id: `${elementIds.inputPrefix}-${formField["@id"]}-confirm`,
          labelText,
          context: formField,
        });
        const el = document.createElement("div");
        el.appendChild(label);
        el.appendChild(input);
        form.appendChild(
          createRenderComponentCallback(
            onRenderComponent,
            el,
            "form",
            `${formField.hint}-confirm`,
            labelText,
            formField,
            context,
          ),
        );
      }
    }
  });

  const buttonLabel = getSubmitButtonLabel(uiContext, defaultLabels, customLabels);
  const clickHandler = (e) => {
    e.preventDefault();
    handleForm({
      formContext: context,
      formId: form.id,
      onSuccessCallback: (response) => {
        if (isResetPassword) {
          handleResetPasswordResponse(response);
          return;
        }
        onSuccessCallback(response);
      },
    }).catch((err) => {
      if (typeof err === "object" && err["~error"]) {
        handleError(err["~error"]);
      }
    });
  };
  const button = primaryButtonUI({
    id: elementIds.submitBtn,
    onClick: clickHandler,
    label: buttonLabel,
  });
  form.appendChild(
    createRenderComponentCallback(
      onRenderComponent,
      button,
      "form",
      "submit",
      clickHandler,
      buttonLabel,
      context,
    ),
  );

  htmlContainer.appendChild(form);
};

module.exports = form;
