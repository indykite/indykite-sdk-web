const { createRenderComponentCallback } = require("../../utils/helpers");

/**
 * @param {{
 *   context: {
 *     "@id": string;
 *     style: string;
 *     label?: string;
 *     msg?: string;
 *     "~ui"?: string;
 *     extensions?: Object;
 *   };
 *   htmlContainer: HTMLElement;
 * }} arguments
 */
const message = ({ context, htmlContainer, onRenderComponent }) => {
  const messageEl = document.createElement("div");
  messageEl.className = `message message-${context.style}`;
  messageEl.innerText = context.msg || context.label || "";
  messageEl.style.margin = "16px 0";
  messageEl.style.textAlign = "center";
  if (context.style === "warn") {
    messageEl.style.color = "yellow";
  }
  if (context.style === "error") {
    messageEl.style.color = "red";
  }

  htmlContainer.appendChild(
    createRenderComponentCallback(onRenderComponent, messageEl, "message", {
      msg: context.msg,
      label: context.label,
      style: context.style,
      id: context["@id"],
      extensions: context.extensions,
      ui: context["~ui"],
    }),
  );
};

module.exports = message;
