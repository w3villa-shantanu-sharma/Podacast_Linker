import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from 'react-toastify';
import api from "../services/base";

export default function EditProfile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    bio: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalData, setOriginalData] = useState({
    username: ""
  });
  
  // Load user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/me");
        const userData = response.data;
        
        setFormData({
          name: userData.name || "",
          username: userData.username || "",
          email: userData.email || "",
          phone: userData.phone || "",
          bio: userData.bio || userData.comment || ""
        });

        // Store original values for comparison
        setOriginalData({
          username: userData.username || ""
        });
        
        // Set profile image preview if it exists
        if (userData.profile_picture) {
          setImagePreview(userData.profile_picture);
        }
      } catch (err) {
        toast.error("Failed to load profile data");
        console.error("Error fetching profile data:", err);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Only include fields that changed
      const updates = {};
      if (formData.name) updates.name = formData.name;
      if (formData.username && formData.username !== originalData.username) {
        updates.username = formData.username;
      }
      if (formData.phone) updates.phone = formData.phone;
      if (formData.bio !== undefined) updates.bio = formData.bio;
      
      // Update profile information if there are changes
      if (Object.keys(updates).length > 0) {
        await api.put("/users/edit-profile", updates);
      }
      
      // Upload profile picture if selected
      if (profileImage) {
        const imageData = new FormData();
        imageData.append("profilePicture", profileImage);
        await api.post("/users/profile/upload", imageData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      
      // Re-fetch user data to update auth context
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        await login(currentToken);
      }
      
      toast.success("Profile updated successfully!");
      navigate("/me");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle profile download
  const handleDownloadProfile = async () => {
    try {
      // Use the existing download profile endpoint
      const response = await api.get("/users/profile/download", {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'profile.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Profile downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download profile");
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title justify-center text-2xl mb-4">
              Edit Your Profile
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="avatar mb-4">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img 
                      src={imagePreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=random`}
                      alt="Profile" 
                    />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full max-w-xs"
                  onChange={handleImageChange}
                />
              </div>
              
              {/* Name */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-semibold">Name</span>
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </label>
              
              {/* Username */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-semibold">Username</span>
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </label>
              
              {/* Email */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-semibold">Email</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  disabled={true}
                />
                <div className="label">
                  <span className="label-text-alt text-base-content/50">Email cannot be changed</span>
                </div>
              </label>
              
              {/* Phone */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-semibold">Phone</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </label>
              
              {/* Bio */}
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-semibold">Bio</span>
                </div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full h-24"
                ></textarea>
              </label>
              
              {/* Error Message */}
              {error && (
                <div className="alert alert-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{error}</span>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/me")}
                >
                  Cancel
                </button>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-accent"
                    onClick={handleDownloadProfile}
                  >
                    Download Profile
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading && <span className="loading loading-spinner loading-xs"></span>}
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}