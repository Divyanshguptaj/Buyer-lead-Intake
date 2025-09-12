import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from '@/components/nav-bar';
import { ClientErrorBoundary } from '@/components/ui/client-error-boundary';
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Buyer Lead Intake",
  description: "Manage buyer leads easily",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased font-sans bg-gray-50 min-h-screen"
      >
        <AuthProvider>
          <ClientErrorBoundary>
            <div className="flex flex-col min-h-screen">
              <NavBar />
              <main className="container mx-auto px-4 py-8 flex-grow">
                {children}
              </main>
              <footer className="bg-slate-800 text-white py-4 text-center text-sm">
                &copy; {new Date().getFullYear()} Buyer Lead Intake
              </footer>
            </div>
          </ClientErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
