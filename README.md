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

## Rendering login/registration screen with different auth flows

### Simple registration

![](/assets/simple_registration_flow.png)

This authentication flow doesn't allow you to do anything special but registering a new user using username and password.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
        // You can store the access token from the data object, but the UISDK can handle
        // all this for you so theoretically you don't need to manage tokens yourself.
        // The authentication flow ended here and you can do a redirection to your application now
      },
      onFail: (error) => {
        console.error(error);
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

### Simple login with no actions

![](/assets/simple_login_flow.png)

This authetication flow lets you log in with a username and password.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
        // You can store the access token from the data object, but the UISDK can handle
        // all this for you so theoretically you don't need to manage tokens yourself.
        // The authentication flow ended here and you can do a redirection to your application now
      },
      onFail: (error) => {
        console.error(error);
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

### Simple login with some actions

![](/assets/login_and_registration_flow.png)

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
        // You can store the access token from the data object, but the UISDK can handle
        // all this for you so theoretically you don't need to manage tokens yourself.
        // The authentication flow ended here and you can do a redirection to your application now
      },
      onFail: (error) => {
        console.error(error);
      },
      actionLabels: {
        KEY_FORGOTTEN: "Forgotten password?",
        KEY_REGISTER: "Registration",
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

### Login flow with OIDC providers

#### When the flow doesn't continue after returning from the OIDC provider

![](/assets/simple_oidc.png)

You need to put the following code to your login page, e.g. `https://yourpage.com/login`:

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
        // You will not get the access token here, because you will be redirected
        // to an OIDC provider page (e.g. google.com) and then to your callback page
      },
      onFail: (error) => {
        console.error(error);
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

This code will display a Google option to log in. After clicking the option, you will be redirected to the Google site where you will be authenticated. After that, you will be redirected back to your callback URL. Put the following code to your call back page, which can be, for example, `https://yourpage.com/callback`:

```ts
import React from "react";
import { IKUIOidc } from "@indykiteone/jarvis-sdk-web";

// This is where Google and other providers can redirect you
const Callback = () => {
  React.useEffect(() => {
    // It's important that oidcCallback is called just once, multiple calls can end up with errors
    IKUIOidc.oidcCallback()
      .then((data) => {
        // You can save the token in your app in case you need it but UISDK can handle all this for you
        // so theoretically you don't need to manage tokens yourself.
        // The authentication flow ended here and you can do a redirection to your application now
        console.log(data);
      })
      .catch((e) => {
        // The App developer is responsible for handling the error in this phase.
        console.error(e);
      });
  }, []);

  return (
    <div>
      <h3>general callback</h3>
    </div>
  );
};
```

#### When the flow continues after returning from the OIDC provider

![](/assets/oidc_with_continuation.png)
You need to put this code in your login page, for example, `https://yourpage.com/login`:

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
        // After you finish your authentication with an OIDC provider you should be redirected
        // back to this login page.
        // You can store the access token from the data object, but the UISDK can handle
        // all this for you so theoretically you don't need to manage tokens yourself.
        // The authentication flow ended here and you can do a redirection to your application now
      },
      onFail: (error) => {
        console.error(error);
      },
      actionLabels: {
        KEY_FINISH: "Finish",
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

And this code to your callback page you set as the Redirect URL in your OIDC provider, for example, `https://yourpage.com/callback`:

```ts
import React from "react";
import { IKUIOidc } from "@indykiteone/jarvis-sdk-web";

// This is where FB, Google and other providers can redirect you
const Callback = () => {
  React.useEffect(() => {
    // It's important that oidcCallback is called just once, multiple calls can end up with errors
    IKUIOidc.oidcCallback()
      .then((data) => {
        // In this case the data should contain a `redirect_to` property and you should redirect to this location.
        if (data.redirect_to) {
          window.location.href = data.redirect_to;
        }
      })
      .catch((e) => {
        // The App developer is responsible for handling the error in this phase.
        console.error(e);
      });
  }, []);

  return (
    <div>
      <h3>general callback</h3>
    </div>
  );
};
```

### Multiple login flows (using the Switch node)

![](/assets/flow_with_switch.png)
Use the switch node to merge mutliple authentication flows into one. If you want to use the `Default` branch, you don't need to specify any new properties. This code will use the `Default` branch.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
        // You can store the access token from the data object, but the UISDK can handle
        // all this for you so theoretically you don't need to manage tokens yourself.
        // The authentication flow ended here and you can do a redirection to your application now
      },
      onFail: (error) => {
        console.error(error);
      },
      actionLabels: {
        KEY_REGISTER: "Registration",
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

The `register` branch will be used if the condition specified inside the Switch node is fulfilled. By default there's a following condition:

```
has(session.input) && has(session.input.flow) && session.input.flow=='register'
```

It checks whether the input object has a property `flow` set to `register`. You can define the input object with passing the `arguments` property to your `IKUICore.renderForm` call:

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
        // You can store the access token from the data object, but the UISDK can handle
        // all this for you so theoretically you don't need to manage tokens yourself.
        // The authentication flow ended here and you can do a redirection to your application now
      },
      onFail: (error) => {
        console.error(error);
      },
      actionLabels: {
        KEY_REGISTER: "Registration",
      },
      arguments: {
        flow: "register",
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

### Forgotten password flow

#### Use an action (click the Did you forget your password? button)

![](/assets/login_and_registration_flow.png)
In the beginning, you can call `IKUICore.renderForm` as usual. The login screen will contain an action "Forgotten password?".

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
        // You will not end here in case a user wants to reset its password.
      },
      onFail: (error) => {
        console.error(error);
      },
      actionLabels: {
        KEY_FORGOTTEN: "Forgotten password?",
        KEY_REGISTER: "Registration",
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

When a user sends a request to reset their password, they will get an email containing a reference ID in the link confirming the password resent. You need to extract this ID from the URL and pass it to the `IKUICore.renderForm` function as an `otpToken` property.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKResetPasswordForm = ({ referenceId }) => {
  React.useEffect(() => {
    if (referenceId) {
      IKUICore.renderForm({
        renderElementSelector: "#form-container",
        onSuccess: (data) => {
          console.log(data);
          // You can store the access token from the data object, but the UISDK can handle
          // all this for you so theoretically you don't need to manage tokens yourself.
          // The authentication flow ended here and you can do a redirection to your application now
        },
        onFail: (error) => {
          console.error(error);
        },
        otpToken: referenceId,
      });
    }
  }, [referenceId]);

  return (
    <div>
      <div id="form-container" />
    </div>
  );
};
```

#### Use a special URL

![](/assets/reset_password_with_switch.png)
If you want to start your flow with the reset password screen, use the Switch node, as mentioned in the [Multiple login flows](#multiple-login-flows-using-the-switch-node) section. If you add the `flow` argument with a value specified by you (in the authentication flow builder) to your `IKUICore.renderForm` call, the Switch node will use the direct connection with the Forgotten Password node.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
        // You will not end here in case a user wants to reset its password.
      },
      onFail: (error) => {
        console.error(error);
      },
      actionLabels: {
        KEY_FORGOTTEN: "Forgotten password?",
        KEY_REGISTER: "Registration",
      },
      arguments: {
        flow: "reset-password",
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

When a user sends a request to reset his password, he will get an email containing a reference ID in the link confirming the password resetting. You need to extract this ID from the URL and pass it to the `IKUICore.renderForm` function as an `otpToken` property.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKResetPasswordForm = ({ referenceId }) => {
  React.useEffect(() => {
    if (referenceId) {
      IKUICore.renderForm({
        renderElementSelector: "#form-container",
        onSuccess: (data) => {
          console.log(data);
          // You can store the access token from the data object, but the UISDK can handle
          // all this for you so theoretically you don't need to manage tokens yourself.
          // The authentication flow ended here and you can do a redirection to your application now
        },
        onFail: (error) => {
          console.error(error);
        },
        otpToken: referenceId,
      });
    }
  }, [referenceId]);

  return (
    <div>
      <div id="form-container" />
    </div>
  );
};
```

### Log in with an OTP token

![](/assets/invitation.png)
A user can get an invitation email which contains a reference ID. You need to pass this ID the same way as you did in the [Reset password](#using-an-action-clicking-on-did-you-forgot-you-password-button) flow, and that's to use this ID as the `otpToken` property. This will cause your authentication to start with the Input Invitation node.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKResetPasswordForm = ({ referenceId }) => {
  React.useEffect(() => {
    if (referenceId) {
      IKUICore.renderForm({
        renderElementSelector: "#form-container",
        onSuccess: (data) => {
          console.log(data);
          // You can store the access token from the data object, but the UISDK can handle
          // all this for you so theoretically you don't need to manage tokens yourself.
          // The authentication flow ended here and you can do a redirection to your application now
        },
        onFail: (error) => {
          console.error(error);
        },
        otpToken: referenceId,
      });
    }
  }, [referenceId]);

  return (
    <div>
      <div id="form-container" />
    </div>
  );
};
```

## Custom OIDC provider

In case you want to act as an OIDC provider, you have to call the `IKUIOidc.handleOidcOriginalParamsAndRedirect` function before you start your auth flow.

```ts
import { IKUIOidc } from "@indykiteone/jarvis-sdk-web";

const pathToLogin = "/login";
IKUIOidc.handleOidcOriginalParamsAndRedirect(pathToLogin);
```

This helps the SDK know that you are an OIDC provider, and after you authenticated, the SDK should return you back to the original application. The `pathToLogin` should point to an endpoint where you will call the `IKUICore.renderForm` as usual.

## Authentication status

After you have successfully finished the authentication flow, you don't have to store the access tokens on your own. The SDK does it for you. You can use the following functions to manage the authentication status.

- **`IKUIUserAPI.isAuthenticated()`**
  - Check whether there's an authenticated user
- **`IKUIUserAPI.getValidAccessToken()`**
  - Get the access token of currently logged user
- **`IKUIUserAPI.refreshAccessToken()`**
  - Refresh the access token of currently logged user
- **`IKUIUserAPI.logoutUser()`**
  - Logout currently logged user

## Customize components

### Replace a form component

#### Input

This example shows how to add a custom class name to the input element.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      onRenderComponent: (component: HTMLElement, componentType: string) => {
        if (componentType === "form") {
          const inputs = component.getElementsByTagName("input");
          // Should be always only one, but this is a general solution
          if (inputs.length > 0) {
            Array.from(inputs).forEach((input) => input.classList.add("my-input-class"));
          }
          return component;
        }

        return component;
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

#### Submit button

This example shows how to replace an original submit button element with a totally new one.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      onRenderComponent: (
        component: HTMLElement,
        componentType: string,
        componentSubtype: string,
        ...rest: unknown[]
      ) => {
        if (componentType === "form" && componentSubtype === "submit") {
          const [clickHandler] = rest as [Function];
          const newButton = document.createElement("button");
          newButton.innerText = "Custom submit";
          newButton.addEventListener("click", clickHandler as any);
          return newButton;
        }

        return component;
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

### Replace an action button

Here you can see how to replace the default `<a>` link with a custom `<button>` element.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      actionLabels: {
        KEY_FORGOTTEN: "Forgotten password?",
        KEY_REGISTER: "Register",
      },
      onRenderComponent: (
        component: HTMLElement,
        componentType: string,
        componentSubtype: string,
        ...rest: unknown[]
      ) => {
        if (componentType === "action" && componentSubtype === "forgotten") {
          const [label] = rest as [string];
          const buttonEl = document.createElement("button");
          buttonEl.innerText = label;
          return buttonEl;
        }

        return component;
      },
    });
  });

  return (
    <div>
      <div id="form-container" style={{ width: 350 }} />
    </div>
  );
};
```

### Replace an OIDC provider button

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      onRenderComponent: (component: HTMLElement, componentType: string, ...rest: unknown[]) => {
        if (componentType === "oidcButton") {
          const [provider, clickHandler, id, url] = rest as [string, Function, string, string];
          const buttonEl = document.createElement("button");
          buttonEl.innerText = provider;
          buttonEl.addEventListener("click", clickHandler as any);
          buttonEl.id = id;
          return buttonEl;
        }

        return component;
      },
    });
  });

  return (
    <div>
      <div id="form-container" style={{ width: 350 }} />
    </div>
  );
};
```

### Replace a message label

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      onRenderComponent: (component: HTMLElement, componentType: string, ...rest: unknown[]) => {
        if (componentType === "message") {
          const [context] = rest as [any];
          const newMessageEl = document.createElement("div");
          newMessageEl.innerHTML = `
            <b>${context.style}:</b> ${context.msg}
          `;
          return newMessageEl;
        }

        return component;
      },
    });
  });

  return (
    <div>
      <div id="form-container" style={{ width: 350 }} />
    </div>
  );
};
```

