import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Chip,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import EmailIcon from '@mui/icons-material/Email'
import { useAuth } from '@/contexts/AuthContext'
import { apiPost } from '@/api/apiClient'
import type { ApiResponse } from '@/types/auth'
import { TwoFactorMethod } from '@/types/auth'

export function TwoFactorPage() {
  const { user, refreshUser } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEnable2fa = async () => {
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const result = await apiPost<ApiResponse>('/auth/2fa/enable', {
        method: TwoFactorMethod.Email,
      })
      if (result.succeeded) {
        setSuccess('Two-factor authentication enabled. You will receive a code via email when signing in.')
        await refreshUser()
      } else {
        setError(result.message || 'Failed to enable 2FA')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2fa = async () => {
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const result = await apiPost<ApiResponse>('/auth/2fa/disable')
      if (result.succeeded) {
        setSuccess('Two-factor authentication disabled')
        await refreshUser()
      } else {
        setError(result.message || 'Failed to disable 2FA')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Two-Factor Authentication
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add an extra layer of security to your account. When enabled, you'll need to enter a verification code sent to your email when signing in.
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Status:
        </Typography>
        {user?.twoFactorEnabled ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Enabled"
            color="success"
            size="small"
          />
        ) : (
          <Chip
            icon={<CancelIcon />}
            label="Disabled"
            color="default"
            size="small"
          />
        )}
      </Box>

      {user?.twoFactorEnabled && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon color="action" />
          <Typography variant="body2">
            Verification codes are sent to <strong>{user.email}</strong>
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box>
        {user?.twoFactorEnabled ? (
          <Button
            variant="outlined"
            color="error"
            onClick={handleDisable2fa}
            disabled={isLoading}
          >
            {isLoading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<EmailIcon />}
            onClick={handleEnable2fa}
            disabled={isLoading}
          >
            {isLoading ? 'Enabling...' : 'Enable Two-Factor Authentication'}
          </Button>
        )}
      </Box>
    </Paper>
  )
}
