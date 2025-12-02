import { Metadata } from 'next';
import SignUpClient from './sign-up-client';

export const metadata: Metadata = {
  title: 'Create Account | Campus Helper',
};

export default function SignUpPage() {
  return <SignUpClient />;
}
