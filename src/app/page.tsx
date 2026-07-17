import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminAuthenticated } from '@/lib/auth';

export default async function EntryPage() {
  const user = await getCurrentUser();
  if (await isAdminAuthenticated()) redirect('/admin/access');
  redirect(user ? (user.role === 'admin' ? '/admin/access' : '/dashboard') : '/login');
}
