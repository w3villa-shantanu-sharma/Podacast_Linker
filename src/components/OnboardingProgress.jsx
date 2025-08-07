// import { Progress, Text, Group } from '@mantine/core';

// const steps = [
//   { label: 'Register', key: 'REGISTER' },
//   { label: 'Email Verification', key: 'EMAIL_VERIFICATION' },
//   { label: 'Mobile OTP', key: 'MOBILE_OTP' },
//   { label: 'Profile', key: 'PROFILE_UPDATED' },
//   { label: 'Done', key: 'DONE' },
// ];

// export default function RegistrationProgress({ currentStep }) {
//   const activeIndex = steps.findIndex(s => s.key === currentStep);
//   const percent = ((activeIndex + 1) / steps.length) * 100;

//   return (
//     <div style={{ marginBottom: 24 }}>
//       <Progress value={percent} size="lg" />
//       <Group mt="sm" position="apart">
//         {steps.map((step, idx) => (
//           <Text key={step.key} size="xs" color={idx <= activeIndex ? 'blue' : 'gray'}>
//             {step.label}
//           </Text>
//         ))}
//       </Group>
//     </div>
//   );
// }

// src/components/OnboardingProgress.jsx (or RegistrationProgress.jsx)

// Define the steps for the onboarding process
const steps = [
  { label: 'Register', key: 'REGISTER' },
  { label: 'Verify Email', key: 'EMAIL_VERIFICATION' },
  { label: 'Verify Mobile', key: 'MOBILE_OTP' },
  { label: 'Complete Profile', key: 'PROFILE_UPDATED' },
  { label: 'Done', key: 'DONE' },
];

export default function OnboardingProgress({ currentStep }) {
  // Find the index of the current step
  const activeIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="w-full mb-8">
      {/* DaisyUI Steps Component */}
      <ul className="steps">
        {steps.map((step, index) => (
          <li
            key={step.key}
            // Dynamically apply classes based on the current step
            className={`step ${index <= activeIndex ? 'step-primary' : ''}`}
          >
            <span className="hidden sm:inline">{step.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}