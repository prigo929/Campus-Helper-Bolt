import { Metadata } from 'next';
import ResetPasswordClient from './reset-password-client';

export const metadata: Metadata = {
  title: 'Reset Password | Military Helper',
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
