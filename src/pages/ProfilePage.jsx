import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/base";

const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);
const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        const res = await api.get("/users/me");
        setProfileData(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Could not load profile. Using basic data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const userData = profileData || user;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card max-w-2xl mx-auto bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-6 md:p-8">
          {error && (
            <div className="alert alert-warning mb-4">
              <span>{error}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={
                      userData?.profile_picture ||
                      `https://ui-avatars.com/api/?name=${userData?.name || userData?.email}&background=random`
                    }
                    alt="User"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{userData?.name}</h1>
                <p className="text-base-content/70 text-lg">@{userData?.username || "username"}</p>
                <div className="badge badge-primary mt-2">{userData?.plan || "Free"} Plan</div>
              </div>
            </div>
            <Link to="/edit-profile" className="btn btn-outline btn-sm">
              Edit Profile
            </Link>
          </div>

          <div className="divider" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <IconMail />
              <span>{userData?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <IconPhone />
              <span>{userData?.phone || "No phone number"}</span>
            </div>
          </div>

          <div className="divider" />

          <div className="text-sm text-base-content/60">
            <strong>Account Created:</strong>{" "}
            {userData?.created_at
              ? new Date(userData.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Unknown"}
          </div>
        </div>
      </div>
    </div>
  );
}
