'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingBag, TrendingUp, X, Package, User, 
  MapPin, Calendar, Check, Trash2,
  LogOut, Lock, Mail, Download
} from 'lucide-react';

export default function AdminDashboard() {
  // --- STAVY PRO AUTENTIZACI ---
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- STAVY PRO DASHBOARD ---
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  // --- STAVY PRO TISKOVÁ DATA ARCHŮ ---
  const [customStampsData, setCustomStampsData] = useState<Record<string, string>>({});

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
      if (user) {
        fetchOrders();
      }
    }
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrders();
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    });

    return () => subscription.unsubscribe();
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

  useEffect(() => {
    let result = orders;
    if (dateFilter) {
      result = orders.filter(order => 
        new Date(order.created_at).toLocaleDateString('en-CA') === dateFilter
      );
    }
    setFilteredOrders(result);
  }, [dateFilter, orders]);

  useEffect(() => {
    async function loadCustomStampsPrintUrls() {
      if (!selectedOrder || !selectedOrder.cart_items) {
        setCustomStampsData({});
        return;
      }

      const customStampIds = selectedOrder.cart_items
        .filter((item: any) => item.name.toLowerCase().includes('vlastní'))
        .map((item: any) => item.id);

      if (customStampIds.length === 0) {
        setCustomStampsData({});
        return;
      }

      const { data, error } = await supabase
        .from('custom_stamps')
        .select('id, print_url')
        .in('id', customStampIds);

      if (error) {
        console.error('Chyba při načítání tiskových URL:', error);
        return;
      }

      if (data) {
        const urlMapping = data.reduce((acc: Record<string, string>, curr: any) => {
          acc[curr.id] = curr.print_url;
          return acc;
        }, {});
        setCustomStampsData(urlMapping);
      }
    }

    loadCustomStampsPrintUrls();
  }, [selectedOrder]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setLoginError(error.message === 'Invalid login credentials' ? 'Nesprávný e-mail nebo heslo.' : error.message);
    }
    setIsLoggingIn(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert('Chyba při aktualizaci stavu');
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder((prev: any) => prev ? { ...prev, status: newStatus } : null);
    }
  }

  if (authLoading) return <div className="p-10 text-secondary bg-black min-h-screen font-sans flex items-center justify-center style-body">Ověřuji přístup...</div>;

  // ========================================================
  // 🔐 PŘIHLAŠOVACÍ FORMULÁŘ
  // ========================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-secondary flex items-center justify-center p-4">
        <div className="bg-black400 w-full max-w-md p-8 rounded-[16px] border border-black300/30 shadow-2xl space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="text-center">
            <h1 className="style-h2 text-secondary">Creative Stamp</h1>
            <p className="style-body text-black300 mt-1">Vstup do administrace e-shopu</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="style-product-tag text-black300 block">E-mail</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-4 text-black300" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@creativestamp.cz"
                  className="w-full bg-black border border-black300/50 rounded-[8px] pl-11 pr-4 h-[48px] style-body text-secondary placeholder:text-black300/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="style-product-tag text-black300 block">Heslo</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-4 text-black300" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-black300/50 rounded-[8px] pl-11 pr-4 h-[48px] style-body text-secondary placeholder:text-black300/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-tag-posledni-kusy style-body-bold bg-tag-posledni-kusy/10 p-3 rounded-[8px] border border-tag-posledni-kusy/20">
                {loginError}
              </p>
            )}

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-black font-semibold h-[48px] rounded-[8px] transition-all style-body mt-2 flex items-center justify-center cursor-pointer"
            >
              {isLoggingIn ? 'Ověřuji...' : 'Přihlásit se'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ========================================================
  // 📊 MAIN DASHBOARD
  // ========================================================
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);

  return (
    <div className="min-h-screen bg-black text-secondary p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="style-h1 text-secondary">E-shop Dashboard</h1>
            <p className="style-body text-black300">Správa objednávek Creative Stamp</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-black400 p-2 px-4 rounded-[8px] border border-black300/30">
              <Calendar size={18} className="text-primary" />
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent style-body outline-none cursor-pointer border-none focus:ring-0 text-secondary"
              />
              {dateFilter && (
                <button onClick={() => setDateFilter('')} className="hover:text-primary cursor-pointer text-black300 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-tag-posledni-kusy/10 hover:bg-tag-posledni-kusy border border-tag-posledni-kusy/20 hover:text-secondary text-tag-posledni-kusy px-4 h-[40px] rounded-[8px] style-body-bold transition-all cursor-pointer"
            >
              <LogOut size={16} /> Odhlásit se
            </button>
          </div>
        </header>

        {/* STATISTIKY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-black400 p-6 rounded-[16px] border border-black300/20 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-tag-top/10 rounded-[8px]"><TrendingUp className="text-tag-top" /></div>
            <div>
              <p className="style-product-tag text-black300 mb-1">Obrat (dle filtru)</p>
              <p className="style-h2 text-secondary">{totalRevenue.toLocaleString('cs-CZ')} Kč</p>
            </div>
          </div>
          <div className="bg-black400 p-6 rounded-[16px] border border-black300/20 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-primary/10 rounded-[8px]"><ShoppingBag className="text-primary" /></div>
            <div>
              <p className="style-product-tag text-black300 mb-1">Objednávek</p>
              <p className="style-h2 text-secondary">{filteredOrders.length}</p>
            </div>
          </div>
        </div>

        {/* TABULKA */}
        <div className="bg-black400 rounded-[16px] border border-black300/20 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-10 text-center text-black300 style-body">Načítám čerstvá data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/50 text-black300 style-product-tag">
                  <tr>
                    <th className="p-4 font-normal">Zákazník / ID</th>
                    <th className="p-4 font-normal">Stav</th>
                    <th className="p-4 font-normal text-right">Částka</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black300/20">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-black300 style-body">Žádné objednávky neodpovídají filtru.</td>
                    </tr>
                  ) : filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-black/40 cursor-pointer transition-colors group"
                    >
                      <td className="p-4">
                        <div className="style-body-bold text-secondary group-hover:text-primary transition-colors">
                          {order.billing_first_name} {order.billing_last_name}
                        </div>
                        <div className="text-[11px] font-mono text-black300 uppercase mt-1">#{order.id.slice(-6)}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-[4px] style-product-tag border ${
                          order.status === 'Vyřízeno' 
                            ? 'bg-success/10 text-success border-success/20' 
                            : order.status === 'Zrušeno'
                            ? 'bg-tag-posledni-kusy/10 text-tag-posledni-kusy border-tag-posledni-kusy/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {order.status || 'Nová'}
                        </span>
                      </td>
                      <td className="p-4 text-right style-body-bold text-secondary">
                        {order.total_price.toLocaleString('cs-CZ')} Kč
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL OBJEDNÁVKY MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all" onClick={() => setSelectedOrder(null)}>
          <div className="bg-black400 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-black300/30 shadow-2xl animate-[fadeIn_0.15s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-black400/90 backdrop-blur-md p-6 border-b border-black300/30 flex justify-between items-center z-10">
              <div>
                <h2 className="style-h3 text-secondary flex items-center gap-2">
                  <Package className="text-primary" size={20} /> Detail #{selectedOrder.id.slice(-6).toUpperCase()}
                </h2>
                <p className="text-[11px] text-black300 mt-1">{new Date(selectedOrder.created_at).toLocaleString('cs-CZ')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-black300 hover:text-secondary hover:bg-black300/10 rounded-full transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* AKCE STAVU */}
              <div className="bg-black p-4 rounded-[12px] flex flex-wrap gap-4 items-center justify-between border border-black300/20">
                <span className="style-product-tag text-black300">Změnit stav:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Vyřízeno')}
                    className="flex items-center gap-1.5 bg-success/10 hover:bg-success text-success hover:text-secondary border border-success/20 px-3 py-2 rounded-[6px] style-body-bold transition-all cursor-pointer"
                  >
                    <Check size={16} /> Vyřízeno
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Zrušeno')}
                    className="flex items-center gap-1.5 bg-tag-posledni-kusy/10 hover:bg-tag-posledni-kusy text-tag-posledni-kusy hover:text-secondary border border-tag-posledni-kusy/20 px-3 py-2 rounded-[6px] style-body-bold transition-all cursor-pointer"
                  >
                    <Trash2 size={16} /> Zrušit
                  </button>
                </div>
              </div>

              {/* ADRESA A INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-3">
                  <h3 className="style-product-tag text-black300 flex items-center gap-2">
                    <User size={14} className="text-primary" /> Zákazník
                  </h3>
                  <div>
                    <p className="style-h4 text-secondary">{selectedOrder.billing_first_name} {selectedOrder.billing_last_name}</p>
                    <p className="style-body text-black300 mt-1">{selectedOrder.billing_email}</p>
                    <p className="style-body text-black300">{selectedOrder.billing_phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="style-product-tag text-black300 flex items-center gap-2">
                    <MapPin size={14} className="text-primary" /> Doručení
                  </h3>
                  <div className="style-body text-black200">
                    {selectedOrder.billing_address_line1}<br />
                    {selectedOrder.billing_city}, {selectedOrder.billing_zip}
                  </div>
                </div>
              </div>

              {/* POLOŽKY VČETNĚ STAŽENÍ TISKOVÝCH PODKLADŮ */}
              <div className="space-y-3">
                <h3 className="style-product-tag text-black300 flex items-center gap-2">
                  <ShoppingBag size={14} className="text-primary" /> Položky objednávky
                </h3>
                <div className="bg-black rounded-[12px] border border-black300/20 overflow-hidden">
                  {selectedOrder.cart_items?.map((item: any, i: number) => {
                    const isCustomStamp = item.name.toLowerCase().includes('vlastní');
                    const printUrl = customStampsData[item.id];

                    return (
                      <div key={i} className="p-4 border-b border-black300/20 last:border-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="space-y-1">
                          <p className="style-body-bold text-secondary">{item.name}</p>
                          <p className="style-product-tag text-black300 lowercase">{item.quantity} x {item.price} Kč</p>
                          
                          {/* DYNAMICKÉ TLAČÍTKO PRO STAŽENÍ TISKOVÉHO SOUBORU */}
                          {isCustomStamp && (
                            <div className="pt-2">
                              {printUrl ? (
                                <a 
                                  href={printUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-black font-semibold px-4 py-2 rounded-[6px] style-body transition-all cursor-pointer"
                                >
                                  <Download size={14} /> Stáhnout tiskové PNG
                                </a>
                              ) : (
                                <span className="style-body text-black300 italic block animate-pulse">
                                  Načítám tiskové podklady z cloudu...
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="style-body-bold text-primary sm:text-right shrink-0">{(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PATIČKA MODALU */}
              <div className="pt-6 border-t border-black300/30 flex justify-between items-center">
                <div className="style-body text-black300">
                  Platba: <span className="text-secondary">{selectedOrder.payment_method}</span>
                </div>
                <div className="text-right">
                  <p className="style-product-tag text-black300 mb-1">Celkem k úhradě</p>
                  <p className="style-product-price text-success">{selectedOrder.total_price.toLocaleString('cs-CZ')} Kč</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}