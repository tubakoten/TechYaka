import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const getEventIcon = (type, isDarkMode) => {
  const colors = {
    'Staj':      { light: '#22c55e', dark: '#22c55e' },
    'Hackathon': { light: '#2563eb', dark: '#60a5fa' },
    'Meetup':    { light: '#a855f7', dark: '#c084fc' },
    'Etkinlik':  { light: '#ef4444', dark: '#f87171' },
  };
  const color = isDarkMode
    ? (colors[type]?.dark  || '#94a3b8')
    : (colors[type]?.light || '#94a3b8');

  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width:40px;height:40px;filter:drop-shadow(0px 4px 6px rgba(0,0,0,0.3));transform:translateY(-10px);">
      <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
    </svg>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const dotColors = {
  'Staj':      'bg-green-500',
  'Hackathon': 'bg-blue-500',
  'Meetup':    'bg-purple-500',
  'Etkinlik':  'bg-red-500',
};

function SwipeKarti({ event, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const sagOpacity = useTransform(x, [0, 100], [0, 1]);
  const solOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) {
      animate(x, 500, { duration: 0.3 });
      setTimeout(() => onSwipe(event, 'sag'), 300);
    } else if (info.offset.x < -100) {
      animate(x, -500, { duration: 0.3 });
      setTimeout(() => onSwipe(event, 'sol'), 300);
    }
  };

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full cursor-grab active:cursor-grabbing"
      whileTap={{ scale: 1.02 }}
    >
      <motion.div style={{ opacity: sagOpacity }} className="absolute inset-0 bg-green-400/20 border-4 border-green-400 rounded-3xl z-10 flex items-center justify-start pl-6">
        <span className="text-green-500 font-black text-2xl">✓ İLGİLENİYORUM</span>
      </motion.div>
      <motion.div style={{ opacity: solOpacity }} className="absolute inset-0 bg-red-400/20 border-4 border-red-400 rounded-3xl z-10 flex items-center justify-end pr-6">
        <span className="text-red-500 font-black text-2xl">✗ PASS</span>
      </motion.div>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className={`h-2 w-full ${event.category === 'Staj' ? 'bg-green-500' : event.category === 'Hackathon' ? 'bg-blue-500' : event.category === 'Meetup' ? 'bg-purple-500' : 'bg-red-500'}`} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <span className={`w-2 h-2 rounded-full ${dotColors[event.category] || 'bg-gray-400'}`} />
              {event.category}
            </span>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">{event.date_start}</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 leading-tight">{event.title}</h2>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-6">
            <span className="text-[#094D92]">📍</span> {event.location_text}
          </p>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Son Başvuru</p>
            <p className="font-extrabold text-gray-800 dark:text-gray-200">{event.deadline}</p>
          </div>
        </div>
        <div className="flex border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => onSwipe(event, 'sol')} className="flex-1 py-4 flex items-center justify-center gap-2 text-red-500 font-extrabold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <span className="text-xl">✗</span> Pas
          </button>
          <div className="w-px bg-gray-100 dark:bg-gray-700" />
          <button onClick={() => onSwipe(event, 'sag')} className="flex-1 py-4 flex items-center justify-center gap-2 text-green-500 font-extrabold text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
            <span className="text-xl">✓</span> İlgileniyorum
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeEvent, setActiveEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [homeFilter, setHomeFilter] = useState('swipe');
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [backendEvents, setBackendEvents] = useState([]);
  const [swipeGecmisi, setSwipeGecmisi] = useState([]);
  const [chatAcik, setChatAcik] = useState(false);
  const [chatMesajlar, setChatMesajlar] = useState([
    { rol: 'ai', metin: 'Merhaba! 👋 Ben TechYaka AI. Kariyer sorularını yanıtlar, ilanlar hakkında bilgi veririm. Ne sormak istersin?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatYukleniyor, setChatYukleniyor] = useState(false);

  const [appliedEvents, setAppliedEvents] = useState([
    { id: 101, eventId: null, company: "Commencis", title: "Future Commencer Yaz Stajı", date: "24 Mayıs 2026", status: "Bekliyor", type: "pending" },
    { id: 102, eventId: null, company: "Nestlé", title: "Talent Nest Summer Internship 2026", date: "18 Mayıs 2026", status: "Olumlu", type: "success" }
  ]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/etkinlikler')
      .then(r => r.json())
      .then(data => {
        const formatted = data.map(e => ({
          id: e.id,
          title: e.title,
          location_text: e.location,
          coordinates: e.coordinates,
          category: e.type,
          date_start: e.date,
          deadline: "Yakında",
          level: "Genel",
          url: e.source_url || "#"
        }));
        setBackendEvents(formatted);
      })
      .catch(err => console.error("API Bağlantı Hatası:", err));
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleSwipe = (event, yon) => {
    fetch('http://127.0.0.1:8000/api/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etkinlik_id: event.id, yon })
    });
    if (yon === 'sag') setSavedEventIds(prev => [...prev, event.id]);
    setSwipeGecmisi(prev => [...prev, { id: event.id, yon }]);
  };

  const handleChatGonder = async () => {
    if (!chatInput.trim()) return;
    const kullaniciMesaj = chatInput;
    setChatInput('');
    setChatMesajlar(prev => [...prev, { rol: 'kullanici', metin: kullaniciMesaj }]);
    setChatYukleniyor(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesaj: kullaniciMesaj })
      });
      const data = await res.json();
      setChatMesajlar(prev => [...prev, { rol: 'ai', metin: data.cevap }]);
    } catch {
      setChatMesajlar(prev => [...prev, { rol: 'ai', metin: 'Bir hata oluştu, tekrar dener misin? 🙏' }]);
    } finally {
      setChatYukleniyor(false);
    }
  };

  const swipeKartlari = backendEvents.filter(e => !swipeGecmisi.some(s => s.id === e.id));
  const mevcutKart = swipeKartlari[0];

  const updateApplicationStatus = (id, newType) => {
    let newStatus = newType === 'pending' ? 'Bekliyor' : newType === 'success' ? 'Olumlu' : 'Red';
    setAppliedEvents(prev => prev.map(app => app.id === id ? { ...app, type: newType, status: newStatus } : app));
  };

  const deleteApplication = (e, id) => {
    e.stopPropagation();
    setAppliedEvents(prev => prev.filter(app => app.id !== id));
  };

  const toggleApplyEvent = () => {
    const isAlreadyApplied = appliedEvents.some(app => app.eventId === activeEvent.id);
    if (isAlreadyApplied) {
      setAppliedEvents(prev => prev.filter(app => app.eventId !== activeEvent.id));
    } else {
      setAppliedEvents(prev => [{ id: Date.now(), eventId: activeEvent.id, company: "TechYaka İlanı", title: activeEvent.title, date: "Bugün", status: "Bekliyor", type: "pending" }, ...prev]);
    }
  };

  const toggleSaveEvent = (e, id) => {
    e.stopPropagation();
    setSavedEventIds(prev => prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]);
  };

  const handleOpenModal = (event) => { setActiveEvent(event); setIsModalOpen(true); };
  const handleMarkerClick = (event) => {
    setActiveEvent(event);
    const el = document.getElementById(`event-card-${event.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] dark:bg-[#1C1018] px-6 font-sans relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#68B684] rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-[#094D92] rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-10"></div>
        <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 space-y-8 relative z-10 border border-white dark:border-gray-700">
          <div className="text-center pt-4">
            <div className="w-16 h-16 bg-[#68B684]/10 dark:bg-[#094D92]/20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#68B684] dark:text-[#094D92]">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">TechYaka</h1>
            <p className="text-[#094D92] dark:text-[#68B684] mt-2 text-sm font-semibold uppercase tracking-widest">Geleceğin kariyer haritası</p>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">E-posta</label>
              <input type="email" defaultValue="deniz@example.com" className="w-full border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#68B684] transition-all text-sm font-medium text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Şifre</label>
              <input type="password" defaultValue="123456" className="w-full border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#68B684] transition-all text-sm font-medium text-gray-900 dark:text-white" />
            </div>
            <button onClick={() => setIsLoggedIn(true)} className="w-full bg-[#094D92] text-white font-extrabold rounded-xl py-4 hover:bg-[#073d75] transition-colors shadow-lg mt-4 tracking-wide">Uygulamaya Gir</button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="h-full overflow-y-auto pb-32 bg-[#f4f6f8] dark:bg-[#1C1018] px-6 pt-12 transition-colors duration-500">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">Merhaba Deniz 👋</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">İstanbul'da {backendEvents.length} fırsat seni bekliyor.</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-6">
              <button onClick={() => setHomeFilter('swipe')} className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${homeFilter === 'swipe' ? 'bg-[#094D92] text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>🔥 Senin İçin</button>
              <button onClick={() => setHomeFilter('Hackathon')} className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${homeFilter === 'Hackathon' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>🚀 Hackathon</button>
              <button onClick={() => setHomeFilter('Staj')} className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${homeFilter === 'Staj' ? 'bg-green-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>💼 Staj</button>
              <button onClick={() => setHomeFilter('Meetup')} className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${homeFilter === 'Meetup' ? 'bg-purple-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>🎯 Meetup</button>
              <button onClick={() => setHomeFilter('Etkinlik')} className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${homeFilter === 'Etkinlik' ? 'bg-red-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>🎪 Etkinlik</button>
            </div>

            {homeFilter === 'swipe' ? (
              <div>
                {mevcutKart ? (
                  <div>
                    <p className="text-xs font-bold text-gray-400 text-center mb-4">{swipeKartlari.length} ilan kaldı · Sürükle veya butonları kullan</p>
                    <div className="relative h-[420px]">
                      {swipeKartlari[1] && (
                        <div className="absolute inset-0 scale-95 opacity-50 pointer-events-none">
                          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 h-full" />
                        </div>
                      )}
                      <SwipeKarti key={mevcutKart.id} event={mevcutKart} onSwipe={handleSwipe} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="text-gray-900 dark:text-white font-black text-xl mb-2">Hepsi bitti!</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Yeni ilanlar eklenince tekrar görünecek.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {backendEvents.filter(e => e.category === homeFilter).length === 0 ? (
                  <div className="text-center py-10 text-gray-400 font-medium">Bu kategoride henüz etkinlik yok.</div>
                ) : (
                  backendEvents.filter(e => e.category === homeFilter).map(event => {
                    const isSaved = savedEventIds.includes(event.id);
                    return (
                      <div key={event.id} onClick={() => handleOpenModal(event)} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                            <span className={`w-2 h-2 rounded-full ${dotColors[event.category] || 'bg-gray-400'}`} />
                            {event.category}
                          </span>
                          <button onClick={(e) => toggleSaveEvent(e, event.id)} className="p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={isSaved ? 0 : 2} stroke="currentColor" className={`w-6 h-6 ${isSaved ? 'text-[#094D92]' : 'text-gray-300 dark:text-gray-600'}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                          </button>
                        </div>
                        <h3 className="font-extrabold text-gray-900 dark:text-white text-lg mb-1">{event.title}</h3>
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><span className="text-[#094D92]">📍</span> {event.location_text}</p>
                          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-md">{event.date_start}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );

      case 'saved':
        const savedEventsList = backendEvents.filter(e => savedEventIds.includes(e.id));
        return (
          <div className="h-full overflow-y-auto pb-32 bg-[#f4f6f8] dark:bg-[#1C1018] px-6 pt-12 transition-colors duration-500">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Kayıtlı</h1>
            <div className="space-y-4">
              {savedEventsList.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-4xl mb-4">🔖</div>
                  <h3 className="text-gray-900 dark:text-white font-bold mb-1">Henüz hiç etkinlik kaydetmediniz.</h3>
                  <p className="text-gray-400 text-sm mt-1">Sağa swipe ettikleriniz burada görünür.</p>
                </div>
              ) : (
                savedEventsList.map(event => (
                  <div key={event.id} onClick={() => handleOpenModal(event)} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        <span className={`w-2 h-2 rounded-full ${dotColors[event.category] || 'bg-gray-400'}`} />
                        {event.category}
                      </span>
                      <button onClick={(e) => toggleSaveEvent(e, event.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#094D92]"><path fillRule="evenodd" d="M6.32 2.577a4.901 4.901 0 017.36 0l.4.453.4-.453a4.902 4.902 0 017.36 0c1.88 2.128 1.88 5.568 0 7.696L12 21.47l-9.84-11.2c-1.88-2.128-1.88-5.568 0-7.696z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg mb-1">{event.title}</h3>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">📍 {event.location_text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'applied':
        const totalApps = appliedEvents.length;
        const pendingApps = appliedEvents.filter(a => a.type === 'pending').length;
        const successApps = appliedEvents.filter(a => a.type === 'success').length;
        return (
          <div className="h-full overflow-y-auto pb-32 bg-[#f4f6f8] dark:bg-[#1C1018] px-6 pt-12 transition-colors duration-500">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Başvurularım</h1>
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-center shadow-sm">
                <span className="block text-2xl font-black text-[#094D92]">{totalApps}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Toplam</span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl border border-amber-100 dark:border-amber-800/50 text-center shadow-sm">
                <span className="block text-2xl font-black text-amber-600">{pendingApps}</span>
                <span className="text-[9px] font-bold text-amber-600 uppercase">Bekleyen</span>
              </div>
              <div className="bg-[#68B684]/10 p-3 rounded-2xl border border-[#68B684]/30 text-center shadow-sm">
                <span className="block text-2xl font-black text-[#68B684]">{successApps}</span>
                <span className="text-[9px] font-bold text-[#68B684] uppercase">Olumlu</span>
              </div>
            </div>
            <div className="space-y-4">
              {appliedEvents.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">Henüz bir ilana başvurmadınız.</div>
              ) : (
                appliedEvents.map(app => (
                  <div key={app.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black text-gray-900 dark:text-white">{app.company}</span>
                      <div className="flex items-center gap-2">
                        <select value={app.type} onChange={(e) => updateApplicationStatus(app.id, e.target.value)} className={`appearance-none text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-md cursor-pointer outline-none text-center shadow-sm border ${app.type === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''} ${app.type === 'success' ? 'bg-[#68B684]/10 text-[#68B684] border-[#68B684]/30' : ''} ${app.type === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : ''}`}>
                          <option value="pending">Bekliyor ⏳</option>
                          <option value="success">Olumlu ✅</option>
                          <option value="rejected">Red ❌</option>
                        </select>
                        <button onClick={(e) => deleteApplication(e, app.id)} className="w-7 h-7 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-full text-gray-400 hover:text-white hover:bg-red-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-base mb-1">{app.title}</h3>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">📅 Başvuru Tarihi: {app.date}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="h-full overflow-y-auto pb-32 bg-[#f4f6f8] dark:bg-[#1C1018] px-6 pt-12 transition-colors duration-500">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Profil</h1>
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${isDarkMode ? 'bg-[#094D92] text-white' : 'bg-yellow-100 text-yellow-500'}`}>{isDarkMode ? '🌙' : '☀️'}</div>
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white">Tema Seçimi</h3>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{isDarkMode ? 'Karanlık Mod Açık' : 'Aydınlık Mod Açık'}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#094D92]"></div>
              </label>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex items-center gap-5">
              <div className="w-16 h-16 bg-[#094D92]/10 text-[#094D92] dark:bg-[#68B684]/20 dark:text-[#68B684] rounded-full flex items-center justify-center text-2xl font-black shadow-inner">DY</div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Deniz Yılmaz</h2>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Yazılım Mühendisliği Öğrencisi</p>
              </div>
            </div>
            <button onClick={() => setIsLoggedIn(false)} className="w-full bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/50 text-red-500 font-extrabold rounded-2xl py-4 hover:bg-red-50 transition-colors shadow-sm">Çıkış Yap</button>
          </div>
        );

      case 'map':
      default:
        return (
          <>
            <div className="absolute top-0 w-full z-[1000] p-4 bg-gradient-to-b from-[#f4f6f8] dark:from-[#1C1018] to-transparent pointer-events-none flex justify-between items-start pt-safe transition-colors duration-500">
              <div className="pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-black text-[#094D92] dark:text-[#68B684] tracking-tight">TechYaka</h1>
              </div>
            </div>
            <div className="absolute inset-0 z-0">
              <MapContainer center={[41.04, 29.0]} zoom={11} className="w-full h-full">
                <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} attribution='&copy; OpenStreetMap' />
                {backendEvents.map(event => (
                  <Marker key={event.id} position={event.coordinates} icon={getEventIcon(event.category, isDarkMode)} eventHandlers={{ click: () => handleMarkerClick(event) }} />
                ))}
              </MapContainer>
            </div>
            <div className="absolute bottom-20 w-full z-[1000] overflow-x-auto pb-4 px-4 scrollbar-hide">
              <div className="flex gap-4 w-max snap-x">
                {backendEvents.map(event => (
                  <div key={event.id} id={`event-card-${event.id}`} onClick={() => handleOpenModal(event)} className={`snap-center shrink-0 w-[280px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-5 rounded-3xl cursor-pointer shadow-xl transition-all duration-300 border ${activeEvent?.id === event.id ? 'border-[#094D92] dark:border-[#68B684] scale-105' : 'border-gray-100 dark:border-gray-700'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        <span className={`w-2 h-2 rounded-full ${dotColors[event.category] || 'bg-gray-400'}`} />
                        {event.category}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-md">{event.date_start}</span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-[15px] truncate mb-1.5">{event.title}</h3>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5"><span className="text-[#094D92] dark:text-[#68B684]">📍</span> {event.location_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
    }
  };

  const isAppliedToActiveEvent = activeEvent ? appliedEvents.some(app => app.eventId === activeEvent.id) : false;

  return (
    <div className="relative h-screen w-full bg-[#f4f6f8] dark:bg-[#1C1018] text-gray-900 dark:text-white font-sans overflow-hidden flex flex-col transition-colors duration-500">
      <div className="flex-1 relative z-0 overflow-hidden">
        {renderContent()}
      </div>

      {/* NAV BAR */}
      <div className="absolute bottom-0 w-full z-[1000] bg-white/95 dark:bg-[#1C1018]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 flex justify-around items-center py-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)] transition-colors duration-500">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center w-[20%] p-1 transition-colors ${activeTab === 'home' ? 'text-[#094D92] dark:text-[#68B684]' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill={activeTab === 'home' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={activeTab === 'home' ? 0 : 2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Ana Sayfa</span>
        </button>
        <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center w-[20%] p-1 transition-colors ${activeTab === 'map' ? 'text-[#094D92] dark:text-[#68B684]' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill={activeTab === 'map' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={activeTab === 'map' ? 0 : 2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" /></svg>
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Harita</span>
        </button>
        <button onClick={() => setActiveTab('saved')} className={`flex flex-col items-center w-[20%] p-1 transition-colors ${activeTab === 'saved' ? 'text-[#094D92] dark:text-[#68B684]' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill={activeTab === 'saved' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={activeTab === 'saved' ? 0 : 2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Kayıtlı</span>
        </button>
        <button onClick={() => setActiveTab('applied')} className={`flex flex-col items-center w-[20%] p-1 transition-colors ${activeTab === 'applied' ? 'text-[#094D92] dark:text-[#68B684]' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill={activeTab === 'applied' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={activeTab === 'applied' ? 0 : 2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.36c-5.91.53-10.37-4.6-8.91-10.24 1.11-4.29 5.86-6.15 9.4-4.2l1.35.74c.26.14.58.14.84 0l1.35-.74c3.54-1.95 8.29-.09 9.4 4.2.49 1.88.24 3.86-.68 5.56l-6.5 11.83a.75.75 0 01-1.31 0l-6.5-11.83z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" /></svg>
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Başvurular</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center w-[20%] p-1 transition-colors ${activeTab === 'profile' ? 'text-[#094D92] dark:text-[#68B684]' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill={activeTab === 'profile' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={activeTab === 'profile' ? 0 : 2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Profil</span>
        </button>
      </div>

      {/* FLOATING CHATBOT BUTONU */}
      {!chatAcik && (
        <button onClick={() => setChatAcik(true)} className="absolute bottom-20 right-4 z-[1003] w-14 h-14 bg-[#094D92] dark:bg-[#68B684] rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform">
          🤖
        </button>
      )}

      {/* CHATBOT EKRANI */}
      {chatAcik && (
        <div className="absolute inset-0 z-[1003] bg-white dark:bg-gray-900 flex flex-col">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="w-10 h-10 bg-[#094D92]/10 dark:bg-[#68B684]/20 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div className="flex-1">
              <h2 className="font-black text-gray-900 dark:text-white text-sm">TechYaka AI</h2>
              <p className="text-[10px] text-green-500 font-bold">● Çevrimiçi</p>
            </div>
            <button onClick={() => setChatAcik(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {chatMesajlar.map((msg, i) => (
              <div key={i} className={`flex ${msg.rol === 'kullanici' ? 'justify-end' : 'justify-start'}`}>
                {msg.rol === 'ai' && (
                  <div className="w-7 h-7 bg-[#094D92]/10 rounded-full flex items-center justify-center text-sm mr-2 shrink-0 mt-1">🤖</div>
                )}
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${msg.rol === 'kullanici' ? 'bg-[#094D92] dark:bg-[#68B684] text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'}`}>
                  {msg.metin}
                </div>
              </div>
            ))}
            {chatYukleniyor && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-[#094D92]/10 rounded-full flex items-center justify-center text-sm mr-2">🤖</div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatGonder()}
              placeholder="Kariyer sorusu sor..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            />
            <button onClick={handleChatGonder} disabled={chatYukleniyor} className="w-11 h-11 bg-[#094D92] dark:bg-[#68B684] rounded-2xl flex items-center justify-center text-white disabled:opacity-50 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && activeEvent && (
        <>
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 z-[1001] backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-[2.5rem] z-[1002] p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.15)] border-t border-gray-100 dark:border-gray-700">
            <div className="w-14 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <div className="flex gap-2 mb-4">
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                <span className={`w-2 h-2 rounded-full ${dotColors[activeEvent.category] || 'bg-gray-400'}`} />
                {activeEvent.category}
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{activeEvent.title}</h2>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1.5">
              <span className="text-[#094D92] dark:text-[#68B684]">📍</span> {activeEvent.location_text}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8 bg-[#f8fafc] dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Etkinlik Tarihi</p>
                <p className="font-extrabold text-gray-800 dark:text-gray-200 text-sm">{activeEvent.date_start}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#094D92] dark:text-[#68B684] uppercase tracking-widest mb-1">Son Başvuru</p>
                <p className="font-extrabold text-gray-800 dark:text-gray-200 text-sm">{activeEvent.deadline}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a href={activeEvent.url} target="_blank" rel="noreferrer" className="flex-[2] flex justify-center items-center bg-[#094D92] dark:bg-[#68B684] text-white font-extrabold text-base py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg">
                İlana Git & Başvur
              </a>
              <button onClick={toggleApplyEvent} className={`flex-[1] flex justify-center items-center font-extrabold text-[11px] px-2 py-4 rounded-2xl transition-all border-2 ${isAppliedToActiveEvent ? 'border-[#68B684] bg-[#68B684]/10 text-[#68B684]' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500'}`}>
                {isAppliedToActiveEvent ? '✅ Başvuruldu' : '📌 Listeme Ekle'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;