## Transition from `render` to `renderForm` function

### Add a Terms & Conditions section

In order to make some customizations in the rendered form, you can use the `onBeforeRender` property. This function is called with the prepared form which will be rendered. You have
an option to customize it as you wish. For example, you can put your Terms & Conditions content to the bottom of the screen, as shown in the following example.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      onRenderComponent: (
        component: HTMLElement,
        componentType: string,
        componentSubtype: string,
        ...rest: unknown[]
      ) => {
        // Use this function in order to change the Register button label
        if (componentType === "form" && componentSubtype === "submit") {
          const [clickHandler, label, context] = rest as [Function, string, any];
          if (context["~ui"].startsWith("passwordCreate")) {
            component.innerText = "Agree & Register";
          }
        }
        return component;
      },
      onBeforeRender: (form) => {
        const termsAndConditionsEl = document.createElement("div");

        // You can put any "Terms & Conditions" content you want here.
        termsAndConditionsEl.innerHTML = "<b>Terms & Conditions</b>";

        const uiContainerEl = form.querySelector(".ui-container");
        uiContainerEl?.appendChild(termsAndConditionsEl);
        return form;
      },
    });
  });

  return (
    <div>
      <div id="form-container" style={{ width: 350 }} />
    </div>
  );
};
```

> If the `onBeforeRender` property returns a nullable value, then the original form content is used.

### Add password policies under an input field

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const policiesEl = document.createElement("div");

const checkPolicies = () => {
  const inputEl = document.getElementById("IKUISDK-input-password") as HTMLInputElement;
  policiesEl.innerHTML = "";

  if (inputEl.value.length < 4) {
    policiesEl.innerHTML = "The password must be at least 4 characters long";
    return false;
  }

  return true;
};

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      onRenderComponent: (
        component: HTMLElement,
        componentType: string,
        componentSubtype: string,
        ...rest: unknown[]
      ) => {
        // Firsty we need to check the type of the rendered component
        // (in general, the third argument doesn't have to be a component subtype)
        if (componentType === "form") {
          if (componentSubtype === "password-confirm") {
            const wrapperEl = document.createElement("div");

            // append the original input element
            wrapperEl.appendChild(component);

            // append the container where missing policies will be written when they are not met
            wrapperEl.appendChild(policiesEl);
            return wrapperEl;
          } else if (componentSubtype === "submit") {
            const [handleClick, label, context] = rest as [Function, string, any];

            // We don't want to add the policies checker to the login screen
            if (context["~ui"].startsWith("passwordCreate")) {
              // We don't want to call the default click handler (that wouldn't check the policies)
              component.removeEventListener("click", handleClick as any);

              // We want to call a custom one which checks the policies
              component.addEventListener("click", (ev) => {
                ev.preventDefault();

                // the checkPolicies returns `true` only when the policies are fulfilled
                if (checkPolicies()) {
                  // in that case we can run the original click handler
                  handleClick(ev);
                }
              });
            }
          }
        }

        return component;
      },
    });
  });

  return (
    <div>
      <div id="form-container" style={{ width: 350 }} />
    </div>
  );
};
```

