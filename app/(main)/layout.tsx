// app/(main)/layout.tsx
import { Header } from "@/components/header";


export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <footer className="border-t border-gray-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6 text-center text-gray-600">
            <p className="mb-2">
              © 2025 JEDI. Built with precision. All rights reserved.
            </p>
          </div>
        </footer>
    </>
  );
}