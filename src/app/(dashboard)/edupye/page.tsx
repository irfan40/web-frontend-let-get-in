"use client";

import React from "react";
import { BookOpenCheck } from "lucide-react";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function EdupyePage() {
  return (
    <ComingSoon
      title="Edupye Learning Suite"
      description="Personalized AI learning paths and targeted course recommendations to close skill gaps identified on your resume."
      icon={BookOpenCheck}
    />
  );
}
