import Link from 'next/link';

// Cvičná data - později je nahradíme voláním do Supabase
const mockProducts = [
  { id: '1', name: 'Základní Tričko', price: 500, image: 'https://via.placeholder.com/300' },
  { id: '2', name: 'Stylová Mikina', price: 1200, image: 'https://via.placeholder.com/300' },
  { id: '3', name: 'Kšiltovka', price: 400, image: 'https://via.placeholder.com/300' },
  { id: '4', name: 'Plátěná Taška', price: 250, image: 'https://via.placeholder.com/300' },
];

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      
      {/* Hero Sekce */}
      <section className="mb-16 text-center mt-12">
        <h1 className="text-5xl font-bold mb-4">Vítejte v našem E-shopu</h1>
        <p className="text-gray-600 text-lg mb-8">Objevte ty nejlepší kousky pro váš šatník.</p>
        <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition">
          Nakupovat teď
        </button>
      </section>

      {/* Seznam produktů */}
      <section>
        <h2 className="text-3xl font-semibold mb-6">Nejnovější produkty</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition flex flex-col">
              {/* Zástupný obrázek */}
              <div className="bg-gray-200 w-full h-48 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-500">Obrázek</span>
              </div>
              
              <h3 className="text-lg font-medium">{product.name}</h3>
              <p className="text-gray-700 mt-1 mb-4">{product.price} Kč</p>
              
              <Link 
                href={`/produkt/${product.id}`} 
                className="mt-auto bg-gray-100 text-center py-2 rounded-md hover:bg-gray-200 transition"
              >
                Detail produktu
              </Link>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}