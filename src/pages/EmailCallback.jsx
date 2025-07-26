// src/pages/EmailCallback.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Title, Progress } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../services/base";
import OnboardingProgress from "../components/OnboardingProgress";
import {routeOnboardingStep} from "../../utils/RouteOnboardingStep";



export default function EmailCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get(`/users/verify-email?token=${token}`);
        showNotification({
          title: "Email Verified",
          message: res.data.message,
          color: "green",
        });

        const { next_action, email } = res.data;
        routeOnboardingStep(next_action, navigate, email);
      } catch (err) {
        showNotification({
          title: "Verification Failed",
          message: err.response?.data?.message || "Invalid or expired link",
          color: "red",
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      showNotification({
        title: "Missing Token",
        message: "No token found in URL",
        color: "red",
      });
      navigate("/login");
    }
  }, [navigate, token]);

  return (
    <Container size="sm" py="md">
      <OnboardingProgress currentStep="EMAIL_VERIFICATION" />
      <Title order={3} mb="md">
        Verifying Email...
      </Title>
      {loading && <Progress value={50} size="lg" color="blue" />}
    </Container>
  );
}
