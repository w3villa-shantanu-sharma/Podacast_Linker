import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/base';

export default function CreatePage() {
  const navigate = useNavigate();
  // State management using individual useState hooks
  const [username, setUsername] = useState('');
  const [spotifyLink, setSpotifyLink] = useState('');
  const [appleLink, setAppleLink] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const values = {
      username: username.trim(),
      spotify_link: spotifyLink.trim(),
      apple_link: appleLink.trim(),
      embed_code: embedCode.trim(),
    };

    try {
      await api.post('/podcast/create', values);
      // Optional: Show a success message before navigating
      navigate('/dashboard', { state: { message: 'Your podcast page was created successfully!' } });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create the page. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title justify-center text-2xl mb-4">
              Create Your Podcast Page
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Your Public URL*</span>
                </div>
                <div className="join w-full">
                  <span className="join-item btn btn-disabled hidden sm:inline-flex">podcast-hub.com/p/</span>
                  <input
                    type="text"
                    placeholder="your-username"
                    className="input input-bordered join-item w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="label">
                  <span className="label-text-alt">This will be your unique page link.</span>
                </div>
              </label>

              {/* Spotify Link */}
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Spotify Link</span>
                </div>
                <input
                  type="url"
                  placeholder="https://open.spotify.com/..."
                  className="input input-bordered w-full"
                  value={spotifyLink}
                  onChange={(e) => setSpotifyLink(e.target.value)}
                />
              </label>

              {/* Apple Podcasts Link */}
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Apple Podcasts Link</span>
                </div>
                <input
                  type="url"
                  placeholder="https://podcasts.apple.com/..."
                  className="input input-bordered w-full"
                  value={appleLink}
                  onChange={(e) => setAppleLink(e.target.value)}
                />
              </label>

              {/* Embed Code */}
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Embed Code (iframe)</span>
                </div>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="<iframe src='...' ></iframe>"
                  value={embedCode}
                  onChange={(e) => setEmbedCode(e.target.value)}
                ></textarea>
                 <div className="label">
                  <span className="label-text-alt">From your podcast host (e.g., Spotify for Podcasters, Transistor).</span>
                </div>
              </label>

              {/* Error Display */}
              {error && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading && <span className="loading loading-spinner"></span>}
                Create Page
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}