const { getElementIds } = require("../../lib/config");
const { handleLogin } = require("../../lib/login");
const { handleError } = require("../../lib/notifications");
const { handleRegister } = require("../../lib/register");
const { createRenderComponentCallback } = require("../../utils/helpers");
const { primaryButtonUI } = require("../components/buttons");
const { inputWithLabel } = require("../components/inputs");

/**
 * @typedef {{
 *   password: string;
 *   username: string;
 *   confirmPassword: string;
 *   registerButton: string;
 *   agreeAndRegisterButton: string;
 *   loginButton: string;
 * }} Labels
 */

/**
 * @param {{
 *   context: {
 *     "@id": string;
 *     "@type": "form";
 *     "~ord": number;
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
 *   isRegistration: boolean;
 *   labels: {
 *     default: Labels;
 *     custom?: Partial<Labels>;
 *   };
 *   notes: {
 *     user: string;
 *     password: string;
 *     passwordCheck: string;
 *   };
 *   onRenderComponent?: () => HTMLElement|undefined;
 *   onSuccessCallback: () => void;
 *   termsAngAgreementHtmlString: string;
 *   validatePassword?: (value: string) => boolean;
 * }} arguments
 */
const form = ({
  context,
  htmlContainer,
  isRegistration,
  labels = {},
  notes = {},
  onRenderComponent,
  onSuccessCallback,
  placeholders,
  termsAngAgreementHtmlString,
  validatePassword,
}) => {
  const elementIds = getElementIds();
  const { default: defaultLabels, custom: customLabels } = labels;
  const {
    user: userNoteText,
    password: passwordNoteText,
    passwordCheck: passwordCheckNoteText,
  } = notes;
  const form = document.createElement("form");

  (context.fields || []).forEach((formField) => {
    switch (formField.hint) {
      case "email": {
        const labelText = (customLabels && customLabels.username) || defaultLabels.username;
        const { label: userLabel, input: userInput, note: userNote } = inputWithLabel({
          type: "email",
          id: elementIds.inputEmail,
          labelText,
          placeholder: placeholders && placeholders.username,
          autofocus: true,
          noteText: userNoteText,
        });
        const userEl = document.createElement("div");
        userEl.appendChild(userLabel);
        userEl.appendChild(userInput);
        if (userNote) {
          userEl.appendChild(userNote);
        }
        form.appendChild(
          createRenderComponentCallback(
            onRenderComponent,
            userEl,
            "form",
            "username",
            labelText,
            formField,
          ),
        );
        break;
      }
      case "password": {
        const labelText = (customLabels && customLabels.password) || defaultLabels.password;
        const { label: psswrdLabel, input: psswrdInput, note: psswrdNote } = inputWithLabel({
          type: "password",
          id: elementIds.inputPassword,
          labelText,
          placeholder: placeholders && placeholders.password,
          noteText: passwordNoteText,
        });
        const psswrdEl = document.createElement("div");
        psswrdEl.appendChild(psswrdLabel);
        psswrdEl.appendChild(psswrdInput);
        if (psswrdNote) {
          psswrdEl.appendChild(psswrdNote);
        }
        form.appendChild(
          createRenderComponentCallback(
            onRenderComponent,
            psswrdEl,
            "form",
            "password",
            labelText,
            formField,
          ),
        );
        if (isRegistration) {
          const psswrdConfirmlabelText =
            (customLabels && customLabels.confirmPassword) || defaultLabels.confirmPassword;
          const {
            label: psswrdConfirmLabel,
            input: psswrdConfirmInput,
            note: psswrdConfirmNote,
          } = inputWithLabel({
            type: "password",
            id: elementIds.inputConfirmPassword,
            labelText: psswrdConfirmlabelText,
            noteText: passwordCheckNoteText,
            placeholder: placeholders && placeholders.confirmPassword,
          });
          const psswrdConfirmEl = document.createElement("div");
          psswrdConfirmEl.appendChild(psswrdConfirmLabel);
          psswrdConfirmEl.appendChild(psswrdConfirmInput);
          if (psswrdConfirmNote) {
            psswrdConfirmEl.appendChild(psswrdConfirmNote);
          }
          form.appendChild(
            createRenderComponentCallback(
              onRenderComponent,
              psswrdConfirmEl,
              "form",
              "passwordCheck",
              psswrdConfirmlabelText,
              formField,
            ),
          );
        }
        break;
      }
    }
  });

  if (isRegistration) {
    const buttonLabel =
      (customLabels && customLabels.registerButton) ||
      (termsAngAgreementHtmlString
        ? defaultLabels.agreeAndRegisterButton
        : defaultLabels.registerButton);
    const button = primaryButtonUI({
      id: elementIds.submitRegisterBtn,
      onClick: (e) => {
        e.preventDefault();
        // check if property validatePassword exists and is a function
        if (typeof validatePassword === "function") {
          const psswrdInput = form.querySelector("input[type='password']");
          if (psswrdInput && validatePassword(psswrdInput.value) !== true) {
            //abort if validatePassword not returns true
            // IndyRiot doesn't want to have errors
            // handleError({
            //   label: "uisdk.general.password_validation",
            // });
            return;
          }
        }
        handleRegister({
          id: context["@id"],
          onSuccessCallback,
          emailValueParam: null,
          passwordValueParam: null,
        }).catch((err) => {
          if (typeof err === "object" && err["~error"]) {
            handleError(err["~error"]);
          }
        });
      },
      label: buttonLabel,
    });
    form.appendChild(
      createRenderComponentCallback(onRenderComponent, button, "form", "submit", buttonLabel),
    );

    if (termsAngAgreementHtmlString) {
      const termsAndAgreementContainer = document.createElement("div");
      termsAndAgreementContainer.style.cssText = "text-align: center;";
      termsAndAgreementContainer.innerHTML = termsAngAgreementHtmlString;
      form.appendChild(
        createRenderComponentCallback(
          onRenderComponent,
          termsAndAgreementContainer,
          "form",
          "termsAndAgreement",
          termsAngAgreementHtmlString,
        ),
      );
    }
  } else {
    const buttonLabel = (customLabels && customLabels.loginButton) || defaultLabels.loginButton;
    const button = primaryButtonUI({
      id: elementIds.submitLoginBtn,
      onClick: (e) => {
        e.preventDefault();
        handleLogin({
          id: context["@id"],
          onSuccessCallback,
          emailValueParam: null,
          passwordValueParam: null,
        }).catch((err) => {
          if (typeof err === "object" && err["~error"]) {
            handleError(err["~error"]);
          }
        });
      },
      label: buttonLabel,
    });
    form.appendChild(
      createRenderComponentCallback(onRenderComponent, button, "form", "submit", buttonLabel),
    );
  }

  htmlContainer.appendChild(form);
};

module.exports = form;
