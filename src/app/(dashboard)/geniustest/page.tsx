"use client";

import React from "react";
import { BrainCircuit } from "lucide-react";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function GeniusTestPage() {
  return (
    <ComingSoon
      title="Genius Test AI"
      description="Adaptive AI-driven technical and domain skill assessments designed to objectively prove your expertise."
      icon={BrainCircuit}
    />
  );
}
