import { useState } from 'react'
import { Box, Paper, Typography, TextField, Button, Alert, Chip } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useAuth } from '@/contexts/AuthContext'
import { apiPost } from '@/api/apiClient'
import type { ApiResponse } from '@/types/auth'

export function EmailPage() {
  const { user, refreshUser } = useAuth()
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const result = await apiPost<ApiResponse>('/auth/email/change', { newEmail })
      if (result.succeeded) {
        setSuccess('Verification email sent to your new address. Please check your inbox.')
        setNewEmail('')
        await refreshUser()
      } else {
        setError(result.message || 'Failed to change email')
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
        Email
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Current email
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Typography variant="body1">{user?.email}</Typography>
          {user?.emailConfirmed && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Verified"
              color="success"
              size="small"
            />
          )}
        </Box>
      </Box>

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

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label="New Email Address"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          margin="normal"
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !newEmail}
          sx={{ mt: 2 }}
        >
          {isLoading ? 'Sending...' : 'Change Email'}
        </Button>
      </Box>
    </Paper>
  )
}
