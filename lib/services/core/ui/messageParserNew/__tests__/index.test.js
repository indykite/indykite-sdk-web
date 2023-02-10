const messageParser = require("..");
const action = require("../action");
const form = require("../form");
const logical = require("../logical");
const oidc = require("../oidc");
const qr = require("../qr");
const fail = require("../fail");
const message = require("../message");
const verifier = require("../verifier");
const webauthn = require("../webauthn");

jest.mock("../action");
jest.mock("../form");
jest.mock("../logical");
jest.mock("../oidc");
jest.mock("../qr");
jest.mock("../fail");
jest.mock("../message");
jest.mock("../verifier");
jest.mock("../webauthn");

let props;

beforeEach(() => {
  jest.resetAllMocks();
  props = {
    context: {},
    anotherKey: 42,
  };
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe("when the type is 'logical'", () => {
  beforeEach(() => {
    props.context["@type"] = "logical";

    return messageParser(props);
  });

  it("calls the 'logical' message parser", () => {
    expect(logical).toBeCalledTimes(1);
    expect(logical).toBeCalledWith(props, expect.any(Function));
  });

  describe("when the second passed parameter is called", () => {
    beforeEach(() => {
      return logical.mock.calls[0][1]({
        "@type": "oidc",
        yetAnotherKey: 43,
      });
    });

    it("calls the 'oidc' message parser", () => {
      expect(oidc).toBeCalledTimes(1);
      expect(oidc).toBeCalledWith({
        anotherKey: 42,
        context: {
          "@type": "oidc",
          yetAnotherKey: 43,
        },
      });
    });
  });
});

describe("when the type is 'oidc'", () => {
  beforeEach(() => {
    props.context["@type"] = "oidc";

    return messageParser(props);
  });

  it("calls the 'oidc' message parser", () => {
    expect(oidc).toBeCalledTimes(1);
    expect(oidc).toBeCalledWith(props);
  });
});

describe("when the type is 'action'", () => {
  beforeEach(() => {
    props.context["@type"] = "action";

    return messageParser(props);
  });

  it("calls the 'action' message parser", () => {
    expect(action).toBeCalledTimes(1);
    expect(action).toBeCalledWith(props);
  });
});

describe("when the type is 'form'", () => {
  beforeEach(() => {
    props.context["@type"] = "form";

    return messageParser(props);
  });

  it("calls the 'form' message parser", () => {
    expect(form).toBeCalledTimes(1);
    expect(form).toBeCalledWith(props);
  });
});

describe("when the type is 'qr'", () => {
  beforeEach(() => {
    props.context["@type"] = "qr";

    return messageParser(props);
  });

  it("calls the 'qr' message parser", () => {
    expect(qr).toBeCalledTimes(1);
    expect(qr).toBeCalledWith(props);
  });
});

describe("when the type is 'fail'", () => {
  beforeEach(() => {
    props.context["@type"] = "fail";

    return messageParser(props);
  });

  it("calls the 'fail' message parser", () => {
    expect(fail).toBeCalledTimes(1);
    expect(fail).toBeCalledWith(props);
  });
});

describe("when the type is 'message'", () => {
  beforeEach(() => {
    props.context["@type"] = "message";

    return messageParser(props);
  });

  it("calls the 'message' message parser", () => {
    expect(message).toBeCalledTimes(1);
    expect(message).toBeCalledWith(props);
  });
});

describe("when the type is 'message'", () => {
  beforeEach(() => {
    props.context["@type"] = "verifier";

    return messageParser(props);
  });

  it("calls the 'verifier' message parser", () => {
    expect(verifier).toBeCalledTimes(1);
    expect(verifier).toBeCalledWith(props);
  });
});

describe("when the type is 'webauthn'", () => {
  beforeEach(() => {
    props.context["@type"] = "webauthn";

    return messageParser(props);
  });

  it("calls the 'verifier' message parser", () => {
    expect(webauthn).toBeCalledTimes(1);
    expect(webauthn).toBeCalledWith(props);
  });
});

describe("when the type is 'unknown'", () => {
  beforeEach(() => {
    props.context["@type"] = "unknown";

    return messageParser(props);
  });

  it("prints the error", () => {
    expect(console.error).toBeCalledTimes(1);
    expect(console.error).toBeCalledWith('Unknown message type: "unknown"');
  });
});
