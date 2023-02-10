const { base64ToArrayBuffer, sendRequest } = require("../../../utils/helpers");
const { getBaseAuthUrl } = require("../../config");
const { getThreadId } = require("../../storage");
const handleAssertCredentials = require("../handleAssertCredentials");

jest.mock("../../../utils/helpers", () => {
  const actualModule = jest.requireActual("../../../utils/helpers");
  return {
    ...actualModule,
    sendRequest: jest.fn(),
  };
});
jest.mock("../../config");
jest.mock("../../storage");
jest.mock("../../../ui/components/dialogs");

beforeEach(() => {
  navigator.credentials = {
    get: jest.fn().mockImplementation(() => {
      return {
        authenticatorAttachment: "platform",
        id: "Y3JlZGVudGlhbElk",
        rawId: base64ToArrayBuffer("Y3JlZGVudGlhbElk"),
        response: {
          authenticatorData: base64ToArrayBuffer("YXV0aGVudGljYXRvckRhdGE"),
          clientDataJSON: base64ToArrayBuffer(
            "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiYkdHcGJudDhLaWJhS0hvbTlnaHlrTGRzLXpNNk9zVmJqU2FXUTVXNjgzSSIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2UsImFsZyI6IkhTMzg0In0",
          ),
          signature: base64ToArrayBuffer("c2lnbmF0dXJlVG9rZW4"),
          userHandle: base64ToArrayBuffer("dXNlckhhbmRsZVRva2Vu"),
        },
        type: "public-key",
      };
    }),
    create: jest.fn(),
  };
  getBaseAuthUrl.mockImplementation(() => "https://example.com");
  getThreadId.mockImplementation(() => "mocked-thread-id");
});

afterEach(() => {
  jest.resetAllMocks();
  delete navigator.credentials;
});

describe("when allowCredentials object is present", () => {
  const request = {
    "@type": "webauthn",
    publicKey: {
      challenge: "Y2hhbGxlbmdlVG9rZW4",
      timeout: 60000,
      rpId: "https://example.com",
      allowCredentials: [
        {
          type: "public-key",
          id: "YWxsb3dDcmVkZW50aWFsSWQ",
        },
      ],
      userVerification: "preferred",
    },
  };

  beforeEach(async () => {
    await handleAssertCredentials(request.publicKey);
  });

  it("sends a correct response", () => {
    expect(sendRequest).toBeCalledTimes(1);
    expect(sendRequest).toBeCalledWith(
      "https://example.com",
      "POST",
      {
        "@type": "webauthn",
        publicKeyCredential: {
          authenticatorAttachment: "platform",
          id: "Y3JlZGVudGlhbElk",
          rawId: "Y3JlZGVudGlhbElk",
          response: {
            authenticatorData: "YXV0aGVudGljYXRvckRhdGE",
            clientDataJSON:
              "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiYkdHcGJudDhLaWJhS0hvbTlnaHlrTGRzLXpNNk9zVmJqU2FXUTVXNjgzSSIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2UsImFsZyI6IkhTMzg0In0",
            signature: "c2lnbmF0dXJlVG9rZW4",
            userHandle: "dXNlckhhbmRsZVRva2Vu",
          },
          type: "public-key",
        },
        "~thread": {
          thid: "mocked-thread-id",
        },
      },
      { actionName: "webauthn-assert" },
    );
  });

  it("asserts the webauthn credential", () => {
    expect(navigator.credentials.get).toBeCalledTimes(1);
    expect(navigator.credentials.get).toBeCalledWith({
      publicKey: {
        allowCredentials: [
          {
            id: Uint8Array.from([
              97,
              108,
              108,
              111,
              119,
              67,
              114,
              101,
              100,
              101,
              110,
              116,
              105,
              97,
              108,
              73,
              100,
            ]),
            type: "public-key",
          },
        ],
        challenge: Uint8Array.from([
          99,
          104,
          97,
          108,
          108,
          101,
          110,
          103,
          101,
          84,
          111,
          107,
          101,
          110,
        ]),
        rpId: "https://example.com",
        timeout: 60000,
        userVerification: "preferred",
      },
    });
  });
});

describe("when allowCredentials object is not present", () => {
  const request = {
    "@type": "webauthn",
    publicKey: {
      challenge: "Y2hhbGxlbmdlVG9rZW4",
      timeout: 60000,
      rpId: "https://example.com",
      userVerification: "preferred",
    },
  };

  beforeEach(async () => {
    await handleAssertCredentials(request.publicKey);
  });

  it("sends a correct response", () => {
    expect(sendRequest).toBeCalledTimes(1);
    expect(sendRequest).toBeCalledWith(
      "https://example.com",
      "POST",
      {
        "@type": "webauthn",
        publicKeyCredential: {
          authenticatorAttachment: "platform",
          id: "Y3JlZGVudGlhbElk",
          rawId: "Y3JlZGVudGlhbElk",
          response: {
            authenticatorData: "YXV0aGVudGljYXRvckRhdGE",
            clientDataJSON:
              "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiYkdHcGJudDhLaWJhS0hvbTlnaHlrTGRzLXpNNk9zVmJqU2FXUTVXNjgzSSIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2UsImFsZyI6IkhTMzg0In0",
            signature: "c2lnbmF0dXJlVG9rZW4",
            userHandle: "dXNlckhhbmRsZVRva2Vu",
          },
          type: "public-key",
        },
        "~thread": {
          thid: "mocked-thread-id",
        },
      },
      { actionName: "webauthn-assert" },
    );
  });

  it("asserts the webauthn credential", () => {
    expect(navigator.credentials.get).toBeCalledTimes(1);
    expect(navigator.credentials.get).toBeCalledWith({
      publicKey: {
        challenge: Uint8Array.from([
          99,
          104,
          97,
          108,
          108,
          101,
          110,
          103,
          101,
          84,
          111,
          107,
          101,
          110,
        ]),
        rpId: "https://example.com",
        timeout: 60000,
        userVerification: "preferred",
      },
    });
  });
});

describe("when navigator.credentials.get throws an error", () => {
  const request = {
    "@type": "webauthn",
    publicKey: {
      challenge: "Y2hhbGxlbmdlVG9rZW4",
      timeout: 60000,
      rpId: "https://example.com",
      userVerification: "preferred",
    },
  };

  describe("when the error is not allowed type", () => {
    let caughtError;

    beforeEach(async () => {
      caughtError = null;

      navigator.credentials.get.mockImplementation(() => {
        throw new Error(
          "The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.",
        );
      });

      return handleAssertCredentials(request.publicKey).catch((err) => {
        caughtError = err;
      });
    });

    it("does not send any response", () => {
      expect(sendRequest).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError.message).toEqual("The operation either timed out or was aborted.");
    });
  });

  describe("when it is a different error", () => {
    let caughtError;

    beforeEach(async () => {
      caughtError = null;

      navigator.credentials.get.mockImplementation(() => {
        throw new Error("Some other error");
      });

      return handleAssertCredentials(request.publicKey).catch((err) => {
        caughtError = err;
      });
    });

    it("does not send any response", () => {
      expect(sendRequest).toBeCalledTimes(0);
    });

    it("throws an error", () => {
      expect(caughtError.message).toEqual("Some other error");
    });
  });
});
