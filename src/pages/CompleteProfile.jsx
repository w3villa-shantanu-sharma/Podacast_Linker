import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Notification,
  Group,
  Avatar,
  Text,
  FileInput,
  Checkbox,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../services/base";
import OnboardingProgress from "../components/OnboardingProgress";
import { useAuth } from "../hooks/useAuth";

export default function CompleteProfile() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [wantToChangePassword, setWantToChangePassword] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login } = useAuth();
  const token = localStorage.getItem("token");

  const email = location.state?.email || localStorage.getItem("onboarding_email") || "";

  useEffect(() => {
    if (!token && !isAuthenticated) {
      console.error("Not authenticated. Redirecting to login...");
      navigate("/login");
    }
  }, [token, isAuthenticated, navigate]);

  if (!email && !user?.email) {
    console.error("Email not provided for profile completion");
    return <div>Error: Email is required to complete profile. Please go back to login.</div>;
  }

  const isGoogleUser = user?.login_method === "GOOGLE";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      const payload = { username };

      if (isGoogleUser && wantToChangePassword && newPassword) {
        payload.newPassword = newPassword;
      }

      await api.post("/users/complete-profile", payload);

      if (file) {
        const formData = new FormData();
        formData.append("profilePicture", file);
        await api.post("/users/profile/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        await login(currentToken);
      }

      localStorage.removeItem("onboarding_step");
      localStorage.removeItem("onboarding_email");

      showNotification({
        title: "Profile Completed",
        message: "Welcome! Your profile is set.",
        color: "green",
      });
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to complete profile";
      setError(msg);
      if (err.response?.data?.suggestions) {
        setSuggestions(err.response.data.suggestions);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="md">
      <OnboardingProgress currentStep="PROFILE_UPDATED" />
      <Title order={3} mb="md">
        Complete Your Profile
      </Title>

      <form onSubmit={handleSubmit}>
        <TextInput
          label="Choose a username"
          placeholder="e.g. johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          withAsterisk
        />

        {isGoogleUser && (
          <>
            <Checkbox
              mt="md"
              label="I want to set a custom password"
              checked={wantToChangePassword}
              onChange={(event) =>
                setWantToChangePassword(event.currentTarget.checked)
              }
            />

            {wantToChangePassword && (
              <PasswordInput
                label="New Password"
                placeholder="Enter a secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                mt="md"
                required={wantToChangePassword}
              />
            )}

            <Text size="sm" color="dimmed" mt="xs">
              {!wantToChangePassword
                ? "You can continue with Google sign-in only, or set a custom password above."
                : "You'll be able to login with either Google or this password."}
            </Text>
          </>
        )}

        <FileInput
          label="Profile Picture (optional)"
          placeholder="Upload .jpg or .png"
          accept="image/png,image/jpeg"
          mt="md"
          value={file}
          onChange={setFile}
        />

        {file && (
          <Group mt="sm">
            <Text size="sm">Preview:</Text>
            <Avatar src={URL.createObjectURL(file)} radius="xl" size="lg" />
          </Group>
        )}

        <Button type="submit" loading={loading} fullWidth mt="lg">
          Complete Profile
        </Button>
      </form>

      {error && (
        <Notification color="red" mt="md">
          {error}
        </Notification>
      )}

      {suggestions.length > 0 && (
        <Group mt="md" wrap="wrap">
          <Text size="sm">Suggestions:</Text>
          {suggestions.map((s) => (
            <Button
              key={s}
              size="xs"
              variant="outline"
              color="blue"
              onClick={() => setUsername(s)}
            >
              {s}
            </Button>
          ))}
        </Group>
      )}
    </Container>
  );
}
