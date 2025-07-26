import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Anchor,
  Card,
  Text,
  Group,
  Loader,
  Divider,
  Button,
  Box,
} from '@mantine/core';
import api from '../services/base';

export default function PublicPage() {
  const { username } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/podcast/${username}`)
      .then((res) => setPage(res.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (page) api.post(`/podcast/track/${username}`);
  }, [page]);

  if (loading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #141e30, #243b55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <Loader color="white" size="lg" />
      </Box>
    );
  }

  if (!page) {
    return (
      <Container style={{ textAlign: 'center', marginTop: 100 }}>
        <Title order={2} color="red">404</Title>
        <Text color="dimmed">Podcast not found.</Text>
      </Container>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        paddingTop: 40,
        background: 'linear-gradient(to bottom, #f0f2f5, #e0e7ff)',
      }}
    >
      <Container size="sm">
        <Card shadow="md" radius="md" p="xl" withBorder>
          <Title order={2} align="center" color="indigo">
            🎧 @{page.username}'s Podcast
          </Title>

          <Divider my="lg" />

          {page.embed_code && (
            <Box
              dangerouslySetInnerHTML={{ __html: page.embed_code }}
              style={{ maxWidth: '100%', marginBottom: 20 }}
            />
          )}

          <Group position="center" spacing="md" mt="md">
            {page.spotify_link && (
              <Button
                component="a"
                href={page.spotify_link}
                target="_blank"
                color="green"
                radius="md"
              >
                Listen on Spotify
              </Button>
            )}

            {page.apple_link && (
              <Button
                component="a"
                href={page.apple_link}
                target="_blank"
                color="dark"
                radius="md"
              >
                Listen on Apple
              </Button>
            )}
          </Group>

          <Text size="sm" align="center" color="dimmed" mt="xl">
            Powered by PodcastHub 🚀
          </Text>
        </Card>
      </Container>
    </Box>
  );
}


// This code defines a public page for a podcast using React and Mantine components.
// It fetches the podcast data based on the username from the URL parameters.
// The `useEffect` hook is used to make an API call to fetch the podcast details when the component mounts.
// If the page data is available, it displays the podcast's username, embed code, and links to Spotify and Apple Podcasts.
// The `dangerouslySetInnerHTML` is used to render the embed code directly into the page.
// The `Anchor` component from Mantine is used to create clickable links for the Spotify and Apple Podcasts pages.
// If the page data is not yet available, it shows a loading message.
// The `api` module is used to handle the HTTP requests to the backend.
// The `Container` component is used to center the content on the page, and `Title` is used for the page title.
// The `useParams` hook from React Router is used to access the URL parameters, specifically the `username` of the podcast.
// The `useState` hook is used to manage the state of the page data.
// The `useEffect` hook is also used to track changes in the `page` state and send a tracking request to the backend whenever the page data is updated.
// This allows the backend to keep track of how many times the public page has been viewed.
// The `dangerouslySetInnerHTML` prop is used to render the embed code directly into the page.
// This is necessary for displaying the podcast player, but it should be used with caution
// as it can expose the application to XSS attacks if the embed code is not sanitized.