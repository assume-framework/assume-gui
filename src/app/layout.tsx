import { ReactFlowProvider } from "@xyflow/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Home from "./Home";
import { DnDProvider } from "./DragDropCtx";

export const metadata: Metadata = {
  title: "Assume Dashboard",
  description: "A dashboard to setup and manage your Assume simulation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ width: "100vw", height: "100vh" }}>
        <ReactFlowProvider>
          <DnDProvider>
            <Home />
          </DnDProvider>
        </ReactFlowProvider>
      </body>
    </html>
  );
}
