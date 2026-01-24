import { useState } from 'react'
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
import { usePasskey } from '@/hooks/usePasskey'

export function RegisterWithPasskeyPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialEmail = (location.state?.email as string) || ''

  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { registerWithPasskey } = useAuth()
  const { isSupported } = usePasskey()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setIsLoading(true)

    try {
      const result = await registerWithPasskey({ email })

      if (result.succeeded && result.data) {
        navigate('/verify-passkey-email', {
          state: { userId: result.data.userId, email },
          replace: true,
        })
      } else {
        setError(result.message || 'Registration failed.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration.')
    } finally {
      setIsLoading(false)
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
            <Alert severity="warning" sx={{ mb: 2 }}>
              Your browser does not support passkeys. Please use a modern browser or{' '}
              <Link component={RouterLink} to="/register">
                register with a password
              </Link>{' '}
              instead.
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
            Register with Passkey
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Enter your email to create a passwordless account. You'll receive a confirmation
            email to set up your passkey.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Sending verification email...' : 'Continue with Email'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                Prefer a password? Register with password
              </Link>
            </Box>
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
