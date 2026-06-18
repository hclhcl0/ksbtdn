"use client";

 

import React, { useState, useEffect, useRef } from "react";

// Inline SVG Icon components with explicit width/height attributes for robust rendering
const FacebookIcon = () => (
  <svg width="14" height="14" className="fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 8H7v3h2v9h3v-9h2.72l.42-3H12V6.24c0-.72.08-1 .8-1H14V2h-2.42c-2.4 0-3.58 1.09-3.58 3.12V8z" />
  </svg>
);

const PrinterIcon = () => (
  <svg width="14" height="14" className="stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 0-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 0-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" className="stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" className="stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TypeIcon = () => (
  <svg width="16" height="16" className="stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" className="stroke-current fill-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = () => (
  <svg width="14" height="14" className="stroke-current fill-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const StopIcon = () => (
  <svg width="14" height="14" className="stroke-current fill-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

const AudioIcon = () => (
  <svg width="14" height="14" className="stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const GoogleNewsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
    <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" />
  </svg>
);

export type ReaderToolsConfig = {
  showFontSize?: boolean;
  showTTS?: boolean;
  showShareFB?: boolean;
  showShareZalo?: boolean;
  showGoogleNews?: boolean;
  googleNewsUrl?: string | null;
  showCopyLink?: boolean;
  showPrint?: boolean;
  showReadProgress?: boolean;
};

export function ArticleReaderTools({
  mode = "all",
  toolsConfig,
}: {
  mode?: "all" | "tts" | "tools";
  toolsConfig?: ReaderToolsConfig;
}) {
  // Default all tools ON if no config supplied
  const cfg: Required<ReaderToolsConfig> = {
    showFontSize:    toolsConfig?.showFontSize    ?? true,
    showTTS:         toolsConfig?.showTTS         ?? true,
    showShareFB:     toolsConfig?.showShareFB     ?? true,
    showShareZalo:   toolsConfig?.showShareZalo   ?? true,
    showGoogleNews:  toolsConfig?.showGoogleNews  ?? false,
    googleNewsUrl:   toolsConfig?.googleNewsUrl   ?? "",
    showCopyLink:    toolsConfig?.showCopyLink    ?? true,
    showPrint:       toolsConfig?.showPrint       ?? true,
    showReadProgress:toolsConfig?.showReadProgress?? true,
  };
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Text-to-Speech State
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  // Text-to-Speech Refs to avoid stale state in asynchronous event handlers
  const sentencesRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);
  const rateRef = useRef<number>(1.0);
  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  
  // Audio player fallback ref (Google Translate TTS API via local proxy)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeObjectUrlRef = useRef<string | null>(null);

  const revokeActiveUrl = () => {
    if (activeObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(activeObjectUrlRef.current);
      } catch (err) {
        console.error("Failed to revoke object URL:", err);
      }
      activeObjectUrlRef.current = null;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
      
      // Check for SpeechSynthesis support
      if (window.speechSynthesis) {
        setIsSupported(true);
        
        const loadVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          
          // Case-insensitive filtering for Vietnamese language codes/names
          const viVoices = availableVoices.filter(v => 
            v.lang.toLowerCase() === "vi-vn" || 
            v.lang.toLowerCase().startsWith("vi") ||
            v.name.toLowerCase().includes("vietnamese")
          );
          
          setVoices(viVoices);
          
          if (viVoices.length > 0) {
            // Prioritize high-quality online natural voices (e.g. Edge Natural or Google TTS)
            const naturalVoice = viVoices.find(v => v.name.toLowerCase().includes("natural"));
            const googleVoice = viVoices.find(v => v.name.toLowerCase().includes("google"));
            
            if (naturalVoice) {
              setSelectedVoice(naturalVoice.name);
            } else if (googleVoice) {
              setSelectedVoice(googleVoice.name);
            } else {
              setSelectedVoice(viVoices[0].name);
            }
          }
        };
        
        loadVoices();
        
        // Chrome/Safari load voices asynchronously, bind event listener
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Additional polling fallback to ensure voices are loaded on slower platforms
        const intervalId = setInterval(() => {
          const currentVoices = window.speechSynthesis.getVoices();
          if (currentVoices.length > 0) {
            loadVoices();
            clearInterval(intervalId);
          }
        }, 200);

        return () => clearInterval(intervalId);
      }
    }
  }, []);

  // Update font size on the .prose element
  useEffect(() => {
    const prose = document.querySelector(".prose") as HTMLElement;
    if (prose) {
      if (fontSize === "normal") {
        prose.style.fontSize = "1.05rem";
      } else if (fontSize === "large") {
        prose.style.fontSize = "1.2rem";
      } else if (fontSize === "xlarge") {
        prose.style.fontSize = "1.35rem";
      }
    }
  }, [fontSize]);

  // Clean up speech synthesis & audio on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
        revokeActiveUrl();
      }
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleShareZalo = () => {
    window.open(
      `https://sp.zalo.me/share_profile_widget/index.html?url=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };

  // TTS Speech Logic
  const speakCurrentSentence = () => {
    const index = currentIndexRef.current;
    const sentences = sentencesRef.current;

    if (index >= sentences.length || !isPlayingRef.current) {
      // Completed reading or stopped
      setIsPlaying(false);
      isPlayingRef.current = false;
      setIsPaused(false);
      isPausedRef.current = false;
      currentIndexRef.current = 0;
      return;
    }

    const text = sentences[index];
    
    // Check if the system has a Vietnamese voice
    const availableVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const viVoices = availableVoices.filter(v => 
      v.lang.toLowerCase() === "vi-vn" || 
      v.lang.toLowerCase().startsWith("vi") ||
      v.name.toLowerCase().includes("vietnamese")
    );

    if (viVoices.length > 0 && window.speechSynthesis) {
      // METHOD A: NATIVE SPEECH SYNTHESIS (Uses client-side voice package)
      console.log("Using native browser SpeechSynthesis for sentence:", index);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.rate = rateRef.current;

      let selectedVoiceObj = null;
      if (selectedVoice) {
        selectedVoiceObj = viVoices.find(v => v.name === selectedVoice) || null;
      }
      
      if (!selectedVoiceObj) {
        selectedVoiceObj = viVoices.find(v => v.name.toLowerCase().includes("natural")) ||
                           viVoices.find(v => v.name.toLowerCase().includes("google")) ||
                           viVoices[0];
      }

      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }

      utterance.onend = () => {
        if (isPlayingRef.current && !isPausedRef.current) {
          currentIndexRef.current += 1;
          speakCurrentSentence();
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && isPlayingRef.current && !isPausedRef.current) {
          currentIndexRef.current += 1;
          speakCurrentSentence();
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // METHOD B: GOOGLE TRANSLATE TTS VIA SERVER PROXY (Always reads in Vietnamese)
      console.log("No native Vietnamese voice found. Falling back to /api/tts proxy for sentence:", index);
      
      const chunkText = text.substring(0, 180);
      const encodedText = encodeURIComponent(chunkText);
      const ttsUrl = `/api/tts?text=${encodedText}`;
      
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      // Setup audio element event handlers
      audioRef.current.onended = () => {
        revokeActiveUrl();
        if (isPlayingRef.current && !isPausedRef.current) {
          currentIndexRef.current += 1;
          speakCurrentSentence();
        }
      };
      
      audioRef.current.onerror = (e) => {
        const errDetails = audioRef.current?.error;
        console.error("Google TTS proxy audio element error event:", {
          code: errDetails?.code,
          message: errDetails?.message,
          event: e
        });
        revokeActiveUrl();
        if (isPlayingRef.current && !isPausedRef.current) {
          currentIndexRef.current += 1;
          speakCurrentSentence();
        }
      };

      // Fetch the audio stream using standard fetch to bypass range/relative URL issues
      fetch(ttsUrl)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch TTS audio: status ${response.status}`);
          }
          const blob = await response.blob();
          
          // Double check if we're still playing and not paused before starting audio
          if (!isPlayingRef.current || isPausedRef.current) {
            return;
          }
          
          revokeActiveUrl();
          const objectUrl = URL.createObjectURL(blob);
          activeObjectUrlRef.current = objectUrl;
          
          if (audioRef.current) {
            audioRef.current.src = objectUrl;
            audioRef.current.playbackRate = rateRef.current;
            audioRef.current.play().catch(err => {
              console.error("Google TTS playback failed (e.g. autoplay block):", err);
              if (isPlayingRef.current && !isPausedRef.current) {
                currentIndexRef.current += 1;
                speakCurrentSentence();
              }
            });
          }
        })
        .catch((err) => {
          console.error("Google TTS fetch/load error:", err);
          if (isPlayingRef.current && !isPausedRef.current) {
            currentIndexRef.current += 1;
            speakCurrentSentence();
          }
        });
    }
  };

  const startSpeaking = () => {
    if (!isSupported) return;

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    revokeActiveUrl();

    const prose = document.querySelector(".prose") as HTMLElement;
    if (!prose) return;

    const titleEl = document.querySelector("h1");
    const titleText = titleEl ? titleEl.textContent || "" : "";

    const textEls = Array.from(prose.querySelectorAll("p, h2, h3, li"));
    const paragraphs = textEls
      .map(el => el.textContent?.trim() || "")
      .filter(text => text.length > 0);

    const allText = [titleText, ...paragraphs].join(". ");
    
    // Split text by punctuation marks for chunked speech synthesis
    const rawSentences = allText.split(/[.!?]\s+/);
    const cleanSentences = rawSentences
      .map(s => s.trim())
      .filter(s => s.length > 1);

    if (cleanSentences.length === 0) return;

    sentencesRef.current = cleanSentences;
    currentIndexRef.current = 0;
    isPlayingRef.current = true;
    isPausedRef.current = false;

    setIsPlaying(true);
    setIsPaused(false);

    // Refresh voices list in state just in case it loaded recently
    if (window.speechSynthesis) {
      const availableVoices = window.speechSynthesis.getVoices();
      const viVoices = availableVoices.filter(v => 
        v.lang.toLowerCase() === "vi-vn" || 
        v.lang.toLowerCase().startsWith("vi")
      );
      if (viVoices.length > 0) {
        setVoices(viVoices);
        if (!selectedVoice) {
          const naturalVoice = viVoices.find(v => v.name.toLowerCase().includes("natural"));
          const googleVoice = viVoices.find(v => v.name.toLowerCase().includes("google"));
          setSelectedVoice(naturalVoice?.name || googleVoice?.name || viVoices[0].name);
        }
      }
    }

    speakCurrentSentence();
  };

  const handlePlayPause = () => {
    const hasNativeVi = voices.length > 0;
    
    if (!isPlaying) {
      startSpeaking();
    } else if (isPaused) {
      if (hasNativeVi && window.speechSynthesis) {
        window.speechSynthesis.resume();
      } else if (audioRef.current) {
        audioRef.current.play().catch(e => console.error(e));
      }
      setIsPaused(false);
      isPausedRef.current = false;
    } else {
      if (hasNativeVi && window.speechSynthesis) {
        window.speechSynthesis.pause();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPaused(true);
      isPausedRef.current = true;
    }
  };

  const handleStop = () => {
    if (!isSupported) return;
    isPlayingRef.current = false;
    isPausedRef.current = false;
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    revokeActiveUrl();
    
    setIsPlaying(false);
    setIsPaused(false);
    currentIndexRef.current = 0;
  };

  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    rateRef.current = newRate;

    if (isPlayingRef.current) {
      if (voices.length > 0 && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setTimeout(() => {
        if (isPlayingRef.current && !isPausedRef.current) {
          speakCurrentSentence();
        }
      }, 50);
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    if (isPlayingRef.current) {
      if (voices.length > 0 && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setTimeout(() => {
        if (isPlayingRef.current && !isPausedRef.current) {
          speakCurrentSentence();
        }
      }, 50);
    }
  };

  return (
    <div className={`no-print ${mode === "tts" ? "flex items-center gap-2" : "reader-tools"}`}>
      {/* Font adjustment group */}
      {(mode === "all" || mode === "tools") && cfg.showFontSize && (
      <div className="reader-tools-group">
        <button
          onClick={() => setFontSize("normal")}
          className={`reader-tools-btn font-size-btn w-10 h-10 shrink-0 min-w-[40px] ${fontSize === "normal" ? "bg-gov-primary text-white" : ""}`}
          title="Cỡ chữ thường"
        >
          A
        </button>
        <button
          onClick={() => setFontSize("large")}
          className={`reader-tools-btn font-size-btn w-10 h-10 shrink-0 min-w-[40px] ${fontSize === "large" ? "bg-gov-primary text-white" : ""}`}
          title="Cỡ chữ lớn"
        >
          A+
        </button>
        <button
          onClick={() => setFontSize("xlarge")}
          className={`reader-tools-btn font-size-btn w-10 h-10 shrink-0 min-w-[40px] ${fontSize === "xlarge" ? "bg-gov-primary text-white" : ""}`}
          title="Cỡ chữ rất lớn"
        >
          A++
        </button>
      </div>
      )}

      {/* TTS Audio Controls group */}
      {isSupported && cfg.showTTS && (mode === "all" || mode === "tts") && (
        <div className={mode === "tts" ? "flex items-center gap-2 flex-row flex-wrap" : "reader-tools-group"}>
          <span className="reader-tools-label">
            <AudioIcon />
            <span className="reader-tools-btn-text hidden">Nghe bài viết:</span>
          </span>
          <button
            onClick={handlePlayPause}
            className={`reader-tools-btn w-10 h-10 shrink-0 min-w-[40px] ${isPlaying && !isPaused ? "bg-gov-primary text-white border-gov-primary hover:bg-gov-primary-dark" : "bg-white text-gray-800"}`}
            title={isPlaying && !isPaused ? "Tạm dừng" : "Đọc bài viết"}
          >
            {isPlaying && !isPaused ? <PauseIcon /> : <PlayIcon />}
            <span className="reader-tools-btn-text hidden">{isPlaying && !isPaused ? "Tạm dừng" : isPaused ? "Tiếp tục" : "Đọc bài"}</span>
          </button>
          
          {isPlaying && (
            <button
              onClick={handleStop}
              className="reader-tools-btn w-10 h-10 shrink-0 min-w-[40px] bg-white text-red-600 border-red-200 hover:bg-red-50"
              title="Dừng đọc"
            >
              <StopIcon />
              <span className="reader-tools-btn-text hidden">Dừng</span>
            </button>
          )}

          {isPlaying && (
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-white px-2 py-1 h-[40px]">
              <span className="text-xs text-gray-500 font-medium">Tốc độ:</span>
              <select
                value={playbackRate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="text-xs font-semibold bg-transparent border-none outline-none cursor-pointer text-gray-700"
              >
                <option value="0.8">0.8x</option>
                <option value="1.0">1.0x</option>
                <option value="1.2">1.2x</option>
                <option value="1.5">1.5x</option>
              </select>
            </div>
          )}
          
          {isPlaying && voices.length > 1 && (
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-white px-2 py-1 h-[40px]">
              <span className="text-xs text-gray-500 font-medium">Giọng:</span>
              <select
                value={selectedVoice}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="text-xs font-semibold bg-transparent border-none outline-none cursor-pointer text-gray-700 max-w-[100px] truncate"
              >
                {voices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name.replace(/Microsoft|Google/gi, '').trim()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Share & Print Utilities group */}
      {(mode === "all" || mode === "tools") && (cfg.showShareFB || cfg.showShareZalo || cfg.showCopyLink || cfg.showPrint) && (
      <div className="reader-tools-group">
        {/* Facebook Share */}
        {cfg.showShareFB && (
          <button
            onClick={handleShareFacebook}
            className="reader-tools-btn reader-tools-btn-fb w-10 h-10 shrink-0 min-w-[40px]"
            title="Chia sẻ lên Facebook"
          >
            <FacebookIcon />
            <span className="reader-tools-btn-text hidden">Chia sẻ</span>
          </button>
        )}

        {/* Google News */}
        {cfg.showGoogleNews && cfg.googleNewsUrl && (
          <a
            href={cfg.googleNewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="reader-tools-btn reader-tools-btn-gnews w-10 h-10 flex items-center justify-center shrink-0 min-w-[40px] border border-gray-200"
            title="Theo dõi trên Google News"
          >
            <GoogleNewsIcon />
            <span className="reader-tools-btn-text hidden">Google News</span>
          </a>
        )}

        {/* Zalo Share */}
        {cfg.showShareZalo && (
        <button
          onClick={handleShareZalo}
          className="reader-tools-btn reader-tools-btn-zalo w-10 h-10 shrink-0 min-w-[40px]"
          title="Chia sẻ lên Zalo"
        >
          <span className="font-bold text-[10px] tracking-tighter">ZALO</span>
          <span className="reader-tools-btn-text hidden">Chia sẻ</span>
        </button>
        )}

        {/* Copy Link */}
        {cfg.showCopyLink && (<button
          onClick={handleCopyLink}
          className={`reader-tools-btn reader-tools-btn-copy w-10 h-10 shrink-0 min-w-[40px] ${copied ? 'copied' : ''}`}
          title="Sao chép đường dẫn bài viết"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span className="reader-tools-btn-text hidden">Chép link</span>
        </button>)}

        {/* Print Button */}
        {cfg.showPrint && (<button
          onClick={handlePrint}
          className="reader-tools-btn reader-tools-btn-print w-10 h-10 shrink-0 min-w-[40px]"
          title="In bài viết"
        >
          <PrinterIcon />
          <span className="reader-tools-btn-text hidden">In trang</span>
        </button>)}
      </div>
      )}
    </div>
  );
}
