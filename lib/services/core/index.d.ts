/// <reference types="./locale/locale" />

interface InitProps {
  tenantId?: string;
  applicationId?: string;
  baseUri?: string;
  localeConfig?: LocaleConfigType | null;
  disableInlineStyles?: boolean;
}

export function IKUIInit(config: InitProps): void;

type onRenderActionComponentFn = (
  defaultComponent: HTMLElement,
  componentType: "action",
  actionType: "forgotten" | "register" | "alreadyRegistered",
  label: string,
  link: string,
) => HTMLElement | undefined;

type onRenderGeneralFormComponentFn = (
  defaultComponent: HTMLElement,
  componentType: "form",
  formComponentType: string, // something like "username", "email", "password", "passwordCheck", ...
  label: string,
  fieldContext: any,
  context: any,
) => HTMLElement | undefined;

type onRenderSubmitFormComponentFn = (
  defaultComponent: HTMLElement,
  componentType: "form",
  formComponentType: "submit",
  handleClick: () => Promise<void>,
  label: string,
  context: any,
) => HTMLElement | undefined;

type onRenderTermsAndAgreementFormComponentFn = (
  defaultComponent: HTMLElement,
  componentType: "form",
  formComponentType: "termsAndAgreement",
  htmlString: string,
) => HTMLElement | undefined;

type onRenderOidcComponentFn = (
  defaultComponent: HTMLElement,
  componentType: "oidcButton",
  provider: string,
  handleClick: () => Promise<void>,
  id: string,
  url: string,
) => HTMLElement | undefined;

type onRenderMessageComponentFn = (
  defaultComponent: HTMLElement,
  componentType: "message",
  context: {
    msg?: string;
    label?: string;
    style: string;
    id?: string;
    extensions?: string;
    ui: string;
  },
) => HTMLElement | undefined;

type onRenderSeparatorComponentFn = (
  defaultComponent: HTMLElement,
  componentType: "separator",
) => HTMLElement | undefined;

type onRenderQrComponentFn = (
  defaultComponent: HTMLElement,
  componentType: "qr",
) => HTMLElement | undefined;

type onRenderComponentFn =
  | onRenderActionComponentFn
  | onRenderGeneralFormComponentFn
  | onRenderSubmitFormComponentFn
  | onRenderTermsAndAgreementFormComponentFn
  | onRenderOidcComponentFn
  | onRenderMessageComponentFn
  | onRenderSeparatorComponentFn
  | onRenderQrComponentFn;

interface DataTokenResponseType {
  "@type": string;
  token: string;
  refresh_token: string;
  token_type: string;
  expiration_time: number;
  expires_in: number;
  redirect_to?: string;
}

/**
 * @hidden
 */
interface RenderLoginProps {
  renderElementSelector: string;
  onLoginFail?: (error: Error) => void;
  onRenderComponent?: onRenderComponentFn;
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
  };
  loginApp?: {
    [optionId: string]: string;
  };
}

/**
 * @hidden
 */
interface RenderRegisterProps {
  renderElementSelector: string;
  onRegistrationFail?: (error: Error) => void;
  onRenderComponent?: onRenderComponentFn;
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
  };
  loginApp?: {
    [optionId: string]: string;
  };
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  userInputNote?: string;
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  passwordInputNote?: string;
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  passwordCheckInputNote?: string;
}

/**
 * @hidden
 */
interface RenderProps {
  arguments?: Record<string, string>;
  renderElementSelector: string;
  onFail?: (error: Error) => void;
  onRenderComponent?: onRenderComponentFn;
  onSuccess: (arg0: DataTokenResponseType) => void;
  redirectUri?: string;
  loginPath?: string;
  registrationPath?: string;
  forgotPasswordPath?: string;
  labels?: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    registerButton?: string;
    registerLinkButton?: string;
    alreadyHaveAnAccountButton?: string;
    loginButton?: string;
    forgotPasswordButton?: string;
    forgottenPasswordSubmitButton?: string;
  };
  loginApp?: {
    [optionId: string]: string;
  };
  /**
   * @deprecated Use `token` property instead.
   */
  otpToken?: string;
  token?: string;
  termsAgreementSectionContent?: string;
  validatePassword?: (arg0: string) => boolean;
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  userInputNote?: string;
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  passwordInputNote?: string;
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  passwordCheckInputNote?: string;
}

interface RenderFormProps {
  arguments?: Record<string, string>;
  renderElementSelector: string;
  onBeforeRender?: (form: HTMLElement) => HTMLElement;
  onFail?: (error: Error) => void;
  onRenderComponent?: onRenderComponentFn;
  onSuccess: (arg0: DataTokenResponseType) => void;
  redirectUri?: string;
  labels?: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    registerButton?: string;
    registerLinkButton?: string;
    alreadyHaveAnAccountButton?: string;
    loginButton?: string;
    forgotPasswordButton?: string;
    forgottenPasswordSubmitButton?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    setNewPasswordButton?: string;
  };
  loginApp?: {
    [optionId: string]: string;
  };
  /**
   * @deprecated Use `token` property instead.
   */
  otpToken?: string;
  token?: string;
  actionLabels?: Record<string, string>;
}

/**
 * @hidden
 */
interface RenderForgotPasswordFormProps {
  renderElementSelector: string;
  loginPath?: string;
  labels?: {
    username?: string;
    submitButton?: string;
    backToLogin?: string;
  };
}

/**
 * @hidden
 */
interface RenderSetNewPasswordFormProps {
  token: string;
  renderElementSelector: string;
  validatePassword?: (arg0: string) => boolean;
  labels?: {
    newPassword?: string;
    confirmNewPassword?: string;
    submitButton?: string;
  };
}

