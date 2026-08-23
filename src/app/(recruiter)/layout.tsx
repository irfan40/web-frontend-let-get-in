"use client";

import React, { useState } from "react";
import { RecruiterGuard } from "@/components/auth/RecruiterGuard";
import { RecruiterShell } from "@/components/layout/RecruiterShell";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RecruiterGuard>
      <div className="min-h-screen flex bg-background text-foreground">
        <RecruiterShell isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </RecruiterGuard>
  );
}