### Add action button translations

In the authentication builder in action nodes, you can specify your own locale keys. Then, using the `actionLabels` property, you can map your custom messages.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      actionLabels: {
        KEY_FORGOTTEN: "Forgotten password?",
        KEY_REGISTER: "Register",
      },
    });
  });

  return (
    <div>
      <div id="form-container" style={{ width: 350 }} />
    </div>
  );
};
```

### Redirect to a different URL after clicking an action button

The redirection is not directly supported, because it's not necessary (and it causes your authflow to restart from the beginning). But, if you still want to do it, you can replace the original action link with your custom one. In this case, the `componentSubtype` is a name of the action used in the authentication builder.

```ts
import ReactDOM from "react-dom";
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const IKForm = () => {
  React.useEffect(() => {
    IKUICore.renderForm({
      renderElementSelector: "#form-container",
      onSuccess: (data) => {
        console.log(data);
      },
      onFail: (error) => {
        console.error(error);
      },
      actionLabels: {
        KEY_FORGOTTEN: "Forgotten password?",
        KEY_REGISTER: "Register",
      },
      onRenderComponent: (
        component: HTMLElement,
        componentType: string,
        componentSubtype: string,
      ) => {
        // We want to open a different URL after the "Forgotten password" action is clicked
        if (componentType === "action" && componentSubtype === "forgotten") {
          const newActionEl = component.cloneNode(true) as HTMLElement;
          const linkEl = newActionEl.querySelector("a");
          linkEl?.addEventListener("click", () => {
            window.location.href = "https://newpage.com";
          });
          return newActionEl;
        }

        return component;
      },
    });
  });

  return (
    <div>
      <div id="form-container" style={{ width: 350 }} />
    </div>
  );
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
