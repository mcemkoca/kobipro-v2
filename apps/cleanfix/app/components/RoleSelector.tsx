'use client';

import { useState } from 'react';

export default function RoleSelector({ id, defaultRole }: { id: string; defaultRole: string }) {
  const [role, setRole] = useState(defaultRole);
  return (
    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 cursor-pointer"
    >
      <option value="ADMIN">Yönetici</option>
      <option value="MANAGER">Sorumlu</option>
      <option value="EMPLOYEE">Personel</option>
      <option value="CUSTOMER">Müşteri</option>
    </select>
  );
}
