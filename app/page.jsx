'use client';

import { useMemo, useState } from 'react';
import { Radio, Search } from 'lucide-react';
import Player from '@/components/player';
import { CHANNELS } from '@/data/channels';

function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

const palette = {
  bg: '#0B0D10',
  panel: '#131619',
  card: '#191D21',
  border: '#262B31',
  text: '#F2F1EE',
  textDim: '#8B9096',
  accent: '#E5484D',
  accentSoft: '#E5484D22',
};

function ChannelTile({ channel, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(channel)}
      className="channel-tile"
      style={{
        background: active ? palette.accentSoft : palette.card,
        border: `1.5px solid ${active ? palette.accent : 'transparent'}`,
      }}
    >
      <div className="channel-avatar" style={{ background: channel.color }}>
        {channel.logo ? (
          <img src={channel.logo} alt={channel.name} className="channel-logo-image" />
        ) : (
          <span>{initials(channel.name)}</span>
        )}
      </div>
      <span className="channel-name" style={{ color: active ? palette.text : palette.textDim }}>
        {channel.name}
      </span>
    </button>
  );
}

export default function LiveTVLayout() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(CHANNELS[0]);

  const filtered = useMemo(() => {
    return CHANNELS.filter((channel) => channel.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <main className="page">
      <div className="topbar">
        <div className="brand">
          <div className="brand-badge">TV</div>
          <span>Raihan TV</span>
        </div>
        <div className="topbar-pill">
          <span className="topbar-dot" />
          <span>Live</span>
        </div>
      </div>

      <div className="page-shell">
        <section className="player-panel">
          <div className="player-frame">
            <Player streamUrl={active.streamUrl} title={active.name} streamType={active.streamType} />
          </div>

          <div className="panel-heading">
            <div className="heading-left">
              <div className="channel-logo" style={{ background: active.color }}>
                {active.logo ? (
                  <img src={active.logo} alt={active.name} className="channel-logo-image" />
                ) : (
                  <span>{initials(active.name)}</span>
                )}
              </div>
              <div>
                <p className="now-playing">Now Playing</p>
                <h1>{active.name}</h1>
              </div>
            </div>
          </div>
        </section>

        <aside className="browser-panel">
          <div className="search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search channels..."
            />
          </div>

          <div className="channel-grid">
            {filtered.map((channel) => (
              <ChannelTile
                key={channel.id}
                channel={channel}
                active={channel.id === active.id}
                onSelect={setActive}
              />
            ))}

            {filtered.length === 0 && (
              <div className="empty-state">
                <Radio size={22} />
                <span>No channels match “{query}”</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
