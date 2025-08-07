import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/base';

const YouTubeLinksManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingLink, setAddingLink] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Plan limits configuration
  const planLimits = {
    FREE: { limit: 0, name: 'Free' },
    SILVER: { limit: 5, name: 'Silver' },
    GOLD: { limit: 50, name: 'Gold' },
    PREMIUM: { limit: 100, name: 'Premium' },
  };

  const currentPlan = planLimits[user?.plan || 'FREE'];

  useEffect(() => {
    fetchYouTubeLinks();
  }, []);

  const fetchYouTubeLinks = async () => {
    try {
      const response = await api.get('/youtube/links');
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching YouTube links:', error);
      toast.error('Failed to load YouTube links');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setAddingLink(true);
    try {
      const response = await api.post('/youtube/links', { youtube_url: newUrl });
      setLinks([response.data, ...links]);
      setNewUrl('');
      setShowAddForm(false);
      toast.success('YouTube link added successfully!');
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.requiresUpgrade) {
        toast.error(errorData.message);
        // Show upgrade prompt
        setTimeout(() => {
          navigate('/payment');
        }, 2000);
      } else {
        toast.error(errorData?.message || 'Failed to add YouTube link');
      }
    } finally {
      setAddingLink(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Are you sure you want to delete this YouTube link?')) return;

    try {
      await api.delete(`/youtube/links/${linkId}`);
      setLinks(links.filter(link => link.id !== linkId));
      toast.success('YouTube link deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete YouTube link');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">📺 YouTube Podcast Links</h2>
          <p className="text-base-content/70">
            {currentPlan.limit === 0 
              ? 'Upgrade your plan to add YouTube podcast links'
              : `${links.length} of ${currentPlan.limit} links used (${currentPlan.name} Plan)`
            }
          </p>
        </div>
        
        {currentPlan.limit > 0 && (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={links.length >= currentPlan.limit}
            className="btn btn-primary"
          >
            Add YouTube Link
          </button>
        )}
      </div>

      {/* Plan Upgrade Notice for FREE users */}
      {currentPlan.limit === 0 && (
        <div role="alert" className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 className="font-bold">Upgrade Required!</h3>
            <div className="text-xs">YouTube podcast links are available on paid plans starting from Silver.</div>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/payment')}>
            View Plans
          </button>
        </div>
      )}

      {/* Add Link Form Modal */}
      {showAddForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add YouTube Podcast Link</h3>
            <form onSubmit={handleAddLink} className="py-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">YouTube URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input input-bordered w-full"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
                <div className="label">
                  <span className="label-text-alt">Paste any YouTube video or podcast URL</span>
                </div>
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewUrl('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addingLink}
                >
                  {addingLink && <span className="loading loading-spinner"></span>}
                  Add Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YouTube Links Grid */}
      {links.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-xl font-bold mb-2">No YouTube links yet</h3>
          <p className="text-base-content/60">
            {currentPlan.limit === 0 
              ? 'Upgrade your plan to start adding YouTube podcast links'
              : 'Add your first YouTube podcast link to get started'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <div key={link.id} className="card bg-base-100 shadow-xl">
              <figure>
                <img 
                  src={link.thumbnail} 
                  alt={link.title}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body p-4">
                <h3 className="card-title text-sm line-clamp-2">{link.title}</h3>
                <div className="card-actions justify-between items-center mt-4">
                  <a 
                    href={link.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    Watch
                  </a>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="btn btn-error btn-outline btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Management Section */}
      {currentPlan.limit > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Plan Management</h3>
            <p className="text-base-content/70">
              You're currently on the {currentPlan.name} plan with {currentPlan.limit} YouTube links.
            </p>
            <div className="card-actions">
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/payment')}
              >
                Manage Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeLinksManager;