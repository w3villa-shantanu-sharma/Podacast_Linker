import { Button } from '@mantine/core';

export default function PlanButton({ onUpgrade }) {
  return <Button onClick={onUpgrade}>Upgrade to Premium</Button>;
}
