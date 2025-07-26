// src/components/Navbar.jsx
import { Container, Group, Button, Text, Box, Menu, Avatar } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box bg="dark" px="md" py="sm">
      <Container size="lg" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text size="xl" fw={700} color="white" component={Link} to="/" style={{ textDecoration: 'none' }}>
          🎙️ PodcastHub
        </Text>

        <Group spacing="md">
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
              <Link to="/create" style={{ color: 'white', textDecoration: 'none' }}>Create</Link>
            </>
          )}
        </Group>

        <Group>
          {isAuthenticated && user ? (
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <Button variant="subtle">
                  {user.profile_picture ? (
                    <Avatar 
                      src={user.profile_picture} 
                      radius="xl" 
                      size="sm" 
                      mr={8}
                      onError={(e) => {
                        console.error("Navbar avatar error:", e.target.src);
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = ""; // Remove src to fall back to text avatar
                      }}
                    />
                  ) : (
                    <Avatar radius="xl" size="sm" mr={8}>
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </Avatar>
                  )}
                  {user.name || user.username}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component={Link} to="/dashboard">Dashboard</Menu.Item>
                <Menu.Item component={Link} to="/me">Profile</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" onClick={handleLogout}>Logout</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <>
              <Button variant="subtle" color="gray" component={Link} to="/login">Login</Button>
              <Button variant="filled" component={Link} to="/register">Register</Button>
            </>
          )}
        </Group>
      </Container>
    </Box>
  );
}