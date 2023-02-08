const {
  arrayBufferToBase64,
  createRenderComponentCallback,
  base64ToArrayBuffer,
  isAssertWebauthnRequest,
} = require("../../utils/helpers");
const { primaryButtonUI } = require("../components/buttons");
const handleWebAuthn = require("../../lib/webauthn/handleWebAuthn");
const handleWebAuthnCreateOp = require("../../lib/webauthn/handleWebAuthnCreateOp");

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
  const createButton = primaryButtonUI({
    id: "IKUISDK-btn-webauthn-create",
    onClick: async () => {
      handleWebAuthnCreateOp({
        onFailCallback,
        onSuccessCallback,
      });
    },
    label: "Create WebAuthn credentials",
  });
  htmlContainer.appendChild(createRenderComponentCallback(onRenderComponent, button, "webauthn"));
  if (isAssertWebauthnRequest(context.publicKey)) {
    htmlContainer.appendChild(
      createRenderComponentCallback(onRenderComponent, createButton, "webauthn"),
    );
  }
};

module.exports = webauthn;
