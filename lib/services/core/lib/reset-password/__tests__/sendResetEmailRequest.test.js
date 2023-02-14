const { getThreadId } = require("../../storage");

// Locals
const { sendRequest } = require("../../../utils/helpers");
const sendResetEmailRequest = require("../sendResetEmailRequest");

jest.mock("../../storage");
jest.mock("../../../utils/helpers");

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
    applicationId: "123",
  },
};

const email = "user@example.com";
let returnedValue;

beforeEach(async () => {
  getThreadId.mockImplementation(() => "stored-thread-id");
  sendRequest.mockImplementation(() =>
    Promise.resolve({
      "@type": "success",
    }),
  );

  returnedValue = await sendResetEmailRequest(email);
});

it("sends a correct request", () => {
  expect(sendRequest).toBeCalledTimes(1);
  expect(sendRequest).toBeCalledWith(
    "https://example.com/auth/v2/123",
    "POST",
    {
      "~thread": {
        thid: "stored-thread-id",
      },
      "@type": "form",
      username: email,
    },
    {
      actionName: "reset-email",
    },
  );
});

it("returns a correct value", () => {
  expect(returnedValue).toEqual({
    "@type": "success",
  });
});
