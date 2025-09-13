import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { ClientErrorBoundary } from "@/components/ui/client-error-boundary";
import { AuthProvider } from "@/components/auth-provider";
import { getSession, getCurrentUser } from "@/lib/session";

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
      <body className="antialiased font-sans bg-white text-gray-900 min-h-screen">
        <AuthProvider>
          <ClientErrorBoundary>
            <div className="flex flex-col min-h-screen">
              {/* Navigation */}
              <header className="border-b border-gray-200 shadow-sm bg-white">
                <NavBar />
              </header>

              {/* Main content */}
              <main className="container  flex-grow">
                {children}
              </main>

              {/* Footer */}
              <footer className="border-t border-gray-200 bg-white text-gray-600 py-6 text-center text-sm">
                &copy; {new Date().getFullYear()} Buyer Lead Intake. All rights reserved.
              </footer>
            </div>
          </ClientErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
