export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Čisté "černé plátno" pro náš košík. 
    // Hlavička se stepperem i sticky patička budou teď přímo v page.tsx
    <main className="flex flex-col flex-grow w-full bg-black text-secondary relative">
      {children}
    </main>
  );
}