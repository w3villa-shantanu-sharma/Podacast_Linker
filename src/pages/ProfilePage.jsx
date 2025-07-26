import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Avatar,
  Title,
  Text,
  Button,
  Group,
  Loader,
  Center,
  Badge,
  Divider,
  SimpleGrid,
  Image,
} from "@mantine/core";
import { useAuth } from "../hooks/useAuth";
import api from "../services/base";
import { IconMail, IconPhone, IconUser } from "@tabler/icons-react";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users/me");
        console.log("Profile data:", response.data); // Debug log
        setProfileData(response.data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Center style={{ height: "80vh" }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container>
        <Title order={2} align="center" mt="xl" color="red">
          {error}
        </Title>
      </Container>
    );
  }

  const userData = profileData || user;

  return (
    <Container size="md" my="xl">
      <Paper radius="md" withBorder p="xl" shadow="sm">
        <Group position="apart">
          <Group>
            {userData?.profile_picture ? (
              <Image
                src={userData.profile_picture}
                alt={userData.name || "Profile"}
                width={120}
                height={120}
                radius="50%"
                fallbackSrc="https://placehold.co/120x120?text=User"
                onError={(e) => {
                  console.error("Image load error:", e.target.src);
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "https://placehold.co/120x120?text=User";
                }}
              />
            ) : (
              <Avatar size={120} radius="50%" color="blue">
                {userData?.name?.charAt(0) || userData?.email?.charAt(0) || "U"}
              </Avatar>
            )}
            <div>
              <Title order={2}>{userData?.name}</Title>
              <Text color="dimmed" size="lg">
                @{userData?.username || "username"}
              </Text>
              <Badge color="blue" variant="light" mt="sm">
                {userData?.plan || "Free"} Plan
              </Badge>
            </div>
          </Group>
          <Button variant="light" component="a" href="/complete-profile">
            Edit Profile
          </Button>
        </Group>

        <Divider my="xl" />

        <SimpleGrid cols={2} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
          <Group>
            <IconMail size={20} />
            <Text>{userData?.email}</Text>
          </Group>
          <Group>
            <IconPhone size={20} />
            <Text>{userData?.phone || "No phone number provided"}</Text>
          </Group>
        </SimpleGrid>

        <Divider my="xl" />

        <Text>
          <strong>Account Created:</strong>{" "}
          {new Date(userData?.created_at).toLocaleDateString()}
        </Text>
      </Paper>
    </Container>
  );
}