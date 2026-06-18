import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import type { UserWithDetails } from '../../services/api';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');
  const hasFetchedRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check if user has permission (admin or parish-priest)
    if (currentUser.role !== 'admin' && currentUser.role !== 'parish-priest') {
      navigate('/admin/dashboard');
      return;
    }

    // Only fetch once on mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUsers();
    }
  }, [navigate, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await usersAPI.updateRole(userId, newRole as any);
      setEditingUserId(null);
      setEditingRole('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      alert(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const startEditing = (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setEditingRole(currentRole);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditingRole('');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'parish-priest':
        return 'bg-indigo-100 text-indigo-800';
      case 'priest':
        return 'bg-blue-100 text-blue-800';
      case 'editor':
        return 'bg-green-100 text-green-800';
      case 'parishioner':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'parish-priest':
        return 'Parish Priest';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  if (!user) return null;

  const roles: Array<'admin' | 'editor' | 'priest' | 'parish-priest' | 'parishioner'> = [
    'admin',
    'parish-priest',
    'priest',
    'editor',
    'parishioner'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
                <p className="text-sm text-gray-500">View and manage user roles</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            {users.length} {users.length === 1 ? 'user' : 'users'} total
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-2 text-sm text-gray-500">No users are registered in the system.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => {
                    const isEditing = editingUserId === u._id;
                    const isCurrentUser = user.id === u._id;
                    const parishionerInfo = typeof u.parishioner === 'object' && u.parishioner ? u.parishioner : null;
                    
                    return (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {u.username || (parishionerInfo ? `${parishionerInfo.firstName} ${parishionerInfo.lastName}` : 'N/A')}
                          </div>
                          {parishionerInfo && (
                            <div className="text-xs text-gray-500 mt-1">
                              Parishioner
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {u.email || (parishionerInfo?.email) || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editingRole}
                              onChange={(e) => setEditingRole(e.target.value)}
                              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                              {roles.map((role) => (
                                <option key={role} value={role}>
                                  {getRoleDisplayName(role)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}
                            >
                              {getRoleDisplayName(u.role)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isEditing ? (
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => handleRoleChange(u._id, editingRole)}
                                className="text-green-600 hover:text-green-900 transition-colors font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(u._id, u.role)}
                              disabled={isCurrentUser}
                              className={`transition-colors font-medium ${
                                isCurrentUser
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-purple-600 hover:text-purple-900'
                              }`}
                              title={isCurrentUser ? 'You cannot change your own role' : 'Edit role'}
                            >
                              Edit Role
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

