import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Button,
  Container,
  Title,
  Divider,
  Group,
  Progress,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandGoogle, IconEye, IconEyeOff } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/base';
;
import OnboardingProgress from "../components/OnboardingProgress";

// Password strength logic
function getStrength(password) {
  let multiplier = password.length > 5 ? 0 : 1;
  if (/[A-Z]/.test(password)) multiplier += 1;
  if (/[0-9]/.test(password)) multiplier += 1;
  if (/[$&+,:;=?@#|'<>.^*()%!-]/.test(password)) multiplier += 1;
  return Math.min((multiplier / 4) * 100, 100);
}

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [visible, { toggle }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post("/users/register", values);
      
      showNotification({
        title: "Registration Successful",
        message: "Please check your email for verification link",
        color: "green",
      });

      // Redirect to email verification waiting page
      navigate("/verify-email", { 
        state: { 
          email: values.email,
          message: "Please check your email for verification link" 
        } 
      });
      
    } catch (err) {
      showNotification({
        title: "Registration Failed",
        message: err.response?.data?.message || "Something went wrong",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const googleAuthUrl = `${import.meta.env.VITE_API_URL}/users/auth/google`;

  function handleGoogleLogin() {
    window.location.href = googleAuthUrl;
  }

  const strength = getStrength(form.values.password);

  return (
    <Container size="sm" py="md">
      <OnboardingProgress currentStep="EMAIL_VERIFICATION" />

      <Title order={3} mb="md">Create Account</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="Name" required {...form.getInputProps('name')} />
        <TextInput label="Email" type="email" required mt="md" {...form.getInputProps('email')} />

        <PasswordInput
          label="Password"
          required
          mt="md"
          visible={visible}
          onVisibilityChange={toggle}
          visibilityToggleIcon={({ reveal }) =>
            reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
          }
          {...form.getInputProps('password')}
        />

        {form.values.password && (
          <>
            <Progress value={strength} size="xs" color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'} mt="xs" />
            <Text size="xs" color="dimmed">
              Password strength: {strength > 80 ? 'Strong' : strength > 50 ? 'Moderate' : 'Weak'}
            </Text>
          </>
        )}

        <Button type="submit" fullWidth mt="lg" loading={loading}>
          Register
        </Button>
      </form>

      <Divider label="Or continue with" my="lg" />

      <Group position="center">
        <Button
          variant="outline"
          leftIcon={<IconBrandGoogle />}
          onClick={handleGoogleLogin}
          color="gray"
        >
          Sign in with Google
        </Button>
      </Group>
    </Container>
  );
}
