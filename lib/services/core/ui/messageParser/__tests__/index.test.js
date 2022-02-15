const messageParser = require("..");
const action = require("../action");
const form = require("../form");
const logical = require("../logical");
const oidc = require("../oidc");
const fail = require("../fail");

jest.mock("../action");
jest.mock("../form");
jest.mock("../logical");
jest.mock("../oidc");
jest.mock("../fail");

let props;

beforeEach(() => {
  jest.resetAllMocks();
  props = {
    context: {},
    anotherKey: 42,
  };
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

describe("when the type is 'unknown'", () => {
  let caughtError;

  beforeEach(() => {
    props.context["@type"] = "unknown";
    caughtError = undefined;

    try {
      messageParser(props);
    } catch (err) {
      caughtError = err;
    }
  });

  it("throws an error", () => {
    expect(caughtError).toBeDefined();
    expect(caughtError.message).toBe('Unknown message type: "unknown"');
  });
});
