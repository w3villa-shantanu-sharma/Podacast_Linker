import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

import {
  TextInput,
  PasswordInput,
  Button,
  Container,
  Title,
  Divider,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

import api from "../services/base";
import { routeOnboardingStep } from "../../utils/RouteOnboardingStep";
import OnboardingProgress from "../components/OnboardingProgress";

export default function Login() {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
  });

  const {login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [visible, { toggle }] = useDisclosure(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await api.post("/users/login", values);

       // **FIX: Store token and update auth state for successful login**
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        login(res.data.token); // This will update the auth context
        navigate("/dashboard");
        return;
      }

      // localStorage.setItem("token", res.data.token);
      // localStorage.setItem("role", res.data.role || "user");
      // login(res.data.token);

      // Handle different response statuses
      if (res.data.next_action) {
        // User needs to complete onboarding steps
        showNotification({
          title: "Complete Setup",
          message: res.data.message,
          color: "blue",
        });
        return routeOnboardingStep(
          res.data.next_action,
          navigate,
          res.data.email
        );
      }

      //  Fallback
      navigate(from);
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";

      showNotification({
        title: "Login Error",
        message: msg,
        color: "red",
      });

      // Handle specific cases
      if (err.response?.status === 403 && err.response?.data?.next_action) {
        // User needs to complete onboarding
        setTimeout(() => {
          routeOnboardingStep(
            err.response.data.next_action,
            navigate,
            err.response.data.email
          );
        }, 2000);
      }

      if (msg.includes("sign in with Google")) {
        const confirmGoogle = window.confirm(
          msg + "\n\nDo you want to sign in via Google instead?"
        );
        if (confirmGoogle) handleGoogleLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Auto-login if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      login(token);
      navigate("/dashboard");
    }
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/auth/google`;
  };

  return (
    <Container size="sm" py="md">
      <OnboardingProgress currentStep="EMAIL_VERIFICATION" />
      <Title order={3} mb="md">
        Login
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label="Email"
          placeholder="Enter your email"
          {...form.getInputProps("email")}
        />
        <PasswordInput
          required
          label="Password"
          placeholder="Enter your password"
          mt="md"
          visible={visible}
          onVisibilityChange={toggle}
          visibilityToggleIcon={({ reveal }) =>
            reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
          }
          {...form.getInputProps("password")}
        />

        <Button type="submit" fullWidth mt="md" loading={loading}>
          Login
        </Button>
      </form>

      <Divider my="lg" label="OR" labelPosition="center" />

      <Group position="center">
        <Button
          variant="outline"
          color="red"
          fullWidth
          onClick={handleGoogleLogin}
        >
          Sign in with Google
        </Button>
      </Group>
    </Container>
  );
}
