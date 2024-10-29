import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback App",
  description: "Anonymous feedback app for everyone to share their thoughts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <AuthProvider>
        <body>
          <Navbar />
          {children}
          <Toaster />
        </body>
      </AuthProvider>
    </html>
  );
}
