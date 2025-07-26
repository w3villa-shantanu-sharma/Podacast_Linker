import { Card, Text, Anchor, Button } from '@mantine/core';

export default function PodcastCard({ page, onUpgrade }) {
  return (
    <Card shadow="sm" padding="lg">
      <Text weight={500}>{page.username}</Text>
      <Anchor href={page.spotify_link} target="_blank">Spotify</Anchor><br/>
      <Anchor href={page.apple_link} target="_blank">Apple</Anchor><br/>
      {page.plan === 'FREE' && (
        <Button onClick={() => onUpgrade(page.username)}>Upgrade</Button>
      )}
    </Card>
  );
}
