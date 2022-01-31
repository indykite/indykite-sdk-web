const storage = require("../storage");
const { isTokenExpired, sendRequest } = require("../../utils/helpers");
const { getValidAccessToken } = require("../refresh");
const { getCodeVerifierAndChallenge } = require("../../utils/crypto");

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
    applicationId: "246",
  },
};

jest.mock("../storage");
jest.mock("../../utils/helpers", () => {
  const realModule = jest.requireActual("../../utils/helpers");
  return {
    ...realModule,
    isTokenExpired: jest.fn(),
    sendRequest: jest.fn(),
  };
});
jest.mock("../../utils/crypto");

beforeEach(() => {
  jest.resetAllMocks();
  storage.getTokens.mockImplementation(() =>
    Promise.resolve({
      accessToken: "access-token",
      expirationTime: new Date("2022-01-19T10:09:22+00:00").getTime() / 1000,
      refreshToken: "refresh-token",
    }),
  );
  isTokenExpired.mockImplementation(() => false);
  getCodeVerifierAndChallenge.mockImplementation(() => ({
    codeChallenge: "code-challenge-token",
  }));
  sendRequest.mockImplementation(() => Promise.reject(new Error("Unimplemented response")));
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.debug.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
});

describe("when no options are provided", () => {
  describe("when tokens do not exist in the storage", () => {
    let caughtError;

    beforeEach(async () => {
      storage.getTokens.mockImplementation(() => ({}));
      try {
        await getValidAccessToken();
      } catch (err) {
        caughtError = err;
      }
    });

    it("throws an error", () => {
      expect(caughtError.message).toBe("No refreshToken was found.");
    });

    it("prints a warning to the console", () => {
      expect(console.warn.mock.calls[0]).toEqual([
        "No refreshToken was found.",
        "IKUISDK Failed to refresh the session",
      ]);
    });
  });

  describe("when tokens exist in the storage", () => {
    describe("when token is not expired", () => {
      let returnedValue;

      beforeEach(async () => {
        returnedValue = await getValidAccessToken();
      });

      it("correctly checks token expiration", () => {
        expect(isTokenExpired).toBeCalledTimes(1);
        expect(isTokenExpired.mock.calls[0]).toEqual([1642586962, 300]);
      });

      it("returns a correct value", () => {
        expect(returnedValue).toBe("access-token");
      });

      it("does not print anything to the console", () => {
        expect(console.log).toBeCalledTimes(0);
        expect(console.error).toBeCalledTimes(0);
        expect(console.debug).toBeCalledTimes(0);
        expect(console.warn).toBeCalledTimes(0);
      });

      it("requires tokens without user id specification", () => {
        expect(storage.getTokens).toBeCalledTimes(1);
        expect(storage.getTokens).toBeCalledWith(undefined);
      });
    });

    describe("when token is expired", () => {
      beforeEach(() => {
        isTokenExpired.mockImplementation(() => true);
      });

      describe("when token refresh succeeds", () => {
        let returnedValue;

        beforeEach(async () => {
          sendRequest.mockImplementation(() =>
            Promise.resolve({
              data: {
                "@type": "success",
                sub: "user-id",
                token: "new-access-token",
                refreshToken: "new-refresh-token",
                expiration_time: new Date("2023-01-01T00:00:00+00:00").getTime() / 1000,
              },
            }),
          );

          returnedValue = await getValidAccessToken();
        });

        it("correctly requests the new token", () => {
          expect(sendRequest).toBeCalledTimes(1);
          expect(sendRequest).toBeCalledWith(
            "https://example.com/auth/246",
            "POST",
            {
              cc: "code-challenge-token",
              "~token": "refresh-token",
            },
            {
              actionName: "refresh-token",
              headers: {
                authorization: "Bearer access-token",
              },
            },
          );
        });

        it("updates tokens", () => {
          expect(storage.setTokens).toBeCalledTimes(1);
          expect(storage.setTokens).toBeCalledWith(
            "user-id",
            "new-access-token",
            "refresh-token",
            1672531200,
          );
        });

        it("does not remove user tokens", () => {
          expect(storage.removeUserTokens).toBeCalledTimes(0);
        });

        it("returns a correct value", () => {
          expect(returnedValue).toBe("new-access-token");
        });

        it("does not print anything to the console", () => {
          expect(console.log).toBeCalledTimes(0);
          expect(console.error).toBeCalledTimes(0);
          expect(console.debug).toBeCalledTimes(0);
          expect(console.warn).toBeCalledTimes(0);
        });
      });

      describe("when token refresh fails", () => {
        let caughtError;

        beforeEach(async () => {
          sendRequest.mockImplementation(() =>
            Promise.resolve({
              data: {
                "@type": "fail",
              },
            }),
          );

          try {
            await getValidAccessToken();
          } catch (err) {
            caughtError = err;
          }
        });

        it("does not update tokens", () => {
          expect(storage.setTokens).toBeCalledTimes(0);
        });

        it("prints errors to the console", () => {
          expect(console.log).toBeCalledTimes(1);
          expect(console.log).toBeCalledWith({ data: { "@type": "fail" } });
          expect(console.error).toBeCalledTimes(1);
          expect(console.error).toBeCalledWith("IKUISDK Failed to refresh the session", {
            "@type": "fail",
          });
          expect(console.debug).toBeCalledTimes(0);
          expect(console.warn).toBeCalledTimes(0);
        });

        it("throws an error", () => {
          expect(caughtError).toEqual({ "@type": "fail" });
        });

        it("removes user tokens", () => {
          expect(storage.removeUserTokens).toBeCalledTimes(1);
          expect(storage.removeUserTokens).toBeCalledWith(undefined);
        });
      });

      describe("when token refresh throws an error", () => {
        const error = new Error("Test error");
        error.name = "Error name";
        error.response = {
          status: 502,
          data: "Error data",
        };
        let caughtError;

        beforeEach(async () => {
          sendRequest.mockImplementation(() => Promise.reject(error));

          try {
            await getValidAccessToken();
          } catch (err) {
            caughtError = err;
          }
        });

        it("does not update tokens", () => {
          expect(storage.setTokens).toBeCalledTimes(0);
        });

        it("prints errors to the console", () => {
          expect(console.log).toBeCalledTimes(0);
          expect(console.error).toBeCalledTimes(1);
          expect(console.error).toBeCalledWith(
            "Error name",
            "IKUISDK Failed to refresh the session",
            502,
            "Error data",
          );
          expect(console.debug).toBeCalledTimes(1);
          expect(console.debug).toBeCalledWith(error);
          expect(console.warn).toBeCalledTimes(0);
        });

        it("throws an error", () => {
          expect(caughtError).toEqual(error);
        });

        it("removes user tokens", () => {
          expect(storage.removeUserTokens).toBeCalledTimes(1);
          expect(storage.removeUserTokens).toBeCalledWith(undefined);
        });
      });
    });
  });
});

