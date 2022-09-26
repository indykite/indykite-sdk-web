const { inputWithLabel } = require("../inputs");

let props;
/**
 * @type {HTMLElement}
 */
let label;
/**
 * @type {HTMLElement}
 */
let input;
/**
 * @type {HTMLElement}
 */
let note;

const createElements = (props) => {
  const result = inputWithLabel(props);
  label = result.label;
  input = result.input;
  note = result.note;
};

const labelStyle =
  "position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap;";
const inputStyle =
  "height: 32px; font-family: 'Rubik', sans-serif; font-size: 11px; border-radius: 5px; outline: none; width: 100% !important; display: block; background: rgb(33, 33, 33); color: rgb(237, 232, 225); box-sizing: border-box; margin-bottom: 4px; padding: 10px 14px;";

beforeEach(() => {
  window.IKSDK = {
    config: { disableInlineStyles: false },
  };

  props = {
    id: "input-id",
    type: "text",
  };
});

describe("when only type and id are set", () => {
  describe("when inline styles are enabled", () => {
    beforeEach(() => {
      createElements(props);
    });

    it("creates an input with the id and type set", () => {
      expect(input.outerHTML).toBe(
        `<input id="input-id" type="text" autocomplete="off" class="IKUISDK-input" style="${inputStyle}">`,
      );
    });

    it("creates a label for the input", () => {
      expect(label.outerHTML).toBe(
        `<label for="input-id" class="IKUISDK-input-label" style="${labelStyle}"></label>`,
      );
    });

    it("does not create a note", () => {
      expect(note).toBeUndefined();
    });
  });

  describe("when inline styles are disabled", () => {
    beforeEach(() => {
      window.IKSDK.config.disableInlineStyles = true;
      createElements(props);
    });

    it("creates an input with the id and type set", () => {
      expect(input.outerHTML).toBe(
        `<input id="input-id" type="text" autocomplete="off" class="IKUISDK-input">`,
      );
    });

    it("creates a label for the input", () => {
      expect(label.outerHTML).toBe(`<label for="input-id" class="IKUISDK-input-label"></label>`);
    });

    it("does not create a note", () => {
      expect(note).toBeUndefined();
    });
  });
});

describe("when type, id and label are set", () => {
  beforeEach(() => {
    props.labelText = "Custom label";
    createElements(props);
  });

  it("creates an input with the id and type set", () => {
    expect(input.outerHTML).toBe(
      `<input id="input-id" type="text" autocomplete="off" class="IKUISDK-input" style="${inputStyle}">`,
    );
  });

  it("creates a label for the input", () => {
    expect(label.innerText).toBe("Custom label");
    expect(label.outerHTML).toBe(
      `<label for="input-id" class="IKUISDK-input-label" style="${labelStyle}"></label>`,
    );
  });

  it("does not create a note", () => {
    expect(note).toBeUndefined();
  });
});

describe("when type, id, required and autocomplete are set", () => {
  beforeEach(() => {
    props.context = { autocomplete: true, required: true };
    createElements(props);
  });

  it("creates an input with the id and type set", () => {
    expect(input.outerHTML).toBe(
      `<input id="input-id" type="text" autocomplete="on" class="IKUISDK-input" required="" style="${inputStyle}">`,
    );
  });

  it("creates a label for the input", () => {
    expect(label.outerHTML).toBe(
      `<label for="input-id" class="IKUISDK-input-label" style="${labelStyle}"></label>`,
    );
  });

  it("does not create a note", () => {
    expect(note).toBeUndefined();
  });
});

describe("when type, id, minlength, maxlength and pattern are set", () => {
  beforeEach(() => {
    props.context = { minlength: 4, maxlength: 8, pattern: "^.{4,8}$" };
    createElements(props);
  });

  it("creates an input with the id and type set", () => {
    expect(input.outerHTML).toBe(
      `<input id="input-id" type="text" autocomplete="off" class="IKUISDK-input" minlength="4" maxlength="8" pattern="^.{4,8}$" style="${inputStyle}">`,
    );
  });

  it("creates a label for the input", () => {
    expect(label.outerHTML).toBe(
      `<label for="input-id" class="IKUISDK-input-label" style="${labelStyle}"></label>`,
    );
  });

  it("does not create a note", () => {
    expect(note).toBeUndefined();
  });
});

describe("when type, id and a note are set", () => {
  beforeEach(() => {
    props.noteText = "<i>Some note</i>";
    createElements(props);
  });

  it("creates an input with the id and type set", () => {
    expect(input.outerHTML).toBe(
      `<input id="input-id" type="text" autocomplete="off" class="IKUISDK-input" style="${inputStyle}">`,
    );
  });

  it("creates a label for the input", () => {
    expect(label.outerHTML).toBe(
      `<label for="input-id" class="IKUISDK-input-label" style="${labelStyle}"></label>`,
    );
  });

  it("creates a note", () => {
    expect(note.outerHTML).toBe(
      '<div class="note" style="font-size: small; position: relative; top: -16px; padding-bottom: 8px;"><i>Some note</i></div>',
    );
  });
});
