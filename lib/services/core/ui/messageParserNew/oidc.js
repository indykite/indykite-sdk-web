const { getElementIds } = require("../../lib/config");
const oidcSetup = require("../../lib/login/oidcSetup");
const { createIdFromString, createRenderComponentCallback } = require("../../utils/helpers");
const { oidcButtonUI } = require("../components/buttons");

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
 *   loginApp: {
 *     [optionId: string]: string;
 *   };
 * }} args
 * @returns
 */
const oidc = ({ context, htmlContainer, onRenderComponent, redirectUri, loginApp = {} }) => {
  const elementIds = getElementIds();
  const clickHandler = async () => {
    const id = context["@id"];
    const params = { id, redirectUri, url: context.url };
    if (loginApp[id]) {
      params.loginApp = loginApp[id];
    }
    return oidcSetup(params);
  };
  const button = oidcButtonUI({
    id: elementIds.oidcBtnPrefix + createIdFromString(context.name || context.prv),
    data: context,
    onClick: clickHandler,
  });
  htmlContainer.appendChild(
    createRenderComponentCallback(
      onRenderComponent,
      button,
      "oidcButton",
      context.prv,
      clickHandler,
      context["@id"],
      context.url,
    ),
  );
};

module.exports = oidc;
