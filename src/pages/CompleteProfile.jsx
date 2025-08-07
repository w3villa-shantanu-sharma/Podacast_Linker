import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/base";
import OnboardingProgress from "../components/OnboardingProgress";

export default function CompleteProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  // Get email from multiple sources with better error handling
  const emailFromState = location.state?.email;
  const emailFromStorage = localStorage.getItem("onboarding_email");
  const emailFromUser = user?.email;
  
  const email = emailFromState || emailFromUser || emailFromStorage;

  // Remove the authentication check that redirects to login
  // This is causing issues when users need to complete their profile
  
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [wantToChangePassword, setWantToChangePassword] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Enhanced error handling for missing email
  if (!email) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body text-center">
              <h2 className="card-title justify-center text-xl text-error">
                Missing Information
              </h2>
              <p className="text-base-content/70">
                We couldn't find your email information. Please log in again to complete your profile.
              </p>
              <div className="card-actions justify-center mt-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="btn btn-primary"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isGoogleUser = user?.login_method === "GOOGLE";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <OnboardingProgress currentStep="PROFILE_UPDATED" />

        <div className="card bg-base-100 shadow-xl border border-base-300 mt-4">
          <div className="card-body">
            <h2 className="card-title justify-center text-2xl mb-4">
              Complete Your Profile
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Choose a username*</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. johndoe"
                  className="input input-bordered w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>

              {/* Password options for Google Users */}
              {isGoogleUser && (
                <div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={wantToChangePassword}
                        onChange={(e) => setWantToChangePassword(e.currentTarget.checked)}
                      />
                      <span className="label-text">Set a custom password</span>
                    </label>
                  </div>
                  {wantToChangePassword && (
                    <label className="form-control w-full mt-2">
                      <div className="label">
                        <span className="label-text font-semibold">New Password*</span>
                      </div>
                      <input
                        type="password"
                        placeholder="Enter a secure password"
                        className="input input-bordered w-full"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required={wantToChangePassword}
                      />
                    </label>
                  )}
                   <p className="text-xs text-base-content/60 mt-2 px-1">
                    {!wantToChangePassword
                      ? "You can continue with Google sign-in only, or set a custom password above."
                      : "You'll be able to login with either Google or this password."}
                  </p>
                </div>
              )}

              {/* File Input */}
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Profile Picture (optional)</span>
                </div>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                />
              </label>

              {/* Image Preview */}
              {previewUrl && (
                <div className="flex items-center gap-3">
                  <span className="text-sm">Preview:</span>
                  <div className="avatar">
                    <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={previewUrl} alt="Profile preview" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error Message Display */}
              {error && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>{error}</span>
                </div>
              )}

              {/* Username Suggestions */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm">Suggestions:</span>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="btn btn-xs btn-outline"
                      onClick={() => setUsername(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Submit Button */}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading && <span className="loading loading-spinner"></span>}
                Complete Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}