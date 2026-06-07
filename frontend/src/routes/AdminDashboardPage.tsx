import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axios
      .get('/api/admin')
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));
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

