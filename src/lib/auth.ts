import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if ((user as any).role !== 'admin') {
    redirect('/picker');
  }
  return user;
}

export async function requirePicker() {
  const user = await requireAuth();
  if ((user as any).role !== 'picker') {
    redirect('/admin');
  }
  return user;
}
