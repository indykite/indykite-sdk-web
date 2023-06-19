const { createRenderComponentCallback, isAssertWebauthnRequest } = require("../../utils/helpers");
const { primaryButtonUI } = require("../components/buttons");
const handleWebAuthn = require("../../lib/webauthn/handleWebAuthn");
const handleWebAuthnCreateOp = require("../../lib/webauthn/handleWebAuthnCreateOp");
const { getLocalizedMessage } = require("../../lib/locale-provider");

/**
 * @param {{
 *   context: unknown,
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
  const label = getLocalizedMessage(
    isAssertWebauthnRequest(context?.publicKey)
      ? "uisdk.login.webauthn"
      : "uisdk.register.webauthn",
  );
  const button = primaryButtonUI({
    id: "IKUISDK-btn-webauthn",
    onClick: async () => {
      const publicKey = context.publicKey;
      handleWebAuthn({
        id: context?.["@id"],
        publicKey,
        onFailCallback: (err) => {
          if (/operation either timed out or was/.test(err.message)) {
            handleWebAuthnCreateOp({
              id: context?.["@id"],
              onFailCallback,
              onSuccessCallback,
            });
          } else {
            onFailCallback(err);
          }
        },
        onSuccessCallback,
      });
    },
    label,
  });
  htmlContainer.appendChild(createRenderComponentCallback(onRenderComponent, button, "webauthn"));
};

module.exports = webauthn;
