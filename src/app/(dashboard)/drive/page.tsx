"use client";

import React from "react";
import { FolderKanban } from "lucide-react";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function DrivePage() {
  return (
    <ComingSoon
      title="LetGetIn Cloud Drive"
      description="Securely store, organize, and manage all your resume versions, portfolio assets, and certificates."
      icon={FolderKanban}
    />
  );
}
