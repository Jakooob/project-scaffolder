import { useState, useEffect } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  Typography,
} from '@mui/material'
import { apiPost } from '@/api/apiClient'
import { useAuth } from '@/contexts/AuthContext'
import type { PasskeyCreationOptions, LoginResponse } from '@/types/auth'

export function SetupPasskeyPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const userId = location.state?.userId as string | undefined
  const token = location.state?.setupToken as string | undefined

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)

  const isSupported = browserSupportsWebAuthn()

  useEffect(() => {
    if (!userId || !token) {
      setError('Invalid setup link. Please request a new confirmation email.')
    }
  }, [userId, token])

  const handleSetupPasskey = async () => {
    if (!userId || !token) {
      setError('Invalid setup link.')
      return
    }

    setError('')
    setIsLoading(true)
    setIsSettingUp(true)

    try {
      // Get passkey creation options from server
      const options = await apiPost<PasskeyCreationOptions>('/auth/passkey/setup-creation-options', {
        userId,
        setupToken: token,
      })

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

      // Send credential to server to complete registration and sign in
      const response = await apiPost<LoginResponse>('/auth/passkey/setup-register', {
        userId,
        setupToken: token,
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

      if (response.succeeded) {
        await refreshUser()
        navigate('/', { replace: true })
      } else {
        setError(response.message || 'Failed to complete passkey setup.')
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Passkey creation was cancelled or denied.')
        } else {
          setError(err.message)
        }
      } else {
        setError('An error occurred during passkey setup.')
      }
    } finally {
      setIsLoading(false)
      setIsSettingUp(false)
    }
  }

  if (!isSupported) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Passkey Not Supported
            </Typography>
            <Alert severity="error" sx={{ mb: 2 }}>
              Your browser does not support passkeys. Unfortunately, you cannot complete
              account setup on this device. Please try using a modern browser that supports
              passkeys.
            </Alert>
          </Paper>
        </Box>
      </Container>
    )
  }

  if (!userId || !token) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Invalid Setup Link
            </Typography>
            <Alert severity="error" sx={{ mb: 2 }}>
              This setup link is invalid or has expired. Please{' '}
              <Link component={RouterLink} to="/register-with-passkey">
                register again
              </Link>{' '}
              to receive a new confirmation email.
            </Alert>
          </Paper>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Set Up Your Passkey
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Your email has been verified. Click below to create your passkey and complete
            your account setup. You'll use this passkey to sign in to your account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isSettingUp && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Follow the prompts from your browser or device...
              </Typography>
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSetupPasskey}
            disabled={isLoading}
            sx={{ mt: 2, mb: 2 }}
          >
            {isLoading ? 'Setting up passkey...' : 'Create Passkey'}
          </Button>

          <Typography variant="body2" color="text.secondary" align="center">
            A passkey allows you to sign in securely without a password using your device's
            built-in security features like fingerprint, face recognition, or PIN.
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
