// import { useParams } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import {
//   Container,
//   Title,
//   Anchor,
//   Card,
//   Text,
//   Group,
//   Loader,
//   Divider,
//   Button,
//   Box,
// } from '@mantine/core';
// import api from '../services/base';

// export default function PublicPage() {
//   const { username } = useParams();
//   const [page, setPage] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api.get(`/podcast/${username}`)
//       .then((res) => setPage(res.data))
//       .catch(() => setPage(null))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     if (page) api.post(`/podcast/track/${username}`);
//   }, [page]);

//   if (loading) {
//     return (
//       <Box
//         style={{
//           minHeight: '100vh',
//           background: 'linear-gradient(to bottom, #141e30, #243b55)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           color: 'white',
//         }}
//       >
//         <Loader color="white" size="lg" />
//       </Box>
//     );
//   }

//   if (!page) {
//     return (
//       <Container style={{ textAlign: 'center', marginTop: 100 }}>
//         <Title order={2} color="red">404</Title>
//         <Text color="dimmed">Podcast not found.</Text>
//       </Container>
//     );
//   }

//   return (
//     <Box
//       style={{
//         minHeight: '100vh',
//         paddingTop: 40,
//         background: 'linear-gradient(to bottom, #f0f2f5, #e0e7ff)',
//       }}
//     >
//       <Container size="sm">
//         <Card shadow="md" radius="md" p="xl" withBorder>
//           <Title order={2} align="center" color="indigo">
//             🎧 @{page.username}'s Podcast
//           </Title>

//           <Divider my="lg" />

//           {page.embed_code && (
//             <Box
//               dangerouslySetInnerHTML={{ __html: page.embed_code }}
//               style={{ maxWidth: '100%', marginBottom: 20 }}
//             />
//           )}

//           <Group position="center" spacing="md" mt="md">
//             {page.spotify_link && (
//               <Button
//                 component="a"
//                 href={page.spotify_link}
//                 target="_blank"
//                 color="green"
//                 radius="md"
//               >
//                 Listen on Spotify
//               </Button>
//             )}

//             {page.apple_link && (
//               <Button
//                 component="a"
//                 href={page.apple_link}
//                 target="_blank"
//                 color="dark"
//                 radius="md"
//               >
//                 Listen on Apple
//               </Button>
//             )}
//           </Group>

//           <Text size="sm" align="center" color="dimmed" mt="xl">
//             Powered by PodcastHub 🚀
//           </Text>
//         </Card>
//       </Container>
//     </Box>
//   );
// }


// // This code defines a public page for a podcast using React and Mantine components.
// // It fetches the podcast data based on the username from the URL parameters.
// // The `useEffect` hook is used to make an API call to fetch the podcast details when the component mounts.
// // If the page data is available, it displays the podcast's username, embed code, and links to Spotify and Apple Podcasts.
// // The `dangerouslySetInnerHTML` is used to render the embed code directly into the page.
// // The `Anchor` component from Mantine is used to create clickable links for the Spotify and Apple Podcasts pages.
// // If the page data is not yet available, it shows a loading message.
// // The `api` module is used to handle the HTTP requests to the backend.
// // The `Container` component is used to center the content on the page, and `Title` is used for the page title.
// // The `useParams` hook from React Router is used to access the URL parameters, specifically the `username` of the podcast.
// // The `useState` hook is used to manage the state of the page data.
// // The `useEffect` hook is also used to track changes in the `page` state and send a tracking request to the backend whenever the page data is updated.
// // This allows the backend to keep track of how many times the public page has been viewed.
// // The `dangerouslySetInnerHTML` prop is used to render the embed code directly into the page.
// // This is necessary for displaying the podcast player, but it should be used with caution
// // as it can expose the application to XSS attacks if the embed code is not sanitized.

import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/base';

const SpotifyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm4.191 14.536c-.202.315-.633.415-.945.213-2.553-1.564-5.76-1.92-9.588-1.053-.387.087-.78-.135-.867-.522s.135-.78.522-.867c4.172-.94 7.746-.54 10.582 1.225.312.202.415.633.213.945zm.64-2.735c-.254.394-.78.522-1.178.268-2.88-1.75-7.148-2.28-10.515-1.246-.437.133-.898-.133-1.031-.57s.133-.898.57-1.031c3.861-1.186 8.513-.62 11.89 1.439.394.254.522.78.268 1.178z"/>
  </svg>
);

const ApplePodcastsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
    <path d="M12 11.379c-1.239 0-2.325.266-3.271.745-.173.087-.367.043-.5-.108-.211-.227-.192-.588.043-.799C9.313 10.46 10.59 10 12 10s2.687.46 3.729 1.217c.235.211.254.572.043.799-.133.151-.327.195-.5.108-.946-.479-2.032-.745-3.272-.745z"/>
  </svg>
);

export default function PublicPage() {
  const { username } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/podcast/${username}`)
      .then((res) => setPage(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Podcast page not found.");
        setPage(null);
        toast.error("Failed to load podcast page.");
      })
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (page) {
      api.post(`/podcast/track/${username}`).catch(err => console.error("Tracking failed:", err));
    }
  }, [page, username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70 mt-4">Loading podcast page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-3xl font-bold text-error mb-4">404</h1>
          <p className="text-xl mb-6">{error}</p>
          <Link to="/" className="btn btn-primary">Go Back Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card bg-base-100 shadow-2xl border border-base-300 overflow-hidden">
          <div className="card-body p-8 md:p-12 text-center">
            <div className="avatar mb-6">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(page.username)}&background=random&size=96`}
                  alt={`${page.username}'s avatar`}
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              🎧 @{page.username}'s Podcast
            </h1>

            <div className="divider my-8"></div>

            {/* Embedded Player */}
            {page.embed_code && (
              <div className="mb-8">
                <div
                  className="w-full [&>iframe]:w-full [&>iframe]:rounded-lg [&>iframe]:min-h-48 [&>iframe]:shadow-lg"
                  dangerouslySetInnerHTML={{ __html: page.embed_code }}
                />
              </div>
            )}

            {/* Listen On Links */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {page.spotify_link && (
                <a 
                  href={page.spotify_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-success text-white btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <SpotifyIcon />
                  Listen on Spotify
                </a>
              )}
              {page.apple_link && (
                <a 
                  href={page.apple_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{backgroundColor: '#9933CC', borderColor: '#9933CC', color: 'white'}}
                >
                  <ApplePodcastsIcon />
                  Listen on Apple
                </a>
              )}
            </div>

            <div className="divider my-8"></div>

            <p className="text-sm text-base-content/60">
              Powered by PodcastHub 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}