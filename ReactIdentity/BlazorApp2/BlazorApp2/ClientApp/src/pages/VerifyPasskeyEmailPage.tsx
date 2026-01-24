import { useState, useEffect, useRef } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'

export function VerifyPasskeyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyPasskeyEmail, resendPasskeyVerification } = useAuth()

  const userId = location.state?.userId as string | undefined
  const email = location.state?.email as string | undefined

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!userId) {
      navigate('/register-with-passkey', { replace: true })
    }
  }, [userId, navigate])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResendMessage('')

    if (!userId) {
      setError('Invalid session. Please start registration again.')
      return
    }

    if (code.length !== 6) {
      setError('Please enter a 6-digit code.')
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyPasskeyEmail({ userId, code })

      if (result.succeeded && result.data) {
        navigate('/setup-passkey', {
          state: {
            userId: result.data.userId,
            setupToken: result.data.setupToken,
          },
          replace: true,
        })
      } else {
        setError(result.message || 'Verification failed.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!userId) return

    setError('')
    setResendMessage('')
    setIsResending(true)

    try {
      const result = await resendPasskeyVerification({ userId })
      if (result.succeeded) {
        setResendMessage('A new code has been sent to your email.')
      } else {
        setError(result.message || 'Failed to resend code.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setIsResending(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
  }

  if (!userId) {
    return null
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Verify Your Email
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            We've sent a 6-digit code to{' '}
            <strong>{email || 'your email address'}</strong>.
            Enter the code below to continue.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {resendMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {resendMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="code"
              label="Verification Code"
              name="code"
              autoComplete="one-time-code"
              inputRef={inputRef}
              value={code}
              onChange={handleCodeChange}
              inputProps={{
                maxLength: 6,
                pattern: '[0-9]*',
                inputMode: 'numeric',
                style: { letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.5rem' },
              }}
              placeholder="000000"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={handleResend}
                disabled={isResending}
                sx={{ textTransform: 'none' }}
              >
                {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/register-with-passkey" variant="body2">
                Start over with a different email
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
