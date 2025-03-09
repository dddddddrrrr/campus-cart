"use client";

import * as React from "react";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";

const UIProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
  );
};

export default UIProvider;
