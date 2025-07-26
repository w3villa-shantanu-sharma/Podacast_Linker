import { useForm } from '@mantine/form';
import { TextInput, Textarea, Button, Container, Title } from '@mantine/core';
import api from '../services/base';
import { useNavigate } from 'react-router-dom';

export default function CreatePage() {
  const navigate = useNavigate();
  const form = useForm({
    initialValues: { username: '', spotify_link: '', apple_link: '', embed_code: '' },
  });

  const handleSubmit = async (values) => {
    await api.post('/podcast/create', values);
    navigate('/dashboard');
  };

  return (
    <Container size="sm" py="md">
      <Title order={3}>Create Your Podcast Page</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput required label="Username (public URL)" {...form.getInputProps('username')} />
        <TextInput label="Spotify Link" {...form.getInputProps('spotify_link')} />
        <TextInput label="Apple Link" {...form.getInputProps('apple_link')} />
        <Textarea label="Embed Code (iframe)" {...form.getInputProps('embed_code')} mt="md" />
        <Button type="submit" mt="md">Create Page</Button>
      </form>
    </Container>
  );
}
// This code defines a page for creating a new podcast page using Mantine components.
// It uses a form with fields for username, Spotify link, Apple link, and an embed code for the podcast player.
// The form is validated and submitted using the `useForm` hook from Mantine.
// When the form is submitted, it sends a POST request to the `/podcast/create` endpoint with the form values.
// After successful creation, it navigates back to the dashboard using the `useNavigate` hook from React Router.
// The `api` module is used to handle the HTTP request.
// The `Container` component is used to center the form on the page, and `Title` is used for the page title.
// The `TextInput` and `Textarea` components are used for the input fields,
// while the `Button` component is used to submit the form.
// The `getInputProps` method from the `useForm` hook is used to bind the input fields to the form state, allowing for easy management of form values and validation.
// The `required` prop on the username field ensures that it must be filled out before submission, providing basic validation.
// The `mt` prop on the `Textarea` and `Button` components adds margin to the top of those elements, providing spacing in the layout.
// The `handleSubmit` function is defined to handle the form submission, sending the form values to the server via an API call.
// If the creation is successful, it navigates back to the dashboard.
// The `useNavigate` hook from React Router is used to programmatically navigate to the dashboard after the form submission.
// This allows for a smooth user experience, redirecting the user to the dashboard without needing to refresh the page.
// The `form` object created by `useForm` manages the form state and validation.
// It provides methods like `getInputProps` to bind input fields to the form state,
// and `onSubmit` to handle form submission.
// The `initialValues` object defines the initial state of the form fields, which can be useful for pre-filling the form or resetting it.
// The `handleSubmit` function is called when the form is submitted.
// It receives the form values as an argument and performs the API call to create the podcast page.
// If the API call is successful, it navigates to the dashboard using the `navigate` function from `useNavigate`.
// This allows the user to see their newly created podcast page in the dashboard immediately after creation.