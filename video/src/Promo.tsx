import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Dashboard } from "./scenes/Scene3Dashboard";
import { Scene4Delete } from "./scenes/Scene4Delete";
import { Scene5Rotation } from "./scenes/Scene5Rotation";
import { Scene6CTA } from "./scenes/Scene6CTA";
import { Grain } from "./ui/Grain";
import { theme } from "./theme";

const SECONDS = 30;

const TIMING = {
  hook: { start: 0, frames: SECONDS * 3 },
  problem: { start: SECONDS * 3, frames: SECONDS * 4 },
  dashboard: { start: SECONDS * 7, frames: SECONDS * 4 },
  delete: { start: SECONDS * 11, frames: SECONDS * 5 },
  rotation: { start: SECONDS * 16, frames: SECONDS * 3 },
  cta: { start: SECONDS * 19, frames: SECONDS * 3 },
};

export const Promo: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => {
  return (
    <AbsoluteFill style={{ background: theme.paper }}>
      <Sequence from={TIMING.hook.start} durationInFrames={TIMING.hook.frames}>
        <Scene1Hook vertical={vertical} />
      </Sequence>
      <Sequence from={TIMING.problem.start} durationInFrames={TIMING.problem.frames}>
        <Scene2Problem vertical={vertical} />
      </Sequence>
      <Sequence from={TIMING.dashboard.start} durationInFrames={TIMING.dashboard.frames}>
        <Scene3Dashboard vertical={vertical} />
      </Sequence>
      <Sequence from={TIMING.delete.start} durationInFrames={TIMING.delete.frames}>
        <Scene4Delete vertical={vertical} />
      </Sequence>
      <Sequence from={TIMING.rotation.start} durationInFrames={TIMING.rotation.frames}>
        <Scene5Rotation vertical={vertical} />
      </Sequence>
      <Sequence from={TIMING.cta.start} durationInFrames={TIMING.cta.frames}>
        <Scene6CTA vertical={vertical} />
      </Sequence>
      <Grain />
      <GlobalStyles />
    </AbsoluteFill>
  );
};

const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Space+Mono:wght@400;700&display=swap');
  `}</style>
);
