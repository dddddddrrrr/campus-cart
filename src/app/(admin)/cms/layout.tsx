"use client";

import * as React from "react";
import { SidebarProvider } from "~/components/cms/SidebarProvider";

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div >
      <SidebarProvider>{children}</SidebarProvider>
    </div>
  );
}
