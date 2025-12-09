import { Metadata } from 'next';
import SignUpClient from './sign-up-client';

export const metadata: Metadata = {
  title: 'Create Account | Military Helper',
};

export default function SignUpPage() {
  return <SignUpClient />;
}
