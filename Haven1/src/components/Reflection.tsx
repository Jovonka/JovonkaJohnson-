import React, { useEffect, useRef } from "react";
import "./Reflection.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
gsap.registerPlugin(ScrollTrigger);


const SECTIONS = [
    {
      key: "one",
      text: "There is no quick-fix when it comes to healing. In many ways, it’s more like a journey that lasts a lifetime. ",
    },
    {
      key: "two",
      text:
        "But you don’t have to take it alone. The same God who holds the stars in their place is holding you together too.",
    },
    {
      key: "three",
      type: "scripture",
      text: (
        <>
          <em>“[God] heals the brokenhearted and binds up their wounds.”</em>
          <br />
          <strong>— Psalm 147:3</strong>
        </>
      ),
    },
    {
      key: "four",
      text:
        "That’s what God wants to do; he wants to meet you right where you are, wrap you in his arms, and lead you to a new, hopeful future.",
    },
    {
      key: "five",
      type: "cta",
      text: "We want to walk with you too.",
    },
  ];
  
  

export default function Reflection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  // 🌈 Gradient background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      float noise(vec2 p) { return sin(p.x) * sin(p.y); }
      void main() {
        vec2 uv = v_uv;
        float t = u_time * 0.1;
        float n = 0.0;
        n += noise(uv * 1.9 + t);
        n += 0.5 * noise(uv * 2.0 - t * 5.2);
        n += 0.25 * noise(uv * 2.0 + t * 5.3);
        n = n * 0.5 + 0.5;
        vec3 colorA = vec3(0.1, 0.5, 0.7);
        vec3 colorB = vec3(0.2, 0.6, 1.0);
        vec3 colorC = vec3(0.9, 0.9, 0.89);
        vec3 color = mix(colorA, colorB, n);
        color = mix(color, colorC, smoothstep(0.2, 0.8, n));
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(program, "u_time");

    const render = (time: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(render);

    return () => window.removeEventListener("resize", resize);
  }, []);

// 🌍 Background sphere (Three.js) — scroll-linked, responsive, evolving, and growing
useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
  
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;
  
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.classList.add("background-sphere-canvas");
    container.appendChild(renderer.domElement);
  
    // === Responsive sizing ===
    const getSphereSize = () => {
      const w = window.innerWidth;
      if (w < 480) return 1.6;
      if (w < 1024) return 2.3;
      return 3.0;
    };
  
    let baseSize = getSphereSize();
    const geometry = new THREE.SphereGeometry(baseSize, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1e3a8a,
      metalness: 0.6,
      roughness: 0.3,
      transparent: true,
      opacity: 0.9,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
  
    // === Lights ===
    const light = new THREE.PointLight(0xffffff, 1.3);
    light.position.set(6, 4, 6);
    scene.add(light);
    const ambient = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambient);
  
    // === Animate rotation ===
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      sphere.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();
  
    // === Edge calculation (so it moves half-to-half, not off-screen) ===
    const computeEdgePositions = () => {
      const distance = camera.position.z;
      const vFOV = (camera.fov * Math.PI) / 180;
      const viewHeight = 2 * Math.tan(vFOV / 2) * distance;
      const viewWidth = viewHeight * camera.aspect;
      const r = baseSize / 2;
  
      const leftX = -viewWidth / 2 + r * 1.1;
      const rightX = viewWidth / 2 - r * 1.1;
      return { leftX, rightX, centerX: 0 };
    };
  
    let { leftX, rightX, centerX } = computeEdgePositions();
  
    // === Scroll-linked GSAP animation ===
    ScrollTrigger.getAll().forEach((t) => t.kill());
    const sections = document.querySelectorAll(".section");
    const totalSections = sections.length || 1;
  
    const positions: number[] = [];
    for (let i = 0; i < totalSections; i++) {
      if (i === 0) positions.push(centerX);
      else positions.push(i % 2 === 1 ? rightX : leftX);
    }
  
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".main",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
      },
    });
  
    // 🎨 Cohesive evolving states (color, glow, size)
    const sphereStates = [
      { color: 0x3b82f6, emissive: 0x1e3a8a, metalness: 0.6, roughness: 0.3, scale: 1.0 },
      { color: 0x2563eb, emissive: 0x1d4ed8, metalness: 0.8, roughness: 0.25, scale: 1.2 },
      { color: 0x60a5fa, emissive: 0x2563eb, metalness: 0.9, roughness: 0.2, scale: 1.35 },
      { color: 0xbfdbfe, emissive: 0x3b82f6, metalness: 0.4, roughness: 0.5, scale: 1.5 },
    ];
  
    positions.forEach((x, i) => {
      const state = sphereStates[i % sphereStates.length];
      tl.to(
        sphere.position,
        { x, duration: 1.2, ease: "power2.inOut" },
        i
      )
        .to(
          sphere.material.color,
          {
            r: new THREE.Color(state.color).r,
            g: new THREE.Color(state.color).g,
            b: new THREE.Color(state.color).b,
            duration: 1.2,
            ease: "power2.inOut",
          },
          i
        )
        .to(
          sphere.material.emissive,
          {
            r: new THREE.Color(state.emissive).r,
            g: new THREE.Color(state.emissive).g,
            b: new THREE.Color(state.emissive).b,
            duration: 1.2,
            ease: "power2.inOut",
          },
          i
        )
        .to(
          sphere.scale,
          {
            x: state.scale,
            y: state.scale,
            z: state.scale,
            duration: 1.5,
            ease: "power3.inOut",
          },
          i
        );
    });
  
    // === Responsive resize handler ===
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
  
      baseSize = getSphereSize();
      sphere.geometry.dispose();
      sphere.geometry = new THREE.SphereGeometry(baseSize, 64, 64);
  
      const { leftX: lx, rightX: rx, centerX: cx } = computeEdgePositions();
      leftX = lx;
      rightX = rx;
      centerX = cx;
    };
  
    window.addEventListener("resize", handleResize);
  
    // === Cleanup ===
    return () => {
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      cancelAnimationFrame(rafId);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);
  
