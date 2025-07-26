import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Button,
  Card,
  SimpleGrid,
  List,
  ThemeIcon,
  Divider,
  Modal,
  useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconCrown, IconClockHour6, IconClock12 } from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/base";

// Plan details based on backend config
const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    duration: "Forever",
    icon: <IconCheck size={18} />,
    color: "gray",
    features: [
      "Basic podcast streaming",
      "Limited episode access",
      "Standard audio quality",
    ],
    popular: false,
    description: "Get started with basic podcasting features",
    buttonVariant: "outline",
  },
  {
    id: "SILVER",
    name: "Silver",
    price: 50,
    duration: "1 Hour",
    icon: <IconCheck size={18} />,
    color: "silver",
    features: [
      "Everything in Free",
      "No ads on episodes",
      "HD audio quality",
      "Limited offline downloads",
    ],
    popular: false,
    description: "Upgrade your podcasting experience",
    buttonVariant: "light",
  },
  {
    id: "GOLD",
    name: "Gold",
    price: 100,
    duration: "6 Hours",
    icon: <IconClockHour6 size={18} />,
    color: "yellow",
    features: [
      "Everything in Silver",
      "Unlimited offline downloads",
      "Exclusive content",
      "Priority access to new features",
    ],
    popular: true,
    description: "Best value for podcast enthusiasts",
    buttonVariant: "filled",
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 150,
    duration: "12 Hours",
    icon: <IconClock12 size={18} />,
    color: "violet",
    features: [
      "Everything in Gold",
      "Early access to episodes",
      "Studio quality audio",
      "Personalized recommendations",
      "VIP customer support",
    ],
    popular: false,
    description: "Ultimate podcasting experience",
    buttonVariant: "gradient",
    gradient: { from: "indigo", to: "cyan" },
  },
];

export default function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Handle plan selection and payment initialization
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    
    if (plan.id === "FREE") {
      // Handle free plan selection
      showNotification({
        title: "Free Plan Selected",
        message: "You're already on the free plan!",
        color: "green",
      });
      return;
    }
    
    setConfirmModalOpen(true);
  };

  // Process payment through Razorpay
  const handleProceedPayment = async () => {
    if (!selectedPlan || selectedPlan.id === "FREE") return;
    
    try {
      setLoading(true);
      const response = await api.post("/payment/create-order", {
        plan: selectedPlan.id,
      });
      
      const { order } = response.data;
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Podcast Hub",
        description: `${selectedPlan.name} Plan Subscription`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // FIXED: Removed duplicate '/api' prefix
            await api.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan.id,
            });
            
            showNotification({
              title: "Payment Successful!",
              message: `Your ${selectedPlan.name} plan is now active`,
              color: "green",
            });
            
            // Redirect to dashboard after successful payment
            setTimeout(() => navigate("/dashboard"), 2000);
          } catch (err) {
            console.error("Payment verification error:", err);
            showNotification({

              title: "Payment Verification Failed",
              message: "Please contact support if your payment was deducted",
              color: "red",
            });
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#3399cc",
        },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error("Payment initialization error:", error);
      
      // Enhanced error messaging
      let errorMessage = "Could not process payment";
      if (error.response?.data?.error === 'API_AUTH_ERROR') {
        errorMessage = "Payment service is currently unavailable. Please try again later or contact support.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showNotification({
        title: "Payment Setup Failed",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setLoading(false);
      setConfirmModalOpen(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Stack spacing="xs" align="center" mb="xl">
        <Badge variant="filled" size="lg" color="blue" radius="sm">
          Pricing Plans
        </Badge>
        <Title order={1} align="center" mt="md">
          Choose the Perfect Plan for Your Podcasting Needs
        </Title>
        <Text color="dimmed" align="center" maw={600} mx="auto" size="lg" mt="xs">
          Unlock premium features to enhance your podcast experience with our flexible pricing options.
        </Text>
      </Stack>

      {/* Plans Grid */}
      <SimpleGrid
        cols={4}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 2 },
          { maxWidth: 'xs', cols: 1 },
        ]}
        mt={50}
      >
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
              transform: plan.popular ? 'scale(1.05)' : 'none',
              border: plan.popular ? `2px solid ${theme.colors[plan.color][5]}` : undefined,
            }}
          >
            {plan.popular && (
              <Badge
                color={plan.color}
                variant="filled"
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                }}
              >
                Most Popular
              </Badge>
            )}
            
            <Stack align="center" spacing="xs">
              <ThemeIcon size={56} radius="md" color={plan.color}>
                {plan.id === "PREMIUM" ? <IconCrown size={30} /> : plan.icon}
              </ThemeIcon>
              <Title order={3}>{plan.name}</Title>
              <Text size="sm" color="dimmed" align="center">
                {plan.description}
              </Text>
            </Stack>

            <Group position="center" mt="md" mb="xs">
              <Text weight={700} size="xl">
                ₹{plan.price}
              </Text>
              <Text size="sm" color="dimmed">
                / {plan.duration}
              </Text>
            </Group>

            <Divider my="md" />

            <List spacing="sm" size="sm" mb="md" center>
              {plan.features.map((feature, index) => (
                <List.Item
                  key={index}
                  icon={
                    <ThemeIcon color={plan.color} size={20} radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  }
                >
                  {feature}
                </List.Item>
              ))}
            </List>

            <Button
              variant={plan.buttonVariant}
              color={plan.color}
              fullWidth
              gradient={plan.gradient}
              onClick={() => handleSelectPlan(plan)}
              disabled={user?.plan === plan.id}
            >
              {user?.plan === plan.id ? "Current Plan" : "Select Plan"}
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      {/* Payment Confirmation Modal */}
      <Modal
        opened={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={`Confirm ${selectedPlan?.name} Plan`}
        centered
      >
        <Stack spacing="md">
          <Text>You're about to purchase the {selectedPlan?.name} plan for ₹{selectedPlan?.price}.</Text>
          <Text weight={500}>This plan includes:</Text>
          
          <List size="sm">
            {selectedPlan?.features.map((feature, idx) => (
              <List.Item key={idx} icon={<ThemeIcon color={selectedPlan.color} size={20} radius="xl"><IconCheck size={12} /></ThemeIcon>}>
                {feature}
              </List.Item>
            ))}
          </List>
          
          <Group position="apart" mt="md">
            <Button variant="light" onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={selectedPlan?.buttonVariant} 
              color={selectedPlan?.color} 
              gradient={selectedPlan?.gradient}
              onClick={handleProceedPayment}
              loading={loading}
            >
              Proceed to Payment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}