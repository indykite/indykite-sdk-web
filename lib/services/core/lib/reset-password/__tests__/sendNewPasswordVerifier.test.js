const { getCv } = require("../../storage");

// Locals
const { sendRequest } = require("../../../utils/helpers");
const sendNewPasswordVerifier = require("../sendNewPasswordVerifier");

jest.mock("../../storage");
jest.mock("../../../utils/helpers");

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
    applicationId: "123",
  },
};

const threadId = "thread-id";
let returnedValue;

beforeEach(async () => {
  getCv.mockImplementation(() => "code-verifier");
  sendRequest.mockImplementation(() =>
    Promise.resolve({
      "@type": "success",
    }),
  );

  returnedValue = await sendNewPasswordVerifier(threadId);
});

it("sends a correct request", () => {
  expect(sendRequest).toBeCalledTimes(1);
  expect(sendRequest).toBeCalledWith(
    "https://example.com/auth/v2/123",
    "POST",
    {
      "~thread": {
        thid: threadId,
      },
      "@type": "verifier",
      cv: "code-verifier",
    },
    {
      actionName: "new-password-verifier",
    },
  );
});

it("returns a correct value", () => {
  expect(returnedValue).toEqual({
    "@type": "success",
  });
});
