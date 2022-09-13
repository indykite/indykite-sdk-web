const { getOidcFinalUrlWithLoginVerifier, sendRequest } = require("../../../utils/helpers");
const storage = require("../../storage");
const { getBaseAuthUrl } = require("../../config");
const oidcCallback = require("../oidcCallback");

jest.mock("../../../utils/helpers");
jest.mock("../../storage");
jest.mock("../../config");
jest.mock("../oidcSetup");

const originalLocation = window.location;
const mockedAuthUrl = "https://www.something.com/auth/54321";

beforeAll(() => {
  delete window.location;
  jest.spyOn(console, "error").mockImplementation(() => {});
});

beforeEach(() => {
  jest.resetAllMocks();
  storage.getThreadId.mockImplementation(() => "stored-thread-id");
  storage.getCv.mockImplementation(() => "code-verifier-token");
  storage.getAuthFlowStartPoint.mockImplementation(() => "https://example.com/start/flow");
  getBaseAuthUrl.mockImplementation(() => mockedAuthUrl);
});

afterAll(() => {
  window.location = originalLocation;
  console.error.mockRestore();
});

describe("when params query parameter is not present", () => {
  beforeEach(() => {
    window.location = {
      search: "?state=state-token&code=code-token",
    };
  });

  describe("when OIDC request returns verifier response", () => {
    let returnedValue;

    beforeEach(() => {
      sendRequest.mockImplementationOnce(() => ({
        data: {
          "@type": "verifier",
          verifier: "verifier-token",
          "~thread": {
            thid: "thread-id-2",
          },
        },
      }));
      returnedValue = undefined;
    });

    describe("when original parameters are set", () => {
      beforeEach(() => {
        storage.getOidcOriginalParams.mockImplementation(() => ({
          login_challenge: "login-challenge-token",
        }));
      });

      describe("when verifier request returns a success response", () => {
        beforeEach(async () => {
          sendRequest.mockImplementationOnce(() => ({
            data: {
              "@type": "success",
              token: "access-token",
            },
          }));
          getOidcFinalUrlWithLoginVerifier.mockImplementation(
            (params, verifier) =>
              `https://example.com/?login_challenge=${params.login_challenge}&login_verifier=${verifier}`,
          );

          returnedValue = await oidcCallback();
        });

        it("sends correct OIDC request", () => {
          expect(sendRequest).toBeCalled();
          expect(sendRequest.mock.calls[0]).toEqual([
            mockedAuthUrl,
            "POST",
            {
              state: "state-token",
              code: "code-token",
              "@type": "oidc",
              "~thread": {
                thid: "stored-thread-id",
              },
            },
            {
              actionName: "oidc-callback",
            },
          ]);
        });

        it("sends correct verifier request", () => {
          expect(sendRequest).toBeCalledTimes(2);
          expect(sendRequest.mock.calls[1]).toEqual([
            mockedAuthUrl,
            "POST",
            {
              "@type": "verifier",
              "~thread": {
                thid: "thread-id-2",
              },
              cv: "code-verifier-token",
            },
            {
              actionName: "oidc-verifier",
            },
          ]);
        });

        it("stores the returned tokens", () => {
          expect(storage.storeOnLoginSuccess).toBeCalledTimes(1);
          expect(storage.storeOnLoginSuccess.mock.calls[0]).toEqual([
            {
              "@type": "success",
              token: "access-token",
            },
          ]);
        });

        it("clears OIDC data", () => {
          expect(storage.clearOidcData).toBeCalled();
        });

        it("does not set a pending response", () => {
          expect(storage.setPendingResponse).toBeCalledTimes(0);
        });

        it("returns a correct object", () => {
          expect(returnedValue).toEqual({
            "@type": "success",
            token: "access-token",
            redirect_to:
              "https://example.com/?login_challenge=login-challenge-token&login_verifier=verifier-token",
          });
        });
      });

      describe("when verifier request returns a fail response", () => {
        beforeEach(async () => {
          sendRequest.mockImplementationOnce(() => ({
            data: {
              "@type": "fail",
            },
          }));
          getOidcFinalUrlWithLoginVerifier.mockImplementation(
            (params, verifier) =>
              `https://example.com/?login_challenge=${params.login_challenge}&login_verifier=${verifier}`,
          );

          returnedValue = await oidcCallback();
        });

        it("sends correct verifier request", () => {
          expect(sendRequest).toBeCalledTimes(2);
          expect(sendRequest.mock.calls[1]).toEqual([
            mockedAuthUrl,
            "POST",
            {
              "@type": "verifier",
              "~thread": {
                thid: "thread-id-2",
              },
              cv: "code-verifier-token",
            },
            {
              actionName: "oidc-verifier",
            },
          ]);
        });

        it("does not try to store tokens", () => {
          expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
        });

        it("clears OIDC data", () => {
          expect(storage.clearOidcData).toBeCalled();
        });

        it("does not set a pending response", () => {
          expect(storage.setPendingResponse).toBeCalledTimes(0);
        });

        it("returns a correct object", () => {
          expect(returnedValue).toEqual({
            "@type": "fail",
            redirect_to:
              "https://example.com/?login_challenge=login-challenge-token&login_verifier=verifier-token",
          });
        });
      });

      describe("when verifier request throws an error", () => {
        const error = new Error("Test error");
        let caughtError;

        beforeEach(async () => {
          sendRequest.mockImplementationOnce(() => Promise.reject(error));
          getOidcFinalUrlWithLoginVerifier.mockImplementation(
            (params, verifier) =>
              `https://example.com/?login_challenge=${params.login_challenge}&login_verifier=${verifier}`,
          );

          caughtError = undefined;
          try {
            await oidcCallback();
          } catch (err) {
            caughtError = err;
          }
        });

        it("sends correct verifier request", () => {
          expect(sendRequest).toBeCalledTimes(2);
          expect(sendRequest.mock.calls[1]).toEqual([
            mockedAuthUrl,
            "POST",
            {
              "@type": "verifier",
              "~thread": {
                thid: "thread-id-2",
              },
              cv: "code-verifier-token",
            },
            {
              actionName: "oidc-verifier",
            },
          ]);
        });

        it("does not try to store tokens", () => {
          expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
        });

        it("does not clear OIDC data", () => {
          expect(storage.clearOidcData).toBeCalledTimes(0);
        });

        it("does not set a pending response", () => {
          expect(storage.setPendingResponse).toBeCalledTimes(0);
        });

        it("prints an error to the console and throws the error", () => {
          expect(console.error).toBeCalledTimes(1);
          expect(console.error.mock.calls[0]).toEqual([error]);
          expect(caughtError).toBe(error);
        });
      });
    });

    describe("when original parameters are not set", () => {
      describe("when verifier request returns a success response", () => {
        beforeEach(async () => {
          sendRequest.mockImplementationOnce(() => ({
            data: {
              "@type": "success",
              token: "access-token",
            },
          }));
          getOidcFinalUrlWithLoginVerifier.mockImplementation(
            (params, verifier) =>
              `https://example.com/?login_challenge=${params.login_challenge}&login_verifier=${verifier}`,
          );

          returnedValue = await oidcCallback();
        });

        it("sends correct OIDC request", () => {
          expect(sendRequest).toBeCalled();
          expect(sendRequest.mock.calls[0]).toEqual([
            mockedAuthUrl,
            "POST",
            {
              state: "state-token",
              code: "code-token",
              "@type": "oidc",
              "~thread": {
                thid: "stored-thread-id",
              },
            },
            {
              actionName: "oidc-callback",
            },
          ]);
        });

        it("sends correct verifier request", () => {
          expect(sendRequest).toBeCalledTimes(2);
          expect(sendRequest.mock.calls[1]).toEqual([
            mockedAuthUrl,
            "POST",
            {
              "@type": "verifier",
              "~thread": {
                thid: "thread-id-2",
              },
              cv: "code-verifier-token",
            },
            {
              actionName: "oidc-verifier",
            },
          ]);
        });

        it("stores the returned tokens", () => {
          expect(storage.storeOnLoginSuccess).toBeCalledTimes(1);
          expect(storage.storeOnLoginSuccess.mock.calls[0]).toEqual([
            {
              "@type": "success",
              token: "access-token",
            },
          ]);
        });

        it("does not clear OIDC data", () => {
          expect(storage.clearOidcData).toBeCalledTimes(0);
        });

        it("does not set a pending response", () => {
          expect(storage.setPendingResponse).toBeCalledTimes(0);
        });

        it("returns a correct object", () => {
          expect(returnedValue).toEqual({
            "@type": "success",
            token: "access-token",
          });
        });
      });
    });
  });

  describe("when OIDC request returns OIDC response", () => {
    let returnedValue;

    beforeEach(async () => {
      sendRequest.mockImplementationOnce(() => ({
        data: {
          "@type": "oidc",
          "~thread": {
            thid: "thread-id-2",
          },
        },
      }));
      returnedValue = await oidcCallback();
    });

    it("does not try to store tokens", () => {
      expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
    });

    it("does not clear OIDC data", () => {
      expect(storage.clearOidcData).toBeCalledTimes(0);
    });

    it("sets a pending response", () => {
      expect(storage.setPendingResponse).toBeCalledTimes(1);
      expect(storage.setPendingResponse).toBeCalledWith({
        "@type": "oidc",
        "~thread": {
          thid: "thread-id-2",
        },
      });
    });

    it("returns a correct object", () => {
      expect(returnedValue).toEqual({
        "@type": "oidc",
        "~thread": {
          thid: "thread-id-2",
        },
        redirect_to: "https://example.com/start/flow",
      });
    });
  });

  describe("when OIDC request returns 'fail' response", () => {
    let caughtError;

    beforeEach(async () => {
      sendRequest.mockImplementationOnce(() => ({
        data: {
          "@type": "fail",
        },
      }));
      try {
        await oidcCallback();
      } catch (err) {
        caughtError = err;
      }
    });

    it("throws an error", () => {
      expect(caughtError).toEqual({
        "@type": "fail",
      });
    });
  });
});

