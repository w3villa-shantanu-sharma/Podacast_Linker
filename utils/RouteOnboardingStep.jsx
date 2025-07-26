export function routeOnboardingStep(nextAction, navigate, email) {
  console.log("Routing to step:", nextAction, "with email:", email); // Debug log
  
  switch (nextAction) {
    case "EMAIL_VERIFICATION":
      navigate("/verify-email", { state: { email } });
      break;
    case "MOBILE_OTP":
      navigate("/verify-otp", { state: { email } });
      break;
    case "PROFILE_UPDATED":
      navigate("/complete-profile", { state: { email } }); // **FIX: Ensure this route works**
      break;
    case "DASHBOARD":
    case null:
      navigate("/dashboard");
      break;
    default:
      console.warn("Unknown next_action:", nextAction);
      navigate("/dashboard");
  }
}
