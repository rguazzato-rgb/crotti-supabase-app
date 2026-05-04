import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Login',
  description: 'Area cliente Crotti Safety con autenticazione Supabase.',
};

export default function Home() {
  return <AuthForm />;
}
