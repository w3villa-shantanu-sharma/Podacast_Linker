import { Link, useLocation } from 'react-router-dom';

export default function AdminLayout({ children, title }) {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary text-white' : '';
  };
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/podcasts', label: 'Podcasts', icon: '🎙️' },
    { path: '/admin/reports', label: 'Reports', icon: '📝' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">Admin</span> {title}
          </h1>
          <div className="text-sm breadcrumbs">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/admin">Admin</Link></li>
              {title !== 'Dashboard' && <li>{title}</li>}
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64 card bg-base-100 shadow-lg h-fit">
            <div className="p-4">
              <h2 className="font-bold text-lg mb-4">Admin Panel</h2>
              <ul className="menu bg-base-100 rounded-box gap-1">
                {navItems.map(item => (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className={`${isActive(item.path)}`}
                    >
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  </li>
                ))}
                <div className="divider my-2"></div>
                <li>
                  <Link to="/" className="text-error">
                    <span>🏠</span> Back to Site
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}