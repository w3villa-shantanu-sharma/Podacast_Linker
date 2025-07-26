import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  SimpleGrid,
  Loader,
  Center,
  Notification,
  Alert,
  Button,
} from '@mantine/core';
import { IconArrowUpCircle } from '@tabler/icons-react';
import api from '../services/base';
import PodcastCard from '../components/PodcastCard';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch podcasts on load
  useEffect(() => {
    api
      .get('/podcast/mine')
      .then((res) => {
        setPages(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch podcasts');
        setLoading(false);
      });
  }, []);

  // ✅ Upgrade handler with Razorpay
  const handleUpgrade = async (plan = 'PREMIUM') => {
    try {
      setUpgradeLoading(true);
      // FIXED: Removed duplicate '/api' prefix
      const { data } = await api.post('/payment/create-order', { plan });

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: data.order.id,
        name: 'Podcast Link Hub',
        description: `Upgrade to ${plan}`,
        handler: async (resp) => {
          // FIXED: Removed duplicate '/api' prefix
          await api.post('/payment/verify', { ...resp, plan });
          alert('✅ Plan upgraded!');
          window.location.reload(); // Or re-fetch data
        },
        theme: {
          color: '#3399cc',
        },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to start payment. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  // ✅ Render
  return (
    <Container py="md">
      <Title order={2}>🎙️ Your Podcast Pages</Title>

      {loading ? (
        <Center mt="md">
          <Loader size="lg" />
        </Center>
      ) : error ? (
        <Notification color="red" title="Error" mt="md">
          {error}
        </Notification>
      ) : (
        <>
          <SimpleGrid cols={2} spacing="lg" mt="md">
            {pages.map((p) => (
              <PodcastCard
                key={p.username}
                page={p}
                onUpgrade={() => handleUpgrade('PREMIUM')}
                upgradeLoading={upgradeLoading}
              />
            ))}
          </SimpleGrid>

          {user?.plan !== 'PREMIUM' && (
            <Alert
              title="Upgrade Your Experience!"
              color="blue"
              icon={<IconArrowUpCircle />}
              withCloseButton={false}
              mt="md"
            >
              Unlock all features with our premium plans starting at just ₹50.
              <Button
                variant="light"
                color="blue"
                mt="sm"
                onClick={() => navigate('/payment')}
              >
                View Plans
              </Button>
            </Alert>
          )}
        </>
      )}
    </Container>
  );
}
