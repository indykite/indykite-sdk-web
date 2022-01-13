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
  const button = oidcButtonUI({
    id: elementIds.oidcBtnPrefix + createIdFromString(context.name || context.prv),
    data: context,
    onClick: () => {
      const id = context["@id"];
      const params = { id, redirectUri };
      if (loginApp[id]) {
        params.loginApp = loginApp[id];
      }
      oidcSetup(params);
    },
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
