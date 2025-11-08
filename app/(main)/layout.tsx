// app/(main)/layout.tsx
import { Header } from "@/components/header";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={poppins.variable}>
      <Header />
      <main>{children}</main>
      <footer className="border-t border-gray-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6 text-center text-gray-600">
            <p className="mb-2">
              © 2025 JEDI. Built with precision. All rights reserved.
            </p>
          </div>
        </footer>
    </div>
  );
}