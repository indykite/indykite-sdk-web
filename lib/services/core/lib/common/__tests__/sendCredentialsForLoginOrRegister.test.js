const helpers = require("../../../utils/helpers");
const storage = require("../../storage");
const emptyFn = () => {};

beforeAll(() => {
  window.IKSDK = {
    config: {
      baseUri: "http://www.example.com",
      applicationId: "12345",
    },
  };
});

describe("when a request is sent", () => {
  /**
   * @type jest.SpyInstance;
   */
  let sendRequestMock;
  let getThreadIdMock;

  beforeEach(() => {
    sendRequestMock = jest.spyOn(helpers, "sendRequest").mockImplementation(emptyFn);
    getThreadIdMock = jest.spyOn(storage, "getThreadId").mockImplementation(() => "thread-id");
    const sendCredentialsForLoginOrRegister = require("../sendCredentialsForLoginOrRegister");
    sendCredentialsForLoginOrRegister({
      emailValueParam: "email@example.com",
      id: "123",
      passwordValueParam: "passw0rd",
    });
  });

  afterEach(() => {
    sendRequestMock.mockRestore();
    getThreadIdMock.mockRestore();
  });

  it("sends a correct request", () => {
    expect(sendRequestMock).toBeCalledTimes(1);
    const [url, method, data, options] = sendRequestMock.mock.calls[0];
    expect(url).toBe("http://www.example.com/auth/v2/12345");
    expect(method.toLowerCase()).toBe("post");
    expect(data).toEqual({
      "~thread": {
        thid: "thread-id",
      },
      "@type": "form",
      "@id": "123",
      username: "email@example.com",
      password: "passw0rd",
    });
    expect(options).toEqual({
      actionName: "username-password-login",
    });
  });
});
