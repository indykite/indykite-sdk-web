/**
 * @typedef {{
 *   id: string;
 *   label: string;
 *   type: 'input';
 *   value?: string;
 * }} ContentInputType
 * @typedef {{
 *   label: string;
 *   type: 'submit';
 * }} ContentButtonType
 * @typedef {ContentInputType | ContentButtonType} ContentType
 */

const { primaryButtonUI } = require("./buttons");
const { inputWithLabel } = require("./inputs");

/**
 * @param {(ContentType | string)[]} content
 */
const modalDialog = async (content = []) => {
  return new Promise((resolve) => {
    const disableInlineStyles = window.IKSDK.config.disableInlineStyles;
    const dialogBackground = document.createElement("div");
    if (!disableInlineStyles) {
      dialogBackground.style.cssText = `
        display: flex;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
      `;
    }
    dialogBackground.className = "IKUISDK-modal-dialog";

    const dialogWrapper = document.createElement("div");
    dialogWrapper.className = "wrapper";
    if (!disableInlineStyles) {
      dialogWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        min-width: 4rem;
        min-height: 1rem;
        border: 1px solid #333;
        border-radius: 5px;
        color: white;
        padding: 2rem 2rem 1rem 2rem;
        background-color: #262626;
      `;
    }

    dialogBackground.appendChild(dialogWrapper);

    const formEl = document.createElement("form");
    formEl.addEventListener("submit", () => false);
    formEl.className = "IKUISDK-form";
    dialogWrapper.appendChild(formEl);

    /** @type {HTMLElement[]} */
    const valuesCollector = [];

    let focusedInput = null;
    content.forEach((item) => {
      if (typeof item === "string") {
        const message = document.createElement("div");
        message.className = "message";
        if (!disableInlineStyles) {
          message.style.cssText = `
            line-height: 1.5rem;
          `;
        }
        message.innerText = item;
        formEl.appendChild(message);
      } else if (item.type === "input") {
        const { input } = inputWithLabel({
          id: item.id,
          labelText: item.label,
          type: "input",
        });
        input.value = item.value || "";
        input.className = "IKUISDK-input";
        const label = document.createElement("label");
        label.className = "IKUISDK-label";
        if (!disableInlineStyles) {
          input.style.marginBottom = "1rem";
          label.style.cssText = `
            font-size: smaller;
            display: block;
            padding-bottom: 0.35rem;
          `;
        }
        label.setAttribute("for", item.id);
        label.innerText = item.label;
        formEl.appendChild(label);
        formEl.appendChild(input);
        valuesCollector.push(input);
        if (!focusedInput) {
          focusedInput = input;
        }
      } else if (item.type === "submit") {
        const button = primaryButtonUI({
          label: item.label,
          onClick: () => {
            const result = {};
            valuesCollector.forEach((el) => {
              if (el.tagName.toLowerCase() === "input") {
                result[el.id] = el.value;
              }
            });
            document.body.removeChild(dialogBackground);
            resolve(result);
          },
        });
        formEl.appendChild(button);
      }
    });

    document.body.appendChild(dialogBackground);
    if (focusedInput) {
      focusedInput.focus();
    }
  });
};

module.exports = modalDialog;
