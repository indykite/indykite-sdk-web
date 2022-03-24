const logical = require("../logical");

/**
 * @type {{
 *   htmlContainer: HTMLDivElement
 * }}
 */
let props;
const optionCallback = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();

  props = {
    context: {
      "@type": "logical",
      op: "or",
    },
    labels: {
      default: {
        orOtherOptions: "or other options",
      },
    },
    htmlContainer: document.createElement("div"),
  };
});

describe("when no options are present", () => {
  beforeEach(() => {
    logical(props, optionCallback);
  });

  it("does not push anything into html container", () => {
    expect(props.htmlContainer.childNodes.length).toBe(0);
  });

  it("does not call optionCallback", () => {
    expect(optionCallback).toBeCalledTimes(0);
  });
});

describe("when one option is present", () => {
  beforeEach(() => {
    props.context.opts = [
      {
        "@type": "action",
        hint: "register",
        "~ord": 0,
      },
    ];

    logical(props, optionCallback);
  });

  it("does not push anything into html container", () => {
    expect(props.htmlContainer.childNodes.length).toBe(0);
  });

  it("calls optionCallback with the options", () => {
    expect(optionCallback).toBeCalledTimes(1);
    expect(optionCallback).nthCalledWith(1, {
      "@type": "action",
      hint: "register",
      "~ord": 0,
    });
  });
});

