import { useState, useEffect, useRef, useCallback } from "react";
import { useBookStore } from "../store/bookStore";

import idle1 from "../assets/opossum-sketches/idle1.png";
import idle2 from "../assets/opossum-sketches/idle2.png";
import idle3 from "../assets/opossum-sketches/idle3.png";
import idle4 from "../assets/opossum-sketches/idle4.png";
import idle5 from "../assets/opossum-sketches/idle5.png";
import sleepy from "../assets/opossum-sketches/sleepy.png";
import sleeping from "../assets/opossum-sketches/sleeping.png";
import searchingImg from "../assets/opossum-sketches/searching.png";
import pettingImg from "../assets/opossum-sketches/petting.png";
import celebratingImg from "../assets/opossum-sketches/celebrating.png";

const IDLE_IMAGES = [idle1, idle2, idle3, idle4, idle5];

type Mood = "idle" | "sleepy" | "sleeping" | "searching" | "petting" | "celebrating";

const SLEEPY_AFTER_MS = 25_000;
const SLEEPING_AFTER_MS = 10_000;
const CELEBRATE_DURATION_MS = 3_500;

interface PossumCompanionProps {
  isSearching?: boolean;
  activeTab?: string;
}

export function PossumCompanion({ isSearching = false, activeTab }: PossumCompanionProps) {
  const [mood, setMood] = useState<Mood>("idle");
  const [idleFrame, setIdleFrame] = useState(0);

  const moodRef = useRef<Mood>("idle");
  const sleepyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { readBooks } = useBookStore();
  const prevReadCountRef = useRef(readBooks.length);

  const changeMood = useCallback((next: Mood) => {
    moodRef.current = next;
    setMood(next);
  }, []);

  const clearSleepTimers = useCallback(() => {
    if (sleepyTimerRef.current) clearTimeout(sleepyTimerRef.current);
    if (sleepingTimerRef.current) clearTimeout(sleepingTimerRef.current);
    sleepyTimerRef.current = null;
    sleepingTimerRef.current = null;
  }, []);

  const startSleepTimers = useCallback(() => {
    clearSleepTimers();
    sleepyTimerRef.current = setTimeout(() => {
      if (moodRef.current === "idle") {
        changeMood("sleepy");
        sleepingTimerRef.current = setTimeout(() => {
          if (moodRef.current === "sleepy") {
            changeMood("sleeping");
          }
        }, SLEEPING_AFTER_MS);
      }
    }, SLEEPY_AFTER_MS);
  }, [clearSleepTimers, changeMood]);

  const celebrate = useCallback(() => {
    clearSleepTimers();
    if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
    changeMood("celebrating");
    celebrateTimerRef.current = setTimeout(() => {
      changeMood("idle");
      startSleepTimers();
    }, CELEBRATE_DURATION_MS);
  }, [clearSleepTimers, changeMood, startSleepTimers]);

  // Idle frame cycles on tab switch
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (activeTab !== prevTabRef.current) {
      prevTabRef.current = activeTab;
      setTimeout(() => {
        if (moodRef.current === "idle") {
          setIdleFrame((f) => (f + 1) % IDLE_IMAGES.length);
        }
      }, 0);
    }
  }, [activeTab]);

  // Start sleep timers on mount
  useEffect(() => {
    startSleepTimers();
    return () => {
      clearSleepTimers();
      if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
    };
  }, [startSleepTimers, clearSleepTimers]);

  // Searching mood — overrides idle/sleepy/sleeping but not petting
  useEffect(() => {
    if (isSearching) {
      clearSleepTimers();
      if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
      setTimeout(() => {
        if (moodRef.current !== "petting") changeMood("searching");
      }, 0);
    } else {
      setTimeout(() => {
        if (moodRef.current === "searching") {
          changeMood("idle");
          startSleepTimers();
        }
      }, 0);
    }
  }, [isSearching, clearSleepTimers, changeMood, startSleepTimers]);

  // Celebrate when a new book is marked as read
  useEffect(() => {
    if (readBooks.length > prevReadCountRef.current) {
      setTimeout(() => celebrate(), 0);
    }
    prevReadCountRef.current = readBooks.length;
  }, [readBooks.length, celebrate]);

  const handlePointerDown = () => {
    clearSleepTimers();
    if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
    changeMood("petting");
  };

  const handlePointerUp = () => {
    if (moodRef.current === "petting") {
      celebrate();
    }
  };

  const image = (() => {
    switch (mood) {
      case "searching":   return searchingImg;
      case "petting":     return pettingImg;
      case "celebrating": return celebratingImg;
      case "sleepy":      return sleepy;
      case "sleeping":    return sleeping;
      default:            return IDLE_IMAGES[idleFrame];
    }
  })();

  return (
    <>
      <style>{`
        @keyframes possum-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    <div
      className="fixed bottom-6 left-6 z-60 select-none touch-none cursor-pointer"
      style={{ width: 96, height: 96, animation: "possum-float 3s ease-in-out infinite" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <img
        src={image}
        alt="possum librarian"
        draggable={false}
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </div>
    </>
  );
}
