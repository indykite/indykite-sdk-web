const { getFPThreadId } = require("../../storage");

// Locals
const { sendRequest } = require("../../../utils/helpers");
const sendNewPasswordRequest = require("../sendNewPasswordRequest");

jest.mock("../../storage");
jest.mock("../../../utils/helpers");

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
    applicationId: "123",
  },
};

const newPassword = "new-password";
let returnedValue;

beforeEach(async () => {
  getFPThreadId.mockImplementation(() => "stored-forgotten-password-thread-id");
  sendRequest.mockImplementation(() =>
    Promise.resolve({
      "@type": "success",
    }),
  );

  returnedValue = await sendNewPasswordRequest(newPassword);
});

it("sends a correct request", () => {
  expect(sendRequest).toBeCalledTimes(1);
  expect(sendRequest).toBeCalledWith(
    "https://example.com/auth/v2/123",
    "POST",
    {
      "~thread": {
        thid: "stored-forgotten-password-thread-id",
      },
      "@type": "form",
      password: newPassword,
    },
    {
      actionName: "new-password-request",
    },
  );
});

it("returns a correct value", () => {
  expect(returnedValue).toEqual({
    "@type": "success",
  });
});
