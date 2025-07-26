import { Progress, Text, Group } from '@mantine/core';

const steps = [
  { label: 'Register', key: 'REGISTER' },
  { label: 'Email Verification', key: 'EMAIL_VERIFICATION' },
  { label: 'Mobile OTP', key: 'MOBILE_OTP' },
  { label: 'Profile', key: 'PROFILE_UPDATED' },
  { label: 'Done', key: 'DONE' },
];

export default function RegistrationProgress({ currentStep }) {
  const activeIndex = steps.findIndex(s => s.key === currentStep);
  const percent = ((activeIndex + 1) / steps.length) * 100;

  return (
    <div style={{ marginBottom: 24 }}>
      <Progress value={percent} size="lg" />
      <Group mt="sm" position="apart">
        {steps.map((step, idx) => (
          <Text key={step.key} size="xs" color={idx <= activeIndex ? 'blue' : 'gray'}>
            {step.label}
          </Text>
        ))}
      </Group>
    </div>
  );
}