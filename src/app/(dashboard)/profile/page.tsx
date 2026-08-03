"use client";

import React from "react";
import { User } from "lucide-react";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function ProfilePage() {
  return (
    <ComingSoon
      title="User Profile & Identity"
      description="Manage your account preferences, verified skills, credentials, and public professional persona."
      icon={User}
    />
  );
}
