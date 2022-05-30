const { getElementIds } = require("../../lib/config");
const { handleLogin } = require("../../lib/login");
const { handleError } = require("../../lib/notifications");
const { handleRegister } = require("../../lib/register");
const { handleSendResetPasswordEmail } = require("../../lib/reset-password");
const { createRenderComponentCallback } = require("../../utils/helpers");
const { primaryButtonUI, navButtonUI } = require("../components/buttons");
const { inputWithLabel } = require("../components/inputs");
const storage = require("../../lib/storage");

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
 *   paths: {
 *     login: string;
 *   };
 *   notes: {
 *     user: string;
 *     password: string;
 *     passwordCheck: string;
 *   };
 *   onRenderComponent?: () => HTMLElement|undefined;
 *   onSuccessCallback: () => void;
 *   termsAndAgreementHtmlString: string;
 *   validatePassword?: (value: string) => boolean;
 * }} arguments
 */
const form = ({
  context = {},
  htmlContainer,
  labels = {},
  notes = {},
  onRenderComponent,
  onSuccessCallback,
  termsAndAgreementHtmlString,
  validatePassword,
}) => {
  if (!htmlContainer) {
    throw new Error("You have to pass a 'htmlContainer' to this function.");
  }
  const elementIds = getElementIds();
  const { default: defaultLabels, custom: customLabels = {} } = labels;
  const {
    user: userNoteText,
    password: passwordNoteText,
    passwordCheck: passwordCheckNoteText,
  } = notes;
  const form = document.createElement("form");
  const uiContext = context["~ui"].includes("#") ? context["~ui"].split("#")[0] : context["~ui"];
  const isRegistration = uiContext === "passwordCreate";
  const isResetPassword = uiContext === "forgottenPassword";

  (context.fields || []).forEach((formField) => {
    switch (formField.hint) {
      case "text":
      case "email": {
        const usernameLabel = (customLabels && customLabels.username) || defaultLabels.username;
        const emailLabel = (customLabels && customLabels.email) || defaultLabels.email;
        const labelText = isResetPassword ? emailLabel : usernameLabel;
        const { label: userLabel, input: userInput, note: userNote } = inputWithLabel({
          type: formField.hint,
          id: isResetPassword ? elementIds.resetPasswordEmail : elementIds.inputEmail,
          labelText,
          autofocus: true,
          noteText: userNoteText,
          context: formField,
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
            isResetPassword ? "email" : "username",
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
          noteText: passwordNoteText,
          context: formField,
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
            context: formField,
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

  if (isResetPassword) {
    const buttonLabel =
      (customLabels && customLabels.forgottenPasswordSubmitButton) ||
      defaultLabels.forgottenPasswordSubmitButton;
    const backToLoginButtonLabel =
      (customLabels && customLabels.backToLogin) || defaultLabels.backToLogin;
    const clickHandler = (e) => {
      e.preventDefault();
      handleSendResetPasswordEmail(null).catch((err) => {
        // The error is already printed in the console so there's no need to do anything more.
      });
    };
    const button = primaryButtonUI({
      id: elementIds.resetPasswordBtn,
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
      ),
    );
    const goBackBtn = navButtonUI({
      id: elementIds.loginBtn,
      label: backToLoginButtonLabel,
      onClick: async () => {
        // remove current forgotten password response
        storage.popResponse();
        // get previous response
        const previousContext = storage.popResponse();
        onSuccessCallback(previousContext);
      },
    });
    form.append(goBackBtn);
  } else if (isRegistration) {
    const buttonLabel =
      (customLabels && customLabels.registerButton) ||
      (termsAndAgreementHtmlString
        ? defaultLabels.agreeAndRegisterButton
        : defaultLabels.registerButton);
    const clickHandler = (e) => {
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
    };
    const button = primaryButtonUI({
      id: elementIds.submitRegisterBtn,
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
      ),
    );

    if (termsAndAgreementHtmlString) {
      const termsAndAgreementContainer = document.createElement("div");
      termsAndAgreementContainer.style.cssText = "text-align: center;";
      termsAndAgreementContainer.innerHTML = termsAndAgreementHtmlString;
      form.appendChild(
        createRenderComponentCallback(
          onRenderComponent,
          termsAndAgreementContainer,
          "form",
          "termsAndAgreement",
          termsAndAgreementHtmlString,
        ),
      );
    }
  } else {
    const buttonLabel = (customLabels && customLabels.loginButton) || defaultLabels.loginButton;
    const clickHandler = (e) => {
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
    };
    const button = primaryButtonUI({
      id: elementIds.submitLoginBtn,
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
      ),
    );
  }

  htmlContainer.appendChild(form);
};

module.exports = form;
