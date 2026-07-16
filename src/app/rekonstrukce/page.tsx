import Image from 'next/image';

export const metadata = {
  title: 'Web se připravuje',
  robots: { index: false, follow: false },
};

export default async function RekonstrukcePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen w-full bg-[#0F172A] text-secondary flex items-center justify-center px-6">
      <div className="w-full max-w-[420px] text-center">
        <Image
          src="/images/creative-stamp_logo.svg"
          alt="My Creative Stamp Logo"
          width={250}
          height={69}
          priority
          className="h-[48px] w-auto mx-auto mb-8 object-contain"
        />
        <h1 className="style-h1 mb-4">Web se připravuje</h1>
        <p className="style-body text-secondary/60 mb-10">
          Chystáme pro vás nový e-shop My Creative Stamp. Pokud máte přístupové heslo, zadejte ho níže.
        </p>

        <form action="/api/site-access" method="POST" className="flex flex-col gap-3">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Heslo"
            className="w-full bg-black border border-black300/50 rounded-[8px] px-4 h-[48px] style-body text-secondary text-center placeholder:text-black300/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
          {error && (
            <p className="style-body-bold text-tag-posledni-kusy">Nesprávné heslo, zkuste to znovu.</p>
          )}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-black font-semibold h-[48px] rounded-[8px] transition-all style-body cursor-pointer"
          >
            Vstoupit
          </button>
        </form>
      </div>
    </main>
  );
}
