import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helical Solar System | 3D Visualization",
  description: "Accurate interactive 3D model of the solar system showing the real helical motion of the planets as the Sun travels through the galaxy. Built with Three.js.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#05070a] text-white">
        {children}
      </body>
    </html>
  );
}
