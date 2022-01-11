const isConfigMissingField = require("../isConfigMissingField");

describe("when required fields are not specified", () => {
  it("returns a correct value", () => {
    expect(
      isConfigMissingField({
        login_app: "login-app",
        redirect_uri: "/redirect/uri",
        response_type: "response-type",
        client_id: "client-id",
        state: "state",
        scope: "scope",
        nonce: "nonce",
      }),
    ).toBeUndefined();

    expect(
      isConfigMissingField({
        login_app: "login-app",
        redirect_uri: "/redirect/uri",
        client_id: "client-id",
        state: "state",
        scope: "scope",
        nonce: "nonce",
      }),
    ).toBe("response_type");

    expect(
      isConfigMissingField({
        login_app: "login-app",
        redirect_uri: "/redirect/uri",
      }),
    ).toBe("response_type");
  });
});

describe("when required fields are specified", () => {
  it("returns a correct value", () => {
    expect(
      isConfigMissingField(
        {
          login_app: "login-app",
          client_id: "client-id",
        },
        ["login_app", "client_id"],
      ),
    ).toBeUndefined();

    expect(
      isConfigMissingField(
        {
          client_id: "client-id",
        },
        ["login_app", "client_id"],
      ),
    ).toBe("login_app");
  });
});
