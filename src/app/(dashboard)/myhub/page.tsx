"use client";

import React from "react";
import { LayoutGrid } from "lucide-react";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function MyHubPage() {
  return (
    <ComingSoon
      title="My Hub"
      description="Your centralized command center for job applications, active recruiter interactions, and career milestones."
      icon={LayoutGrid}
    />
  );
}
