// import { Card, Text, Anchor, Button } from '@mantine/core';

// export default function PodcastCard({ page, onUpgrade }) {
//   return (
//     <Card shadow="sm" padding="lg">
//       <Text weight={500}>{page.username}</Text>
//       <Anchor href={page.spotify_link} target="_blank">Spotify</Anchor><br/>
//       <Anchor href={page.apple_link} target="_blank">Apple</Anchor><br/>
//       {page.plan === 'FREE' && (
//         <Button onClick={() => onUpgrade(page.username)}>Upgrade</Button>
//       )}
//     </Card>
//   );
// }

// src/components/PodcastCard.jsx
import { Link } from 'react-router-dom';

export default function PodcastCard({ page, onUpgrade, upgradeLoading }) {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 transition-shadow hover:shadow-2xl">
      <div className="card-body p-5">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="card-title text-lg font-bold">{page.title || 'Untitled Page'}</h2>
                <p className="text-sm text-base-content/70">
                    Public URL:
                    <Link to={`/u/${page.username}`} className="link link-primary ml-1">
                        /u/{page.username}
                    </Link>
                </p>
            </div>
            {page.plan === 'FREE' && (
                <div className="badge badge-warning">Free Plan</div>
            )}
        </div>

        <div className="divider my-2"></div>

        <div className="flex flex-wrap gap-2">
            {page.spotify_link && (
                <a href={page.spotify_link} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline">
                    Spotify
                </a>
            )}
            {page.apple_link && (
                <a href={page.apple_link} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline">
                    Apple
                </a>
            )}
        </div>

        <div className="card-actions justify-end mt-4">
          <Link to={`/edit-page/${page.username}`} className="btn btn-sm btn-ghost">
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
}