// 🌟 Floating overlay line animations (only visible during their section)
useEffect(() => {
    const overlays = gsap.utils.toArray(".overlay-line") as HTMLElement[];
  
    overlays.forEach((el) => {
      const sectionIndex = Number(el.dataset.section);
      const trigger = document.querySelector(`.section:nth-of-type(${sectionIndex})`);
  
      if (!trigger) return;
  
      gsap.timeline({
        scrollTrigger: {
          trigger,
          start: "top center",
          end: "bottom center",
          scrub: true,
          onEnter: () =>
            gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }),
          onLeave: () =>
            gsap.to(el, { opacity: 0, y: -40, duration: 0.5, ease: "power2.inOut" }),
          onEnterBack: () =>
            gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }),
          onLeaveBack: () =>
            gsap.to(el, { opacity: 0, y: 40, duration: 0.5, ease: "power2.inOut" }),
        },
      });
    });
  
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);
  
  useEffect(() => {
    const overlays = gsap.utils.toArray(".overlay-line") as HTMLElement[];
    const sections = gsap.utils.toArray(".section") as HTMLElement[];
  
    overlays.forEach((el, i) => {
      const trigger = sections[i]; // section 1, 2, 4 will match their overlay
      if (!trigger) return;
  
      gsap.set(el, { opacity: 0, y: 50 });
  
      gsap.to(el, {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger,
          start: "top center",
          end: "bottom center",
          scrub: true,
          onLeave: () =>
            gsap.to(el, { opacity: 0, y: -40, duration: 0.4, ease: "power2.in" }),
          onLeaveBack: () =>
            gsap.to(el, { opacity: 0, y: 40, duration: 0.4, ease: "power2.in" }),
        },
      });
    });
  
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);
  
  
  
  
  // ✨ CTA reveal animation
  useEffect(() => {
    const lastSection = document.querySelector(".section:last-of-type");
    if (!lastSection || !ctaRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ctas = ctaRef.current!.children;
        if (entry.isIntersecting) {
          gsap.to(ctas, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          });
        } else {
          gsap.to(ctas, { opacity: 0, duration: 0.3 });
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(lastSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="scroll-root" ref={containerRef}>
      <canvas ref={canvasRef} className="animated-bg"></canvas>

     {/* 💫 CTA buttons only */}
<div className="cta-overlay">
  <div className="cta-container" ref={ctaRef}>
    <button className="cta-btn">Chat With Us</button>
    <button className="cta-btn">Read More</button>
    <button className="cta-btn secondary">Breathe With Me</button>
  </div>
</div>

{/* 🌤️ Floating overlay lines */}
<div className="overlay-lines">
  <div className="overlay-line" data-section="1">
    <strong>“What am I supposed to do now?”</strong>
  </div>
  <div className="overlay-line" data-section="2">
    <strong>You may not feel it, but hope is closer than you know.</strong>
  </div>
  <div className="overlay-line" data-section="4">
    <strong>It’s okay to not know what to do in times like this. Sometimes the bravest response to tragedy is  allowing someone to walk through it with you.</strong>
  </div>
</div>



      <main className="main" role="main">
  <section className="intro-section2">
    <p className="intro-text">
      When innocent lives are lost, when our sense of safety and security are stolen
      without warning, hope can easily slip away.{" "}
      <mark>
        But even though the world seems like it’s getting darker by the second, there
        is a light that no tragedy can touch.
      </mark>
      {"\n\n"}Your heart may be broken now, but it doesn’t have to stay that way.{" "}
    </p>
    <div className="scroll-indicator">
      <span>↓</span>
    </div>
  </section>

  {SECTIONS.map((s, i) => (
    <section
      key={s.key}
      className={`section section--fulltext ${
        i === SECTIONS.length - 1 ? "section--top" : "section--bottom"
      }`}
    >
      <div className="section__inner">
        <div className="section__text">{s.text}</div>
      </div>
    </section>
  ))}
</main>

    </div>
  );
}
