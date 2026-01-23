import { Box, Paper, Typography, Chip, List, ListItem, ListItemText, Divider } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useAuth } from '@/contexts/AuthContext'
import { TwoFactorMethod } from '@/types/auth'

export function AuthPage() {
  const { user } = useAuth()

  const getTwoFactorMethodName = (method: TwoFactorMethod) => {
    switch (method) {
      case TwoFactorMethod.Authenticator:
        return 'Authenticator App'
      case TwoFactorMethod.Email:
        return 'Email'
      default:
        return 'None'
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Authentication Info
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Current User
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary="Email"
              secondary={user?.email || 'Not logged in'}
            />
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText primary="Email Confirmed" />
            {user?.emailConfirmed ? (
              <Chip
                icon={<CheckCircleIcon />}
                label="Verified"
                color="success"
                size="small"
              />
            ) : (
              <Chip
                icon={<CancelIcon />}
                label="Not Verified"
                color="warning"
                size="small"
              />
            )}
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText primary="Two-Factor Authentication" />
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
          </ListItem>

          {user?.twoFactorEnabled && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Preferred 2FA Method"
                  secondary={getTwoFactorMethodName(user.preferredTwoFactorMethod)}
                />
              </ListItem>
            </>
          )}
        </List>
      </Paper>
    </Box>
  )
}
