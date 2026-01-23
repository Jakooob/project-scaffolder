import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import SecurityIcon from '@mui/icons-material/Security'
import KeyIcon from '@mui/icons-material/Key'

const menuItems = [
  { path: '/settings', label: 'Profile', icon: <PersonIcon /> },
  { path: '/settings/email', label: 'Email', icon: <EmailIcon /> },
  { path: '/settings/password', label: 'Password', icon: <LockIcon /> },
  { path: '/settings/two-factor', label: 'Two-Factor Auth', icon: <SecurityIcon /> },
  { path: '/settings/passkeys', label: 'Passkeys', icon: <KeyIcon /> },
]

export function SettingsLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
        <Paper sx={{ width: 240, flexShrink: 0 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
