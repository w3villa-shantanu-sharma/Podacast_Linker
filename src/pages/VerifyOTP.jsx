import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Container,
  Title,
  TextInput,
  Button,
  Progress,
  Center,
  Text,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../services/base";
import OnboardingProgress from "../components/OnboardingProgress";
import { routeOnboardingStep } from "../../utils/RouteOnboardingStep";

const OTP_COOLDOWN_SECONDS = 60;

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email =
    location.state?.email || localStorage.getItem("onboarding_email") || ""; // fallback from storage

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // If neither email in state nor local storage, go back to register/login
    if (!email) {
      navigate("/register");
    }
  }, [email]);

  // Restore cooldown from localStorage
  useEffect(() => {
    const lastSent = parseInt(localStorage.getItem("otp_sent_ts") || "0");
    const elapsed = Math.floor((Date.now() - lastSent) / 1000);
    if (elapsed < OTP_COOLDOWN_SECONDS) {
      setCooldown(OTP_COOLDOWN_SECONDS - elapsed);
      setOtpSent(true);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Send OTP
  const handleSendOTP = async () => {
    if (!phone) {
      showNotification({
        title: "Error",
        message: "Please enter your phone number",
        color: "red",
      });
      return;
    }

    try {
      setLoading(true);
      await api.post("/users/send-otp", { email, phone });
      showNotification({
        title: "OTP Sent",
        message: `OTP has been sent to ${phone}`,
        color: "green",
      });
      setOtpSent(true);
      localStorage.setItem("otp_sent_ts", Date.now().toString());
      setCooldown(OTP_COOLDOWN_SECONDS);
    } catch (err) {
      showNotification({
        title: "Failed to Send OTP",
        message: err.response?.data?.message || "Please try again later.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    if (!otp) {
      showNotification({
        title: "Error",
        message: "Please enter the OTP",
        color: "red",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/users/verify-otp", { email, otp });
      console.log("OTP verification response:", res.data);

      // **FIX: Store token and update auth state**
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        await login(res.data.token); // This will update the auth context
      }

      localStorage.setItem(
        "onboarding_step",
        res.data.next_action || "PROFILE_UPDATED"
      );
      localStorage.setItem("onboarding_email", email);

      showNotification({
        title: "Success",
        message: "Mobile number verified!",
        color: "green",
      });

      // **FIX: Directly navigate to complete-profile instead of using routeOnboardingStep**
      if (res.data.next_action === "PROFILE_UPDATED") {
        navigate("/complete-profile", {
          state: { email: res.data.email || email },
        });
      } else {
        // Fallback: use routeOnboardingStep utility
        routeOnboardingStep(res.data.next_action, navigate, email);
      }
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

  const progress =
    ((OTP_COOLDOWN_SECONDS - cooldown) / OTP_COOLDOWN_SECONDS) * 100;

  return (
    <Container size="sm" py="md">
      <OnboardingProgress currentStep="MOBILE_OTP" />
      <Title order={3} mb="md">
        Verify Mobile Number
      </Title>

      <Text mb="md" color="dimmed">
        We need to verify your mobile number for account security.
      </Text>

      {!otpSent ? (
        <Group>
          <TextInput
            label="Phone Number"
            placeholder="+91 9999999999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={handleSendOTP} loading={loading} mt="xl">
            Send OTP
          </Button>
        </Group>
      ) : (
        <>
          <TextInput
            label="Enter OTP"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />

          <Button
            fullWidth
            mt="md"
            onClick={handleVerify}
            loading={loading}
            disabled={!otp}
          >
            Verify OTP
          </Button>

          <Button
            fullWidth
            mt="sm"
            variant="subtle"
            onClick={handleSendOTP}
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
        </>
      )}
    </Container>
  );
}
