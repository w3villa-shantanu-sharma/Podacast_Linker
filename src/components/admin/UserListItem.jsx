import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function UserListItem({ user, onStatusChange, onRoleChange, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getStatusBadge = (isActive) => {
    return isActive 
      ? <span className="badge badge-success badge-sm">Active</span>
      : <span className="badge badge-error badge-sm">Inactive</span>;
  };
  
  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'PREMIUM':
        return <span className="badge badge-secondary badge-sm">Premium</span>;
      case 'GOLD':
        return <span className="badge badge-warning badge-sm">Gold</span>;
      case 'SILVER':
        return <span className="badge badge-info badge-sm">Silver</span>;
      default:
        return <span className="badge badge-ghost badge-sm">Free</span>;
    }
  };

  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="mask mask-squircle w-12 h-12">
              <img 
                src={user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                alt={user.name}
              />
            </div>
          </div>
          <div>
            <div className="font-bold">{user.name}</div>
            <div className="text-sm opacity-50">@{user.username || 'no-username'}</div>
          </div>
        </div>
      </td>
      <td>{user.email}</td>
      <td>
        <select 
          className="select select-bordered select-sm w-full max-w-xs"
          value={user.role || 'user'}
          onChange={(e) => onRoleChange(user.uuid, e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td>{getStatusBadge(user.is_active)}</td>
      <td>{getPlanBadge(user.plan)}</td>
      <td>{formatDate(user.created_at)}</td>
      <td>
        <div className="dropdown dropdown-end">
          <div 
            tabIndex={0} 
            role="button" 
            className="btn btn-ghost btn-xs"
            onClick={() => setShowActions(!showActions)}
          >
            ⋮
          </div>
          <ul className={`dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 ${showActions ? 'block' : 'hidden'}`}>
            <li>
              <Link to={`/admin/users/${user.uuid}`}>View Details</Link>
            </li>
            <li>
              <button onClick={() => onStatusChange(user.uuid, !user.is_active)}>
                {user.is_active ? 'Deactivate' : 'Activate'} User
              </button>
            </li>
            <li>
              <button 
                className="text-error"
                onClick={() => onDelete(user.uuid)}
              >
                Delete User
              </button>
            </li>
          </ul>
        </div>
      </td>
    </tr>
  );
}