const { createRenderComponentCallback, wait } = require("../../utils/helpers");
const { qr: qrComponent } = require("../components/qr");
const handleAction = require("../../lib/handleAction");

const isPongResponse = (response) => {
  return (
    response["@type"] === "action" &&
    Array.isArray(response.opts) &&
    response.opts[0].hint === "pong"
  );
};

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
 *   onSuccessCallback: () => void;
 * }} arguments
 */
const qr = async ({ context, htmlContainer, onRenderComponent, onSuccessCallback }) => {
  const qrEl = await qrComponent(context);
  htmlContainer.appendChild(createRenderComponentCallback(onRenderComponent, qrEl, "qr"));

  // Wait 5 seconds before the first check
  await wait(5);

  let response;
  while (!response) {
    try {
      // Wait at most 20 seconds for the response.
      const newResponse = await handleAction({ action: "ping", timeout: 20000 });
      if (isPongResponse(newResponse)) {
        // If there's a pong response, wait for 5 seconds before the next try.
        await wait(5);
      } else {
        response = newResponse;
      }
    } catch (err) {
      // This should happen when the request takes more than 20 seconds.
      console.debug(err);
      await wait(2);
    }
  }

  onSuccessCallback(response);
};

module.exports = qr;
