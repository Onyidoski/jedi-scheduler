// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is just a simple wrapper
  // It will NOT have your header or footer
  return (
    <div className="flex min-h-screen items-center justify-center">
      {children}
    </div>
  );
}