describe("when two options are present", () => {
  describe("when the actions have the same type", () => {
    beforeEach(() => {
      props.context.opts = [
        {
          "@type": "action",
          hint: "register",
          "~ord": 0,
        },
        {
          "@type": "action",
          hint: "forgotten",
          "~ord": 1,
        },
      ];

      logical(props, optionCallback);
    });

    it("does not push anything into html container", () => {
      expect(props.htmlContainer.childNodes.length).toBe(0);
    });

    it("calls optionCallback with the options", () => {
      expect(optionCallback).toBeCalledTimes(2);
      expect(optionCallback).nthCalledWith(1, {
        "@type": "action",
        hint: "register",
        "~ord": 0,
      });
      expect(optionCallback).nthCalledWith(2, {
        "@type": "action",
        hint: "forgotten",
        "~ord": 1,
      });
    });
  });

  describe("when the actions have different types", () => {
    describe("[form, action]", () => {
      /**
       * @type {jest.SpyInstance}
       */
      let appendChildSpy;

      beforeEach(() => {
        props.context.opts = [
          {
            "@type": "form",
            "@id": "form-id",
            "~ord": 0,
          },
          {
            "@type": "action",
            hint: "register",
            "~ord": 1,
          },
        ];

        const originalAppendChild = props.htmlContainer.appendChild;
        appendChildSpy = jest
          .spyOn(props.htmlContainer, "appendChild")
          .mockImplementation((child) => {
            // check whether form is rendered before the divider is appended
            expect(optionCallback).toBeCalledTimes(1);
            expect(optionCallback).nthCalledWith(1, {
              "@type": "form",
              "@id": "form-id",
              "~ord": 0,
            });
            originalAppendChild.call(props.htmlContainer, child);
          });

        logical(props, optionCallback);
      });

      it("renders divider between options", () => {
        expect(props.htmlContainer.childNodes.length).toBe(1);
      });

      it("calls optionCallback with the options", () => {
        expect(optionCallback).toBeCalledTimes(2);
        expect(optionCallback).nthCalledWith(1, {
          "@type": "form",
          "@id": "form-id",
          "~ord": 0,
        });
        expect(optionCallback).nthCalledWith(2, {
          "@type": "action",
          hint: "register",
          "~ord": 1,
        });
      });
    });

    describe("[action, form]", () => {
      beforeEach(() => {
        props.context.opts = [
          {
            "@type": "action",
            hint: "register",
            "~ord": 0,
          },
          {
            "@type": "form",
            "@id": "form-id",
            "~ord": 1,
          },
        ];

        logical(props, optionCallback);
      });

      it("renders divider between options", () => {
        expect(props.htmlContainer.childNodes.length).toBe(1);
      });

      it("calls optionCallback with the options", () => {
        expect(optionCallback).toBeCalledTimes(2);
        expect(optionCallback).nthCalledWith(1, {
          "@type": "form",
          "@id": "form-id",
          "~ord": 1,
        });
        expect(optionCallback).nthCalledWith(2, {
          "@type": "action",
          hint: "register",
          "~ord": 0,
        });
      });
    });

    describe("[oidc, form]", () => {
      beforeEach(() => {
        props.context.opts = [
          {
            "@type": "oidc",
            prv: "indykite.me",
            "~ord": 0,
          },
          {
            "@type": "form",
            "@id": "form-id",
            "~ord": 1,
          },
        ];

        const originalAppendChild = props.htmlContainer.appendChild;
        appendChildSpy = jest
          .spyOn(props.htmlContainer, "appendChild")
          .mockImplementation((child) => {
            // check whether form is rendered before the divider is appended
            expect(optionCallback).toBeCalledTimes(1);
            expect(optionCallback).nthCalledWith(1, {
              "@type": "form",
              "@id": "form-id",
              "~ord": 1,
            });
            originalAppendChild.call(props.htmlContainer, child);
          });
      });

      describe("when no custom labels are used", () => {
        beforeEach(() => {
          logical(props, optionCallback);
        });

        it("renders divider and 'or other options' between options", () => {
          expect(props.htmlContainer.childNodes.length).toBe(2);
          expect(props.htmlContainer.children.item(0).tagName.toLowerCase()).toBe("hr");
          expect(props.htmlContainer.children.item(1).tagName.toLowerCase()).toBe("p");
          expect(props.htmlContainer.children.item(1).innerText).toBe("or other options");
          expect(props.htmlContainer.children.item(1).className).toBe("oidc-options-label");
        });

        it("calls optionCallback with the options", () => {
          expect(optionCallback).toBeCalledTimes(2);
          expect(optionCallback).nthCalledWith(1, {
            "@type": "form",
            "@id": "form-id",
            "~ord": 1,
          });
          expect(optionCallback).nthCalledWith(2, {
            "@type": "oidc",
            prv: "indykite.me",
            "~ord": 0,
          });
        });
      });

      describe("when custom labels are used", () => {
        beforeEach(() => {
          props.labels.custom = {
            orOtherOptions: "or try other options",
          };

          logical(props, optionCallback);
        });

        it("renders divider and 'or other options' between options", () => {
          expect(props.htmlContainer.childNodes.length).toBe(2);
          expect(props.htmlContainer.children.item(0).tagName.toLowerCase()).toBe("hr");
          expect(props.htmlContainer.children.item(1).tagName.toLowerCase()).toBe("p");
          expect(props.htmlContainer.children.item(1).innerText).toBe("or try other options");
          expect(props.htmlContainer.children.item(1).className).toBe("oidc-options-label");
        });

        it("calls optionCallback with the options", () => {
          expect(optionCallback).toBeCalledTimes(2);
          expect(optionCallback).nthCalledWith(1, {
            "@type": "form",
            "@id": "form-id",
            "~ord": 1,
          });
          expect(optionCallback).nthCalledWith(2, {
            "@type": "oidc",
            prv: "indykite.me",
            "~ord": 0,
          });
        });
      });
    });

    describe("[unknown, form]", () => {
      beforeEach(() => {
        props.context.opts = [
          {
            "@type": "unknown",
            "~ord": 0,
          },
          {
            "@type": "form",
            "@id": "form-id",
            "~ord": 1,
          },
        ];

        logical(props, optionCallback);
      });

      it("renders divider between options", () => {
        expect(props.htmlContainer.childNodes.length).toBe(1);
      });

      it("calls optionCallback with the options", () => {
        expect(optionCallback).toBeCalledTimes(2);
        expect(optionCallback).nthCalledWith(1, {
          "@type": "form",
          "@id": "form-id",
          "~ord": 1,
        });
        expect(optionCallback).nthCalledWith(2, {
          "@type": "unknown",
          "~ord": 0,
        });
      });
    });
  });
});

describe("when operation is not 'or'", () => {
  let error;

  beforeEach(() => {
    props.context.op = "and";
    try {
      logical(props, optionCallback);
    } catch (err) {
      error = err;
    }
  });

  it("does not push anything into html container", () => {
    expect(error.message).toBe("Incorrect operation (and) of logic type.");
  });

  it("does not call optionCallback", () => {
    expect(optionCallback).toBeCalledTimes(0);
  });
});