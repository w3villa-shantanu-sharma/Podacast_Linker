import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import api from "../services/base";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await api.get('/podcast/playlists');
        setPlaylists(res.data);
      } catch (err) {
        console.error("Failed to load playlists:", err);
        setError("Failed to load playlists. Please try again.");
        toast.error("Failed to load playlists.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
          <p className="text-base-content/70 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
             Podcast Playlists
          </h1>
          <p className="text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto">
            Curated collections of podcasts for you to explore and enjoy.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/70">Loading playlists...</p>
            </div>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">No playlists available</h3>
              <p className="text-base-content/60 mb-6">
                Check back later for curated podcast collections.
              </p>
              <Link to="/" className="btn btn-primary">
                Explore Podcasts
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlists.map((pl) => (
              <div key={pl.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full">
                <figure className="relative overflow-hidden">
                  <img
                    src={pl.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(pl.title || 'Playlist')}&background=random&format=svg`}
                    alt={pl.title || 'Playlist'}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pl.title || 'Playlist')}&background=random&format=svg`;
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <div className="badge badge-primary">
                      {pl.total || 0} episodes
                    </div>
                  </div>
                </figure>
                
                <div className="card-body p-4 flex flex-col">
                  <h2 className="card-title text-base font-bold line-clamp-2 min-h-[2.5rem]">
                    {pl.title || "Untitled Playlist"}
                  </h2>
                  <p className="text-sm text-base-content/70 line-clamp-3 flex-1">
                    {pl.description || "No description available."}
                  </p>
                  
                  <div className="card-actions justify-center mt-4">
                    <a 
                      href={pl.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary btn-sm w-full"
                    >
                      View Playlist
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
