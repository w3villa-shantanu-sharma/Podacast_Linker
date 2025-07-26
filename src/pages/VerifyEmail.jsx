import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Button,
  Progress,
  Stack,
  Center,
  Alert,
  Box,
  Group,
  Badge,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconMail,
  IconClock,
  IconRefresh,
  IconArrowLeft,
} from "@tabler/icons-react";
import api from "../services/base";
import OnboardingProgress from "../components/OnboardingProgress";
import { routeOnboardingStep } from "../../utils/RouteOnboardingStep";

const RESEND_WAIT_SECONDS = 60;

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get email from state or URL params
  const email =
    location.state?.email || localStorage.getItem("onboarding_email") || ""; // fallback from storage

  // Get token from URL path (after /verify-email/)
  const pathSegments = location.pathname.split("/");
  const token = pathSegments[pathSegments.length - 1];
  const hasToken = token && token !== "verify-email";

  // State management
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'verifying', 'success', 'error'
  const [error, setError] = useState("");
  const [autoVerified, setAutoVerified] = useState(false);

  // Auto-verify when component mounts if token exists
  useEffect(() => {
    // Auto-verify function moved inside useEffect
    const handleAutoVerify = async () => {
      try {
        setVerificationStatus("verifying");
        console.log("Auto-verifying token:", token);

        const res = await api.get(`/users/verify-email/${token}`);
        console.log("Verification response:", res.data);

        setVerificationStatus("success");

        showNotification({
          title: "Email Verified!",
          message: res.data.message || "Email verified successfully",
          color: "green",
          icon: <IconCheck size={16} />,
          autoClose: 3000,
        });

        // Wait 2 seconds then redirect to next step
        setTimeout(() => {
          if (res.data.next_action) {
            localStorage.setItem("onboarding_step", res.data.next_action);
            localStorage.setItem("onboarding_email", res.data.email || email);
            routeOnboardingStep(
              res.data.next_action,
              navigate,
              res.data.email || email
            );
          } else {
            localStorage.removeItem("onboarding_step");
            localStorage.removeItem("onboarding_email");
            navigate("/dashboard");
          }
        }, 2000);
      } catch (err) {
        console.error("Auto-verification error:", err);

        setVerificationStatus("error");
        setError(err.response?.data?.message || "Verification failed");

        showNotification({
          title: "Verification Failed",
          message:
            err.response?.data?.message || "Invalid or expired verification link",
          color: "red",
          icon: <IconX size={16} />,
          autoClose: 5000,
        });
      }
    };

    if (hasToken && !autoVerified) {
      setAutoVerified(true);
      handleAutoVerify();
    } else if (!hasToken) {
      // Restore cooldown from localStorage for resend functionality
      const lastSent = parseInt(localStorage.getItem("resend_email_ts") || "0");
      const elapsed = Math.floor((Date.now() - lastSent) / 1000);
      if (elapsed < RESEND_WAIT_SECONDS) {
        setCooldown(RESEND_WAIT_SECONDS - elapsed);
      }
    }
  }, [hasToken, autoVerified, token, email, navigate]);

  useEffect(() => {
    // If neither email in state nor local storage, go back to register/login
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Manual resend function
  const handleResend = async () => {
    if (!email) {
      showNotification({
        title: "Error",
        message: "Email address is required to resend verification",
        color: "red",
      });
      return;
    }

    try {
      setLoading(true);
      await api.post("/users/resend-verification", { email });

      showNotification({
        title: "Verification Email Sent",
        message: `A new verification email was sent to ${email}`,
        color: "green",
        icon: <IconMail size={16} />,
      });

      localStorage.setItem("resend_email_ts", Date.now().toString());
      setCooldown(RESEND_WAIT_SECONDS);
    } catch (err) {
      showNotification({
        title: "Resend Failed",
        message: err.response?.data?.message || "Please try again later.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle different UI states
  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case "verifying":
        return (
          <Alert
            icon={<IconClock size={16} />}
            title="Verifying..."
            color="blue"
          >
            <Text>Please wait while we verify your email address...</Text>
            <Progress value={50} size="lg" color="blue" animate mt="md" />
          </Alert>
        );

      case "success":
        return (
          <Alert
            icon={<IconCheck size={16} />}
            title="Email Verified!"
            color="green"
          >
            <Text>Your email has been verified successfully!</Text>
            <Text size="sm" color="dimmed" mt="xs">
              Redirecting you to the next step...
            </Text>
            <Progress value={100} size="sm" color="green" mt="md" />
          </Alert>
        );

      case "error":
        return (
          <Alert
            icon={<IconX size={16} />}
            title="Verification Failed"
            color="red"
          >
            <Text>{error}</Text>
            <Group mt="md">
              <Button
                size="sm"
                variant="light"
                color="red"
                onClick={handleResend}
                disabled={!email || cooldown > 0}
                loading={loading}
              >
                Resend Verification Email
              </Button>
              <Button
                size="sm"
                variant="subtle"
                leftIcon={<IconArrowLeft size={14} />}
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </Group>
          </Alert>
        );

      default:
        return null;
    }
  };

  const progressValue =
    ((RESEND_WAIT_SECONDS - cooldown) / RESEND_WAIT_SECONDS) * 100;

  return (
    <Container size="sm" py="md">
      <OnboardingProgress currentStep="EMAIL_VERIFICATION" />

      <Stack spacing="lg">
        <Box>
          <Title order={2} ta="center" mb="xs">
            {hasToken ? "Verifying Email" : "Check Your Email"}
          </Title>

          {email && (
            <Text ta="center" color="dimmed" mb="md">
              {hasToken
                ? "Please wait while we verify your email address..."
                : `We've sent a verification link to`}
              {!hasToken && (
                <>
                  <br />
                  <Badge variant="light" color="blue" mt="xs">
                    {email}
                  </Badge>
                </>
              )}
            </Text>
          )}
        </Box>

        {/* Auto-verification status */}
        {hasToken && renderVerificationStatus()}

        {/* Manual verification UI */}
        {!hasToken && (
          <>
            <Alert
              icon={<IconMail size={16} />}
              title="Check Your Inbox"
              color="blue"
            >
              <Text size="sm">
                Click the verification link in your email to continue. If you
                don't see it, check your spam folder.
              </Text>
            </Alert>

            <Divider label="Need help?" labelPosition="center" />

            <Stack spacing="sm">
              <Button
                onClick={handleResend}
                disabled={cooldown > 0 || !email}
                loading={loading}
                leftIcon={<IconRefresh size={16} />}
                variant="light"
                fullWidth
              >
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend Verification Email"}
              </Button>

              {cooldown > 0 && (
                <Box>
                  <Progress
                    value={progressValue}
                    striped
                    animate
                    size="sm"
                    color="blue"
                    radius="md"
                    mb="xs"
                  />
                  <Text ta="center" size="xs" color="dimmed">
                    Wait {cooldown} seconds before requesting a new email
                  </Text>
                </Box>
              )}

              <Button
                variant="subtle"
                leftIcon={<IconArrowLeft size={14} />}
                onClick={() => navigate("/login")}
                fullWidth
              >
                Back to Login
              </Button>
            </Stack>
          </>
        )}

        {/* No email provided */}
        {!email && !hasToken && (
          <Alert
            icon={<IconX size={16} />}
            title="Missing Email"
            color="orange"
          >
            <Text>
              No email address provided. Please try registering again.
            </Text>
            <Button
              mt="md"
              onClick={() => navigate("/register")}
              variant="light"
              color="orange"
            >
              Go to Registration
            </Button>
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
