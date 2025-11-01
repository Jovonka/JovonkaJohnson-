import React, { useEffect, useRef, useState } from "react";
import "./IntroSequence.css";

interface IntroSequenceProps {
  onComplete: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [step, setStep] = useState(0);
  const [showClickIndicator, setShowClickIndicator] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFinalFade, setIsFinalFade] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // 🌊 Mesh Gradient Shader
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

      float noise(vec2 p) {
        return sin(p.x) * sin(p.y);
      }

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

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeUniform = gl.getUniformLocation(program, "u_time");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    let start = Date.now();
    const render = () => {
      const time = (Date.now() - start) * 0.001;
      gl.uniform1f(timeUniform, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ✨ Sequence start
  useEffect(() => {
    const startSequence = async () => {
      await delay(100);
      setStep(1);
      await delay(100);
      setShowClickIndicator(true);
    };
    startSequence();
  }, []);

  const handleScreenTap = async () => {
    if (!showClickIndicator) return;

    setShowClickIndicator(false);
    setIsFadingOut(true);
    await delay(100);

    if (step === 1) {
      setStep(2);
      setIsFadingOut(false);
      await delay(100);
      setShowClickIndicator(true);
      return;
    }

    if (step === 2) {
      setStep(3);
      setIsFadingOut(false);
      await delay(100);
      setShowPanel(true);
      return;
    }
  };

  const handleContinue = async () => {
    setIsFadingOut(true);
    await delay(500);
    setIsFinalFade(true);
    await delay(500);
    onComplete();
  };

  return (
    <div className="intro-container" onClick={handleScreenTap}>
      {/* 🎨 Mesh Gradient Background */}
      <canvas ref={canvasRef} className="mesh-gradient-bg" />

      {/* 🌫️ Floating Texts */}
      {step === 1 && (
        <div className={`intro-text1 ${isFadingOut ? "fade-out" : ""}`}>
          I just don’t see how everything’s going to be okay.
        </div>
      )}

      {step === 2 && (
        <div className={`intro-text1 ${isFadingOut ? "fade-out" : ""}`}>
          You have questions–big questions. And they deserve answers. But for now, let’s start small...
        </div>
      )}

      {/* 🪶 Instruction Panel */}
      {showPanel && (
        <div className={`instruction-overlay ${isFadingOut ? "fade-out" : ""}`}>
          <div className="instruction-panel">
            <h3>Instructions</h3>
            <p>
              On the next screen, press and hold to begin, and keep holding until the progress bar completes.
            </p>
            <button className="continue-button" onClick={handleContinue}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* 👇 "Tap to continue" only for step 1 and 2 */}
      {showClickIndicator && (step === 1 || step === 2) && (
        <div className="click-indicator">Tap to continue</div>
      )}

      {/* 🖤 Fade to black overlay */}
      {isFinalFade && <div className="fade-to-black" />}
    </div>
  );
}
