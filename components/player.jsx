'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function Player({ streamUrl, title, streamType = 'auto' }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) {
      return;
    }

    const source = streamUrl.trim();
    const normalizedType = (streamType || 'auto').toLowerCase();
    const isHls = normalizedType === 'hls' || (normalizedType === 'auto' && /\.m3u8?|\.m3u/i.test(source));
    const isTs = normalizedType === 'ts' || (normalizedType === 'auto' && /(\.ts|\.mp2t)(\?.*)?$/i.test(source));
    const isDirectVideo = normalizedType === 'video' || /\.(mp4|m4v|webm|ogg|ogv|mov|avi|mkv)(\?.*)?$/i.test(source);

    const showStreamError = (message = 'Network error while loading the stream.') => {
      setError(message);
    };

    const getPlayableUrl = () => {
      try {
        const parsedUrl = new URL(source);
        if (parsedUrl.protocol === 'http:' && window.location.protocol === 'https:') {
          parsedUrl.protocol = 'https:';
          return parsedUrl.toString();
        }
        return source;
      } catch {
        return source;
      }
    };

    const resolvedUrl = getPlayableUrl();
    let hlsPlayer = null;

    setError('');
    video.pause();
    video.removeAttribute('src');
    video.removeAttribute('type');
    video.removeAttribute('crossorigin');
    video.load();

    const attachErrorHandler = () => {
      const handleVideoError = () => {
        showStreamError('Network error while loading the stream.');
      };

      video.addEventListener('error', handleVideoError);
      return () => video.removeEventListener('error', handleVideoError);
    };

    if (isHls && Hls.isSupported()) {
      hlsPlayer = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsPlayer.loadSource(resolvedUrl);
      hlsPlayer.attachMedia(video);

      hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => undefined);
      });

      hlsPlayer.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              showStreamError('Network error while loading the stream.');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              showStreamError('Media error while decoding the stream.');
              break;
            default:
              showStreamError('Unable to play this stream source.');
              break;
          }
        }
      });

      const cleanupErrorHandler = attachErrorHandler();
      const handleLoadedMetadata = () => {
        video.play().catch(() => undefined);
      };
      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        hlsPlayer?.destroy();
        video.pause();
        video.removeAttribute('src');
        video.removeAttribute('type');
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        cleanupErrorHandler();
        video.load();
      };
    }

    if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = resolvedUrl;
      const cleanupErrorHandler = attachErrorHandler();
      const handleLoadedMetadata = () => {
        video.play().catch(() => undefined);
      };
      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video.pause();
        video.removeAttribute('src');
        video.removeAttribute('type');
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        cleanupErrorHandler();
        video.load();
      };
    }

    if (isDirectVideo || isTs || (!isHls && !isTs)) {
      video.src = resolvedUrl;
      video.type = isTs ? 'video/mp2t' : '';
      if (isDirectVideo) {
        const ext = source.split('?')[0].split('.').pop()?.toLowerCase();
        const mimeByExtension = {
          mp4: 'video/mp4',
          m4v: 'video/mp4',
          webm: 'video/webm',
          ogg: 'video/ogg',
          ogv: 'video/ogg',
          mov: 'video/quicktime',
          avi: 'video/x-msvideo',
          mkv: 'video/x-matroska',
        };
        video.type = mimeByExtension[ext] || '';
      }
      video.crossOrigin = 'anonymous';
      video.load();

      const handleLoadedMetadata = () => {
        video.play().catch(() => undefined);
      };
      const cleanupErrorHandler = attachErrorHandler();
      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video.pause();
        video.removeAttribute('src');
        video.removeAttribute('type');
        video.removeAttribute('crossorigin');
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        cleanupErrorHandler();
        video.load();
      };
    }

    setError('This stream format is not supported by the browser. Try a different source or open it in an external player.');
  }, [streamType, streamUrl, title]);

  return (
    <div className="player-wrapper">
      <video ref={videoRef} className="video-element" controls playsInline preload="metadata" />
      {!streamUrl && (
        <div className="player-overlay">
          <span>Select a channel to start playback</span>
        </div>
      )}
      {error && (
        <div className="player-overlay" style={{ flexDirection: 'column', gap: 8 }}>
          <span>{error}</span>
          <span style={{ fontSize: '0.85rem', color: '#8b9096' }}>Try a different stream URL or open it in a dedicated player.</span>
        </div>
      )}
    </div>
  );
}
