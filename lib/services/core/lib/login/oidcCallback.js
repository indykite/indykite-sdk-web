const queryString = require("query-string");
const storage = require("../storage");
const { getOidcFinalUrlWithLoginVerifier, sendRequest } = require("../../utils/helpers");
const { getBaseAuthUrl } = require("../config");
const Base64 = require("crypto-js/enc-base64");
const Utf8 = require("crypto-js/enc-utf8");

const oidcCallback = async () => {
  const parsedParams = queryString.parse(window.location.search);
  const originalParams = storage.getOidcOriginalParams();

  try {
    // sending params received from oidc provider
    const thid = storage.getThreadId();
    const url = getBaseAuthUrl();
    const data = {
      state: parsedParams.state,
      code: parsedParams.code,
      "@type": "oidc",
      "~thread": {
        thid: thid,
      },
    };

    const paramsKeys = Object.keys(parsedParams).filter(
      (key) => !["state", "code"].includes(key),
    );
    if (paramsKeys.length > 0) {
      const paramsObject = paramsKeys.reduce((obj, key) => {
        obj[key] = parsedParams[key];
        return obj;
      }, {});

      data.params = paramsObject;
    }

    const responseOne = await sendRequest(url, "POST", data, {
      actionName: "oidc-callback",
    });
    const thid2 = responseOne.data["~thread"] && responseOne.data["~thread"].thid;

    if (responseOne.data["@type"] === "fail") {
      throw responseOne.data;
    }

    if (responseOne.data["@type"] === "verifier") {
      // We are at the end of te flo

      // sending verifier in order to receive token

      const data2 = {
        "~thread": {
          thid: thid2,
        },
        "@type": "verifier",
        cv: storage.getCv(),
      };
      const requestTokenResponse = await sendRequest(url, "POST", data2, {
        actionName: "oidc-verifier",
      });

      // store tokens
      if (requestTokenResponse.data["@type"] === "success") {
        await storage.storeOnLoginSuccess(requestTokenResponse.data);
      }

      if (responseOne.data.verifier && originalParams) {
        // We are already in the OIDC flow from a different provider
        storage.clearOidcData();
        return {
          ...requestTokenResponse.data,
          redirect_to: getOidcFinalUrlWithLoginVerifier(
            originalParams,
            responseOne.data.verifier,
          ),
        };
      }

      return requestTokenResponse.data;
    }

    storage.setPendingResponse(responseOne.data);
    return {
      ...responseOne.data,
      redirect_to: storage.getAuthFlowStartPoint(),
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = oidcCallback;
