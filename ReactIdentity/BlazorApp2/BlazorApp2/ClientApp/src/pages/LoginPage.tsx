import { useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import KeyIcon from '@mui/icons-material/Key'
import { useAuth } from '@/contexts/AuthContext'
import { usePasskey } from '@/hooks/usePasskey'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, refreshUser } = useAuth()
  const { isSupported: passkeySupported, loginWithPasskey, isLoading: passkeyLoading } = usePasskey()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login({ email, password, rememberMe })

      if (result.succeeded) {
        navigate(from, { replace: true })
      } else if (result.requiresTwoFactor) {
        navigate('/login-2fa', { state: { from } })
      } else if (result.isLockedOut) {
        setError('This account has been locked out. Please try again later.')
      } else if (result.isNotAllowed) {
        setError('You must confirm your email before logging in.')
      } else {
        setError(result.message || 'Invalid login attempt.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasskeyLogin = async () => {
    setError('')

    try {
      const result = await loginWithPasskey(email || undefined)

      if (result.succeeded) {
        await refreshUser()
        navigate(from, { replace: true })
      } else if (result.requiresTwoFactor) {
        navigate('/login-2fa', { state: { from } })
      } else {
        setError(result.message || 'Passkey authentication failed.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during passkey login.')
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Sign in
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {passkeySupported && (
              <>
                <Divider sx={{ my: 2 }}>or</Divider>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<KeyIcon />}
                  onClick={handlePasskeyLogin}
                  disabled={passkeyLoading}
                >
                  {passkeyLoading ? 'Authenticating...' : 'Sign in with Passkey'}
                </Button>
              </>
            )}

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Box>
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
