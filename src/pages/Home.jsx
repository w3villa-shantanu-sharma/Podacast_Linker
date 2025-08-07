import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import api from "../services/base";

// Consistent icon components
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const fetchEpisodes = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/podcast/free`, { params: { q } });
      // const validEpisodes = (res.data || []).filter(ep => ep.listenNotes || ep.link);
      const validEpisodes = (res.data || []);
      setEpisodes(validEpisodes);
    } catch (err) {
      console.error("Failed to load episodes:", err);
      toast.error("Failed to load podcasts. Please try again.");
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = search.trim();
    if (searchTerm) {
      setQuery(searchTerm);
      fetchEpisodes(searchTerm);
    }
  };

  const handleListenClick = async (podcast) => {
    if (!user) {
      navigate('/register', {
        state: { message: 'Please register or login to listen to podcasts' }
      });
      return;
    }
    
    try {
      api.post(`/podcast/track-listen/${podcast.id}`);
      const url = podcast.listenNotes || podcast.link;
      if (url) {
        window.open(url, "_blank");
        toast.success("Opening podcast in a new tab!");
      } else {
        toast.error("Sorry, no listening link available for this podcast.");
      }
    } catch (err) {
      console.error("Failed to track click:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            🎙️ Podcast Link Hub
          </h1>
          <p className="text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto">
            Discover trending podcasts or search your favorites!
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="form-control flex-1">
              <label className="input input-bordered input-lg flex items-center gap-2 bg-base-100 shadow-lg">
                <SearchIcon />
                <input
                  type="text"
                  className="grow text-base"
                  placeholder="Search podcasts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            <button type="submit" className="btn btn-primary btn-lg px-8 shadow-lg">
              Search
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link to="/playlists" className="btn btn-outline btn-lg">
            🎧 Explore Playlists
          </Link>
          {user?.username && (
            <Link to={`/u/${user.username}`} className="btn btn-ghost btn-lg">
              👉 View Your Profile
            </Link>
          )}
        </div>

        {/* Results Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {query ? `🔎 Results for "${query}"` : '🌟 Featured Podcasts'}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-base-content/70">Loading amazing podcasts...</p>
              </div>
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-bold mb-2">No podcasts found</h3>
                <p className="text-base-content/60 mb-6">
                  Try adjusting your search terms or explore our curated playlists.
                </p>
                <Link to="/playlists" className="btn btn-primary">
                  Browse Playlists
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {episodes.map((ep, i) => (
                <div key={i} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <figure className="relative overflow-hidden">
                    <img
                      src={ep.thumbnail || ep.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(ep.title)}&background=random`}
                      alt={ep.title}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ep.title)}&background=random`;
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <div className="badge badge-primary gap-1">
                        <ClockIcon />
                        {Math.floor((ep.audio_length_sec || 1800) / 60)}m
                      </div>
                    </div>
                  </figure>
                  
                  <div className="card-body p-4">
                    <h3 className="card-title text-sm font-bold line-clamp-2 min-h-[2.5rem]">
                      {ep.title}
                    </h3>
                    <p className="text-xs text-base-content/70 line-clamp-3 min-h-[3rem]">
                      {ep.description?.replace(/<[^>]+>/g, "") || "No description available."}
                    </p>
                    
                    <div className="card-actions justify-center mt-4">
                      <button 
                        onClick={() => handleListenClick(ep)} 
                        className="btn btn-primary btn-sm w-full"
                      >
                        🔗 Listen Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}