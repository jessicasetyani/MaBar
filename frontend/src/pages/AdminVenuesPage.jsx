import { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';

const AdminVenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState({});

  // Fetch venues based on filter
  const fetchVenues = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'pending' 
        ? '/api/admin/venues/pending' 
        : `/api/admin/venues?status=${filter}`;
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch venues');
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [filter]);

  // Handle venue approval
  const handleApprove = async (venueId, adminNotes = '') => {
    try {
      setActionLoading(prev => ({ ...prev, [venueId]: 'approving' }));
      
      const response = await fetch(`/api/admin/venues/${venueId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ adminNotes })
      });

      if (response.ok) {
        // Remove venue from current list if it's pending filter
        if (filter === 'pending') {
          setVenues(prev => prev.filter(venue => venue._id !== venueId));
        } else {
          // Refresh the list to show updated status
          fetchVenues();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to approve venue');
      }
    } catch (error) {
      console.error('Error approving venue:', error);
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [venueId]: null }));
    }
  };

  // Handle venue rejection
  const handleReject = async (venueId, adminNotes) => {
    if (!adminNotes || adminNotes.trim() === '') {
      setError('Admin notes are required when rejecting a venue');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [venueId]: 'rejecting' }));
      
      const response = await fetch(`/api/admin/venues/${venueId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ adminNotes })
      });

      if (response.ok) {
        // Remove venue from current list if it's pending filter
        if (filter === 'pending') {
          setVenues(prev => prev.filter(venue => venue._id !== venueId));
        } else {
          // Refresh the list to show updated status
          fetchVenues();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to reject venue');
      }
    } catch (error) {
      console.error('Error rejecting venue:', error);
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [venueId]: null }));
    }
  };



  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Venue Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and manage venue submissions
            </p>
          </div>
          
          {/* Filter tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 text-sm font-medium rounded-md capitalize ${
                  filter === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading venues...</span>
          </div>
        ) : (
          /* Venues list */
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {venues.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🏟️</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {filter} venues found
                </h3>
                <p className="text-gray-500">
                  {filter === 'pending' 
                    ? 'All venue submissions have been reviewed.'
                    : `No venues with ${filter} status.`
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {venues.map((venue) => (
                  <VenueCard
                    key={venue._id}
                    venue={venue}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    actionLoading={actionLoading[venue._id]}
                    showActions={filter === 'pending'}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Venue Card Component
const VenueCard = ({ venue, onApprove, onReject, actionLoading, showActions }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  const handleRejectSubmit = () => {
    onReject(venue._id, rejectNotes);
    setShowRejectModal(false);
    setRejectNotes('');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-medium text-gray-900">{venue.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(venue.status)}`}>
                {venue.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><strong>Owner:</strong> {venue.owner?.firstName} {venue.owner?.lastName}</p>
                <p><strong>Email:</strong> {venue.owner?.email}</p>
                <p><strong>Phone:</strong> {venue.phone || 'Not provided'}</p>
              </div>
              <div>
                <p><strong>Address:</strong> {venue.address}</p>
                <p><strong>Courts:</strong> {venue.numberOfCourts}</p>
                <p><strong>Price/Hour:</strong> ${venue.pricePerHour}</p>
              </div>
            </div>
            
            {venue.description && (
              <p className="mt-2 text-sm text-gray-600">
                <strong>Description:</strong> {venue.description}
              </p>
            )}
            
            {venue.amenities && venue.amenities.length > 0 && (
              <div className="mt-2">
                <strong className="text-sm text-gray-600">Amenities:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {venue.amenities.map((amenity) => (
                    <span key={amenity} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-3 text-xs text-gray-500">
              <p>Submitted: {formatDate(venue.createdAt)}</p>
              {venue.reviewedAt && (
                <p>Reviewed: {formatDate(venue.reviewedAt)}</p>
              )}
              {venue.adminNotes && (
                <p className="mt-1"><strong>Admin Notes:</strong> {venue.adminNotes}</p>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onApprove(venue._id)}
                disabled={actionLoading === 'approving'}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {actionLoading === 'approving' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading === 'rejecting'}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {actionLoading === 'rejecting' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rejecting...
                  </>
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reject Venue: {venue.name}
              </h3>
              <div className="mb-4">
                <label htmlFor="rejectNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (required):
                </label>
                <textarea
                  id="rejectNotes"
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Please provide a detailed reason for rejecting this venue..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectNotes('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectNotes.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Venue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminVenuesPage;
