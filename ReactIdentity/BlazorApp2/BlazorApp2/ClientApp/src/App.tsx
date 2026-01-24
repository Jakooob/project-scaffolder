import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { LoginWith2faPage } from '@/pages/LoginWith2faPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { HomePage } from '@/pages/HomePage'
import { RegisterConfirmationPage } from '@/pages/RegisterConfirmationPage'
import { RegisterWithPasskeyPage } from '@/pages/RegisterWithPasskeyPage'
import { VerifyPasskeyEmailPage } from '@/pages/VerifyPasskeyEmailPage'
import { SetupPasskeyPage } from '@/pages/SetupPasskeyPage'
import { AuthPage } from '@/pages/AuthPage'
import { SettingsLayout } from '@/pages/settings/SettingsLayout'
import { ProfilePage } from '@/pages/settings/ProfilePage'
import { EmailPage } from '@/pages/settings/EmailPage'
import { PasswordPage } from '@/pages/settings/PasswordPage'
import { TwoFactorPage } from '@/pages/settings/TwoFactorPage'
import { PasskeysPage } from '@/pages/settings/PasskeysPage'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register-confirmation" element={<RegisterConfirmationPage />} />
      <Route path="/register-with-passkey" element={<RegisterWithPasskeyPage />} />
      <Route path="/verify-passkey-email" element={<VerifyPasskeyEmailPage />} />
      <Route path="/setup-passkey" element={<SetupPasskeyPage />} />
      <Route path="/login-2fa" element={<LoginWith2faPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="email" element={<EmailPage />} />
            <Route path="password" element={<PasswordPage />} />
            <Route path="two-factor" element={<TwoFactorPage />} />
            <Route path="passkeys" element={<PasskeysPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
