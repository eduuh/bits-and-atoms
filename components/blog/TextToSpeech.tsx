'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Headphones } from 'lucide-react';

interface TextToSpeechProps {
  content: string;
  title: string;
}

type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5 | 2;

export function TextToSpeech({ content, title }: TextToSpeechProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);

  // Check browser support
  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  // Load voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Try to find a good English voice
      const englishVoice = availableVoices.find(
        (v) => v.lang.startsWith('en') && v.name.includes('Natural')
      ) || availableVoices.find(
        (v) => v.lang.startsWith('en-US')
      ) || availableVoices.find(
        (v) => v.lang.startsWith('en')
      );

      if (englishVoice && !selectedVoice) {
        setSelectedVoice(englishVoice);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, selectedVoice]);

  // Extract clean text from content
  const extractText = useCallback((mdxContent: string): string => {
    let text = mdxContent
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]+`/g, '')
      // Remove MDX components
      .replace(/<[^>]+>/g, '')
      // Remove images
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove headers markdown
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, '')
      // Remove extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return `${title}. ${text}`;
  }, [title]);

  // Estimate reading time
  useEffect(() => {
    if (content) {
      textRef.current = extractText(content);
      // Rough estimate: 150 words per minute at 1x speed
      const words = textRef.current.split(/\s+/).length;
      const minutes = words / 150;
      setTotalTime(Math.ceil(minutes * 60));
    }
  }, [content, extractText]);

  const speak = useCallback(() => {
    if (!isSupported || !textRef.current) return;

    // Cancel any existing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textRef.current);
    utterance.rate = speed;
    utterance.pitch = 1;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentTime(totalTime);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, speed, selectedVoice, totalTime]);

  // Update progress while playing
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const adjustedElapsed = elapsed * speed;
      const newProgress = Math.min((adjustedElapsed / totalTime) * 100, 100);
      setProgress(newProgress);
      setCurrentTime(Math.min(Math.floor(adjustedElapsed), totalTime));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused, speed, totalTime]);

  const handlePlayPause = () => {
    if (!isSupported) return;

    if (isPlaying && !isPaused) {
      speechSynthesis.pause();
    } else if (isPlaying && isPaused) {
      speechSynthesis.resume();
    } else {
      speak();
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleSpeedChange = () => {
    const speeds: PlaybackSpeed[] = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setSpeed(newSpeed);

    // Update current utterance if playing
    if (utteranceRef.current && isPlaying) {
      // Need to restart with new speed
      const wasPlaying = isPlaying && !isPaused;
      speechSynthesis.cancel();
      if (wasPlaying) {
        setTimeout(() => speak(), 100);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="my-6 rounded-lg border border-border bg-card overflow-hidden not-prose">
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Headphones className="h-4 w-4" />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-medium text-foreground">Listen to this article</span>
          <span className="text-xs text-muted-foreground ml-2">
            ~{Math.ceil(totalTime / 60)} min
          </span>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Playing</span>
          </div>
        )}
      </button>

      {/* Expanded Player */}
      {isExpanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalTime)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleStop}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Stop"
              disabled={!isPlaying}
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title={isPlaying && !isPaused ? 'Pause' : 'Play'}
            >
              {isPlaying && !isPaused ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </button>

            <button
              onClick={handleSpeedChange}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-muted hover:bg-muted/80 transition-colors min-w-[4rem]"
              title="Change speed"
            >
              {speed}x
            </button>
          </div>

          {/* Voice Selection */}
          {voices.length > 0 && (
            <div className="pt-2 border-t border-border">
              <label className="block text-xs text-muted-foreground mb-2">Voice</label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find((v) => v.name === e.target.value);
                  if (voice) setSelectedVoice(voice);
                }}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background"
              >
                {voices
                  .filter((v) => v.lang.startsWith('en'))
                  .map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
