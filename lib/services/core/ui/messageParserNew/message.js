const { createRenderComponentCallback } = require("../../utils/helpers");
const { message: messageComponent } = require("../components/texts");

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
 *   onRenderComponent?: () => HTMLElement|undefined;
 * }} arguments
 */
const message = ({ context, htmlContainer, onRenderComponent }) => {
  const messageEl = messageComponent({
    label: context.label,
    message: context.msg,
    type: context.style,
  });

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
