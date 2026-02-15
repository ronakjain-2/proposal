"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./page.module.css";

const WIFE_NAME = "Anu";
const YOUR_NAME = "Ronak";

const quiz = [
  { q: "First personal meeting date?", a: ["21st march 2019", "21 march 2019", "21/03/2019", "21-03-2019"] },
  { q: "First Phone?", a: ["realme"] },
  { q: "First visiting place?", a: ["udaipur"] },
  { q: "Where did we first hand holded?", a: ["car", "in car"] },
  { q: "First gift from me?", a: ["necklace", "a necklace"] }
];

const floatChars = ["❤", "💗", "💖", "💘", "💞", "💕", "🌹", "✨"];

export default function ValentinePage() {
  const [today, setToday] = useState("");
  const [musicOn, setMusicOn] = useState(false);
  const [musicLabel, setMusicLabel] = useState("Tap to play");
  const [showTapOverlay, setShowTapOverlay] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("Let's begin 😌");
  const [showValentineOverlay, setShowValentineOverlay] = useState(false);
  const [showYesOverlay, setShowYesOverlay] = useState(false);
  const [secretOpened, setSecretOpened] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [valHint, setValHint] = useState("Tip: Try pressing \"No\" 😌");
  const [noButtonStyle, setNoButtonStyle] = useState<React.CSSProperties>({});

  const bgMusicRef = useRef<HTMLAudioElement>(null);
  const floatLayerRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const secretBoxRef = useRef<HTMLDivElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const valNoRef = useRef<HTMLButtonElement>(null);

  // Set today's date
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setToday(dateStr);
  }, []);

  // Spawn floating hearts
  const spawnFloat = useCallback(() => {
    if (!floatLayerRef.current) return;
    const count = 16;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = styles.floatItem;
      el.textContent = floatChars[Math.floor(Math.random() * floatChars.length)];
      const left = Math.random() * 100;
      const duration = 10 + Math.random() * 12;
      const delay = Math.random() * 6;
      const size = 14 + Math.random() * 18;
      el.style.left = left + "vw";
      el.style.animationDuration = duration + "s";
      el.style.animationDelay = delay + "s";
      el.style.fontSize = size + "px";
      floatLayerRef.current.appendChild(el);
      setTimeout(() => el.remove(), (duration + delay) * 1000);
    }
  }, []);

  // Burst hearts animation
  const burstHearts = useCallback((n = 28) => {
    if (!burstRef.current) return;
    const w = window.innerWidth;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("div");
      p.className = styles.piece;
      p.textContent = floatChars[Math.floor(Math.random() * floatChars.length)];
      const x = Math.random() * w;
      const delay = Math.random() * 0.25;
      const size = 14 + Math.random() * 18;
      p.style.left = x + "px";
      p.style.top = (-20 - Math.random() * 80) + "px";
      p.style.animationDelay = delay + "s";
      p.style.fontSize = size + "px";
      burstRef.current.appendChild(p);
      setTimeout(() => p.remove(), 1700);
    }
  }, []);

  // Music functions
  const toggleMusic = useCallback(async () => {
    if (!bgMusicRef.current) return;
    try {
      if (!musicOn) {
        await bgMusicRef.current.play();
        setMusicOn(true);
        setMusicLabel("Playing");
      } else {
        bgMusicRef.current.pause();
        setMusicOn(false);
        setMusicLabel("Tap to play");
      }
    } catch (e) {
      setMusicOn(false);
      setMusicLabel("Browser blocked autoplay");
    }
  }, [musicOn]);

  const startMusicIfPossible = useCallback(async () => {
    if (musicOn || !bgMusicRef.current) return;
    try {
      await bgMusicRef.current.play();
      setMusicOn(true);
      setMusicLabel("Playing");
    } catch (e) {
      // ignore
    }
  }, [musicOn]);

  // Try autoplay on load
  useEffect(() => {
    const tryAutoplayOnLoad = async () => {
      if (!bgMusicRef.current) return;
      try {
        await bgMusicRef.current.play();
        setMusicOn(true);
        setMusicLabel("Playing");
      } catch (e) {
        // Autoplay blocked → show cute tap screen
        setShowTapOverlay(true);
      }
    };
    const timer = setTimeout(tryAutoplayOnLoad, 250);
    return () => clearTimeout(timer);
  }, []);

  // Initialize floating hearts
  useEffect(() => {
    spawnFloat();
    const interval = setInterval(spawnFloat, 8500);
    return () => clearInterval(interval);
  }, [spawnFloat]);

  // Quiz functions
  const normalize = (s: string) => {
    return (s || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[.,!?:;"'()]/g, "")
      .replace(/\s/g, "");
  };

  const showQuestion = useCallback(() => {
    const item = quiz[quizIndex];
    if (!item) return;
    if (quizIndex === 0) {
      setFeedback(`Okay ${WIFE_NAME}… first one 😌💗`);
    } else {
      setFeedback("Nice 😌 Next one…");
    }
    setAnswer("");
    answerInputRef.current?.focus();
  }, [quizIndex]);

  useEffect(() => {
    showQuestion();
  }, [showQuestion]);

  const isCorrect = (userInput: string, validAnswers: string[]) => {
    const u = normalize(userInput);
    return validAnswers.some((v) => normalize(v) === u);
  };

  const handleSubmit = useCallback(() => {
    startMusicIfPossible();
    const item = quiz[quizIndex];
    if (!item) return;

    const value = answer.trim();
    if (!value) {
      setFeedback(`Type something, ${WIFE_NAME} 😌`);
      answerInputRef.current?.focus();
      return;
    }

    if (isCorrect(value, item.a)) {
      burstHearts(22);
      const lines = [
        "Yesss 😍 you remember!",
        "Perfect 😌",
        "That's my smart girl 🥰",
        "Awww ❤️",
        "Okay… you unlocked the final surprise 💝",
      ];
      setFeedback(lines[Math.min(quizIndex, lines.length - 1)]);

      if (quizIndex + 1 >= quiz.length) {
        setTimeout(() => {
          setShowValentineOverlay(true);
          burstHearts(50);
          startMusicIfPossible();
        }, 900);
      } else {
        setTimeout(() => {
          setQuizIndex(quizIndex + 1);
        }, 650);
      }
    } else {
      setFeedback(`Hmm… not quite 😄 Try again, ${WIFE_NAME} ❤️`);
      burstHearts(10);
      answerInputRef.current?.focus();
      answerInputRef.current?.select();
    }
  }, [answer, quizIndex, burstHearts, startMusicIfPossible]);

  const handleRestart = useCallback(() => {
    setQuizIndex(0);
    burstHearts(18);
  }, [burstHearts]);

  // Secret box
  const handleSecretClick = useCallback(() => {
    setSecretOpened(!secretOpened);
    if (!secretOpened) {
      burstHearts(24);
      startMusicIfPossible();
    }
  }, [secretOpened, burstHearts, startMusicIfPossible]);

  const handleSecretTriggerDoubleClick = useCallback(() => {
    secretBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setSecretOpened(true);
    burstHearts(24);
    startMusicIfPossible();
  }, [burstHearts, startMusicIfPossible]);

  // Valentine overlay
  const moveNoButton = useCallback(() => {
    if (!valNoRef.current) return;
    const rect = valNoRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 20;
    const maxY = window.innerHeight - rect.height - 20;
    const x = 10 + Math.random() * maxX;
    const y = 10 + Math.random() * maxY;

    setNoButtonStyle({
      position: "fixed",
      left: x + "px",
      top: y + "px",
      zIndex: 120,
    });

    const newCount = noCount + 1;
    setNoCount(newCount);
    if (newCount === 1) setValHint("Hehe… nice try 😌");
    else if (newCount === 2) setValHint("Babe, the 'No' button is shy 🙈");
    else if (newCount === 3) setValHint("Okay okay… just press YES 😭❤️");
    else if (newCount >= 4) setValHint(`I'm not accepting no today, ${WIFE_NAME} 😤💍`);
  }, [noCount]);

  const handleValYes = useCallback(() => {
    setShowValentineOverlay(false);
    setShowYesOverlay(true);
    burstHearts(90);
  }, [burstHearts]);

  const handleMoreMagic = useCallback(() => {
    burstHearts(120);
  }, [burstHearts]);

  const handleSurprise = useCallback(() => {
    burstHearts(42);
  }, [burstHearts]);

  const handleScrollToQuiz = useCallback(() => {
    quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    burstHearts(18);
    startMusicIfPossible();
  }, [burstHearts, startMusicIfPossible]);

  const handleTapStartMusic = useCallback(async () => {
    try {
      if (bgMusicRef.current) {
        await bgMusicRef.current.play();
        setMusicOn(true);
        setMusicLabel("Playing");
        setShowTapOverlay(false);
        burstHearts(35);
      }
    } catch (e) {
      // still blocked
    }
  }, [burstHearts]);

  const handleTapOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        handleTapStartMusic();
      }
    },
    [handleTapStartMusic]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const currentQuestion = quiz[quizIndex];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;500;600;700&display=swap');
      `}</style>
      <div className={styles.body}>
        <div className={styles.sparkles} aria-hidden="true" />
        <div className={styles.floatLayer} ref={floatLayerRef} aria-hidden="true" />
        <div className={styles.burst} ref={burstRef} aria-hidden="true" />

        <audio ref={bgMusicRef} loop preload="auto">
          <source src="/tum_hi_ho.mp4" type="video/mp4" />
        </audio>

        <div className={styles.music}>
          <button
            className={`${styles.button} ${styles.btn} ${styles.btnGhost}`}
            onClick={toggleMusic}
            style={{ padding: "10px 12px", borderRadius: "999px" }}
          >
            {musicOn ? "⏸️" : "▶️"}
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: "13px", lineHeight: "1.1" }}>
              Tum Hi Ho
            </div>
            <div className={styles.label}>{musicLabel}</div>
          </div>
        </div>

        <main className={styles.wrap}>
          <header className={styles.header}>
            <div
              className={styles.badge}
              onDoubleClick={handleSecretTriggerDoubleClick}
            >
              <svg
                className={styles.heart}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 21s-7.2-4.4-9.6-9C.2 7.8 3 4.5 6.5 4.5c2 0 3.4 1.1 4.2 2.2.8-1.1 2.2-2.2 4.2-2.2 3.5 0 6.3 3.3 4.1 7.5C19.2 16.6 12 21 12 21Z"
                  fill="url(#g)"
                />
                <defs>
                  <linearGradient
                    id="g"
                    x1="3"
                    y1="5"
                    x2="21"
                    y2="21"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#ff3b7a" />
                    <stop offset="1" stopColor="#ff9bd0" />
                  </linearGradient>
                </defs>
              </svg>
              <span>For Anu — from Ronak ❤️</span>
            </div>

            <div className={styles.badge}>{today}</div>
          </header>

          <section className={styles.hero} role="region" aria-label="Hero">
            <div className={styles.heroInner}>
              <h1 className={styles.h1}>Hey Anu… ❤️</h1>
              <p className={styles.sub}>
                I made a little love quiz just for you.
                <br />
                Answer everything correctly… and you'll unlock the final surprise. ✨
              </p>

              <div className={styles.ctaRow}>
                <button
                  className={`${styles.button} ${styles.btn} ${styles.btnPrimary}`}
                  onClick={handleScrollToQuiz}
                >
                  Start the Love Quiz 💞
                </button>
                {/* <button
                  className={`${styles.button} ${styles.btn} ${styles.btnGhost}`}
                  onClick={handleSurprise}
                >
                  Tap for Magic 💖
                </button> */}
              </div>
            </div>
          </section>

          <section className={styles.grid} aria-label="Intro">
            <article className={styles.card}>
              <h2>A little note</h2>
              <p className={styles.bigLine}>
                You're my favorite person. My safe place. My biggest blessing.
                <br />
                And I still choose you — every day.
              </p>
              <p className={styles.small}>
                Now… let's see if you remember our love story 😌❤️
              </p>
            </article>

            <aside className={styles.card}>
              <h2>Rules</h2>
              <p>
                You can only move forward if the answer is correct.
                <br />
                No cheating 😌
                <br />
                (Okay fine… a little cheating is cute too 🙈)
              </p>
            </aside>
          </section>

          <section
            className={styles.quiz}
            ref={quizRef}
            id="quiz"
            aria-label="Love Quiz"
          >
            <div className={styles.quizInner}>
              <div className={styles.quizHead}>
                <div>
                  <h2 style={{ margin: "0 0 4px" }}>Our Love Quiz 💌</h2>
                  <p className={styles.sub} style={{ margin: 0, maxWidth: "70ch" }}>
                    Answer correctly to unlock the final surprise.
                  </p>
                </div>
                <div className={styles.meter}>
                  Question: <b>{quizIndex + 1}</b> / <b>{quiz.length}</b>
                </div>
              </div>

              <div className={styles.question}>
                {currentQuestion?.q || "Loading…"}
              </div>

              <div className={styles.inputRow}>
                <input
                  ref={answerInputRef}
                  className={styles.input}
                  id="answer"
                  placeholder="Type your answer here…"
                  autoComplete="off"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className={`${styles.button} ${styles.btn} ${styles.btnPrimary}`}
                  onClick={handleSubmit}
                >
                  Submit 💘
                </button>
              </div>

              <div className={styles.feedback}>{feedback}</div>

              <div className={styles.ctaRow} style={{ marginTop: "14px" }}>
                <button
                  className={`${styles.button} ${styles.btn} ${styles.btnGhost}`}
                  onClick={handleRestart}
                >
                  Restart Quiz 🔁
                </button>
              </div>

              <div
                className={styles.secret}
                ref={secretBoxRef}
                title="Tap me…"
                onClick={handleSecretClick}
              >
                {secretOpened ? (
                  <>
                    <b>I love you, {WIFE_NAME}</b> ❤️
                    <br />
                    <span style={{ color: "#ffffffb6", fontSize: "13px" }}>
                      — {YOUR_NAME}
                    </span>
                  </>
                ) : (
                  <span>💞 Secret message (tap)</span>
                )}
              </div>
            </div>
          </section>

          <footer className={styles.footer}>
            Built with love by Ronak — only for Anu ❤️
          </footer>
        </main>

        {/* FINAL SCREEN: Valentine Question */}
        <div
          className={`${styles.overlay} ${showValentineOverlay ? styles.open : ""}`}
          aria-label="Valentine question"
        >
          <div className={styles.overlayCard}>
            <div className={styles.overlayInner}>
              <div className={styles.overlayTitle}>Anu… 💘</div>
              <p className={styles.overlayText}>
                You're my favorite part of every day.
                <br />
                <br />
                So here's my question…
              </p>

              <div
                className={styles.overlayTitle}
                style={{
                  fontSize: "clamp(44px, 5.2vw, 80px)",
                  marginTop: "10px",
                }}
              >
                Will you be my Valentine? ❤️
              </div>

              <div className={styles.overlayActions} style={{ marginTop: "18px" }}>
                <button
                  className={`${styles.button} ${styles.btn} ${styles.btnYes}`}
                  onClick={handleValYes}
                >
                  YESSS ❤️✨
                </button>
                <button
                  ref={valNoRef}
                  className={`${styles.button} ${styles.btn} ${styles.btnNo}`}
                  onMouseEnter={moveNoButton}
                  onClick={moveNoButton}
                  style={noButtonStyle}
                >
                  No 🙈
                </button>
              </div>

              <p className={styles.small} style={{ marginTop: "14px" }}>
                {valHint}
              </p>
            </div>
          </div>
        </div>

        {/* YES SCREEN */}
        <div
          className={`${styles.overlay} ${showYesOverlay ? styles.open : ""}`}
          aria-label="Yes screen"
        >
          <div className={styles.overlayCard}>
            <div className={styles.overlayInner}>
              <div className={styles.overlayTitle}>She said YES! 💍❤️</div>
              <p className={styles.overlayText}>
                You just made my heart do a happy dance.
                <br />
                <br />
                I love you, Anu.
                <br />
                Forever and always.
              </p>

              <div className={styles.overlayActions}>
                <button
                  className={`${styles.button} ${styles.btn} ${styles.btnPrimary}`}
                  onClick={handleMoreMagic}
                >
                  More Magic ✨
                </button>
                <button
                  className={`${styles.button} ${styles.btn} ${styles.btnGhost}`}
                  onClick={() => setShowYesOverlay(false)}
                >
                  Back to Page
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tap overlay (only appears if autoplay is blocked) */}
        <div
          className={`${styles.tapOverlay} ${showTapOverlay ? styles.open : ""}`}
          aria-label="Tap to start music"
          onClick={handleTapOverlayClick}
        >
          <div className={styles.tapCard}>
            <div className={styles.tapInner}>
              <div className={styles.tapTitle}>Hey Anu… 🎶</div>
              <p className={styles.tapText}>
                This page is made with love… and with music too 💖
                <br />
                <br />
                Tap the button below to start <b>Tum Hi Ho</b> ✨
              </p>
              <div className={styles.tapActions}>
                <button
                  className={`${styles.button} ${styles.btn} ${styles.btnPrimary}`}
                  onClick={handleTapStartMusic}
                >
                  Start Music ❤️🎵
                </button>
                {/* <button
                  className={`${styles.button} ${styles.btn} ${styles.btnGhost}`}
                  onClick={() => setShowTapOverlay(false)}
                >
                  Continue without music
                </button> */}
              </div>
              <p className={styles.small} style={{ marginTop: "14px" }}>
                (Browsers block autoplay — so one tap is needed 😌)
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