/**
 * @deprecated Use `renderForm` function instead.
 * @hidden
 */
type renderSetNewPasswordFormFn = (props: RenderSetNewPasswordFormProps) => void;
/**
 * @deprecated Use `renderForm` function instead.
 * @hidden
 */
type renderLoginFn = (props: RenderLoginProps) => void;
/**
 * @deprecated Use `renderForm` function instead.
 * @hidden
 */
type renderRegisterFn = (props: RenderRegisterProps) => void;
/**
 * @deprecated Use `renderForm` function instead.
 * @hidden
 */
type renderFn = (props: RenderProps) => void;
/**
 * @deprecated Use `renderForm` function instead.
 * @hidden
 */
type renderForgotPasswordFormFn = (props: RenderForgotPasswordFormProps) => void;

interface IKUICoreProps {
  renderForm: (props: RenderFormProps) => void;
  /**
   * @deprecated Use `renderForm` function instead.
   */
  renderSetNewPasswordForm: renderSetNewPasswordFormFn;
  /**
   * @deprecated Use `renderForm` function instead.
   */
  renderLogin: renderLoginFn;
  /**
   * @deprecated Use `renderForm` function instead.
   */
  renderRegister: renderRegisterFn;
  /**
   * @deprecated Use `renderForm` function instead.
   */
  render: renderFn;
  /**
   * @deprecated Use `renderForm` function instead.
   */
  renderForgotPasswordForm: renderForgotPasswordFormFn;
}

export const IKUICore: IKUICoreProps;

interface ErrorObjectType {
  code: string;
  label?: string;
  msg: string;
  extensions: Record<string, string | number>;
}

export interface ErrorResponseType {
  type: string;
  "~error": ErrorObjectType;
}

export interface SetupOptsType {
  "~ord": number;
  "@type": string;
  "@id": string;
  prv?: string;
  fields?: Array<Record<string, any>>;
  opts?: Array<Record<string, any>>;
}

export interface LoginSetupDataType {
  "@type": string;
  op?: string;
  prv?: string;
  url?: string;
  opts?: Array<SetupOptsType>;
  "~thread": {
    thid: string;
  };
}

interface SetupRequestConfig {
  /**
   * @deprecated Use `token` property instead.
   */
  otpToken?: string;
  token?: string;
}

/**
  @deprecated
  @hidden
*/
type logoutCurrentUserFn = () => Promise<boolean>;
/**
  @deprecated
  @hidden
*/
type loginFn = (
  email: string,
  password: string,
  setupData: LoginSetupDataType,
) => Promise<DataTokenResponseType | Error>;
/**
  @deprecated
  @hidden
*/
type registerFn = (email: string, password: string) => Promise<DataTokenResponseType>;
/**
  @deprecated
  @hidden
*/
type sendResetPasswordEmailFn = (email: string) => Promise<{ "@type": string }>;
/**
  @deprecated
  @hidden
*/
type sendNewPasswordFn = (
  referenceId: string,
  newPassword: string,
) => Promise<DataTokenResponseType>;
/**
  @deprecated
  @hidden
*/
type loginSetupFn = (config?: SetupRequestConfig) => Promise<LoginSetupDataType>;
/**
  @deprecated
  @hidden
*/
type registerSetupFn = (config?: SetupRequestConfig) => Promise<LoginSetupDataType>;

interface IKUIUserAPIProps {
  isAuthenticated: (userId?: string) => Promise<boolean>;
  logoutAllUsers: () => Promise<{ [userId: string]: boolean }>;
  /**
    @deprecated Use `logoutUser` instead.
  */
  logoutCurrentUser: logoutCurrentUserFn;
  logoutUser: (userId?: string) => Promise<boolean>;
  /**
    @deprecated
  */
  login: loginFn;
  getValidAccessToken: (options?: { refreshToken?: string; userId?: string }) => Promise<string>;
  /**
    @deprecated
  */
  register: registerFn;
  /**
    @deprecated
  */
  sendResetPasswordEmail: sendResetPasswordEmailFn;
  /**
    @deprecated
  */
  sendNewPassword: sendNewPasswordFn;
  /**
    @deprecated
  */
  loginSetup: loginSetupFn;
  /**
    @deprecated
  */
  registerSetup: registerSetupFn;
  refreshAccessToken: (
    refreshToken?: string,
    codeChallenge?: string,
    omitAuthorizationHeaders?: boolean,
  ) => Promise<string>;
}

export const IKUIUserAPI: IKUIUserAPIProps;

type oidcSetupFn = {
  (options?: { id?: string; redirectUri?: string; threadId?: string; loginApp?: string }): void;

  /**
   * @deprecated Move all the parameters to an options object.
   */
  (id?: string | null, redirectUri?: string | null, threadId?: string | null): void;
};

interface SingleOidcSetupInput {
  "~thread": {
    thid: string;
  };
  url: string;
}

/**
  @deprecated
  @hidden
*/
type initOidcAuthorizationRequestFn = (
  oauth2Host: string,
  queryParams: Record<string, string>,
) => void;

/**
  @deprecated
  @hidden
*/
type handleOauth2CallbackFn = () => void;

interface IKUIOidcProps {
  oidcSetup: oidcSetupFn;
  singleOidcSetup: (input: SingleOidcSetupInput) => void;
  oidcCallback: () => Promise<DataTokenResponseType>;
  handleOidcOriginalParamsAndRedirect: (redirectTo?: string) => void;
  /**
   * @deprecated
   */
  initOidcAuthorizationRequest: initOidcAuthorizationRequestFn;
  /**
   * @deprecated
   */
  handleOauth2Callback: handleOauth2CallbackFn;
}

export const IKUIOidc: IKUIOidcProps;
