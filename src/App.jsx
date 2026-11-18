import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Bell,
  Clock,
  CheckCircle2,
  ChefHat,
  Users,
  MessageSquare,
  Package,
  BarChart3,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  FastForward,
  Send,
  CreditCard,
  Banknote,
  Building2,
  QrCode,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  Flame,
  Award,
  TrendingUp,
} from 'lucide-react';

// --- INITIAL DATA ---
const MENU_ITEMS = [
  { id: 'm1', name: 'Chicken Biryani (Full)', category: 'Mains', price: 320, prepTime: '12m', veg: false, popular: true, stockKey: 'chicken' },
  { id: 'm2', name: 'Mutton Rogan Josh', category: 'Mains', price: 420, prepTime: '15m', veg: false, popular: true, stockKey: 'mutton' },
  { id: 'm3', name: 'Paneer Tikka Masala', category: 'Mains', price: 280, prepTime: '10m', veg: true, popular: false, stockKey: 'paneer' },
  { id: 'm4', name: 'Garlic Butter Naan (2 pcs)', category: 'Breads', price: 90, prepTime: '5m', veg: true, popular: true, stockKey: 'flour' },
  { id: 'm5', name: 'Chicken Seekh Kebab', category: 'Starters', price: 260, prepTime: '10m', veg: false, popular: false, stockKey: 'chicken' },
  { id: 'm6', name: 'Mango Lassi', category: 'Drinks', price: 110, prepTime: '3m', veg: true, popular: false, stockKey: 'dairy' },
  { id: 'm7', name: 'Noor Shahi Family Feast', category: 'Deals', price: 999, prepTime: '18m', veg: false, popular: true, isDeal: true, desc: '2 Chicken Biryani + 1 Paneer Tikka + 4 Naan + 2 Lassi', stockKey: 'chicken' },
];

const INITIAL_TABLES = [
  { id: 'T1', seats: 4, status: 'occupied', guests: 3, bill: 730, waiter: 'Ali' },
  { id: 'T2', seats: 2, status: 'free', guests: 0, bill: 0, waiter: 'Ali' },
  { id: 'T3', seats: 6, status: 'occupied', guests: 5, bill: 1419, waiter: 'Ali' },
  { id: 'T4', seats: 4, status: 'billing', guests: 4, bill: 960, waiter: 'Sara' },
  { id: 'T5', seats: 2, status: 'free', guests: 0, bill: 0, waiter: 'Sara' },
  { id: 'T6', seats: 8, status: 'occupied', guests: 6, bill: 1850, waiter: 'Ali' },
  { id: 'T7', seats: 4, status: 'free', guests: 0, bill: 0, waiter: 'Sara' },
  { id: 'T8', seats: 4, status: 'occupied', guests: 2, bill: 410, waiter: 'Ali' },
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-104',
    source: 'Dine-In',
    table: 'T1',
    items: [
      { name: 'Chicken Biryani (Full)', qty: 2, price: 320 },
      { name: 'Garlic Butter Naan (2 pcs)', qty: 1, price: 90 },
    ],
    total: 730,
    status: 'preparing',
    elapsedSeconds: 510, // 8m 30s
    note: 'Extra raita on the side',
  },
  {
    id: 'ORD-105',
    source: 'Dine-In',
    table: 'T3',
    items: [
      { name: 'Noor Shahi Family Feast', qty: 1, price: 999 },
      { name: 'Mutton Rogan Josh', qty: 1, price: 420 },
    ],
    total: 1419,
    status: 'preparing',
    elapsedSeconds: 820, // 13m 40s (close to 15m late threshold)
    note: 'Medium spicy',
  },
  {
    id: 'ORD-106',
    source: 'WhatsApp',
    table: 'Delivery • +91 98201-44210',
    items: [
      { name: 'Paneer Tikka Masala', qty: 2, price: 280 },
      { name: 'Garlic Butter Naan (2 pcs)', qty: 2, price: 90 },
    ],
    total: 740,
    status: 'new',
    elapsedSeconds: 145,
    note: 'Flat 402, Green Residency',
  },
];

