# Changelog

### [0.1.11](https://github.com/indykite/jarvis-sdk-web/compare/v0.1.10...v0.1.11) (2022-02-10)


### Bug Fixes

* **api:** handle click with custom components ([177beea](https://github.com/indykite/jarvis-sdk-web/commit/177beeab65a9ac82b96da6f7113bbf53feae1f1e))

### [0.1.10](https://github.com/indykite/jarvis-sdk-web/compare/v0.1.9...v0.1.10) (2022-02-09)

### Features

- display error on problems during rendering ([3116482](https://github.com/indykite/jarvis-sdk-web/commit/311648207e8eab80d5be06a1957dcfa63da64da5))
- `IKUICore.renderLogin` accepts `onLoginFail` property
- `IKUICore.renderRegister` accepts `onRegistrationFail` property

### Bug Fixes

- update es-check package ([336f50e](https://github.com/indykite/jarvis-sdk-web/commit/336f50e317830e1cad03d22b66cc73af65a161f2))

## 0.1.9

- [FIX] Fixed TypeScript definition of `IKUIOidc.oidcSetup` function
- [DOCS] Updated `README.md` so that it reflects changes in the `IKUIOidc.oidcSetup` function

## 0.1.8

- [FIX] Fix `renderLogin` and `loginSetup` functions so that they don't try to render the login form when the page will be redirected.
- [REFACTOR] Divide big files (index, login and reset-password.js) into multiple smaller files
- [TEST] Add unit tests so the code coverage is above 80% level

## 0.1.7

- [FIX] Minor code fixes
- [TEST] Added unit tests

## 0.1.6

- [FIX] Fixed unhandled error thrown when you wanted reset your password with empty email input.

## 0.1.5

- [FIX] When you are in the OAuth2 flow and you want to login using a different OAuth provider, then there was a problem with the redirection to the original domain.

## 0.1.4

- [Fix] Updated README with correct links
- [CI/CD] Add a test coverage report to PRs

## 0.1.3

- [FEATURE] Allow to specify login_app parameter in a OIDC request

## 0.1.2

- [ACTIONS] Add a release GA pipeline
- [FIX] Fix the badge url path in README

## 0.1.1

- [RELEASE] Initial Release
