import AdminLayout from '../components/admin/AdminLayout';

const AdminUsersPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Coming soon placeholder */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-12 text-center">
            <span className="text-6xl mb-4 block">👥</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              User Management
            </h3>
            <p className="text-gray-500 mb-4">
              This feature is coming soon. You'll be able to manage users, view their profiles, and handle user-related issues.
            </p>
            <div className="text-sm text-gray-400">
              Features planned:
              <ul className="mt-2 space-y-1">
                <li>• View all registered users</li>
                <li>• Search and filter users</li>
                <li>• Manage user roles and permissions</li>
                <li>• Handle user reports and issues</li>
                <li>• User activity monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