describe("when options are provided", () => {
  let options;

  beforeEach(() => {
    options = {
      refreshTokenParam: "custom-refresh-token",
      userId: "custom-user-id",
    };
  });

  describe("when token is not expired", () => {
    describe("when refresh token in options differs from the stored one", () => {
      let returnedValue;

      beforeEach(async () => {
        sendRequest.mockImplementation(() =>
          Promise.resolve({
            data: {
              "@type": "success",
              sub: "user-id",
              token: "new-access-token",
              refreshToken: "new-refresh-token",
              expiration_time: new Date("2023-01-01T00:00:00+00:00").getTime() / 1000,
            },
          }),
        );
        returnedValue = await getValidAccessToken(options);
      });

      it("does not check token expiration", () => {
        expect(isTokenExpired).toBeCalledTimes(0);
      });

      it("updates tokens", () => {
        expect(storage.setTokens).toBeCalledTimes(1);
        expect(storage.setTokens).toBeCalledWith(
          "user-id",
          "new-access-token",
          "custom-refresh-token",
          1672531200,
        );
      });

      it("does not remove user tokens", () => {
        expect(storage.removeUserTokens).toBeCalledTimes(0);
      });

      it("returns a correct value", () => {
        expect(returnedValue).toBe("new-access-token");
      });

      it("does not print anything to the console", () => {
        expect(console.log).toBeCalledTimes(0);
        expect(console.error).toBeCalledTimes(0);
        expect(console.debug).toBeCalledTimes(0);
        expect(console.warn).toBeCalledTimes(0);
      });

      it("sends refresh token request", () => {
        expect(sendRequest).toBeCalledTimes(1);
        expect(sendRequest).toBeCalledWith(
          "https://example.com/auth/246",
          "POST",
          {
            cc: "code-challenge-token",
            "~token": "custom-refresh-token",
          },
          {
            actionName: "refresh-token",
          },
        );
      });
    });

    describe("when refresh token in options is same as the stored one", () => {
      let returnedValue;

      beforeEach(async () => {
        options.refreshTokenParam = "refresh-token";
        returnedValue = await getValidAccessToken(options);
      });

      it("correctly checks token expiration", () => {
        expect(isTokenExpired).toBeCalledTimes(1);
        expect(isTokenExpired.mock.calls[0]).toEqual([1642586962, 300]);
      });

      it("returns a correct value", () => {
        expect(returnedValue).toBe("access-token");
      });

      it("does not print anything to the console", () => {
        expect(console.log).toBeCalledTimes(0);
        expect(console.error).toBeCalledTimes(0);
        expect(console.debug).toBeCalledTimes(0);
        expect(console.warn).toBeCalledTimes(0);
      });

      it("requires tokens with user id specification", () => {
        expect(storage.getTokens).toBeCalledTimes(1);
        expect(storage.getTokens).toBeCalledWith("custom-user-id");
      });

      it("does send any request", () => {
        expect(sendRequest).toBeCalledTimes(0);
      });
    });
  });
});

describe("when getValidAccessToken is called multiple times", () => {
  beforeEach(() => {
    sendRequest.mockImplementation(() =>
      Promise.resolve({
        data: {
          "@type": "success",
          sub: "user-id",
          token: "new-access-token",
          refreshToken: "new-refresh-token",
          expiration_time: new Date("2023-01-01T00:00:00+00:00").getTime() / 1000,
        },
      }),
    );
    const options = {
      refreshTokenParam: "custom-refresh-token",
    };
    return Promise.all([getValidAccessToken(options), getValidAccessToken(options)]);
  });

  it("prints a warning to the console", () => {
    expect(console.log).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
    expect(console.debug).toBeCalledTimes(0);
    expect(console.warn).toBeCalledTimes(1);
    expect(console.warn).toBeCalledWith(
      "Multiple refresh token requests detected. You should not create a new request until you get a server response to the previous one.",
    );
  });

  it("sends one request only", () => {
    expect(sendRequest).toBeCalledTimes(1);
  });
});
