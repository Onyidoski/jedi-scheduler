export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is minimal and doesn't include the Header or Footer
  return <section>{children}</section>;
}