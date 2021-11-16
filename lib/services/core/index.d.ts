/// <reference types="./locale/locale" />

export function IKUIInit(config: {
  tenantId?: string;
  applicationId?: string;
  baseUri?: string;
  localeConfig?: LocaleConfigType | null;
}): void;

type onRenderComponent =
  | ((
      defaultComponent: HTMLElement,
      componentType: "action",
      actionType: "forgotten" | "register" | "alreadyRegistered",
      label: string,
      link: string,
    ) => HTMLElement | undefined)
  | ((
      defaultComponent: HTMLElement,
      componentType: "form",
      formComponentType: "username" | "password" | "passwordCheck",
      label: string,
      context: any,
    ) => HTMLElement | undefined)
  | ((
      defaultComponent: HTMLElement,
      componentType: "form",
      formComponentType: "submit",
      label: string,
    ) => HTMLElement | undefined)
  | ((
      defaultComponent: HTMLElement,
      componentType: "form",
      formComponentType: "termsAndAgreement",
      htmlString: string,
    ) => HTMLElement | undefined)
  | ((
      defaultComponent: HTMLElement,
      componentType: "oidcButton",
      provider: string,
      id: string,
      url: string,
    ) => HTMLElement | undefined)
  | ((defaultComponent: HTMLElement, componentType: "separator") => HTMLElement | undefined);

type DataTokenResponseType = {
  "@type": string;
  token: string;
  refresh_token: string;
  token_type: string;
  expiration_time: number;
  expires_in: number;
};

type renderLogin = (props: {
  renderElementSelector: string;
  onRenderComponent?: onRenderComponent;
  onSuccessLogin: (arg0: DataTokenResponseType) => void;
  redirectUri?: string;
  registrationPath?: string;
  forgotPasswordPath?: string;
  labels?: {
    username?: string;
    password?: string;
    loginButton?: string;
    registerButton?: string;
    forgotPasswordButton?: string;
    orOtherOptions?: string;
  };
  placeholders?: {
    username?: string;
    password?: string;
  };
}) => void;

type renderRegister = (props: {
  renderElementSelector: string;
  onRenderComponent?: onRenderComponent;
  onSuccessRegistration: (arg0: DataTokenResponseType) => void;
  redirectUri?: string;
  termsAgreementSectionContent?: string;
  validatePassword?: (arg0: string) => boolean;
  labels?: {
    username?: string;
    password?: string;
    confirmPassword?: string;
    registerButton?: string;
    alreadyHaveAnAccountButton?: string;
    orOtherOptions?: string;
  };
  placeholders?: {
    username?: string;
    password?: string;
    confirmPassword?: string;
  };
  /**
   * This is a temporary configuration only. Keep on mind that this property will be removed in the future.
   */
  userInputNote?: string;
  /**
   * This is a temporary configuration only. Keep on mind that this property will be removed in the future.
   */
  passwordInputNote?: string;
  /**
   * This is a temporary configuration only. Keep on mind that this property will be removed in the future.
   */
  passwordCheckInputNote?: string;
}) => void;

type renderForgotPasswordForm = (props: {
  renderElementSelector: string;
  loginPath?: string;
  labels?: {
    username?: string;
    submitButton?: string;
    backToLogin?: string;
  };
  placeholders?: {
    username?: string;
  };
}) => void;

type renderSetNewPasswordForm = (props: {
  token: string;
  renderElementSelector: string;
  validatePassword?: (arg0: string) => boolean;
  labels?: {
    newPassword?: string;
    confirmNewPassword?: string;
    submitButton?: string;
  };
  placeholders?: {
    password?: string;
    confirmPassword?: string;
  };
}) => void;

interface IKUICore {
  renderLogin: renderLogin;
  renderRegister: renderRegister;
  renderForgotPasswordForm: renderForgotPasswordForm;
  renderSetNewPasswordForm: renderSetNewPasswordForm;
}

export const IKUICore: IKUICore;

type ErrorObjectType = {
  code: string;
  label?: string;
  msg: string;
  extensions: Record<string, string | number>;
};

export type ErrorResponseType = {
  type: string;
  "~error": ErrorObjectType;
};

export type SetupOptsType = {
  "~ord": number;
  "@type": string;
  "@id": string;
  prv?: string;
  fields?: Array<Record<string, any>>;
  opts?: Array<Record<string, any>>;
};

export type LoginSetupDataType = {
  "@type": string;
  op?: string;
  prv?: string;
  url?: string;
  opts?: Array<SetupOptsType>;
  "~thread": {
    thid: string;
  };
};

type logoutCurrentUser = () => Promise<boolean>;
type logoutUser = (userId?: string) => Promise<boolean>;
type logoutAllUsers = () => Promise<{ [userId: string]: boolean }>;
type login = (
  email: string,
  password: string,
  setupData: LoginSetupDataType,
) => Promise<DataTokenResponseType | Error>;
type isAuthenticated = (userId?: string) => Promise<boolean>;
type getValidAccessToken = (options?: {
  refreshToken?: string;
  userId?: string;
}) => Promise<string>;
type register = (email: string, password: string) => Promise<DataTokenResponseType>;
type sendResetPasswordEmail = (email: string) => Promise<{ "@type": string }>;
type sendNewPassword = (
  referenceId: string,
  newPassword: string,
) => Promise<DataTokenResponseType>;

type loginSetup = () => Promise<LoginSetupDataType>;
type registerSetup = () => Promise<LoginSetupDataType>;

interface IKUIUserAPI {
  isAuthenticated: isAuthenticated;
  logoutAllUsers: logoutAllUsers;
  /**
    @deprecated
  */
  logoutCurrentUser: logoutCurrentUser;
  logoutUser: logoutUser;
  login: login;
  getValidAccessToken: getValidAccessToken;
  register: register;
  sendResetPasswordEmail: sendResetPasswordEmail;
  sendNewPassword: sendNewPassword;
  loginSetup: loginSetup;
  registerSetup: registerSetup;
}

export const IKUIUserAPI: IKUIUserAPI;

type oidcSetup = (
  id?: string | null,
  redirectUri?: string | null,
  threadId?: string | null,
) => void;

type singleOidcSetupInput = {
  "~thread": {
    thid: string;
  };
  url: string;
};

type singleOidcSetup = (singleOidcSetupInput) => void;
type oidcCallback = () => Promise<DataTokenResponseType>;
type handleOidcOriginalParamsAndRedirect = () => void;
type initOidcAuthorizationRequest = (
  oauth2Host: string,
  queryParams: Record<string, string>,
) => void;
type handleOauth2Callback = () => void;

interface IKUIOidc {
  oidcSetup: oidcSetup;
  singleOidcSetup: singleOidcSetup;
  oidcCallback: oidcCallback;
  handleOidcOriginalParamsAndRedirect: handleOidcOriginalParamsAndRedirect;
  initOidcAuthorizationRequest: initOidcAuthorizationRequest;
  handleOauth2Callback: handleOauth2Callback;
}

export const IKUIOidc: IKUIOidc;
