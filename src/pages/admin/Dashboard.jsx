import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/base';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    newUsers: 0,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get('/admin/stats');
        console.log('Admin stats response:', res.data);
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load dashboard statistics. Using placeholder data.');
        
        // Set placeholder data
        setStats({
          totalUsers: 100,
          activeUsers: 75,
          premiumUsers: 25,
          newUsers: 10,
          lastUpdated: new Date(),
          error: true
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`card bg-base-100 shadow-lg border-l-4 ${color}`}>
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title text-lg opacity-70">{title}</h2>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={`text-4xl opacity-70`}>{icon}</div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Admin Dashboard">
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <>
          {error && (
            <div className="alert alert-warning shadow-lg mb-6">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              color="border-primary"
            />
            <StatCard 
              title="Active Users" 
              value={stats.activeUsers} 
              color="border-success"
            />
            <StatCard 
              title="Premium Users" 
              value={stats.premiumUsers} 
              color="border-secondary"
            />
            <StatCard 
              title="New Users (30d)" 
              value={stats.newUsers} 
              color="border-accent"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Quick Actions</h2>
                <div className="divider"></div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/admin/users" className="btn btn-primary">
                    Manage Users
                  </Link>
                  <Link to="/admin/podcasts" className="btn btn-secondary">
                    Review Podcasts
                  </Link>
                  <Link to="/admin/reports" className="btn btn-accent">
                    View Reports
                  </Link>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">System Status</h2>
                <div className="divider"></div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>API Server</span>
                    <span className="badge badge-success">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database</span>
                    <span className="badge badge-success">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Redis Cache</span>
                    <span className="badge badge-success">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated</span>
                    <span className="text-sm opacity-70">
                      {stats.lastUpdated 
                        ? new Date(stats.lastUpdated).toLocaleString()
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}