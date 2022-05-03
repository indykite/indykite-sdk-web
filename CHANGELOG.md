# Changelog

### [0.1.15](https://github.com/indykite/jarvis-sdk-web/compare/v0.1.14...v0.1.15) (2022-05-03)


### Features

* expose refresh access token method ([e4437a6](https://github.com/indykite/jarvis-sdk-web/commit/e4437a698715b0827d5e717b67b4d75910146271))


### Bug Fixes

* allow to specify otp token in render function ([7b284cb](https://github.com/indykite/jarvis-sdk-web/commit/7b284cb2cfa304f4c2ad0f6de79e3995b75915c5))
* upgrade axios from 0.21.4 to 0.26.0 ([8166aaa](https://github.com/indykite/jarvis-sdk-web/commit/8166aaa2fb74955c4995ca7b057e690b75bfcb5f))
* upgrade core-js from 3.20.3 to 3.21.1 ([b8350df](https://github.com/indykite/jarvis-sdk-web/commit/b8350dfa42b2361a101558b62a774cf6651d58b9))
* upgrade intl-messageformat from 9.11.2 to 9.11.4 ([1fa5bc9](https://github.com/indykite/jarvis-sdk-web/commit/1fa5bc9bfee205654624cd2460f441f6aa41aa3e))
* upgrade query-string from 7.1.0 to 7.1.1 ([0fc4708](https://github.com/indykite/jarvis-sdk-web/commit/0fc4708de13e49a3f685d68c5b83f01945dc579b))

### [0.1.14](https://github.com/indykite/jarvis-sdk-web/compare/v0.1.13...v0.1.14) (2022-04-14)


### Features

* **api:** linking flow support ([ef1ec09](https://github.com/indykite/jarvis-sdk-web/commit/ef1ec09eb94ff8fac98a56dec73a79f4ee2877c7))


### Bug Fixes

* render input fields according to server cfg ([38ec5b7](https://github.com/indykite/jarvis-sdk-web/commit/38ec5b79f228a0b71365d72f64f8a319d8a2fc0b))

### [0.1.13](https://github.com/indykite/jarvis-sdk-web/compare/v0.1.12...v0.1.13) (2022-03-29)


### Features

* add render function ([7856c0d](https://github.com/indykite/jarvis-sdk-web/commit/7856c0de4a36beb5ca4d87174ebb00f732c5e6aa))
* refresh ui container after an action click ([a7f7fc8](https://github.com/indykite/jarvis-sdk-web/commit/a7f7fc8074c42fa44ddaac56fb0d5d8e133fd8c5))
* support custom args in setup request ([f1c9dcc](https://github.com/indykite/jarvis-sdk-web/commit/f1c9dcc17459b8ee3f321589dc30a90639d8297e))


### Bug Fixes

* issue with sending reset password email ([5787599](https://github.com/indykite/jarvis-sdk-web/commit/5787599a6442d6f683cd2eb122f855767021d269))
* render a form according to context ([8613d44](https://github.com/indykite/jarvis-sdk-web/commit/8613d44abea886ac86c8e2ca75d7bfb56394955e))
* support redirection in actions ([42e0596](https://github.com/indykite/jarvis-sdk-web/commit/42e0596213ee319c9bee81173658d584fe81438b))
* update type definitions with deprecated props ([2673c5a](https://github.com/indykite/jarvis-sdk-web/commit/2673c5abdeec560763c5004f8c9a5de925ec5f62))

### [0.1.12](https://github.com/indykite/jarvis-sdk-web/compare/v0.1.11...v0.1.12) (2022-02-17)


### Features

* **auth:** allow to login with otp token ([5abb342](https://github.com/indykite/jarvis-sdk-web/commit/5abb342565f90f5e42bc999123d189dfccf0fa60))

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
