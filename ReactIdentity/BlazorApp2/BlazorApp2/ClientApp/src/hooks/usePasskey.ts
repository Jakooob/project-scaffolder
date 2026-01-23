import { useState, useCallback } from 'react'
import { startAuthentication, startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { apiPost } from '@/api/apiClient'
import type { PasskeyAssertionOptions, PasskeyCreationOptions, LoginResponse, ApiResponse } from '@/types/auth'

interface UsePasskeyReturn {
  isSupported: boolean
  isLoading: boolean
  error: string | null
  loginWithPasskey: (email?: string) => Promise<LoginResponse>
  registerPasskey: () => Promise<ApiResponse>
  clearError: () => void
}

export function usePasskey(): UsePasskeyReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSupported = browserSupportsWebAuthn()

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const loginWithPasskey = useCallback(async (email?: string): Promise<LoginResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      // Get assertion options from server
      const options = await apiPost<PasskeyAssertionOptions>('/auth/passkey/request-options', { email })

      // Perform WebAuthn authentication
      const credential = await startAuthentication({
        optionsJSON: {
          challenge: options.challenge,
          rpId: options.rpId,
          timeout: options.timeout,
          userVerification: options.userVerification as UserVerificationRequirement,
          allowCredentials: options.allowCredentials?.map(c => ({
            id: c.id,
            type: c.type as PublicKeyCredentialType,
            transports: c.transports as AuthenticatorTransport[],
          })),
        },
      })

      // Send credential to server for verification
      const response = await apiPost<LoginResponse>('/auth/passkey/authenticate', {
        id: credential.id,
        rawId: credential.rawId,
        response: {
          clientDataJSON: credential.response.clientDataJSON,
          authenticatorData: credential.response.authenticatorData,
          signature: credential.response.signature,
          userHandle: credential.response.userHandle,
        },
        type: credential.type,
        authenticatorAttachment: credential.authenticatorAttachment,
        clientExtensionResults: credential.clientExtensionResults,
      })

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Passkey authentication failed'
      setError(message)
      return { succeeded: false, requiresTwoFactor: false, isLockedOut: false, isNotAllowed: false, message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const registerPasskey = useCallback(async (): Promise<ApiResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      // Get creation options from server
      const options = await apiPost<PasskeyCreationOptions>('/auth/passkey/creation-options')

      // Perform WebAuthn registration
      const credential = await startRegistration({
        optionsJSON: {
          challenge: options.challenge,
          rp: options.rp,
          user: {
            id: options.user.id,
            name: options.user.name,
            displayName: options.user.displayName,
          },
          pubKeyCredParams: options.pubKeyCredParams.map(p => ({
            type: p.type as PublicKeyCredentialType,
            alg: p.alg,
          })),
          timeout: options.timeout,
          attestation: options.attestation as AttestationConveyancePreference,
          authenticatorSelection: {
            authenticatorAttachment: options.authenticatorSelection.authenticatorAttachment as AuthenticatorAttachment | undefined,
            residentKey: options.authenticatorSelection.residentKey as ResidentKeyRequirement,
            userVerification: options.authenticatorSelection.userVerification as UserVerificationRequirement,
          },
          excludeCredentials: options.excludeCredentials?.map(c => ({
            id: c.id,
            type: c.type as PublicKeyCredentialType,
            transports: c.transports as AuthenticatorTransport[],
          })),
        },
      })

      // Send credential to server for registration
      const response = await apiPost<ApiResponse>('/auth/passkey/register', {
        id: credential.id,
        rawId: credential.rawId,
        response: {
          clientDataJSON: credential.response.clientDataJSON,
          attestationObject: credential.response.attestationObject,
          transports: credential.response.transports,
        },
        type: credential.type,
        authenticatorAttachment: credential.authenticatorAttachment,
        clientExtensionResults: credential.clientExtensionResults,
      })

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Passkey registration failed'
      setError(message)
      return { succeeded: false, message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isSupported,
    isLoading,
    error,
    loginWithPasskey,
    registerPasskey,
    clearError,
  }
}
