import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Login',
  description: 'Login email, password e magic link con Supabase Auth.',
};

export default function LoginPage() {
  return (
    <AuthForm
      eyebrow="Area riservata"
      title="Accedi alla centrale operativa Crotti Safety."
      description="Dashboard, documenti e richieste tecniche sempre sincronizzati con Supabase."
    />
  );
}
