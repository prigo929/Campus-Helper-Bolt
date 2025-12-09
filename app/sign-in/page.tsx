import { Metadata } from 'next';
import SignInClient from './sign-in-client';

export const metadata: Metadata = {
  title: 'Sign In | Military Helper',
};

export default function SignInPage() {
  return <SignInClient />;
}
