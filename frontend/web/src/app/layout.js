import "./globals.css";
import { MetrixStoreProvider } from "@/lib/store";

export const metadata = {
  title: "MetriX — Legal Metrology Digital Verification & Certification Platform",
  description: "Unified digital platform for registration, verification, digital certification, and lifecycle management of weighing and measuring instruments under Legal Metrology regulations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[#f8fafc] text-[#1b1b1d]">
        <MetrixStoreProvider>
          {children}
        </MetrixStoreProvider>
      </body>
    </html>
  );
}
