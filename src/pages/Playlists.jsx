import {
  Container, Title, Card, Group, Anchor, Image, Loader, Grid, Text, Center
} from "@mantine/core";
import { useEffect, useState } from "react";
import api from "../services/base";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await api.get('/podcast/playlists');
        setPlaylists(res.data);
      } catch (err) {
        console.error("Failed to load playlists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <Container size="lg" py="xl">
      <Title order={2} align="center">📚 Podcast Playlists</Title>

      {loading ? (
        <Center my="lg">
          <Loader size="md" />
        </Center>
      ) : (
        <Grid gutter="md" mt="md">
          {playlists.map((pl) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={pl.id}>
              <Card withBorder radius="md" p="md">
                <Card.Section>
                  <Image src={pl.image} alt={pl.title} height={180} fit="cover" />
                </Card.Section>
                <Title order={5} mt="sm">{pl.title}</Title>
                <Text size="sm" color="dimmed" mt="xs" lineClamp={3}>
                  {pl.description}
                </Text>
                <Group justify="space-between" mt="md">
                  <Anchor href={pl.link} target="_blank" size="sm">
                    View
                  </Anchor>
                  <Text size="sm" color="gray">{pl.total} episodes</Text>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
}
