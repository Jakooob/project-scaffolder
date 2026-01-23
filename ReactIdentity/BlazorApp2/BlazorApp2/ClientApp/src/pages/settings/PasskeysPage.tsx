import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyIcon from '@mui/icons-material/Key'
import { usePasskey } from '@/hooks/usePasskey'
import { apiGet, apiPost } from '@/api/apiClient'
import type { ApiResponse } from '@/types/auth'

interface PasskeyInfo {
  id: string
  name: string | null
  createdAt: string
}

export function PasskeysPage() {
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { isSupported, isLoading: isRegistering, registerPasskey } = usePasskey()

  const loadPasskeys = async () => {
    try {
      const result = await apiGet<PasskeyInfo[]>('/auth/passkey/list')
      setPasskeys(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load passkeys')
    } finally {
      setIsLoadingList(false)
    }
  }

  useEffect(() => {
    loadPasskeys()
  }, [])

  const handleRegister = async () => {
    setError('')
    setSuccess('')

    const result = await registerPasskey()
    if (result.succeeded) {
      setSuccess('Passkey registered successfully')
      loadPasskeys()
    } else {
      setError(result.message || 'Failed to register passkey')
    }
  }

  const handleDelete = async (id: string) => {
    setError('')
    setSuccess('')

    try {
      const result = await apiPost<ApiResponse>('/auth/passkey/delete', { id })
      if (result.succeeded) {
        setSuccess('Passkey deleted')
        loadPasskeys()
      } else {
        setError(result.message || 'Failed to delete passkey')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  if (!isSupported) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Passkeys
        </Typography>
        <Alert severity="warning">
          Your browser does not support passkeys (WebAuthn).
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Passkeys
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Passkeys let you sign in securely without a password using your fingerprint, face, or screen lock.
      </Typography>

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

      {isLoadingList ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : passkeys.length > 0 ? (
        <List>
          {passkeys.map((passkey) => (
            <ListItem key={passkey.id} divider>
              <KeyIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary={passkey.name || 'Unnamed passkey'}
                secondary={`Added ${new Date(passkey.createdAt).toLocaleDateString()}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(passkey.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          No passkeys registered yet.
        </Alert>
      )}

      <Button
        variant="contained"
        startIcon={<KeyIcon />}
        onClick={handleRegister}
        disabled={isRegistering}
        sx={{ mt: 2 }}
      >
        {isRegistering ? 'Registering...' : 'Add a Passkey'}
      </Button>
    </Paper>
  )
}
