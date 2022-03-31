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

beforeEach(() => {
  props = {
    id: "input-id",
    type: "text",
  };
});

describe("when only type and id are set", () => {
  beforeEach(() => {
    createElements(props);
  });

  it("creates an input with the id and type set", () => {
    expect(input.outerHTML).toBe(
      '<input id="input-id" type="text" autocomplete="off" style="height: 45px; font-family: \'Raleway\', sans-serif; font-size: 14px; border-radius: 6px; outline: none; width: 100% !important; display: block; color: black; box-sizing: border-box; margin-top: 5px; margin-bottom: 20px; padding: 5px 10px;">',
    );
  });

  it("creates a label for the input", () => {
    expect(label.outerHTML).toBe(
      '<label style="font-family: \'Raleway\', sans-serif; font-size: 16px; width: 100% !important; display: block; text-transform: capitalize;" for="input-id"></label>',
    );
  });

  it("does not create a note", () => {
    expect(note).toBeUndefined();
  });
});

describe("when type, id and label are set", () => {
  beforeEach(() => {
    props.labelText = "Custom label";
    createElements(props);
  });

  it("creates an input with the id and type set", () => {
    expect(input.outerHTML).toBe(
      '<input id="input-id" type="text" autocomplete="off" style="height: 45px; font-family: \'Raleway\', sans-serif; font-size: 14px; border-radius: 6px; outline: none; width: 100% !important; display: block; color: black; box-sizing: border-box; margin-top: 5px; margin-bottom: 20px; padding: 5px 10px;">',
    );
  });

  it("creates a label for the input", () => {
    expect(label.innerText).toBe("Custom label");
    expect(label.outerHTML).toBe(
      '<label style="font-family: \'Raleway\', sans-serif; font-size: 16px; width: 100% !important; display: block; text-transform: capitalize;" for="input-id"></label>',
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
      '<input id="input-id" type="text" autocomplete="on" style="height: 45px; font-family: \'Raleway\', sans-serif; font-size: 14px; border-radius: 6px; outline: none; width: 100% !important; display: block; color: black; box-sizing: border-box; margin-top: 5px; margin-bottom: 20px; padding: 5px 10px;" required="">',
    );
  });

  it("creates a label for the input", () => {
    expect(label.outerHTML).toBe(
      '<label style="font-family: \'Raleway\', sans-serif; font-size: 16px; width: 100% !important; display: block; text-transform: capitalize;" for="input-id"></label>',
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
      '<input id="input-id" type="text" autocomplete="off" style="height: 45px; font-family: \'Raleway\', sans-serif; font-size: 14px; border-radius: 6px; outline: none; width: 100% !important; display: block; color: black; box-sizing: border-box; margin-top: 5px; margin-bottom: 20px; padding: 5px 10px;" minlength="4" maxlength="8" pattern="^.{4,8}$">',
    );
  });

  it("creates a label for the input", () => {
    expect(label.outerHTML).toBe(
      '<label style="font-family: \'Raleway\', sans-serif; font-size: 16px; width: 100% !important; display: block; text-transform: capitalize;" for="input-id"></label>',
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
      '<input id="input-id" type="text" autocomplete="off" style="height: 45px; font-family: \'Raleway\', sans-serif; font-size: 14px; border-radius: 6px; outline: none; width: 100% !important; display: block; color: black; box-sizing: border-box; margin-top: 5px; margin-bottom: 20px; padding: 5px 10px;">',
    );
  });

  it("creates a label for the input", () => {
    expect(label.outerHTML).toBe(
      '<label style="font-family: \'Raleway\', sans-serif; font-size: 16px; width: 100% !important; display: block; text-transform: capitalize;" for="input-id"></label>',
    );
  });

  it("creates a note", () => {
    expect(note.outerHTML).toBe(
      '<div class="note" style="font-size: small; position: relative; top: -16px; padding-bottom: 8px;"><i>Some note</i></div>',
    );
  });
});
