import { useEffect, useRef, useState } from "react";
import "./App.css";
import TextPressure from "./components/TextPressure";


export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);
  const prismRef = useRef<HTMLDivElement | null>(null); // 👈 Ref for Prism parallax

  // Move indicator when active tab changes or window resizes
  useEffect(() => {
    const moveIndicator = () => {
      const active = tabsRef.current.find((tab) => tab?.dataset.tab === activeTab);
      const indicator = indicatorRef.current;
      if (!active || !indicator) return;

      const rect = active.getBoundingClientRect();
      const parentRect = active.parentElement!.getBoundingClientRect();
      const offsetLeft = rect.left - parentRect.left;
      indicator.style.width = `${rect.width + 20}px`;
      indicator.style.transform = `translate(${offsetLeft - 10}px, -50%)`;
      indicator.style.setProperty("--x", `${offsetLeft - 10}px`);
    };

    setTimeout(moveIndicator, 50);
    window.addEventListener("resize", moveIndicator);
    return () => window.removeEventListener("resize", moveIndicator);
  }, [activeTab]);

  // 👇 Parallax movement for Prism background
  useEffect(() => {
    const prismEl = prismRef.current;
    if (!prismEl) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10; // horizontal tilt
      const y = (e.clientY / innerHeight - 0.5) * 10; // vertical tilt
      prismEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.02)`; // slight zoom
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <div className="app">
   

      {/* === TOPBAR === */}
      <header className="topbar">
        <nav>
          <ul>
            {["home", "work", "playground", "about"].map((tab, i) => (
              <li
                key={tab}
                data-tab={tab}
                ref={(el) => {
                  tabsRef.current[i] = el;
                }}
                className={activeTab === tab ? "active" : ""}
                onClick={() => handleTabClick(tab)}
              >
                {tab === "about" ? "About Me" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </li>
            ))}
          </ul>
          <div className="nav-indicator" ref={indicatorRef}></div>
        </nav>
      </header>

      {/* === CONTENT === */}
      <main className="content">
        {activeTab === "home" && (
          <section id="home" className="tab-section active">
            <div className="video-background">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="background-video"
                onCanPlay={(e) => {
                  const video = e.currentTarget;
                  video.playbackRate = 0.75;
                }}
              >
                <source src="/videos/hero.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="text-overlay">
              <div className="name-block">
                <TextPressure text="Jovonka" minFontSize={40} width weight italic />
                <TextPressure text="Johnson" minFontSize={40} width weight italic />
              </div>
              <p className="intro-text">
              Is a designer, developer, and 3d artist blending technology and design to inspire and connect.
              </p>
            </div>
          </section>
        )}

        <section
          id="work"
          className={`tab-section ${activeTab === "work" ? "active" : ""}`}
        >
          <h1>Work</h1>
          <p>Projects that explore emotion and experience through design.</p>
        </section>

        <section
          id="playground"
          className={`tab-section ${activeTab === "playground" ? "active" : ""}`}
        >
          <h1>Playground</h1>
          <p>Experimental ideas, motion studies, and creative coding.</p>
        </section>

        <section
          id="about"
          className={`tab-section ${activeTab === "about" ? "active" : ""}`}
        >
          <h1>About Me</h1>
          <p>
            Designer, dreamer, and digital explorer — inspired by rhythm and
            resonance.
          </p>
        </section>
      </main>
    </div>
  );
}
