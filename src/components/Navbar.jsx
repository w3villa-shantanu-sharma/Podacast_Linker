import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth(); // Add isAdmin here
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/login");
    }
  };

  const avatarImage =
    user?.profile_picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || user?.email || "User"
    )}&background=random`;

  const avatarInitial = user?.name?.[0] || user?.email?.[0] || "U";

  const menuLinks = (
    <>
      <li>
        <Link to="/" className="btn btn-ghost">
          🏠 Home
        </Link>
      </li>
      <li>
        <Link to="/playlists" className="btn btn-ghost">
          🎧 Playlists
        </Link>
      </li>
      {isAuthenticated && (
        <>
          <li>
            <Link to="/dashboard" className="btn btn-ghost">
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/create" className="btn btn-ghost">
              ➕ Create Page
            </Link>
          </li>
          {/* Add Admin link if user is admin */}
          {isAdmin && (
            <li>
              <Link to="/admin" className="btn btn-ghost">
                👑 Admin Panel
              </Link>
            </li>
          )}
        </>
      )}
    </>
  );

  const userMenu = (
    <ul
      tabIndex={0}
      className="menu dropdown-content mt-3 p-3 shadow-xl bg-base-100 rounded-box w-64 border border-base-300/50 z-50"
    >
      <li className="menu-title">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-8 rounded-full">
              <img src={avatarImage} alt="User" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold">{user?.name || user?.username}</p>
            <p className="text-xs text-base-content/60">{user?.email}</p>
          </div>
        </div>
      </li>
      <div className="divider my-2" />
      <li>
        <Link to="/me">👤 My Profile</Link>
      </li>
      <li>
        <Link to="/dashboard">📊 Dashboard</Link>
      </li>
      <li>
        <Link to="/payment">💎 Upgrade Plan</Link>
      </li>
      {/* Add Admin link in dropdown if user is admin */}
      {isAdmin && (
        <li>
          <Link to="/admin" className="text-primary font-semibold">
            👑 Admin Panel
          </Link>
        </li>
      )}
      <div className="divider my-2" />
      <li>
        <button onClick={handleLogout} className="text-error">
          🚪 Logout
        </button>
      </li>
    </ul>
  );

  return (
    <div className="navbar bg-base-100/90 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-base-300">
     <div className="w-full max-w-screen-xl mx-auto px-4 flex justify-between items-center">

        {/* Start */}
        <div className="navbar-start">
          {/* Mobile Menu */}
          <div className="dropdown lg:hidden">
            <div tabIndex={0} className="btn btn-ghost btn-circle">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={avatarImage}
                    alt="Avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${avatarInitial}&background=random`;
                    }}
                  />
                </div>
              </div>
            </div>

            <ul className="menu menu-sm dropdown-content mt-3 p-2 bg-base-100 rounded-box w-64 border border-base-300">
              <li className="menu-title">
                <span>Navigation</span>
              </li>
              <div className="divider" />
              {menuLinks}
            </ul>
          </div>

          {/* Logo */}
          <Link to="/" className="btn btn-ghost normal-case text-xl font-bold flex items-center gap-2">

            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🎙️ PodcastHub
            </span>
          </Link>
        </div>

        {/* Center */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1">{menuLinks}</ul>
        </div>

        {/* End */}
        <div className="navbar-end flex items-center space-x-3">
          {isAuthenticated && user ? (
            <>
              <NotificationBell />
              <div className="dropdown dropdown-end">
                <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={avatarImage}
                      alt="Avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${avatarInitial}&background=random`;
                      }}
                    />
                  </div>
                </div>
                {userMenu}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
