import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Profile
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Your profile information is managed through your email address.
      </Alert>

      <Box component="form" noValidate>
        <TextField
          fullWidth
          label="Email"
          value={user?.email || ''}
          disabled
          margin="normal"
          helperText="To change your email, go to the Email settings page."
        />

        <Button
          variant="contained"
          disabled
          sx={{ mt: 2 }}
        >
          Save Changes
        </Button>
      </Box>
    </Paper>
  )
}
