export function routeOnboardingStep(nextAction, navigate, state) {
  console.log("Routing to step:", nextAction, "with state:", state);
  
  // Clean up the state to ensure email is a string
  const cleanState = typeof state === 'object' && state !== null 
    ? { email: state.email || state, message: state.message }
    : { email: state };
  
  switch (nextAction) {
    case "EMAIL_VERIFICATION":
      navigate("/verify-email", { state: cleanState });
      break;
    case "MOBILE_OTP":
      navigate("/verify-otp", { state: cleanState });
      break;
    case "PROFILE_UPDATED":
      navigate("/complete-profile", { state: cleanState });
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
