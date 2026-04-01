import type { Metadata } from "next";
import "./globals.css";
import { MotionProvider } from "@/components/providers/motion-provider";

export const metadata: Metadata = {
  title: "Fairway for Good",
  description: "A golf charity subscription platform with prize draws, subscriptions, and measurable giving."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
