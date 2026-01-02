'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function ApprovedInnovations() {
  const [innovations, setInnovations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInnovation, setSelectedInnovation] = useState(null); // For sidebar description

  // Edit form states
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingInnovation, setEditingInnovation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: null,
    photoPreview: null,
    photoUrl: null,
    sponsorship_needed: 'no-need'
  });

  useEffect(() => {
    fetchApprovedInnovations();
  }, []);

  const fetchApprovedInnovations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/innovations/approved/', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setInnovations(data.innovations || []);
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching innovations:', error);
      alert('Failed to load approved innovations');
    }
    setLoading(false);
  };

  const handleEdit = (innovation) => {
    setEditingInnovation(innovation);
    setFormData({
      name: innovation.name || '',
      description: innovation.description || '',
      photo: null,
      photoPreview: null,
      photoUrl: innovation.photo_url || null,
      sponsorship_needed: innovation.sponsorship_needed || 'no-need'
    });
    setShowEditForm(true);
    setSelectedInnovation(null); // Close sidebar if open
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      alert('Innovation name is required');
      return;
    }

    try {
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('description', formData.description);
      updateData.append('sponsorship_needed', formData.sponsorship_needed);
      if (formData.photo) {
        updateData.append('photo', formData.photo);
      }

      const res = await fetch(`http://localhost:8000/api/admin/innovations/${editingInnovation.id}/update/`, {
        method: 'PUT',
        credentials: 'include',
        body: updateData
      });

      if (res.ok) {
        alert('Innovation updated successfully!');
        setShowEditForm(false);
        setEditingInnovation(null);
        fetchApprovedInnovations();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update innovation');
      }
    } catch (error) {
      console.error('Error updating innovation:', error);
      alert('Error updating innovation');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`http://localhost:8000/api/admin/innovations/${id}/delete/`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Innovation deleted successfully!');
        fetchApprovedInnovations();
        setSelectedInnovation(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete innovation');
      }
    } catch (error) {
      console.error('Error deleting innovation:', error);
      alert('Error deleting innovation');
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-[#4a772e] font-bold">Loading approved innovations...</div>;
  }

  return (
    <div className="min-h-screen bg-[#E0F2FE] p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold text-[#4a772e] text-center mb-8">
        Approved Innovations Management
      </h2>

      {/* Edit Form (Top Section) */}
      {showEditForm && (
        <div className="mb-8 p-6 bg-white rounded-xl border-2 border-[#e0e0b7] shadow-lg">
          <h3 className="text-xl font-bold text-[#4a772e] mb-5">Edit Innovation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
              <div className="flex flex-col items-center">
                {(formData.photoPreview || formData.photoUrl) && (
                  <div className="relative mb-4">
                    <img
                      src={formData.photoPreview || formData.photoUrl}
                      alt="Preview"
                      className="w-64 h-64 object-cover rounded-lg border shadow"
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, photo: null, photoPreview: null, photoUrl: null }))}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Image must be less than 5MB');
                        return;
                      }
                      setFormData(prev => ({
                        ...prev,
                        photo: file,
                        photoPreview: URL.createObjectURL(file)
                      }));
                    }
                  }}
                  className="mt-3 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#4a772e] file:text-white hover:file:bg-[#3a5f24]"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#4a772e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="6"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#4a772e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sponsorship Needed</label>
                <select
                  value={formData.sponsorship_needed}
                  onChange={e => setFormData(prev => ({ ...prev, sponsorship_needed: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#4a772e]"
                >
                  <option value="no-need">No Need</option>
                  <option value="sponsored">Sponsored</option>
                  <option value="unsponsored">Unsponsored</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditingInnovation(null);
              }}
              className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-6 py-2.5 bg-[#4a772e] text-white rounded-lg font-bold hover:bg-[#3a5f24]"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Cards + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cards List */}
        <div className="lg:col-span-2 space-y-5">
          {innovations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border">
              <p className="text-gray-500 text-lg">No approved innovations found.</p>
            </div>
          ) : (
            innovations.map(innovation => (
              <div
                key={innovation.id}
                className={`bg-white rounded-xl border border-[#e0e0b7] shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                  selectedInnovation?.id === innovation.id ? 'ring-4 ring-[#4a772e] ring-opacity-30' : ''
                }`}
                onClick={() => setSelectedInnovation(innovation)}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Photo */}
                  <div className="sm:w-48 sm:h-48 flex-shrink-0">
                    {innovation.photo_url ? (
                      <img
                        src={`http://localhost:8000${innovation.photo_url}`}
                        alt={innovation.name}
                        className="w-full h-48 sm:h-full object-cover rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-t-xl sm:rounded-l-xl">
                        No Photo
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-[#4a772e] line-clamp-2">{innovation.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(innovation);
                          }}
                          className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(innovation.id, innovation.name);
                          }}
                          className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-3">
                      <div>
                        <span className="font-medium">Innovator:</span> {innovation.innovator_name || 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">Approved:</span> {format(new Date(innovation.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Sponsorship:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        innovation.sponsorship_needed === 'sponsored' ? 'bg-green-100 text-green-800' :
                        innovation.sponsorship_needed === 'unsponsored' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {innovation.sponsorship_display || innovation.sponsorship_needed.replace('-', ' ')}
                      </span>
                    </div>

                    {innovation.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {innovation.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar: Full Description */}
        <div className="lg:col-span-1">
          {selectedInnovation ? (
            <div className="bg-white rounded-xl border border-[#e0e0b7] shadow-lg p-6 sticky top-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#4a772e]">Full Description</h3>
                <button
                  onClick={() => setSelectedInnovation(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h4 className="text-lg font-semibold text-gray-800 mb-3">{selectedInnovation.name}</h4>

              {selectedInnovation.photo_url && (
                <img
                  src={`http://localhost:8000${selectedInnovation.photo_url}`}
                  alt={selectedInnovation.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              {selectedInnovation.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedInnovation.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description provided.</p>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <p><span className="font-medium">Innovator:</span> {selectedInnovation.innovator_name}</p>
                <p><span className="font-medium">Approved on:</span> {format(new Date(selectedInnovation.created_at), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              Click on an innovation card to view full details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}