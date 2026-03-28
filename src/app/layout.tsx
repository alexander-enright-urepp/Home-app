import type { Metadata } from "next";
import { fontClasses } from "@/lib/fonts";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aylae - All Your Links, Access Easily",
  description: "Create your personal link page with Aylae",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontClasses} font-body antialiased bg-surface text-brand`}
      >
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#0f172a",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
