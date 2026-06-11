import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Admin endpoint is guarded server-side. If unauthenticated/unauthorized,
    // send user to login page.
    axios
      .get('/api/admin')
      .then((res: any) => setStats(res.data))
      .catch((err: any) => {
        setStats(null);
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          window.location.href = '/login';
        }
      });

  }, []);


  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Admin</h1>
      <div style={{ opacity: 0.85 }}>
        {stats ? JSON.stringify(stats, null, 2) : 'No admin stats available.'}
      </div>
    </div>
  );
}

