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
  let getCvMock;

  beforeEach(() => {
    sendRequestMock = jest.spyOn(helpers, "sendRequest").mockImplementation(emptyFn);
    getCvMock = jest.spyOn(storage, "getCv").mockImplementation(() => "abc");
    const sendVerifierForLoginOrRegister = require("../sendVerifierForLoginOrRegister");
    sendVerifierForLoginOrRegister("xyz");
  });

  afterEach(() => {
    sendRequestMock.mockRestore();
    getCvMock.mockRestore();
  });

  it("sends a correct request", () => {
    expect(sendRequestMock).toBeCalledTimes(1);
    const [url, method, data, options] = sendRequestMock.mock.calls[0];
    expect(url).toBe("http://www.example.com/auth/12345");
    expect(method.toLowerCase()).toBe("post");
    expect(data).toEqual({
      "~thread": {
        thid: "xyz",
      },
      "@type": "verifier",
      cv: "abc",
    });
    expect(options).toEqual({
      actionName: "send-verifier",
    });
  });
});
