export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-grow w-full">
      {children}
    </div>
  );
}