const inputWithLabel = ({ type, id, labelText, autofocus, noteText, context }) => {
  const disableInlineStyles = window.IKSDK.config.disableInlineStyles;
  const label = document.createElement("label");
  label.innerText = labelText || "";
  label.setAttribute("for", id);
  label.className = "IKUISDK-input-label";

  const input = document.createElement("input");

  input.id = id;
  input.type = type;
  input.autocomplete = "off";
  input.autofocus = autofocus;
  input.className = "IKUISDK-input";

  if (context) {
    if (context.required) {
      input.required = true;
    }
    if (context.autocomplete) {
      input.autocomplete = "on";
    }
    if (context.minlength) {
      input.minLength = context.minlength.toString();
    }
    if (context.maxlength) {
      input.maxLength = context.maxlength.toString();
    }
    if (context.pattern) {
      input.pattern = context.pattern;
    }
    if (labelText) {
      input.placeholder = labelText;
    }
  }

  const note = noteText && document.createElement("div");
  if (note) {
    note.innerHTML = noteText;
    note.className = "note";
  }

  if (!disableInlineStyles) {
    label.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0px;
      margin: -1px;
      overflow: hidden;
      clip: rect(0px, 0px, 0px, 0px);
      white-space: nowrap;
    `;

    input.style.cssText = `
      height: 32px;
      font-family: 'Rubik', sans-serif;
      font-size: 11px;
      border-radius: 5px;
      border: none;
      outline: none;
      width: 100% !important;
      display: block; 
      background: rgb(33, 33, 33);
      color: rgb(237, 232, 225); 
      box-sizing: border-box;
      margin-bottom: 4px;
      padding: 10px 14px;
    `;

    if (note) {
      note.style.cssText = `
        font-size: small;
        position: relative;
        top: -16px;
        padding-bottom: 8px;
      `;
    }
  }

  return { label, input, note };
};

module.exports = {
  inputWithLabel,
};
