export const ADMIN_EMAIL = 'r.guazzato@studenti.unibg.it';

export function isAdminEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase() === ADMIN_EMAIL;
}

export function getPostLoginPath(user) {
  return isAdminEmail(user?.email) ? '/admin/dashboard' : '/dashboard';
}
