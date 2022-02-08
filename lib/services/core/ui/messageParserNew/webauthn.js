const { getElementIds, getBaseAuthUrl } = require("../../lib/config");
const oidcSetup = require("../../lib/login/oidcSetup");
const { arrayBufferToBase64, createIdFromString, createRenderComponentCallback, base64ToArrayBuffer, sendRequest } = require("../../utils/helpers");
const { oidcButtonUI, primaryButtonUI } = require("../components/buttons");
const storage = require("../../lib/storage");
const { notificationUI } = require("../components/notification");
const { setNotification, cleanAllNotifications } = require("../../lib/notifications");
const { sendVerifierForLoginOrRegister } = require("../../lib/common");

const createCredentials = async (publicKey) => {
  const objectWithBuffers = {
    ...(publicKey || {}),
    challenge: base64ToArrayBuffer(publicKey.challenge),
    user: {
      ...publicKey.user,
      id: base64ToArrayBuffer(publicKey.user.id),
      displayName: publicKey.user.displayName || publicKey.user.name,
    }
  };

  const creds = await navigator.credentials.create({ publicKey: objectWithBuffers });
  return {
    authenticatorAttachment: creds.authenticatorAttachment,
    id: creds.id,
    rawId: arrayBufferToBase64(creds.rawId),
    response: {
      attestationObject: arrayBufferToBase64(creds.response.attestationObject),
      clientDataJSON: arrayBufferToBase64(creds.response.clientDataJSON),
    },
    type: creds.type,
  };
}

const assertCredentials = async (publicKey) => {
  const objectWithBuffers = {
    ...(publicKey || {}),
    challenge: base64ToArrayBuffer(publicKey.challenge),
  };

  const creds = await navigator.credentials.get({ publicKey: objectWithBuffers });
  return {
    authenticatorAttachment: creds.authenticatorAttachment,
    id: creds.id,
    rawId: arrayBufferToBase64(creds.rawId),
    response: {
      authenticatorData: arrayBufferToBase64(creds.response.authenticatorData),
      clientDataJSON: arrayBufferToBase64(creds.response.clientDataJSON),
      signature: arrayBufferToBase64(creds.response.signature),
      userHandle: arrayBufferToBase64(creds.response.userHandle),
    },
    type: creds.type,
  };
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
 *   onFailCallback: (err: Error) => void;
 *   onRenderComponent?: () => HTMLElement|undefined;
 *   onSuccessCallback: (newContext: unknown) => void;
 * }} args
 * @returns
 */
const webauthn = ({ context, htmlContainer, onFailCallback, onRenderComponent, onSuccessCallback }) => {
  const button = primaryButtonUI({
    id: "IKUISDK-btn-webauthn",
    onClick: async() => {
      const url = getBaseAuthUrl();
      try {
        const publicKey = context.publicKey || {};
        let response;
        if (publicKey.hasOwnProperty('rp')) {
          const publicKeyCreds = await createCredentials(publicKey);
          response = await sendRequest(url, "POST", {
            "~thread": {
              "thid": storage.getThreadId(),
            },
            "@type": "webauthn",
            publicKeyCredential: publicKeyCreds,
          }, {
            actionName: "webauthn-create",
          });
        } else if (publicKey.hasOwnProperty('rpId')) {
          const publicKeyCreds = await assertCredentials(publicKey);

          response = await sendRequest(url, "POST", {
            "~thread": {
              "thid": storage.getThreadId(),
            },
            "@type": "webauthn",
            publicKeyCredential: publicKeyCreds,
          }, {
            actionName: "webauthn-assert",
          });
        }

        if (response.data["@type"] === "verifier") {
          // Verifier
          const callBackTHID = response.data["~thread"] && response.data["~thread"].thid;
          const secondResponse = await sendVerifierForLoginOrRegister(callBackTHID);
    
          if (secondResponse.data["~error"]) {
            onFailCallback(secondResponse.data);
            setNotification(err.message, 'error');
            return;
          }
    
          await storage.storeOnLoginSuccess(secondResponse.data);
          cleanAllNotifications();
    
          onSuccessCallback(secondResponse.data);
        }
      } catch (err) {
        onFailCallback(err);
        setNotification(err.message, 'error');
      }
    },
    label: "Webauthn",
  });
  htmlContainer.appendChild(
    createRenderComponentCallback(
      onRenderComponent,
      button,
      "webauthn",
    ),
  );
};

module.exports = webauthn;
