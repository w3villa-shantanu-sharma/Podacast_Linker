import {
  Container, Title, Text, Card, Group, Anchor, Image,
  Loader, Badge, Grid, Button, Center, TextInput
} from "@mantine/core";
import { IconClock, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/base";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const fetchEpisodes = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/podcast/free`, { params: { q } });
      setEpisodes(res.data || []);
    } catch (err) {
      console.error("Failed to load episodes:", err);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const handleSearch = () => {
    setQuery(search.trim());
    fetchEpisodes(search.trim());
  };

  const handleGetStarted = () => {
    navigate(user ? "/create" : "/register");
  };

  return (
    <Container size="lg" py="xl">
      <Title align="center" order={2}>
        🎙️ <span style={{ color: "#3b82f6" }}>Podcast Link Hub</span>
      </Title>

      <Text align="center" size="lg" color="dimmed" mt="xs" mb="lg">
        Discover trending podcasts or search your favorites!
      </Text>

      <Group position="center" mb="md">
        <TextInput
          placeholder="Search podcasts"
          icon={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </Group>

      <Group position="center" mt="sm" mb="xl">
        <Button component={Link} to="/playlists" variant="outline">
          🎧 Explore Playlists
        </Button>
      </Group>

      {user?.username && (
        <Group position="center" mb="xl">
          <Anchor component={Link} to={`/u/${user.username}`}>
            👉 View Your Public Profile
          </Anchor>
        </Group>
      )}

      <Title order={4} mt="xl" mb="md">
        {query ? `🔎 Results for "${query}"` : '🌟 Random Podcasts'}
      </Title>

      {loading ? (
        <Center my="lg">
          <Loader size="md" />
        </Center>
      ) : episodes.length === 0 ? (
        <Text align="center" color="dimmed">No episodes found.</Text>
      ) : (
        <Grid gutter="md">
          {episodes.map((ep, i) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={i}>
              <Card shadow="sm" radius="md" withBorder p="md" style={{ height: "100%" }}>
                <Card.Section>
                  <Image
                    src={ep.thumbnail || ep.image}
                    alt={ep.title}
                    height={180}
                    fit="cover"
                    radius="md"
                  />
                </Card.Section>

                <Title order={5} mt="sm" lineClamp={2}>{ep.title}</Title>

                <Text size="sm" color="dimmed" mt="xs" lineClamp={3}>
                  {ep.description?.replace(/<[^>]+>/g, "") || "No description available."}
                </Text>

                <Group justify="space-between" mt="md">
                  <Anchor
                    href={ep.listenNotes || ep.link}
                    target="_blank"
                    size="sm"
                    underline="hover"
                  >
                    🔗 Listen
                  </Anchor>
                  <Badge
                    leftSection={<IconClock size={12} />}
                    variant="light"
                    color="blue"
                  >
                    {Math.floor((ep.audio_length_sec || 1800) / 60)} min
                  </Badge>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
}
