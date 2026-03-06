import "./globals.css";
import AuthProviders from "./components/AuthProviders";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Petpooja Revenue & Voice Copilot",
  description: "AI-Powered Revenue Intelligence and Voice Ordering for Restaurants",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProviders>
          <div className="min-h-screen bg-slate-50">
            {children}
          </div>
        </AuthProviders>
      </body>
    </html>
  );
}
