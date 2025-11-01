import React, { useEffect, useRef, useState } from "react";
import "../App.css";

const PHASES = {
  IDLE: "idle",
  IN: "in",
  HOLD: "hold",
  OUT: "out",
} as const;

const scriptureParts = {
  in: "The LORD is close to the brokenhearted;",
  hold: "The LORD is close to the brokenhearted;",
  out: "He rescues those whose spirits are crushed.\nPsalm 34:18",
};

interface BreathingExerciseProps {
  onComplete: () => void;
}

export default function BreathingExercise({ onComplete }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<typeof PHASES[keyof typeof PHASES]>("idle");
  const [headerText, setHeaderText] = useState("");
  const [scripture, setScripture] = useState("");
  const [hidden, setHidden] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shrinking, setShrinking] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [bgPhase, setBgPhase] = useState("idle");
  const [fadeIn, setFadeIn] = useState(true);
  const [inputLocked, setInputLocked] = useState(false);
  const [resetting, setResetting] = useState(false);

  const progressRef = useRef<HTMLDivElement>(null);
  const typerRef = useRef<number | null>(null);
  const cancelRef = useRef<boolean>(false);

  const IN_DURATION = 4000;
  const HOLD_DURATION = 5000;
  const OUT_DURATION = 4000;

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const animateProgress = (startWidth: number, endWidth: number, time: number) => {
    const startTime = performance.now();
    const step = (now: number) => {
      if (cancelRef.current) return;
      const t = Math.min((now - startTime) / time, 1);
      if (progressRef.current)
        progressRef.current.style.width = `${startWidth + (endWidth - startWidth) * t}%`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const resetProgressBar = (duration = 600) => {
    if (!progressRef.current) return;
    const startWidth = parseFloat(progressRef.current.style.width) || 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const newWidth = startWidth * (1 - t);
      progressRef.current!.style.width = `${newWidth}%`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const typeText = (text: string, duration: number) =>
    new Promise<void>((resolve) => {
      if (typerRef.current) cancelAnimationFrame(typerRef.current);
      cancelRef.current = false;
      const totalChars = text.length;
      setScripture("");
      requestAnimationFrame(() => {
        const startTime = performance.now();
        const step = (now: number) => {
          if (cancelRef.current) return;
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const chars = Math.floor(progress * totalChars);
          setScripture(text.slice(0, chars));
          if (progress < 1) {
            typerRef.current = requestAnimationFrame(step);
          } else {
            setScripture(text);
            resolve();
          }
        };
        typerRef.current = requestAnimationFrame(step);
      });
    });

  const runPhase = async (
    phaseName: string,
    duration: number,
    text: string,
    progressStart: number,
    progressEnd: number,
    sphereExpand: boolean,
    skipTyping = false
  ) => {
    if (cancelRef.current) return;
    setPhase(phaseName as any);
    setShowUI(true);
    setBgPhase(phaseName);
    setHeaderText(
      phaseName === PHASES.IN
        ? "Breathe In"
        : phaseName === PHASES.HOLD
        ? "Hold"
        : "Breathe Out"
    );
    setExpanded(sphereExpand);
    setShrinking(!sphereExpand);
    animateProgress(progressStart, progressEnd, duration);

    if (skipTyping) {
      setHidden(false);
      setScripture(text);
      await new Promise((r) => setTimeout(r, duration));
    } else {
      await typeText(text, duration);
    }
  };

  async function breatheCycle() {
    if (phase !== PHASES.IDLE || inputLocked) return;
    setInputLocked(true);
    cancelRef.current = false;
    setShowUI(true);
    setHidden(false);
    setBgPhase("in");
    await new Promise((r) => setTimeout(r, 300));

    await runPhase(PHASES.IN, IN_DURATION, scriptureParts.in, 0, 100, true);
    if (cancelRef.current) return handleEarlyRelease();

    await runPhase(PHASES.HOLD, HOLD_DURATION, scriptureParts.hold, 100, 100, true, true);
    if (cancelRef.current) return fadeOutAll();

    await runPhase(PHASES.OUT, OUT_DURATION, scriptureParts.out, 100, 0, false);
    if (cancelRef.current) return fadeOutAll();

    await new Promise((r) => setTimeout(r, 3000));
    await fadeOutAll();
  }

  // ✅ Clean early-release reset (during Breathe In only)
  async function handleEarlyRelease() {
    if (resetting) return;
    setResetting(true);

    cancelRef.current = true;

    // Instantly hide UI with fade-out class
    setShowUI(false);
    setHidden(true);
    setHeaderText("");
    setScripture("");

    // Reset sphere state
    setExpanded(false);
    setShrinking(false);
    setBgPhase("idle");

    // Smoothly reset progress bar to 0
    resetProgressBar();

    // Small delay to make fade feel natural
    await new Promise((r) => setTimeout(r, 500));

    // Reset everything cleanly
    setPhase(PHASES.IDLE);
    setInputLocked(false);
    setResetting(false);
  }

  async function fadeOutAll() {
    setShowUI(false);
    setHidden(true);
    setBgPhase("idle");
    resetProgressBar(1000);

    await new Promise((r) => setTimeout(r, 1200));

    setInputLocked(false);
    if (typeof onComplete === "function") onComplete();
  }

  useEffect(() => {
    const handleStart = (e: Event) => {
      e.preventDefault();
      if (phase === PHASES.IDLE && !inputLocked) {
        cancelRef.current = false;
        breatheCycle();
      }
    };

    const handleEnd = (e: Event) => {
      e.preventDefault();
      if (phase === PHASES.IN && !resetting) {
        cancelRef.current = true;
        handleEarlyRelease();
      }
    };

    document.addEventListener("mousedown", handleStart, { passive: false });
    document.addEventListener("touchstart", handleStart, { passive: false });
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);
    return () => {
      document.removeEventListener("mousedown", handleStart);
      document.removeEventListener("touchstart", handleStart);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [phase, inputLocked, resetting]);

  // Sphere + Rings setup (unchanged)
  useEffect(() => {
    const ringsContainer = document.getElementById("rings");
    const sphereContainer = document.getElementById("sphere");
    if (!ringsContainer || !sphereContainer) return;

    const generateScene = () => {
      ringsContainer.innerHTML = "";
      sphereContainer.innerHTML = "";
      const isMobile = window.innerWidth < 600;
      const ringCount = 12;
      const sphereRings = isMobile ? 10 : 20;

      for (let i = 0; i < ringCount; i++) {
        const c = document.createElement("div");
        c.className = "c";
        const t = i / ringCount;
        const r = 0.1 + 0.6 * t;
        const g = 0.55 + 0.35 * t;
        const b = 0.55 + 0.35 * (1 - t);
        const color = `rgba(${r * 255}, ${g * 255}, ${b * 255},`;
        c.style.borderColor = `${color} 0.9)`;
        c.style.animation = `spin ${25 + i * 2}s linear ${i * 0.1}s infinite`;
        ringsContainer.appendChild(c);
      }

      for (let i = 1; i <= sphereRings; i++) {
        const ring = document.createElement("div");
        ring.className = `ring${i}`;
        const t = i / sphereRings;
        const r = 0.1 + 0.8 * t;
        const g = 0.5 + 0.4 * t;
        const b = 0.7 + 0.19 * t;
        const hueColor = `rgba(${r * 255}, ${g * 255}, ${b * 255},`;
        const blur = isMobile ? 0.5 + i * 0.7 : 1 + i * 1.1;
        ring.style.transform = `rotateY(${i * 2}deg) rotateX(${i * 2}deg) rotateZ(${i * 3}deg)`;
        ring.style.boxShadow = `
          0 0 ${blur}px ${hueColor} 0.25),
          inset 0 0 ${blur}px ${hueColor} 0.35)
        `;
        sphereContainer.appendChild(ring);
      }
    };

    generateScene();
    window.addEventListener("resize", generateScene);
    return () => {
      window.removeEventListener("resize", generateScene);
      ringsContainer.innerHTML = "";
      sphereContainer.innerHTML = "";
    };
  }, []);

  return (
    <>
      {fadeIn && <div className="fade-in-overlay"></div>}
      <div className={`background-gradient ${bgPhase}`}></div>
      <div className={`scripture ${hidden ? "hidden" : ""}`}>{scripture}</div>
      <div className={`header ${showUI ? "show" : ""}`}>{headerText}</div>

      <div
        className={`scene ${expanded ? "expanded" : ""} ${shrinking ? "shrinking" : ""}`}
        id="scene"
      >
        <div className="b" id="rings"></div>
        <div className={`inner-red-circle phase-${phase}`}></div>
        <div className="sphere" id="sphere"></div>
      </div>

      <div className={`progress-container ${showUI ? "show" : ""}`}>
        <div className="progress-bar" ref={progressRef}></div>
      </div>
    </>
  );
}
