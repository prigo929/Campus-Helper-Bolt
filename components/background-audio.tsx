'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react';

const VIDEO_ID = 'Ann_XMs-gfc'; // Macarena (Slowed) | Military Edition

export function BackgroundAudio() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const createPlayer = () => {
      const YTGlobal = (window as any).YT;
      if (!YTGlobal?.Player || !containerRef.current || playerRef.current) return;

      playerRef.current = new YTGlobal.Player(containerRef.current, {
        height: '0',
        width: '0',
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: VIDEO_ID,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          mute: 0,
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            event.target.setVolume?.(65);
            event.target.setPlaybackRate?.(1);
            event.target.unMute?.();
            setReady(true);
            setPlaying(true);
            setMuted(false);
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            const endedState = (window as any).YT?.PlayerState?.ENDED;
            if (endedState !== undefined && event.data === endedState) {
              event.target.seekTo(0);
              event.target.playVideo();
            }
          },
        },
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const previous = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        previous?.();
        if (!isMounted) return;
        createPlayer();
      };
      document.body.appendChild(tag);
    } else {
      createPlayer();
    }

    return () => {
      isMounted = false;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !ready) return;

    player.setPlaybackRate?.(1);
    if (playing) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }

    if (muted) {
      player.mute();
    } else {
      player.unMute();
    }
  }, [muted, playing, ready]);

  const togglePlay = () => {
    if (!ready) return;
    setPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    if (!ready) return;
    setMuted((prev) => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1c16]/85 px-3 py-2 text-[#d9c8a5] shadow-xl backdrop-blur-md">
      <div ref={containerRef} className="hidden" aria-hidden="true" />
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Music2 className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs uppercase tracking-[0.14em] text-[#caa35d]">Now looping</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Macarena (Slowed) | Military Edition</p>
            <Image src="/usa-flag.svg" alt="USA flag" width={24} height={16} className="h-4 w-6 rounded-sm border border-white/20 shadow-sm" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={playing ? 'Pause background audio' : 'Play background audio'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:opacity-50"
          onClick={togglePlay}
          disabled={!ready}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          type="button"
          aria-label={muted ? 'Unmute background audio' : 'Mute background audio'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:opacity-50"
          onClick={toggleMute}
          disabled={!ready}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
