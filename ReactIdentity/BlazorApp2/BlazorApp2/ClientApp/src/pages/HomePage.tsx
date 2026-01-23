import { Box, Typography, Paper } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'

export function HomePage() {
  const { user } = useAuth()

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome!
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          You are signed in as <strong>{user?.email}</strong>.
        </Typography>
        {user?.twoFactorEnabled && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Two-factor authentication is enabled.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}
