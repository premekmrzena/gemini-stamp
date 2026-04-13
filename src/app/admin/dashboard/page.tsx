'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingBag, TrendingUp, X, Package, User, 
  MapPin, FileText, Calendar, Filter, Check, Trash2 
} from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Stavy pro filtry
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Chyba při načítání:', error);
    else {
      setOrders(data || []);
      setFilteredOrders(data || []);
    }
    setLoading(false);
  }

  // Funkce pro filtrování
  useEffect(() => {
    let result = orders;
    if (dateFilter) {
      result = orders.filter(order => 
        new Date(order.created_at).toLocaleDateString('en-CA') === dateFilter
      );
    }
    setFilteredOrders(result);
  }, [dateFilter, orders]);

  // Funkce pro změnu stavu objednávky
  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert('Chyba při aktualizaci stavu');
    } else {
      // Lokální aktualizace pro okamžitý efekt v UI
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  }

  if (loading) return <div className="p-10 text-white bg-[#0F172A] min-h-screen font-sans">Načítám dashboard...</div>;

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">E-shop Dashboard</h1>
            <p className="text-slate-400 text-sm">Správa objednávek Creative Stamp</p>
          </div>
          
          {/* FILTR PODLE DATA */}
          <div className="flex items-center gap-3 bg-[#1E293B] p-2 px-4 rounded-xl border border-[#334155]">
            <Calendar size={18} className="text-orange-500" />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-sm outline-none cursor-pointer border-none focus:ring-0 text-white"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="hover:text-orange-500">
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        {/* STATISTIKY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155] flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-blue-500/10 rounded-lg"><TrendingUp className="text-blue-500" /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Obrat (dle filtru)</p>
              <p className="text-2xl font-bold">{totalRevenue.toLocaleString('cs-CZ')} Kč</p>
            </div>
          </div>
          <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155] flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-orange-500/10 rounded-lg"><ShoppingBag className="text-orange-500" /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Objednávek</p>
              <p className="text-2xl font-bold">{filteredOrders.length}</p>
            </div>
          </div>
        </div>

        {/* TABULKA */}
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0F172A]/50 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Zákazník / ID</th>
                  <th className="p-4">Stav</th>
                  <th className="p-4 text-right">Částka</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-[#2B3755] cursor-pointer transition-colors text-sm group"
                  >
                    <td className="p-4">
                      <div className="font-bold group-hover:text-orange-400 transition-colors">
                        {order.billing_first_name} {order.billing_last_name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">#{order.id.slice(-6)}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        order.status === 'Vyřízeno' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : order.status === 'Zrušeno'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {order.status || 'Nová'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold">
                      {order.total_price.toLocaleString('cs-CZ')} Kč
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL OBJEDNÁVKY MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all">
          <div className="bg-[#1E293B] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#334155] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-[#1E293B]/80 backdrop-blur-md p-6 border-b border-[#334155] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Package className="text-orange-500" /> Detail #{selectedOrder.id.slice(-6).toUpperCase()}
                </h2>
                <p className="text-[10px] text-slate-500">{new Date(selectedOrder.created_at).toLocaleString('cs-CZ')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-[#334155] rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* AKCE STAVU */}
              <div className="bg-[#0F172A] p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between border border-[#334155]">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Změnit stav:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Vyřízeno')}
                    className="flex items-center gap-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    <Check size={14} /> Vyřízeno
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Zrušeno')}
                    className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    <Trash2 size={14} /> Zrušit
                  </button>
                </div>
              </div>

              {/* ADRESA A INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm pt-4">
                <div className="space-y-4">
                  <h3 className="text-slate-500 uppercase text-[10px] font-bold tracking-widest flex items-center gap-2">
                    <User size={14} className="text-orange-500" /> Zákazník
                  </h3>
                  <div>
                    <p className="font-bold text-lg">{selectedOrder.billing_first_name} {selectedOrder.billing_last_name}</p>
                    <p className="text-slate-400">{selectedOrder.billing_email}</p>
                    <p className="text-slate-400">{selectedOrder.billing_phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-slate-500 uppercase text-[10px] font-bold tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-orange-500" /> Doručení
                  </h3>
                  <div className="text-slate-300 italic">
                    {selectedOrder.billing_street}<br />
                    {selectedOrder.billing_city}, {selectedOrder.billing_zip}
                  </div>
                </div>
              </div>

              {/* POLOŽKY */}
              <div className="space-y-4">
                <h3 className="text-slate-500 uppercase text-[10px] font-bold tracking-widest flex items-center gap-2">
                  <ShoppingBag size={14} className="text-orange-500" /> Položky objednávky
                </h3>
                <div className="bg-[#0F172A] rounded-2xl overflow-hidden border border-[#334155]">
                  {selectedOrder.cart_items?.map((item: any, i: number) => (
                    <div key={i} className="p-4 border-b border-[#334155] last:border-0 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-200">{item.name}</p>
                        <p className="text-[11px] text-slate-500 uppercase font-mono">{item.quantity} x {item.price} Kč</p>
                      </div>
                      <p className="font-bold text-orange-400">{(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* PATIČKA MODALU */}
              <div className="pt-6 border-t border-[#334155] flex justify-between items-center">
                <div className="text-slate-500 text-xs italic">
                  Platba: {selectedOrder.payment_method}
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Celkem k úhradě</p>
                  <p className="text-3xl font-bold text-green-500">{selectedOrder.total_price.toLocaleString('cs-CZ')} Kč</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}