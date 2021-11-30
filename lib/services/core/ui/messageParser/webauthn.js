const { getElementIds, getBaseAuthUrl } = require("../../lib/config");
const { createRenderComponentCallback, sendRequest, base64ToArrayBuffer, arrayBufferToBase64 } = require("../../utils/helpers");
const { primaryButtonUI } = require("../components/buttons");
const storage = require("../../lib/storage");

/**
 * @param {{
 *   context: {
 *     "@id": string;
 *   };
 *   htmlContainer: HTMLElement;
 *   onRenderComponent?: () => HTMLElement|undefined;
 * }} args
 * @returns
 */
const webauthn = ({ context, htmlContainer, onRenderComponent }) => {
  const elementIds = getElementIds();
  const registerButton = primaryButtonUI({
    id: elementIds.webauthnBtn,
    label: 'WebAuthN - Register',
    onClick: async () => {
      const url = getBaseAuthUrl();
      const data = {
        '~thread': {
          thid: storage.getThreadId(),
        },
        "@type": "webauthn",
        "@id": context["@id"],
        "op": "create",
        "name": "newUser",
        "displayName": "New User",
      };
      const { data: response } = await sendRequest(url, "POST", data, {
        actionName: "webauthn-register-request",
      });
      if (!response.publicKey.user.displayName) {
        console.error('Browser requires the BE response to have `publicKey.user.displayName` value.');
      }
      if (response.publicKey.rp.id.charAt(8) === '-' && response.publicKey.rp.id.charAt(23) === '-') {
        console.warn('`publicKey.rp.id` probably contains an UUID value.');
      } else if (response.publicKey.rp.id === 'http://localhost') {
        console.error('`publicKey.rp.id` should be `localhost` instead of `http://localhost`');
      }
      const publicKey = {
        ...response.publicKey,
        challenge: base64ToArrayBuffer(response.publicKey.challenge),
        user: {
          ...response.publicKey.user,
          id: base64ToArrayBuffer(response.publicKey.user.id),
          // displayName: "Indykite",
        },
        rp: {
          ...response.publicKey.rp,
          // id: response.publicKey.rp.id.startsWith('http://localhost') ? 'localhost' : response.publicKey.rp.id
          // id: 'localhost',
        }
      };
      const credentialsObject = await navigator.credentials.create({
        publicKey
      });
      console.log('Browser "create" response:', credentialsObject);
      const credentialsObjectWithBase64 = {
        id: credentialsObject.id,
        rawId: arrayBufferToBase64(credentialsObject.rawId),
        type: credentialsObject.type,
        response: {
          attestationObject: arrayBufferToBase64(credentialsObject.response.attestationObject),
          clientDataJSON: arrayBufferToBase64(credentialsObject.response.clientDataJSON),
        }
      };
      const data2 = {
        '~thread': {
          thid: response['~thread'].thid
        },
        '@type': 'webauthn',
        publicKeyCredential: credentialsObjectWithBase64,
      };
      const { data: response2 } = await sendRequest(url, "POST", data2, {
        actionName: "webauthn-register-credentials",
      });
      console.log('BE "create" response:', response2);
    },
  });
  const loginButton = primaryButtonUI({
    id: elementIds.webauthnBtn,
    label: 'WebAuthN - Login',
    onClick: async () => {
      const url = getBaseAuthUrl();
      const data = {
        '~thread': {
          thid: storage.getThreadId(),
        },
        "@type": "webauthn",
        "@id": context["@id"],
        "op": "assert",
        "name": "newUser",
      };
      const { data: response } = await sendRequest(url, "POST", data, {
        actionName: "webauthn-login-request",
      });
      const publicKey = {
        ...response.publicKey,
        // rpId: 'localhost',
        challenge: base64ToArrayBuffer(response.publicKey.challenge),
      };
      const credentialsObject = await navigator.credentials.get([{
        publicKey
      }]);
      console.log('Browser "assert" response:', credentialsObject);
      if (!credentialsObject) {
        console.error('navigator.credentials.get returns `null`.');
        return;
      }
      const credentialsObjectWithBase64 = {
        id: credentialsObject.id,
        rawId: arrayBufferToBase64(credentialsObject.rawId),
        type: credentialsObject.type,
        response: {
          authenticatorData: arrayBufferToBase64(credentialsObject.response.authenticatorData),
          clientDataJSON: arrayBufferToBase64(credentialsObject.response.clientDataJSON),
          signature: arrayBufferToBase64(credentialsObject.response.signature),
          userHandle: arrayBufferToBase64(credentialsObject.response.userHandle),
        }
      };
      const { data: response2 } = await sendRequest(url, "POST", credentialsObjectWithBase64, {
        actionName: "webauthn-login-credentials",
      });
      console.log('BE "assert" response:', response2);
    },
  });
  htmlContainer.appendChild(
    createRenderComponentCallback(
      onRenderComponent,
      registerButton,
      "webauthn",
    ),
  );
  htmlContainer.appendChild(
    createRenderComponentCallback(
      onRenderComponent,
      loginButton,
      "webauthn",
    ),
  );
};

module.exports = webauthn;
