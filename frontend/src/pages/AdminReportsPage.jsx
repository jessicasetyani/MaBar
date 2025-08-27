import AdminLayout from '../components/admin/AdminLayout';

const AdminReportsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            View platform analytics and generate reports
          </p>
        </div>

        {/* Coming soon placeholder */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-12 text-center">
            <span className="text-6xl mb-4 block">📊</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Reports & Analytics
            </h3>
            <p className="text-gray-500 mb-4">
              This feature is coming soon. You'll be able to view detailed analytics and generate comprehensive reports.
            </p>
            <div className="text-sm text-gray-400">
              Features planned:
              <ul className="mt-2 space-y-1">
                <li>• User registration and activity metrics</li>
                <li>• Venue performance analytics</li>
                <li>• Booking trends and revenue reports</li>
                <li>• Platform usage statistics</li>
                <li>• Custom report generation</li>
                <li>• Data export capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;
