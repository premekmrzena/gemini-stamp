import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-grow w-full">
        {children}
      </main>
      <Footer />
    </>
  );
}