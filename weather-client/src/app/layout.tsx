import { PlacesProvider } from "@/contexts/PlacesContext";
import type { Metadata } from "next";
import "../assets/css/globals.css";

export const metadata: Metadata = {
  title: "Weather Site",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PlacesProvider>{children}</PlacesProvider>
      </body>
    </html>
  );
}