describe("when params query parameters are present", () => {
  beforeEach(() => {
    window.location = {
      search: "?state=state-token&code=code-token&key1=value1&key2=value2",
    };
  });

  let returnedValue;

  beforeEach(async () => {
    sendRequest.mockImplementationOnce(() => ({
      data: {
        "@type": "verifier",
        verifier: "verifier-token",
        "~thread": {
          thid: "thread-id-2",
        },
      },
    }));
    returnedValue = undefined;
    sendRequest.mockImplementationOnce(() => ({
      data: {
        "@type": "success",
        token: "access-token",
      },
    }));
    getOidcFinalUrlWithLoginVerifier.mockImplementation(
      (params, verifier) =>
        `https://example.com/?login_challenge=${params.login_challenge}&login_verifier=${verifier}`,
    );
    returnedValue = await oidcCallback();
  });

  it("sends correct OIDC request", () => {
    expect(sendRequest).toBeCalled();
    expect(sendRequest.mock.calls[0]).toEqual([
      mockedAuthUrl,
      "POST",
      {
        state: "state-token",
        code: "code-token",
        params: {
          key1: "value1",
          key2: "value2",
        },
        "@type": "oidc",
        "~thread": {
          thid: "stored-thread-id",
        },
      },
      {
        actionName: "oidc-callback",
      },
    ]);
  });
});
