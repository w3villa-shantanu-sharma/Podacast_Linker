import { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Container,
  Title,
  Progress,
  Center,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../services/base";
import { useNavigate } from "react-router-dom";
import { routeOnboardingStep } from "../utils/routeOnboardingStep";

const OTP_COOLDOWN_SECONDS = 60;

export default function OtpVerification({ email }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // 🕒 Restore cooldown from localStorage
  useEffect(() => {
    const lastSent = parseInt(localStorage.getItem("otp_sent_ts") || "0");
    const elapsed = Math.floor((Date.now() - lastSent) / 1000);
    if (elapsed < OTP_COOLDOWN_SECONDS) {
      setCooldown(OTP_COOLDOWN_SECONDS - elapsed);
    }
  }, []);

  //  Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  //  Verify OTP
  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await api.post("/users/verify-otp", { email, otp });
      showNotification({
        title: "Success",
        message: "Mobile number verified!",
        color: "green",
      });

      // Use next_action from backend to route
      if (res.data.next_action === "PROFILE_UPDATED") {
        navigate("/complete-profile", { state: { email } });
      } else {
        // fallback: use routeOnboardingStep utility if you have it
        routeOnboardingStep(res.data.next_action, navigate, email);
      }
      // onVerified();
    } catch (err) {
      showNotification({
        title: "OTP Verification Failed",
        message: err.response?.data?.message || "Invalid OTP",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Resend OTP with cooldown
  const handleResend = async () => {
    try {
      await api.post("/users/send-otp", { email });
      showNotification({
        title: "OTP Resent",
        message: `A new OTP has been sent to ${email}`,
        color: "blue",
      });
      setOtp("");
      localStorage.setItem("otp_sent_ts", Date.now().toString());
      setCooldown(OTP_COOLDOWN_SECONDS);
    } catch (err) {
      showNotification({
        title: "Failed to Resend",
        message: err.response?.data?.message || "Please try again later.",
        color: "red",
      });
    }
  };

  const progress =
    ((OTP_COOLDOWN_SECONDS - cooldown) / OTP_COOLDOWN_SECONDS) * 100;

  return (
    <Container size="sm" py="md">
      <Title order={3}>Verify Mobile OTP</Title>

      <TextInput
        label="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        mt="md"
        required
      />

      <Button
        fullWidth
        mt="md"
        onClick={handleVerify}
        loading={loading}
        disabled={!otp}
      >
        Verify
      </Button>

      <Button
        fullWidth
        mt="sm"
        variant="subtle"
        onClick={handleResend}
        disabled={cooldown > 0}
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
      </Button>

      {cooldown > 0 && (
        <>
          <Progress
            value={progress}
            size="sm"
            color="indigo"
            striped
            animate
            radius="xl"
            mt="sm"
          />
          <Center mt={4} style={{ fontSize: "12px", color: "#666" }}>
            Wait {cooldown}s before resending
          </Center>
        </>
      )}
    </Container>
  );
}