const INITIAL_INVENTORY = [
  { key: 'chicken', name: 'Fresh Chicken (Marinated)', unit: 'kg', current: 4.5, min: 8, max: 25 },
  { key: 'mutton', name: 'Tender Mutton Cuts', unit: 'kg', current: 9.0, min: 5, max: 20 },
  { key: 'paneer', name: 'Malai Paneer Blocks', unit: 'kg', current: 6.5, min: 4, max: 15 },
  { key: 'flour', name: 'Tandoori Maida & Wheat', unit: 'kg', current: 18.0, min: 6, max: 30 },
  { key: 'dairy', name: 'Curd, Cream & Mango Pulp', unit: 'L', current: 11.0, min: 5, max: 20 },
];

const SAMPLE_WHATSAPP_INCOMING = [
  {
    customer: 'Zoya Khan (+91 98192-77310)',
    message: 'Salam! 2 Chicken Biryani Full aur 2 Mango Lassi bhej do Sector 14.',
    items: [
      { name: 'Chicken Biryani (Full)', qty: 2, price: 320, stockKey: 'chicken' },
      { name: 'Mango Lassi', qty: 2, price: 110, stockKey: 'dairy' },
    ],
    total: 860,
    note: 'Sector 14, Gate 2',
  },
  {
    customer: 'Rohan Sharma (+91 99204-11890)',
    message: 'Hi, 1 Noor Shahi Family Feast order karna hai ASAP!',
    items: [
      { name: 'Noor Shahi Family Feast', qty: 1, price: 999, stockKey: 'chicken' },
    ],
    total: 999,
    note: 'Blue Ridge Tower B-904',
  },
  {
    customer: 'Imran Shaikh (+91 97650-88211)',
    message: '1 Mutton Rogan Josh + 2 Garlic Butter Naan pack kar dena.',
    items: [
      { name: 'Mutton Rogan Josh', qty: 1, price: 420, stockKey: 'mutton' },
      { name: 'Garlic Butter Naan (2 pcs)', qty: 2, price: 90, stockKey: 'flour' },
    ],
    total: 600,
    note: 'Pickup in 20 mins',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // Core Shared State
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [waiterAlerts, setWaiterAlerts] = useState([
    { id: 'AL-1', table: 'T4', reason: 'Requested Final Bill', time: '1m ago', acknowledged: false },
  ]);
  const [dailySales, setDailySales] = useState(28450);
  const [completedCount, setCompletedCount] = useState(34);

  // Guest QR Phone State
  const [selectedTable, setSelectedTable] = useState('T1');
  const [guestTab, setGuestTab] = useState('menu'); // 'menu' | 'bill'
  const [menuCategory, setMenuCategory] = useState('All');
  const [cart, setCart] = useState([
    { id: 'm1', name: 'Chicken Biryani (Full)', price: 320, qty: 1, stockKey: 'chicken' },
  ]);
  const [splitCount, setSplitCount] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [guestToast, setGuestToast] = useState('');

  // WhatsApp Simulator State
  const [waQueueIndex, setWaQueueIndex] = useState(0);
  const [waMessages, setWaMessages] = useState([
    {
      id: 'WA-1',
      customer: 'Farhan Siddiqui (+91 98201-44210)',
      message: '2 Paneer Tikka Masala aur 2 Garlic Naan Flat 402 Green Residency par bhej dein.',
      converted: true,
      orderId: 'ORD-106',
    },
  ]);

  // Live 1-second ticker for KDS timers
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.status !== 'served' ? { ...o, elapsedSeconds: o.elapsedSeconds + 1 } : o
        )
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  };

  const triggerToast = (msg) => {
    setGuestToast(msg);
    setTimeout(() => setGuestToast(''), 3000);
  };

  // Cart Actions
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const deductStock = (items) => {
    setInventory((prev) =>
      prev.map((inv) => {
        const matched = items.filter((i) => i.stockKey === inv.key);
        if (matched.length === 0) return inv;
        const used = matched.reduce((acc, m) => acc + m.qty * 0.4, 0);
        return { ...inv, current: Math.max(0, Number((inv.current - used).toFixed(1))) };
      })
    );
  };

  // Send Guest Order to KDS & Table
  const handleSendGuestOrder = () => {
    if (cart.length === 0) return;
    const orderTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const newOrderId = `ORD-${104 + orders.length}`;

    const newOrder = {
      id: newOrderId,
      source: 'QR Menu',
      table: selectedTable,
      items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
      total: orderTotal,
      status: 'new',
      elapsedSeconds: 0,
      note: 'Ordered via Table QR',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable
          ? {
              ...t,
              status: 'occupied',
              guests: t.guests || 2,
              bill: t.bill + orderTotal,
            }
          : t
      )
    );
    deductStock(cart);
    setCart([]);
    triggerToast(`Order ${newOrderId} sent to Kitchen!`);
  };

  // Call Waiter Button
  const handleCallWaiter = () => {
    const newAlert = {
      id: `AL-${Date.now()}`,
      table: selectedTable,
      reason: 'Table Bell Pressed (QR App)',
      time: 'Just now',
      acknowledged: false,
    };
    setWaiterAlerts((prev) => [newAlert, ...prev]);
    triggerToast(`Waiter Ali alerted for ${selectedTable}!`);
  };

  // Pay Table Bill
  const handlePayTableBill = () => {
    const currentTableObj = tables.find((t) => t.id === selectedTable);
    if (!currentTableObj || currentTableObj.bill <= 0) return;

    setDailySales((prev) => prev + currentTableObj.bill);
    setCompletedCount((prev) => prev + 1);
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable ? { ...t, status: 'free', guests: 0, bill: 0 } : t
      )
    );
    triggerToast(`Paid ₹${currentTableObj.bill} via ${paymentMethod}!`);
  };

  // KDS Status Updates
  const advanceOrderStatus = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (o.status === 'new') return { ...o, status: 'preparing' };
        if (o.status === 'preparing') return { ...o, status: 'ready' };
        if (o.status === 'ready') {
          if (o.source === 'WhatsApp') {
            setDailySales((s) => s + o.total);
            setCompletedCount((c) => c + 1);
          }
          return { ...o, status: 'served' };
        }
        return o;
      })
    );
  };

  const fastForwardTimers = () => {
    setOrders((prev) =>
      prev.map((o) =>
        o.status !== 'served' ? { ...o, elapsedSeconds: o.elapsedSeconds + 300 } : o
      )
    );
  };

  // Simulate Incoming WhatsApp Message
  const simulateIncomingWhatsApp = () => {
    const sample = SAMPLE_WHATSAPP_INCOMING[waQueueIndex % SAMPLE_WHATSAPP_INCOMING.length];
    setWaQueueIndex((prev) => prev + 1);

    const newOrderId = `ORD-${104 + orders.length}`;
    const newOrder = {
      id: newOrderId,
      source: 'WhatsApp',
      table: `WA • ${sample.customer.split(' ')[0]}`,
      items: sample.items,
      total: sample.total,
      status: 'new',
      elapsedSeconds: 0,
      note: sample.note,
    };

    setOrders((prev) => [newOrder, ...prev]);
    deductStock(sample.items);
    setWaMessages((prev) => [
      {
        id: `WA-${Date.now()}`,
        customer: sample.customer,
        message: sample.message,
        converted: true,
        orderId: newOrderId,
      },
      ...prev,
    ]);
  };

  const activeOrders = orders.filter((o) => o.status !== 'served');
  const currentTableData = tables.find((t) => t.id === selectedTable) || tables[0];
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const lowStockItems = inventory.filter((i) => i.current <= i.min);
  const unackAlerts = waiterAlerts.filter((a) => !a.acknowledged);

  const filteredMenu =
    menuCategory === 'All'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === menuCategory);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl font-bold shadow">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">NOOR KITCHEN</h1>
                <span className="text-[11px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Live OS
                </span>
              </div>
              <p className="text-xs text-slate-400">Unified Restaurant Ecosystem</p>
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'overview', label: 'Unified Command', icon: Sparkles },
              { id: 'kds', label: `Kitchen (KDS)`, badge: activeOrders.length, icon: ChefHat },
              { id: 'floor', label: 'Floor & Waiter', badge: unackAlerts.length, icon: Users },
              { id: 'whatsapp', label: 'WhatsApp Bot', icon: MessageSquare },
              { id: 'inventory', label: 'Stock', badge: lowStockItems.length, alert: true, icon: Package },
              { id: 'owner', label: 'Owner Sales', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        tab.alert
                          ? 'bg-rose-500 text-white'
                          : isActive
                          ? 'bg-slate-900 text-amber-400'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* OVERVIEW MODE: Split View with Guest QR Phone + Live Kitchen & Floor */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Guest QR Phone Simulator */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[380px] bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800">
                {/* Phone Notch & Status */}
                <div className="bg-white rounded-[2rem] overflow-hidden flex flex-col h-[690px]">
                  <div className="bg-amber-600 text-white px-4 pt-3 pb-3">
                    <div className="flex items-center justify-between text-[11px] opacity-90 mb-2">
                      <span className="flex items-center gap-1 font-medium">
                        <QrCode className="w-3.5 h-3.5" /> Guest QR Menu
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span>Table:</span>
                        <select
                          value={selectedTable}
                          onChange={(e) => setSelectedTable(e.target.value)}
                          className="bg-amber-700 text-white font-bold rounded px-1.5 py-0.5 text-xs outline-none"
                        >
                          {tables.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.id}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-bold text-base leading-tight">Noor Kitchen</h2>
                        <p className="text-[11px] text-amber-100">Authentic Mughlai & Biryani</p>
                      </div>
                      <button
                        onClick={handleCallWaiter}
                        className="bg-white text-amber-700 hover:bg-amber-50 active:scale-95 transition px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Bell className="w-3.5 h-3.5 animate-bounce" />
                        Waiter Bulayein
                      </button>
                    </div>

                    {/* Phone Inner Tabs */}
                    <div className="grid grid-cols-2 gap-1.5 mt-3 bg-amber-700/60 p-1 rounded-xl text-xs font-semibold">
                      <button
                        onClick={() => setGuestTab('menu')}
                        className={`py-1.5 rounded-lg transition ${
                          guestTab === 'menu' ? 'bg-white text-amber-800 shadow' : 'text-amber-100'
                        }`}
                      >
                        Order Menu
                      </button>
                      <button
                        onClick={() => setGuestTab('bill')}
                        className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                          guestTab === 'bill' ? 'bg-white text-amber-800 shadow' : 'text-amber-100'
                        }`}
                      >
                        <span>Table Bill</span>
                        {currentTableData.bill > 0 && (
                          <span className="bg-emerald-500 text-white text-[10px] px-1.5 rounded-full">
                            ₹{currentTableData.bill}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Toast Feedback inside Phone */}
                  {guestToast && (
                    <div className="bg-emerald-600 text-white text-xs font-semibold px-3 py-2 text-center">
                      {guestToast}
                    </div>
                  )}

                  {/* Phone Body: Menu or Bill */}
                  {guestTab === 'menu' ? (
                    <>
                      {/* Category Filter */}
                      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b border-slate-100 shrink-0">
                        {['All', 'Deals', 'Mains', 'Starters', 'Breads', 'Drinks'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setMenuCategory(cat)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              menuCategory === cat
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Menu Items Scrollable List */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                        {filteredMenu.map((item) => {
                          const inCart = cart.find((c) => c.id === item.id);
                          return (
                            <div
                              key={item.id}
                              className={`p-2.5 rounded-xl border transition ${
                                item.isDeal
                                  ? 'bg-amber-50/80 border-amber-300'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${
                                        item.veg ? 'border-emerald-600' : 'border-rose-600'
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          item.veg ? 'bg-emerald-600' : 'bg-rose-600'
                                        }`}
                                      />
                                    </span>
                                    <h3 className="text-xs font-bold text-slate-900">{item.name}</h3>
                                  </div>
                                  {item.desc && (
                                    <p className="text-[11px] text-amber-800 mt-0.5">{item.desc}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-extrabold text-slate-800">
                                      ₹{item.price}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      • {item.prepTime}
                                    </span>
                                  </div>
                                </div>

                                {inCart ? (
                                  <div className="flex items-center gap-1.5 bg-slate-900 text-white rounded-lg px-2 py-1">
                                    <button onClick={() => updateCartQty(item.id, -1)}>
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold w-4 text-center">
                                      {inCart.qty}
                                    </span>
                                    <button onClick={() => updateCartQty(item.id, 1)}>
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-3 py-1.5 rounded-lg"
                                  >
                                    + Add
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Cart Checkout Bar */}
                      <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
                        {cart.length > 0 ? (
                          <button
                            onClick={handleSendGuestOrder}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-between shadow-md transition active:scale-[0.99]"
                          >
                            <span className="text-xs">
                              {cart.reduce((s, i) => s + i.qty, 0)} Items • ₹{cartTotal}
                            </span>
                            <span className="text-xs flex items-center gap-1">
                              Send order <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </button>
                        ) : (
                          <p className="text-center text-xs text-slate-400 py-1">
                            Add dishes above to send directly to Kitchen
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Phone Bill & Split Screen */
                    <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto">
                      <div>
                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-slate-500">
                              Active Table {selectedTable}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                              {currentTableData.status}
                            </span>
                          </div>
                          <div className="text-2xl font-black text-slate-900">
                            ₹{currentTableData.bill}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Inclusive of GST & service charges
                          </p>
                        </div>

                        {/* Split Bill Feature */}
                        <div className="mt-4 bg-white rounded-2xl p-3.5 border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">
                              Split • {splitCount} log
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold">{splitCount}</span>
                              <button
                                onClick={() => setSplitCount(splitCount + 1)}
                                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs text-slate-500">Per Person Share</span>
                            <span className="text-sm font-extrabold text-amber-700">
                              ₹{Math.ceil(currentTableData.bill / splitCount)}
                            </span>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mt-4">
                          <p className="text-xs font-bold text-slate-700 mb-2">Payment Method</p>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'Card', icon: CreditCard },
                              { id: 'Bank', icon: Building2 },
                              { id: 'Cash', icon: Banknote },
                            ].map((m) => {
                              const Icon = m.icon;
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => setPaymentMethod(m.id)}
                                  className={`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 ${
                                    paymentMethod === m.id
                                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                                      : 'border-slate-200 text-slate-600'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                  {m.id}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={currentTableData.bill <= 0}
                        onClick={handlePayTableBill}
                        className="w-full mt-4 bg-slate-900 disabled:bg-slate-300 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs shadow transition"
                      >
                        {currentTableData.bill > 0
                          ? `Pay ₹${currentTableData.bill} & Clear Table`
                          : 'No Pending Bill'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Live Connected Ecosystem Feed */}
            <div className="lg:col-span-7 space-y-6">
              {/* Top Quick KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Aaj Ki Sale</p>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    ₹{dailySales.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    +18% vs kal
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Kitchen Queue</p>
                  <p className="text-xl font-black text-amber-600 mt-1">{activeOrders.length}</p>
                  <span className="text-[11px] text-slate-500">Live tickets</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Waiter Alerts</p>
                  <p className="text-xl font-black text-rose-600 mt-1">{unackAlerts.length}</p>
                  <span className="text-[11px] text-slate-500">Active calls</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Stock Alerts</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{lowStockItems.length}</p>
                  <span className="text-[11px] text-rose-600 font-semibold">
                    {lowStockItems.length > 0 ? lowStockItems[0].name.split(' ')[1] : 'All good'}
                  </span>
                </div>
              </div>

              {/* Waiter Alert Banner if any */}
              {unackAlerts.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-600 text-white p-2 rounded-xl animate-pulse">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-rose-900">
                        Table {unackAlerts[0].table}: {unackAlerts[0].reason}
                      </p>
                      <p className="text-[11px] text-rose-700">Assigned to Waiter • Ali</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setWaiterAlerts((prev) =>
                        prev.map((a) =>
                          a.id === unackAlerts[0].id ? { ...a, acknowledged: true } : a
                        )
                      )
                    }
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    Acknowledge
                  </button>
                </div>
              )}

              {/* Live Kitchen Display Preview (Dark Mode) */}
              <div className="bg-slate-950 text-white rounded-2xl p-4 shadow-xl border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-sm">Live Kitchen Display (KDS)</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fastForwardTimers}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-700"
                    >
                      <FastForward className="w-3.5 h-3.5" /> Fast-Forward +5m
                    </button>
                    <button
                      onClick={simulateIncomingWhatsApp}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> + WhatsApp Order
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeOrders.slice(0, 4).map((order) => {
                    const isLate = order.elapsedSeconds >= 900; // 15 mins
                    return (
                      <div
                        key={order.id}
                        className={`rounded-xl p-3 border transition ${
                          isLate
                            ? 'bg-rose-950/60 border-rose-500'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-amber-400">{order.id}</span>
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                              {order.table}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              isLate
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-slate-800 text-emerald-400'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {formatTime(order.elapsedSeconds)}
                            {isLate && <span className="ml-1 text-[10px]">LATE</span>}
                          </div>
                        </div>

                        <ul className="space-y-1 text-xs text-slate-200 mb-3">
                          {order.items.map((it, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>
                                <strong className="text-amber-400">{it.qty}x</strong> {it.name}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => advanceOrderStatus(order.id)}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition ${
                            order.status === 'new'
                              ? 'bg-blue-600 hover:bg-blue-500 text-white'
                              : order.status === 'preparing'
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {order.status === 'new' && 'Start Cooking'}
                          {order.status === 'preparing' && 'Mark Ready'}
                          {order.status === 'ready' && 'Complete & Serve'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mini Floor Map */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-slate-800">Floor Occupancy (T1–T8)</h3>
                  <button
                    onClick={() => setActiveTab('floor')}
                    className="text-xs font-semibold text-amber-700 hover:underline"
                  >
                    Open Waiter Hub →
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {tables.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTable(t.id);
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition text-center ${
                        selectedTable === t.id ? 'ring-2 ring-amber-500' : ''
                      } ${
                        t.status === 'free'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : t.status === 'billing'
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    >
                      <div className="font-bold text-xs">{t.id}</div>
                      <div className="text-[10px] opacity-80 capitalize">{t.status}</div>
                      {t.bill > 0 && (
                        <div className="text-[11px] font-bold text-amber-400 mt-0.5">₹{t.bill}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED KDS TAB */}
        {activeTab === 'kds' && (
          <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-amber-400" /> Kitchen Display System (KDS)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tickets automatically highlight red after 15:00 minutes
                </p>
              </div>
              <button
                onClick={fastForwardTimers}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
              >
                <FastForward className="w-4 h-4" /> Fast-Forward +5m
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeOrders.map((order) => {
                const isLate = order.elapsedSeconds >= 900;
                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl p-4 border-2 flex flex-col justify-between ${
                      isLate
                        ? 'bg-rose-950/70 border-rose-500'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                        <div>
                          <span className="font-black text-base text-amber-400">{order.id}</span>
                          <p className="text-xs text-slate-400">
                            {order.source} • {order.table}
                          </p>
                        </div>
                        <span
                          className={`font-mono text-sm font-bold px-2.5 py-1 rounded-lg ${
                            isLate ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-emerald-400'
                          }`}
                        >
                          {formatTime(order.elapsedSeconds)}
                        </span>
                      </div>

                      <ul className="py-3 space-y-2 text-sm">
                        {order.items.map((item, i) => (
                          <li key={i} className="flex justify-between">
                            <span>
                              <strong className="text-amber-400">{item.qty}x</strong> {item.name}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {order.note && (
                        <div className="bg-slate-800/80 text-amber-200 text-xs p-2 rounded-lg mb-4">
                          Note: {order.note}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => advanceOrderStatus(order.id)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs uppercase bg-emerald-600 hover:bg-emerald-500 text-white transition"
                    >
                      {order.status === 'new'
                        ? 'Accept & Start'
                        : order.status === 'preparing'
                        ? 'Mark Ready for Pickup'
                        : 'Complete Order'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FLOOR & WAITER HUB */}
        {activeTab === 'floor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Live Restaurant Floor (T1–T8)</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {tables.map((t) => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border-2 ${
                      t.status === 'free'
                        ? 'bg-emerald-50 border-emerald-200'
                        : t.status === 'billing'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-black text-base">{t.id}</span>
                      <span className="text-[11px] opacity-75">{t.seats} Seats</span>
                    </div>
                    <p className="text-xs uppercase font-bold mt-2 opacity-80">{t.status}</p>
                    <p className="text-xs mt-1 opacity-75">Waiter: {t.waiter}</p>
                    <div className="mt-3 pt-2 border-t border-current/10 font-bold text-sm">
                      {t.bill > 0 ? `₹${t.bill}` : 'Available'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">Waiter • Ali Alerts</h3>
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {unackAlerts.length} Pending
                </span>
              </div>
              <div className="space-y-3">
                {waiterAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border ${
                      alert.acknowledged
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          Table {alert.table} • {alert.reason}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{alert.time}</p>
                      </div>
                      {!alert.acknowledged && (
                        <button
                          onClick={() =>
                            setWaiterAlerts((prev) =>
                              prev.map((a) =>
                                a.id === alert.id ? { ...a, acknowledged: true } : a
                              )
                            )
                          }
                          className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WHATSAPP ORDER INBOX */}
        {activeTab === 'whatsapp' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" /> WhatsApp Auto-Order Bot
                </h2>
                <p className="text-xs text-slate-500">
                  Incoming customer chats automatically convert into Kitchen KDS tickets
                </p>
              </div>
              <button
                onClick={simulateIncomingWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" /> Simulate Incoming Message
              </button>
            </div>

            <div className="space-y-3">
              {waMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-emerald-950">{msg.customer}</p>
                    <p className="text-sm text-slate-800 mt-1">"{msg.message}"</p>
                  </div>
                  <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full self-start sm:self-center shrink-0">
                    ✓ Sent to KDS ({msg.orderId})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STOCK & INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold">Live Kitchen Stock & Inventory</h2>
                <p className="text-xs text-slate-500">
                  Auto-deducts as QR and WhatsApp orders are placed
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {inventory.map((item) => {
                const isLow = item.current <= item.min;
                const pct = Math.min(100, Math.round((item.current / item.max) * 100));
                return (
                  <div
                    key={item.key}
                    className={`p-4 rounded-2xl border ${
                      isLow ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{item.name}</span>
                        {isLow && (
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> LOW STOCK
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black">
                          {item.current} / {item.max} {item.unit}
                        </span>
                        <button
                          onClick={() =>
                            setInventory((prev) =>
                              prev.map((inv) =>
                                inv.key === item.key ? { ...inv, current: inv.max } : inv
                              )
                            )
                          }
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Restock
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isLow ? 'bg-rose-600' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* OWNER SALES DASHBOARD */}
        {activeTab === 'owner' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Aaj Ki Sale (Today)</p>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  ₹{dailySales.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +18.4% higher than yesterday
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Orders Completed</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{completedCount}</p>
                <p className="text-xs text-slate-500 mt-1">Avg prep time: 11m 20s</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Top Performer</p>
                <p className="text-xl font-black text-amber-600 mt-1 flex items-center gap-1.5">
                  <Award className="w-5 h-5" /> Waiter Ali
                </p>
                <p className="text-xs text-slate-500 mt-1">19 tables served • 4.9★ rating</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-base mb-4">Top Selling Dishes Today</h3>
              <div className="space-y-3">
                {[
                  { name: 'Chicken Biryani (Full)', orders: 28, rev: '₹8,960', pct: 90 },
                  { name: 'Noor Shahi Family Feast', orders: 12, rev: '₹11,988', pct: 75 },
                  { name: 'Mutton Rogan Josh', orders: 15, rev: '₹6,300', pct: 60 },
                  { name: 'Garlic Butter Naan', orders: 42, rev: '₹3,780', pct: 50 },
                ].map((dish, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{dish.name}</span>
                      <span>
                        {dish.orders} sold • {dish.rev}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${dish.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}