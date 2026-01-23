export interface User {
  email: string
  emailConfirmed: boolean
  twoFactorEnabled: boolean
  preferredTwoFactorMethod: TwoFactorMethod
}

export enum TwoFactorMethod {
  None = 0,
  Authenticator = 1,
  Email = 2
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  code: string
  password: string
  confirmPassword: string
}

export interface Verify2faRequest {
  code: string
}

export interface LoginResponse {
  succeeded: boolean
  requiresTwoFactor: boolean
  isLockedOut: boolean
  isNotAllowed: boolean
  message?: string
}

export interface ApiResponse<T = void> {
  succeeded: boolean
  message?: string
  data?: T
}

export interface PasskeyAssertionOptions {
  challenge: string
  rpId: string
  timeout: number
  userVerification: string
  allowCredentials?: Array<{
    id: string
    type: string
    transports?: string[]
  }>
}

export interface PasskeyCreationOptions {
  challenge: string
  rp: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
    displayName: string
  }
  pubKeyCredParams: Array<{
    type: string
    alg: number
  }>
  timeout: number
  attestation: string
  authenticatorSelection: {
    authenticatorAttachment?: string
    residentKey: string
    userVerification: string
  }
  excludeCredentials?: Array<{
    id: string
    type: string
    transports?: string[]
  }>
}
