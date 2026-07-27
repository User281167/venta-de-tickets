"use client";

import { Box} from "@chakra-ui/react";
import Wave from "react-wavify";

export function DefaultWaves() {
  return (
    <>
      <Box
        position="absolute"
        insetX={0}
        bottom={0}
        zIndex={3}
        h="35%"
        opacity={0.40}
        pointerEvents="none"
        className="!opacity-5"
      >
        <Wave
          fill="url(#authWaveFront)"
          paused={false}
          style={{ width: "100%", height: "100%", display: "flex" }}
          options={{ height: 24, amplitude: 90, speed: 0.16, points: 4 }}
        >
          <defs>
            <linearGradient id="authWaveFront" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="35%" stopColor="#a78bfa" />
              <stop offset="65%" stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
          </defs>
        </Wave>
      </Box>

      <Box
        position="absolute"
        insetX={0}
        bottom={0}
        zIndex={3}
        h="30%"
        opacity={0.30}
        pointerEvents="none"
        className="!opacity-5"
      >
        <Wave
          fill="url(#authWaveBack)"
          paused={false}
          style={{ width: "100%", height: "100%", display: "flex" }}
          options={{ height: 20, amplitude: 100, speed: 0.1, points: 3 }}
        >
          <defs>
            <linearGradient id="authWaveBack" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff0f7b" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>
          </defs>
        </Wave>
      </Box>

      <Box
        position="absolute"
        insetX={0}
        bottom={0}
        zIndex={3}
        h="25%"
        opacity={0.30}
        pointerEvents="none"
        className="!opacity-5"
      >
        <Wave
          fill="url(#authWaveBack)"
          paused={false}
          style={{ width: "100%", height: "100%", display: "flex" }}
          options={{ height: 18, amplitude: 95, speed: 0.07, points: 5 }}
        >
          <defs>
            <linearGradient id="authWaveBack" x1="0" y1="0" x2="1" y2="0">
              <stop offset="00%" stopColor="#a78bfa" />
              <stop offset="40%" stopColor="#ff0f7b" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>
          </defs>
        </Wave>
      </Box>
    </>
  )
}
