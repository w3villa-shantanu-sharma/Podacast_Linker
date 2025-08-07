// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Container,
//   Title,
//   SimpleGrid,
//   Loader,
//   Center,
//   Notification,
//   Alert,
//   Button,
// } from '@mantine/core';
// import { IconArrowUpCircle } from '@tabler/icons-react';
// import api from '../services/base';
// import PodcastCard from '../components/PodcastCard';
// import { useAuth } from '../hooks/useAuth';

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [pages, setPages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [upgradeLoading, setUpgradeLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // ✅ Fetch podcasts on load
//   useEffect(() => {
//     api
//       .get('/podcast/mine')
//       .then((res) => {
//         setPages(res.data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err.response?.data?.message || 'Failed to fetch podcasts');
//         setLoading(false);
//       });
//   }, []);

//   // ✅ Upgrade handler with Razorpay
//   const handleUpgrade = async (plan = 'PREMIUM') => {
//     try {
//       setUpgradeLoading(true);
//       // FIXED: Removed duplicate '/api' prefix
//       const { data } = await api.post('/payment/create-order', { plan });

//       const rzp = new window.Razorpay({
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         order_id: data.order.id,
//         name: 'Podcast Link Hub',
//         description: `Upgrade to ${plan}`,
//         handler: async (resp) => {
//           // FIXED: Removed duplicate '/api' prefix
//           await api.post('/payment/verify', { ...resp, plan });
//           alert('✅ Plan upgraded!');
//           window.location.reload(); // Or re-fetch data
//         },
//         theme: {
//           color: '#3399cc',
//         },
//       });

//       rzp.open();
//     } catch (err) {
//       console.error(err);
//       alert('❌ Failed to start payment. Please try again.');
//     } finally {
//       setUpgradeLoading(false);
//     }
//   };

//   // ✅ Render
//   return (
//     <Container py="md">
//       <Title order={2}>🎙️ Your Podcast Pages</Title>

//       {loading ? (
//         <Center mt="md">
//           <Loader size="lg" />
//         </Center>
//       ) : error ? (
//         <Notification color="red" title="Error" mt="md">
//           {error}
//         </Notification>
//       ) : (
//         <>
//           <SimpleGrid cols={2} spacing="lg" mt="md">
//             {pages.map((p) => (
//               <PodcastCard
//                 key={p.username}
//                 page={p}
//                 onUpgrade={() => handleUpgrade('PREMIUM')}
//                 upgradeLoading={upgradeLoading}
//               />
//             ))}
//           </SimpleGrid>

//           {user?.plan !== 'PREMIUM' && (
//             <Alert
//               title="Upgrade Your Experience!"
//               color="blue"
//               icon={<IconArrowUpCircle />}
//               withCloseButton={false}
//               mt="md"
//             >
//               Unlock all features with our premium plans starting at just ₹50.
//               <Button
//                 variant="light"
//                 color="blue"
//                 mt="sm"
//                 onClick={() => navigate('/payment')}
//               >
//                 View Plans
//               </Button>
//             </Alert>
//           )}
//         </>
//       )}
//     </Container>
//   );
// }


import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from 'react-toastify';
import api from "../services/base";
import YouTubeLinksManager from './YouTubeLinksManager';

const PodcastCard = ({ page, onUpgrade, upgradeLoading }) => {
  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-base-300">
      <div className="card-body p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="card-title text-lg font-bold line-clamp-2">
              {page.title || 'Untitled Page'}
            </h2>
            <p className="text-sm text-base-content/70 mt-1">
              <span className="font-medium">Public URL:</span>
              <Link to={`/u/${page.username}`} className="link link-primary ml-1 break-all">
                /u/{page.username}
              </Link>
            </p>
          </div>
          <div className="badge badge-outline">
            {page.plan || 'FREE'}
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="flex flex-wrap gap-2 mb-4">
          {page.spotify_link && (
            <a href={page.spotify_link} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-success">
              Spotify
            </a>
          )}
          {page.apple_link && (
            <a href={page.apple_link} target="_blank" rel="noopener noreferrer" className="btn btn-xs" style={{backgroundColor: '#9933CC', borderColor: '#9933CC', color: 'white'}}>
              Apple
            </a>
          )}
        </div>

        <div className="card-actions justify-end gap-2">
          <Link to={`/edit-page/${page.username}`} className="btn btn-sm btn-outline">
            Edit
          </Link>
          {page.plan === 'FREE' && (
            <button
              onClick={() => onUpgrade(page.username)}
              className="btn btn-sm btn-primary"
              disabled={upgradeLoading}
            >
              {upgradeLoading && <span className="loading loading-spinner loading-xs"></span>}
              Upgrade
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pages'); // Add this state

  useEffect(() => {
    api.get('/podcast/mine')
      .then((res) => {
        setPages(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch your podcast pages.');
        toast.error('Failed to load your podcast pages.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async (plan = 'PREMIUM') => {
    try {
      setUpgradeLoading(true);
      const { data } = await api.post('/payment/create-order', { plan });

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: 'Podcast Link Hub',
        description: `Upgrade to ${plan} Plan`,
        handler: async (resp) => {
          try {
            await api.post('/payment/verify', { ...resp, plan });
            toast.success('Plan upgraded successfully!');
            window.location.reload();
          } catch (verifyErr) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        theme: {
          color: '#3b82f6',
        },
      });

      rzp.open();
    } catch (err) {
      toast.error('Failed to start the payment process. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🎙️ Your Dashboard
            </h1>
            <p className="text-base-content/70 mt-2">
              Manage your podcast pages and YouTube links
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/create" className="btn btn-primary shadow-lg">
              Create New Page
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-8">
          <button 
            className={`tab ${activeTab === 'pages' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('pages')}
          >
            Podcast Pages
          </button>
          <button 
            className={`tab ${activeTab === 'youtube' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('youtube')}
          >
            YouTube Links
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'pages' ? (
          // Your existing podcast pages content
          <>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="text-base-content/70">Loading your podcast pages...</p>
                </div>
              </div>
            ) : error ? (
              <div role="alert" className="alert alert-error shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            ) : (
              <>
                {pages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {pages.map((p) => (
                      <PodcastCard
                        key={p.username}
                        page={p}
                        onUpgrade={() => handleUpgrade('PREMIUM')}
                        upgradeLoading={upgradeLoading}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="max-w-md mx-auto">
                      <div className="text-6xl mb-4">🎙️</div>
                      <h3 className="text-xl font-bold mb-2">No podcast pages yet</h3>
                      <p className="text-base-content/60 mb-6">
                        Create your first podcast page to get started with sharing your content.
                      </p>
                      <Link to="/create" className="btn btn-primary btn-lg">
                        Create Your First Page
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* Upgrade Prompt */}
                {user?.plan !== 'PREMIUM' && (
                  <div role="alert" className="alert alert-info shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                      <h3 className="font-bold">Upgrade Your Experience!</h3>
                      <div className="text-xs">Unlock all features with our premium plans.</div>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => navigate('/payment')}>
                      View Plans
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // YouTube Links Tab
          <YouTubeLinksManager />
        )}
      </div>
    </div>
  );
}