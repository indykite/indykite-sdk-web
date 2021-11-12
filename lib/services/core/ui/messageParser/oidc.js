const { getElementIds } = require("../../lib/config");
const { oidcSetup } = require("../../lib/login");
const { createIdFromString, createRenderComponentCallback } = require("../../utils/helpers");
const { oidcButtonUI } = require("../components/buttons");

const convertContextToId = (context) => {
  return createIdFromString(context.name || context.prv);
}

/**
 * @param {{
 *   context: {
 *     "@id": string;
 *     "@type": "oidc";
 *     prv: string;
 *     url: string;
 *     name?: string;
 *   }
 *   htmlContainer: HTMLElement;
 *   onRenderComponent?: () => HTMLElement|undefined;
 *   redirectUri: string;
 * }} args
 * @returns
 */
const oidc = ({ context, htmlContainer, onRenderComponent, redirectUri }) => {
  const elementIds = getElementIds();
  const button = oidcButtonUI({
    id: elementIds.oidcBtnPrefix + convertContextToId(context),
    data: context,
    onClick: () => oidcSetup(context["@id"], redirectUri),
  });
  htmlContainer.appendChild(
    createRenderComponentCallback(
      onRenderComponent,
      button,
      "oidcButton",
      context.prv,
      context["@id"],
      context.url,
    ),
  );
};

module.exports = oidc;
