"use client";

import * as React from "react";
import UIProvider from "~/components/provider/UIProvider";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UIProvider>{children}</UIProvider>;
}
