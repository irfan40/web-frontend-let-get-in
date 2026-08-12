"use client";

import React from "react";
import { Network } from "lucide-react";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function NetworkPage() {
  return (
    <ComingSoon
      title="My Network"
      description="Connect with verified hiring managers, peer developers, and industry mentors to expand your professional career reach."
      icon={Network}
    />
  );
}
