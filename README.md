<a href="https://indykite.com">
    <img src="logo.png" alt="IndyKite logo" title="IndyKite.ID" align="right" width="200"/>
</a>

# IndyKite Client UI SDK

IndyKite is a cloud identity platform built to secure and manage human & non-person (IoT) identities and their data. This repository containts the JavaScript Library packages for [IndyKite Platform](https://indykite.com/) Client SDK.

This library contains multiple client libraries for each service of the platform.

[![NPM version](https://img.shields.io/npm/v/@indykiteone/jarvis-sdk-web.svg?style=flat-square)](https://www.npmjs.com/package/@indykiteone/jarvis-sdk-web)
![npm type definitions](https://img.shields.io/npm/types/@indykiteone/jarvis-sdk-web?style=flat-square)
[![codecov](https://codecov.io/gh/indykite/jarvis-sdk-web/branch/master/graph/badge.svg?token=33M4Y8GYFV)](https://codecov.io/gh/indykite/jarvis-sdk-web)

In order to access to the platform you must obtain an API key first.

## Terminology

| Definition               | Description                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Digital Twin             | A digital twin is the digital identity of a physical entity on/in a software/identity system     |
| Application Space ID     | ID of the application where the digital twin belongs to                                          |
| Application Agent ID     | ID of the agent which makes the application available for the different calls                    |
| Tenant ID                | ID of the tenant where the digital twin belongs to. The tenant is belong to an application space |
| Private Key and Settings | The secret which required to reach the system. Indykite provides the necessary secrets           |
| Property                 | The digital twin's property (eg.: email, name)                                                   |
| JWT                      | JSON Web Tokens                                                                                  |
| Introspect               | A process used to validate the token and to retrieve properties assigned to the token            |
| Patch property           | Add, change or delete a property of a digital twin                                               |

## Documentation

Visit the IndyKite One Developer Community site for official [IndyKite documentation](https://indykite.one/blog?category=5e3e9297-3451-4b52-91ee-8027dcd1789c) and to find out how to use the entire platform for your project.

## Installation

##### From [npm](https://www.npmjs.com/package/@indykiteone/jarvis-sdk-web):

```
npm install @indykiteone/jarvis-sdk-web
```

##### From CDN:

UNPKG

```javascript
<script src="https://unpkg.com/@indykiteone/jarvis-sdk-web/dist/iksdkweb.dist.js"></script>
```

jsDelivr

```javascript
<script src="https://cdn.jsdelivr.net/npm/@indykiteone/jarvis-sdk-web/dist/iksdkweb.dist.js"></script>
```

### Browser support

#### CDN .dist.js version

Is build with support for all recent versions of major browsers (Chrome, FF, Safari, Edge, Opera).

#### import version

`import { IKUIInit } from "@indykiteone/jarvis-sdk-web";` Is not prebuild. It's necessary for you to build your application using tools like webpack and babel.
If you are building apps with frameworks like React, Angular or Vue.js. You have most likely already setup
a build process (often automatically by the framework), and you don't need to do anything.

In case you need support for Internet Explorer (ES5) please let us know in issues, and we will provide
you with built sdk or build instructions.

## API

##### dist.js package

In case of using the dist package. All functions are exported under the `IK` keyword.
For example:

```html
<script src="https://unpkg.com/@indykiteone/jarvis-sdk-web/dist/iksdkweb.dist.js"></script>
<script>
 IK.IKUIInit({});
</script
```

## Getting Started

### Trial

For a trial please contact [IndyKite](https://www.indykite.com/contact-us) to setup and configure the platform.

### Init

To use the functions from the library you first need to initialize the lib.
This should be done in entry point to the app.

```javascript
import { IKUIInit } from "@indykiteone/jarvis-sdk-web";

IKUIInit({
  baseUri: process.env.REACT_APP_INDY_BASE_URI,
  applicationId: process.env.REACT_APP_INDY_CLIENT_ID,
  tenantId: process.env.REACT_APP_INDY_TENANT_ID,
});
```

### Core - UI API

To use the UI elements provided by the @indykiteone/jarvis-sdk-web library, make sure you've completed initializing the library as described above.
As all render functions do network setup calls, they should be treated as side effects in the JS framework of your application.

#### Form rendering

To render the form without any customization, call the `IKUICore.renderForm` function with `renderElementSelector` and `onSuccess` parameters.

```javascript
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  // React example, call only during the first render. Side effect!
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      redirectUri: "/callback", // Optional - Needed only if you use OIDC (Google, FB etc) buttons
    });
  }, []);

  return (
    <div>
      <div id="form-container" />
    </div>
  );
};
```

#### Forgotten password flow

If you want to render the Forgotten password screen as the initial form, update your authentication flow by adding a new condition to your `Switch` node with the following condition:

```
has(session.input) && has(session.input.flow) && session.input.flow == 'forgotten'
```

and connect the new branch with the `Forgotten password` node, as it's on the image.

![](/assets/forgotten_password_flow.png)

Add the flow argument in the rendering function, and start the flow with the Forgotten password form.

```javascript
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  // React example, call only during the first render. Side effect!
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      arguments: {
        flow: "forgotten",
      },
    });
  }, []);

  return (
    <div>
      <div id="form-container" />
    </div>
  );
};
```

#### Set a new password flow (with an OTP)

You can also use the `IKUICore.renderForm` function. You only need to pass an `otpToken` property there, as shown in the next example.

```javascript
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  // React example, call only during the first render. Side effect!
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      otpToken: referenceId,
    });
  }, []);

  return (
    <div>
      <div id="form-container" />
    </div>
  );
};
```

#### Replace default component

Use the `onRenderComponent` property to tweak an existing element or create a new one. In this example we will put a small _"Enter the same password here"_ message under the second password input in the registration form.

```javascript
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  // React example, call only during the first render. Side effect!
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      onRenderComponent: (component, componentType, componentSubtype) => {
        if (componentType === "form" && componentSubtype === "password-confirm") {
          const wrapper = document.createElement("div");
          ReactDOM.render(
            <i>
              <small>Enter the same password here</small>
            </i>,
            wrapper,
          );
          wrapper.prepend(component);
          return wrapper;
        }
      },
    });
  }, []);

  return (
    <div>
      <div id="form-container" />
    </div>
  );
};
```

You can also replace a component with your custom one. In this example we are replacing the form submit button.

```javascript
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  // React example, call only during the first render. Side effect!
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      onRenderComponent: (component, componentType, componentSubtype, ...rest) => {
        if (componentType === "form" && componentSubtype === "submit") {
          const [clickHandler] = rest;
          const newButton = document.createElement("button");
          newButton.innerText = "Custom submit";
          newButton.addEventListener("click", clickHandler);
          return newButton;
        }
      },
    });
  }, []);

  return (
    <div>
      <div id="form-container" />
    </div>
  );
};
```

Or you can update an existing component. Here we are adding a custom class to all of our inputs.

```javascript
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  // React example, call only during the first render. Side effect!
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      onRenderComponent: (component, componentType) => {
        if (componentType === "form") {
          const inputs = component.getElementsByTagName("input");
          if (inputs.length > 0) {
            Array.from(inputs).forEach((input) => input.classList.add("my-input-class"));
          }
          return component;
        }
      },
    });
  }, []);

  return (
    <div>
      <div id="form-container" />
    </div>
  );
};
```

## IKUIOidc - OIDC Support

### Handling the OIDC callback

When you want to login with Google or Facebook you need to pass the `redirectUri` property to your `IKUICore.renderForm` function call. After you finish the login/registration with the external OIDC provider you will be redirected to this URI. On this route you have to call `IKUIOidc.oidcCallback()` function which will process the returned values from the OIDC provider and return you an object. You have to check, whether this object contains a `redirect_to` property and if so, you have to redirect your page to this URI. If the object does't have such property, then the object should contain the access token.

```javascript
import React from "react";
import { IKUIOidc } from "@indykiteone/jarvis-sdk-web";

const Callback = () => {
  React.useEffect(() => {
    IKUIOidc.oidcCallback()
      .then((data) => {
        if (data.redirect_to) {
          window.location.href = data.redirect_to;
          return;
        }
        console.log(data.token);
        console.log(data.refresh_token);
        console.log(data.token_type); // For example "bearer"
        console.log(data.expiration_time); // Timestamp
        console.log(data.expires_in); // In x seconds
      })
      .catch(console.log);
  }, []);
  return <span>OIDC callback</span>;
};
```

> Keep in mind that after you redirect your page to the URI from the `redirect_to` property and you call there the `IKUICore.renderForm` function, you have to call that function only once (especially when you are using React ensure your `useEffect` is called only once). Otherwise the data from the OIDC provider will be lost.

### OIDC Provider

When you act as an OIDC provider, you have to call `IKUIOidc.handleOidcOriginalParamsAndRedirect` function. For this case, it's good to have a special route so you know you are redirected here from a different page. This function stores its actual state and redirects you to a route which you usually use for logging users.

```javascript
import React from "react";
import { IKUIOidc } from "@indykiteone/jarvis-sdk-web";

const Oidc = () => {
  React.useEffect(() => {
    // Put your default login route to the function argument
    IKUIOidc.handleOidcOriginalParamsAndRedirect("/login");
  }, []);

  return <span>OIDC login...</span>;
};
```

## TypeScript

The library has build in types and is compatible with typescript projects.

## SDK Development

Look into using `npm link` in case you want to develop the lib with the app  
https://medium.com/dailyjs/how-to-use-npm-link-7375b6219557

In case you update the response don't forget to update CommonJS docs and also
any typescript definitions.

Commit message follows [commit guidelines](./doc/guides/commit-message.md#commit-message-guidelines)

Install husky pre-commit hooks
`npm install & npm run prepare`

### Localisation development

All the messages and keys are stored in the localise.com app under project Indykite
https://app.lokalise.com/project/5428220160b483af770945.85338584/

All the keys for only UI SDK should have tag `uisdk`.

To export new localisation keys and error messages. Go to download page
https://app.lokalise.com/download/5428220160b483af770945.85338584/

Download settings are as follows:

```
Format: JSON
- Include all platform keys YES

Plural format: ICU
Placeholder format: ICU
```

Click on build and download. Put the final JSONs into folder `lib/services/core/locale/src`
See file `.github/export-settings.png` for the export settings from localise.

## Roadmap

Checkout our roadmap on our [issues page](https://github.com/indykite/jarvis-sdk-web/issues)

## Contributing

[Contribution guidelines for this project](contributing.md)

## Support, Feedback, Connect with other developers

We'd love to have you connect with us or other community developers over at [IndyKite.one](https://indykite.one)

Feel free to file a bug, submit an issue or give us feedback on our [issues page](https://github.com/indykite/jarvis-sdk-web/issues)

## Vulnerability Reporting

[Responsible Disclosure](https://www.indykite.com/security)

## Changelog

Coming Soon!

## Contributers / Acknowledgements

Coming Soon!

## What is IndyKite

IndyKite is a cloud identity platform built to secure and manage human & non-person (IoT) identities and their data. Based on open source standards, the cloud platform gives developers the ability to secure data and embed identity controls into their Web 3.0 applications. Empowering the world’s 23 million developers without the need to involve security and identity specialists.

## License

[This project is licensed under the terms of the Apache 2.0 license.](LICENSE)
