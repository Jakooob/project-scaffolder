import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'

export function RegisterConfirmationPage() {
  const location = useLocation()
  const email = location.state?.email || ''

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <EmailIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography component="h1" variant="h4" gutterBottom>
            Check your email
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We've sent a confirmation link to{' '}
            <strong>{email || 'your email address'}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Click the link in the email to confirm your account. If you don't see the email,
            check your spam folder.
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Return to Sign In
          </Button>
        </Paper>
      </Box>
    </Container>
  )
}
