import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import api from '../../services/base';
import AdminLayout from '../../components/admin/AdminLayout';
import UserListItem from '../../components/admin/UserListItem';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Debounced search function
  const debouncedFetchUsers = useCallback(
    debounce((searchTerm, role, status, page, limit) => {
      fetchUsers(searchTerm, role, status, page, limit);
    }, 300),
    []
  );

  const fetchUsers = async (search, role, status, page, limit) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      if (status) params.append('status', status);
      params.append('page', page);
      params.append('limit', limit);
      
      console.log(`Fetching users from: /admin/users?${params.toString()}`);
      
      const res = await api.get(`/admin/users?${params.toString()}`);
      
      console.log('API response:', res.data);
      
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    debouncedFetchUsers(
      search,
      roleFilter,
      statusFilter,
      pagination.page,
      pagination.limit
    );
  }, [search, roleFilter, statusFilter, pagination.page, pagination.limit]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // Reset to first page when search changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page }));
  };

  // User action handlers
  const handleStatusChange = async (uuid, isActive) => {
    try {
      await api.put(`/admin/users/${uuid}`, { is_active: isActive });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      
      // Update user in the current list
      setUsers(users.map(user => 
        user.uuid === uuid ? { ...user, is_active: isActive } : user
      ));
    } catch (err) {
      toast.error('Failed to update user status');
      console.error('Error updating user status:', err);
    }
  };

  const handleRoleChange = async (uuid, role) => {
    try {
      await api.put(`/admin/users/${uuid}`, { role });
      toast.success(`User role updated to ${role}`);
      
      // Update user in the current list
      setUsers(users.map(user => 
        user.uuid === uuid ? { ...user, role } : user
      ));
    } catch (err) {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', err);
    }
  };

  const handleDeleteUser = async (uuid) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${uuid}`);
      toast.success('User deleted successfully');
      
      // Remove user from the current list
      setUsers(users.filter(user => user.uuid !== uuid));
      // Update pagination if needed
      if (users.length === 1 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        // Refresh current page
        fetchUsers(search, roleFilter, statusFilter, pagination.page, pagination.limit);
      }
    } catch (err) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  return (
    <AdminLayout title="Manage Users">
      {/* Filters */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="form-control">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input input-bordered w-full"
                  value={search}
                  onChange={handleSearchChange}
                />
                <button className="btn btn-square btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Role filter */}
            <div className="form-control">
              <select
                className="select select-bordered w-full"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {/* Status filter */}
            <div className="form-control">
              <select
                className="select select-bordered w-full"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Users List */}
      <div className="card bg-base-100 shadow-lg overflow-x-auto">
        <div className="card-body p-0">
          <table className="table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map(user => (
                  <UserListItem 
                    key={user.uuid}
                    user={user}
                    onStatusChange={handleStatusChange}
                    onRoleChange={handleRoleChange}
                    onDelete={handleDeleteUser}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    No users found. Try adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm">
          Showing {users.length} of {pagination.total} users
        </div>
        
        <div className="join">
          <button 
            className="join-item btn"
            disabled={pagination.page <= 1}
            onClick={() => goToPage(pagination.page - 1)}
          >
            «
          </button>
          
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            // Show current page and up to 2 pages on each side
            const pageOffset = Math.min(
              Math.max(0, pagination.page - 3),
              Math.max(0, pagination.totalPages - 5)
            );
            const pageNum = i + 1 + pageOffset;
            return (
              <button
                key={i}
                className={`join-item btn ${pageNum === pagination.page ? 'btn-active' : ''}`}
                onClick={() => goToPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            className="join-item btn"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
          >
            »
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}