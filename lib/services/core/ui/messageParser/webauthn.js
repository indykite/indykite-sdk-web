const { getElementIds, getBaseAuthUrl } = require("../../lib/config");
const {
  createRenderComponentCallback,
  sendRequest,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  base64UrlToArrayBuffer,
} = require("../../utils/helpers");
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
    label: "WebAuthN - Register",
    onClick: async () => {
      const url = getBaseAuthUrl();
      const data = {
        "~thread": {
          thid: storage.getThreadId(),
        },
        "@type": "webauthn",
        "@id": context["@id"],
        op: "create",
        name: "newUser",
        displayName: "New User",
      };
      const { data: response } = await sendRequest(url, "POST", data, {
        actionName: "webauthn-register-request",
      });
      console.log('BE "create" options:', response);
      let rpIdReplacement;
      if (
        response.publicKey.rp.id.charAt(8) === "-" &&
        response.publicKey.rp.id.charAt(23) === "-"
      ) {
        rpIdReplacement = window.location.hostname;
        console.warn(
          "`publicKey.rp.id` probably contains an UUID value (" +
            response.publicKey.rp.id +
            "). Will use `" +
            rpIdReplacement +
            "` instead.",
        );
      } else if (response.publicKey.rp.id.startsWith("http")) {
        rpIdReplacement = /^https?:\/\/(.*)$/.exec(response.publicKey.rp.id)[1];
        console.warn(
          "`publicKey.rp.id` shouldn't contain `http` nor `https` prefix. Will use `" +
            rpIdReplacement +
            "` instead.",
        );
      }
      const publicKey = {
        ...response.publicKey,
        challenge: base64UrlToArrayBuffer(response.publicKey.challenge),
        user: {
          ...response.publicKey.user,
          id: base64ToArrayBuffer(response.publicKey.user.id),
          name: "newUser",
          displayName: "New User",
        },
        rp: {
          ...response.publicKey.rp,
          id: rpIdReplacement || response.publicKey.rp.id,
        },
      };
      console.log('Browser "create" request:', publicKey);
      const credentialsObject = await navigator.credentials.create({
        publicKey,
      });
      console.log('Browser "create" response:', credentialsObject);
      const credentialsObjectWithBase64 = {
        id: credentialsObject.id,
        rawId: arrayBufferToBase64(credentialsObject.rawId),
        type: credentialsObject.type,
        response: {
          attestationObject: arrayBufferToBase64(credentialsObject.response.attestationObject),
          clientDataJSON: arrayBufferToBase64(credentialsObject.response.clientDataJSON),
        },
      };
      const data2 = {
        "~thread": {
          thid: response["~thread"].thid,
        },
        "@type": "webauthn",
        publicKeyCredential: credentialsObjectWithBase64,
      };
      console.log('BE "create" request:', data2);
      const { data: response2 } = await sendRequest(url, "POST", data2, {
        actionName: "webauthn-register-credentials",
      });
      console.log('BE "create" response:', response2);
    },
  });
  const loginButton = primaryButtonUI({
    id: elementIds.webauthnBtn,
    label: "WebAuthN - Login",
    onClick: async () => {
      const url = getBaseAuthUrl();
      const data = {
        "~thread": {
          thid: storage.getThreadId(),
        },
        "@type": "webauthn",
        "@id": context["@id"],
        op: "assert",
        name: "newUser",
      };
      const { data: response } = await sendRequest(url, "POST", data, {
        actionName: "webauthn-login-request",
      });
      console.log('BE "assert" options:', response);
      let rpIdReplacement;
      if (
        response.publicKey.rpId.charAt(8) === "-" &&
        response.publicKey.rpId.charAt(23) === "-"
      ) {
        rpIdReplacement = window.location.hostname;
        console.warn(
          "`publicKey.rp.id` probably contains an UUID value (" +
            response.publicKey.rpId +
            "). Will use `" +
            rpIdReplacement +
            "` instead.",
        );
      } else if (response.publicKey.rpId.startsWith("http")) {
        rpIdReplacement = /^https?:\/\/(.*)$/.exec(response.publicKey.rpId)[1];
        console.warn(
          "`publicKey.rp.id` shouldn't contain `http` nor `https` prefix. Will use `" +
            rpIdReplacement +
            "` instead.",
        );
      }
      const publicKey = {
        ...response.publicKey,
        rpId: rpIdReplacement || response.publicKey.rpId,
        challenge: base64UrlToArrayBuffer(response.publicKey.challenge),
        allowCredentials: response.publicKey.allowCredentials
          ? response.publicKey.allowCredentials.map((credential) => ({
              ...credential,
              id: base64ToArrayBuffer(credential.id),
            }))
          : undefined,
      };
      // const publicKey = {
      //   challenge: /*base64urlToArrayBuffer(response.publicKey.challenge),*/ base64urlToArrayBuffer('dCOW6w1Q4cW69rfrjntANsDdxuvOTrLK2rfOC0Twqvw'),
      //   allowCredentials: [
      //     {
      //       id: base64ToArrayBuffer("AQECAwUIDRUiN1mQ"),
      //       type: "public-key",
      //     },
      //   ],
      //   rpId: 'localhost',
      //   timeout: 60000,
      //   authenticatorSelection: { userVerification: "preferred" },
      // };
      console.log('Browser "assert" request:', publicKey);
      const credentialsObject = await navigator.credentials.get([
        {
          publicKey,
        },
      ]);
      console.log('Browser "assert" response:', credentialsObject);
      if (!credentialsObject) {
        console.error("navigator.credentials.get returns `null`.");
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
        },
      };
      const { data: response2 } = await sendRequest(url, "POST", credentialsObjectWithBase64, {
        actionName: "webauthn-login-credentials",
      });
      console.log('BE "assert" response:', response2);
    },
  });
  htmlContainer.appendChild(
    createRenderComponentCallback(onRenderComponent, registerButton, "webauthn"),
  );
  htmlContainer.appendChild(
    createRenderComponentCallback(onRenderComponent, loginButton, "webauthn"),
  );
};

module.exports = webauthn;
