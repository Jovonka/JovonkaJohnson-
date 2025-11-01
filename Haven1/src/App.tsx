// App.tsx
import React, { useState } from "react";
import IntroSequence from "./components/IntroSequence";
import BreathingExercise from "./components/BreathingExercise";
import Reflection from "./components/Reflection";

export default function App() {
  const [stage, setStage] = useState<"intro" | "breathing" | "reflection">("intro");

  return (
    <>
      {stage === "intro" && (
        <IntroSequence onComplete={() => setStage("breathing")} />
      )}
      {stage === "breathing" && (
        <BreathingExercise onComplete={() => setStage("reflection")} />
      )}
      {stage === "reflection" && <Reflection />}
    </>
  );
}
