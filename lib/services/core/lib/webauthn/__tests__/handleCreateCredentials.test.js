const { base64ToArrayBuffer, sendRequest } = require("../../../utils/helpers");
const { getBaseAuthUrl } = require("../../config");
const { getThreadId } = require("../../storage");
const handleCreateCredentials = require("../handleCreateCredentials");
const modalDialog = require("../../../ui/components/dialogs");

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
    create: jest.fn().mockImplementation(() => {
      return {
        authenticatorAttachment: "platform",
        id: "Y3JlZGVudGlhbElk",
        rawId: base64ToArrayBuffer("Y3JlZGVudGlhbElk"),
        response: {
          attestationObject: base64ToArrayBuffer("YXR0ZXN0YXRpb25PYmplY3RJZA"),
          clientDataJSON: base64ToArrayBuffer(
            "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWTJoaGJHeGxibWRsVkc5clpXNCIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2UsImFsZyI6IkhTMzg0In0",
          ),
        },
        type: "public-key",
      };
    }),
    get: jest.fn(),
  };
  getBaseAuthUrl.mockImplementation(() => "https://example.com");
  modalDialog.mockImplementationOnce(() => ({
    "IKUISDK-modal-username": "",
    "IKUISDK-modal-displayName": "",
  }));
  modalDialog.mockImplementationOnce(() => ({
    "IKUISDK-modal-username": "username-mock",
    "IKUISDK-modal-displayName": "Username Mock",
  }));
  getThreadId.mockImplementation(() => "mocked-thread-id");
});

afterEach(() => {
  jest.resetAllMocks();
  delete navigator.credentials;
});

describe("when username and display name are predefined", () => {
  const request = {
    "@type": "webauthn",
    publicKey: {
      challenge: "Y2hhbGxlbmdlVG9rZW4",
      rp: {
        name: "RP test",
        id: "https://example.com",
      },
      user: {
        name: "user@example.com",
        id: "dXNlcklk",
      },
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -2,
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: true,
        userVerification: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    },
  };

  beforeEach(async () => {
    await handleCreateCredentials(request.publicKey);
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
            attestationObject: "YXR0ZXN0YXRpb25PYmplY3RJZA",
            clientDataJSON:
              "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWTJoaGJHeGxibWRsVkc5clpXNCIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2UsImFsZyI6IkhTMzg0In0",
          },
          type: "public-key",
        },
        "~thread": {
          thid: "mocked-thread-id",
        },
      },
      { actionName: "webauthn-create" },
    );
  });

  it("does not open any modal dialogs", () => {
    expect(modalDialog).toBeCalledTimes(0);
  });

  it("creates the webauthn credential", () => {
    expect(navigator.credentials.create).toBeCalledTimes(1);
    expect(navigator.credentials.create).toBeCalledWith({
      publicKey: {
        attestation: "none",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: true,
          userVerification: "preferred",
        },
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
        pubKeyCredParams: [{ alg: -2, type: "public-key" }],
        rp: {
          id: "https://example.com",
          name: "RP test",
        },
        timeout: 60000,
        user: {
          displayName: "user@example.com",
          id: Uint8Array.from([117, 115, 101, 114, 73, 100]),
          name: "user@example.com",
        },
      },
    });
  });
});

describe("when username and display name are not predefined", () => {
  const request = {
    "@type": "webauthn",
    publicKey: {
      challenge: "Y2hhbGxlbmdlVG9rZW4",
      rp: {
        name: "RP test",
        id: "https://example.com",
      },
      user: {
        name: "[ASK]",
        displayName: "[ASK]",
        id: "dXNlcklk",
      },
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -2,
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: true,
        userVerification: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    },
  };

  beforeEach(async () => {
    await handleCreateCredentials(request.publicKey);
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
            attestationObject: "YXR0ZXN0YXRpb25PYmplY3RJZA",
            clientDataJSON:
              "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWTJoaGJHeGxibWRsVkc5clpXNCIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2UsImFsZyI6IkhTMzg0In0",
          },
          type: "public-key",
        },
        "~thread": {
          thid: "mocked-thread-id",
        },
      },
      { actionName: "webauthn-create" },
    );
  });

  it("opens a modal dialog", () => {
    expect(modalDialog).toBeCalledTimes(2);
    expect(modalDialog).nthCalledWith(1, [
      {
        id: "IKUISDK-modal-username",
        label: "Enter your username",
        type: "input",
        value: "",
      },
      {
        id: "IKUISDK-modal-displayName",
        label: "Enter your display name",
        type: "input",
        value: "",
      },
      {
        label: "Confirm",
        type: "submit",
      },
    ]);
    expect(modalDialog).nthCalledWith(2, [
      {
        id: "IKUISDK-modal-username",
        label: "Enter your username",
        type: "input",
        value: "",
      },
      {
        id: "IKUISDK-modal-displayName",
        label: "Enter your display name",
        type: "input",
        value: "",
      },
      {
        label: "Confirm",
        type: "submit",
      },
    ]);
  });

  it("creates the webauthn credential", () => {
    expect(navigator.credentials.create).toBeCalledTimes(1);
    expect(navigator.credentials.create).toBeCalledWith({
      publicKey: {
        attestation: "none",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: true,
          userVerification: "preferred",
        },
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
        pubKeyCredParams: [{ alg: -2, type: "public-key" }],
        rp: {
          id: "https://example.com",
          name: "RP test",
        },
        timeout: 60000,
        user: {
          displayName: "Username Mock",
          id: Uint8Array.from([117, 115, 101, 114, 73, 100]),
          name: "username-mock",
        },
      },
    });
  });
});
