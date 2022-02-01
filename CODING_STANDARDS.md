# Coding standards

- 2 spaces for indentation
- UNIX-style newlines (\n)
- No trailing spaces
- Limit your lines to 120 characters
- Use semicolons after commands
- Use double quotes
- Use `const` and `let` for variable declarations instead of `var`
- Try not to use `import * from ...`
- Put opening braces on the same line as `if`/`while`/`for-each`/... statements

```js
if (condition) {
  ...
}
```

- Use lowerCamelCase for directory/file names
- Use lowerCamelCase for variable/function names
- Use UPPERCASE for constants
- Use trailing commas

```js
{
  key1: "value1",
  key2: "value2",
}
```

- Declare one variable per var statement

```js
const variableA = 42;
const variableB = "foo";
```

- Do not use `==` and `!=` conditions
- Try to write functions as small as possible
- Return early from functions (do not nest deeply)

```js
function isPercentage(val) {
  if (val < 0) {
    return false;
  }
  if (val > 100) {
    return false;
  }
  return true;
}
```

- When a file contains a lot of functions divide it into smaller files
- Mark function as `async` when it returns a promise
- Use `async`/`await` instead of callbacks (when possible)
- Catch unhandled promise rejections
- Use arrow functions
- When an error is thrown, it should be instance of the `Error` object.
- Write JSDocs whenever it's meaningful

# Files structure

- Put your code into `lib/services/core` folder
- Put unit tests into `__tests__` folder within the folder where the tested file is located
- Unit tests have to have `*.test.js` suffix
