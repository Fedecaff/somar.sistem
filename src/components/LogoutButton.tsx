'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-sm text-gray-700 hover:text-gray-900"
    >
      Cerrar sesión
    </button>
  );
}
