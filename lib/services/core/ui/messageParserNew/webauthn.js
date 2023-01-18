const {
  arrayBufferToBase64,
  createRenderComponentCallback,
  base64ToArrayBuffer,
} = require("../../utils/helpers");
const { primaryButtonUI } = require("../components/buttons");
const handleWebAuthn = require("../../lib/webauthn/handleWebAuthn");

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
 *   onFailCallback: (err: Error) => void;
 *   onRenderComponent?: () => HTMLElement|undefined;
 *   onSuccessCallback: (newContext: unknown) => void;
 * }} args
 * @returns
 */
const webauthn = ({
  context,
  htmlContainer,
  onFailCallback,
  onRenderComponent,
  onSuccessCallback,
}) => {
  const button = primaryButtonUI({
    id: "IKUISDK-btn-webauthn",
    onClick: async () => {
      const publicKey = context.publicKey || {};
      handleWebAuthn({
        publicKey,
        onFailCallback,
        onSuccessCallback,
      });
    },
    label: "Webauthn",
  });
  htmlContainer.appendChild(createRenderComponentCallback(onRenderComponent, button, "webauthn"));
};

module.exports = webauthn;
