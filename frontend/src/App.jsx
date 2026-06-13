import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const API = 'https://techyaka.onrender.com';

const getEventIcon = (type, isDarkMode) => {
  const colors = {
    'Staj':      { light: '#22c55e', dark: '#22c55e' },
    'Hackathon': { light: '#2563eb', dark: '#60a5fa' },
    'Meetup':    { light: '#a855f7', dark: '#c084fc' },
    'Etkinlik':  { light: '#ef4444', dark: '#f87171' },
  };
  const color = isDarkMode ? (colors[type]?.dark || '#94a3b8') : (colors[type]?.light || '#94a3b8');
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width:40px;height:40px;filter:drop-shadow(0px 4px 6px rgba(0,0,0,0.3));transform:translateY(-10px);">
      <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
    </svg>`,
    iconSize: [40, 40], iconAnchor: [20, 40],
  });
};

const dotColors = { 'Staj': 'bg-green-500', 'Hackathon': 'bg-blue-500', 'Meetup': 'bg-purple-500', 'Etkinlik': 'bg-red-500' };

function UyumlulukRozeti({ etkinlikId, token }) {
  const [skor, setSkor] = useState(null);
  useEffect(() => {
    fetch(`${API}/api/uyumluluk/${etkinlikId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }).then(r => r.json()).then(data => { if (data.skor) setSkor(data.skor); }).catch(() => {});
  }, [etkinlikId, token]);
  if (!skor) return null;
  const renk = skor >= 80 ? 'bg-green-500' : skor >= 60 ? 'bg-yellow-500' : 'bg-red-400';
  return <span className={`${renk} text-white text-[10px] font-black px-2 py-1 rounded-full`}>🎯 %{skor} uyumlu</span>;
}

function SwipeKarti({ event, onSwipe, token }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const sagOpacity = useTransform(x, [0, 100], [0, 1]);
  const solOpacity = useTransform(x, [-100, 0], [1, 0]);
  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) { animate(x, 500, { duration: 0.3 }); setTimeout(() => onSwipe(event, 'sag'), 300); }
    else if (info.offset.x < -100) { animate(x, -500, { duration: 0.3 }); setTimeout(() => onSwipe(event, 'sol'), 300); }
  };
  return (
    <motion.div style={{ x, rotate }} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={handleDragEnd} className="absolute w-full cursor-grab active:cursor-grabbing" whileTap={{ scale: 1.02 }}>
      <motion.div style={{ opacity: sagOpacity }} className="absolute inset-0 bg-green-400/20 border-4 border-green-400 rounded-3xl z-10 flex items-center justify-start pl-6">
        <span className="text-green-500 font-black text-2xl">✓ İLGİLENİYORUM</span>
      </motion.div>
      <motion.div style={{ opacity: solOpacity }} className="absolute inset-0 bg-red-400/20 border-4 border-red-400 rounded-3xl z-10 flex items-center justify-end pr-6">
        <span className="text-red-500 font-black text-2xl">✗ PASS</span>
      </motion.div>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className={`h-2 w-full ${event.category === 'Staj' ? 'bg-green-500' : event.category === 'Hackathon' ? 'bg-blue-500' : event.category === 'Meetup' ? 'bg-purple-500' : 'bg-red-500'}`} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <span className={`w-2 h-2 rounded-full ${dotColors[event.category] || 'bg-gray-400'}`} />{event.category}
            </span>
            <UyumlulukRozeti etkinlikId={event.id} token={token} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 leading-tight mt-3">{event.title}</h2>
          <p className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-6"><span className="text-[#094D92]">📍</span>{event.location_text}</p>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Son Başvuru</p>
            <p className="font-extrabold text-gray-800 dark:text-gray-200">{event.deadline}</p>
          </div>
        </div>
        <div className="flex border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => onSwipe(event, 'sol')} className="flex-1 py-4 flex items-center justify-center gap-2 text-red-500 font-extrabold text-sm hover:bg-red-50 transition-colors"><span className="text-xl">✗</span> Pas</button>
          <div className="w-px bg-gray-100 dark:bg-gray-700" />
          <button onClick={() => onSwipe(event, 'sag')} className="flex-1 py-4 flex items-center justify-center gap-2 text-green-500 font-extrabold text-sm hover:bg-green-50 transition-colors"><span className="text-xl">✓</span> İlgileniyorum</button>
        </div>
      </div>
    </motion.div>
  );
}

function ChatMesaj({ msg }) {
  const parcalar = msg.metin.split(/(https?:\/\/[^\s\)]+)/g);
  return (
    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${msg.rol === 'kullanici' ? 'bg-[#094D92] text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'}`}>
      {parcalar.map((parca, idx) =>
        parca.match(/^https?:\/\//) ? (
          <a key={idx} href={parca} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 bg-[#094D92] text-white text-[10px] font-black px-2 py-1 rounded-lg mx-1">
            🔗 İlana Git
          </a>
        ) : parca
      )}
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('techyaka_token'));
  const [kullanici, setKullanici] = useState(JSON.parse(localStorage.getItem('techyaka_kullanici') || 'null'));
  const [authMod, setAuthMod] = useState('giris');
  const [authForm, setAuthForm] = useState({ email: '', sifre: '', ad_soyad: '' });
  const [authHata, setAuthHata] = useState('');
  const [authYukleniyor, setAuthYukleniyor] = useState(false);

  const [activeTab, setActiveTab] = useState('home');
  const [activeEvent, setActiveEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('techyaka_theme') === 'dark'
  );
  const [homeFilter, setHomeFilter] = useState('swipe');
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [backendEvents, setBackendEvents] = useState([]);
  const [swipeGecmisi, setSwipeGecmisi] = useState([]);
  const [chatAcik, setChatAcik] = useState(false);
  const [chatMesajlar, setChatMesajlar] = useState([
    { rol: 'ai', metin: 'Merhaba! 👋 Ben TechYaka AI. Kariyer sorularını yanıtlar, ilanlar hakkında bilgi veririm.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatYukleniyor, setChatYukleniyor] = useState(false);
  const [profil, setProfil] = useState({ ad_soyad: '', bolum: '', sinif: '', beceriler: '', ilgi_alanlari: '' });
  const [profilKaydediliyor, setProfilKaydediliyor] = useState(false);
  const [cvYukleniyor, setCvYukleniyor] = useState(false);
  const [profilMesaj, setProfilMesaj] = useState('');
  const [cvDegerlendirme, setCvDegerlendirme] = useState(null);
  const [appliedEvents, setAppliedEvents] = useState([]);

  const authHeaders = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch(`${API}/api/etkinlikler`)
      .then(r => r.json())
      .then(data => setBackendEvents(data.map(e => ({
        id: e.id, title: e.title, location_text: e.location,
        coordinates: e.coordinates, category: e.type,
        date_start: e.date, deadline: "Yakında", level: "Genel",
        url: e.source_url || "#"
      })))).catch(console.error);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/profil`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => { if (data.bolum) setProfil(data); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleGiris = async () => {
    setAuthYukleniyor(true); setAuthHata('');
    try {
      const res = await fetch(`${API}/api/giris`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: authForm.email, sifre: authForm.sifre }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Giriş başarısız');
      localStorage.setItem('techyaka_token', data.token);
      localStorage.setItem('techyaka_kullanici', JSON.stringify(data.kullanici));
      setToken(data.token); setKullanici(data.kullanici);
    } catch (e) { setAuthHata(e.message); }
    finally { setAuthYukleniyor(false); }
  };

  const handleKayit = async () => {
    setAuthYukleniyor(true); setAuthHata('');
    try {
      const res = await fetch(`${API}/api/kayit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Kayıt başarısız');
      localStorage.setItem('techyaka_token', data.token);
      localStorage.setItem('techyaka_kullanici', JSON.stringify(data.kullanici));
      setToken(data.token); setKullanici(data.kullanici);
    } catch (e) { setAuthHata(e.message); }
    finally { setAuthYukleniyor(false); }
  };

  const handleCikis = () => {
    localStorage.removeItem('techyaka_token');
    localStorage.removeItem('techyaka_kullanici');
    setToken(null); setKullanici(null);
  };

  const handleSwipe = (event, yon) => {
    fetch(`${API}/api/swipe`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ etkinlik_id: event.id, yon }) });
    if (yon === 'sag') setSavedEventIds(prev => [...prev, event.id]);
    setSwipeGecmisi(prev => [...prev, { id: event.id, yon }]);
  };

  const handleChatGonder = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatMesajlar(prev => [...prev, { rol: 'kullanici', metin: msg }]);
    setChatYukleniyor(true);
    try {
      const res = await fetch(`${API}/api/chat`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ mesaj: msg }) });
      const data = await res.json();
      setChatMesajlar(prev => [...prev, { rol: 'ai', metin: data.cevap }]);
    } catch {
      setChatMesajlar(prev => [...prev, { rol: 'ai', metin: 'Bir hata oluştu 🙏' }]);
    } finally { setChatYukleniyor(false); }
  };

  const handleProfilKaydet = async () => {
    setProfilKaydediliyor(true);
    try {
      await fetch(`${API}/api/profil`, { method: 'POST', headers: authHeaders, body: JSON.stringify(profil) });
      setProfilMesaj('✅ Profil kaydedildi!');
      setTimeout(() => setProfilMesaj(''), 3000);
    } catch { setProfilMesaj('❌ Hata oluştu'); }
    finally { setProfilKaydediliyor(false); }
  };

  const handleCvYukle = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCvYukleniyor(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/api/cv-yukle`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      setCvDegerlendirme(data.degerlendirme);
      setProfilMesaj(`✅ CV yüklendi! Puan: ${data.degerlendirme?.puan}/100`);
      setTimeout(() => setProfilMesaj(''), 5000);
    } catch { setProfilMesaj('❌ CV yüklenemedi'); }
    finally { setCvYukleniyor(false); }
  };

  const swipeKartlari = backendEvents.filter(e => !swipeGecmisi.some(s => s.id === e.id));
  const mevcutKart = swipeKartlari[0];

  const updateApplicationStatus = (id, newType) => {
    const newStatus = newType === 'pending' ? 'Bekliyor' : newType === 'success' ? 'Olumlu' : 'Red';
    setAppliedEvents(prev => prev.map(app => app.id === id ? { ...app, type: newType, status: newStatus } : app));
  };

  const deleteApplication = (e, id) => { e.stopPropagation(); setAppliedEvents(prev => prev.filter(app => app.id !== id)); };

  const toggleApplyEvent = () => {
    const isApplied = appliedEvents.some(app => app.eventId === activeEvent.id);
    if (isApplied) { setAppliedEvents(prev => prev.filter(app => app.eventId !== activeEvent.id)); }
    else { setAppliedEvents(prev => [{ id: Date.now(), eventId: activeEvent.id, company: "TechYaka İlanı", title: activeEvent.title, date: "Bugün", status: "Bekliyor", type: "pending" }, ...prev]); }
  };

  const toggleSaveEvent = (e, id) => { e.stopPropagation(); setSavedEventIds(prev => prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]); };
  const handleOpenModal = (event) => { setActiveEvent(event); setIsModalOpen(true); };
  const handleMarkerClick = (event) => {
    setActiveEvent(event);
    document.getElementById(`event-card-${event.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] px-6 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#68B684] rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-[#094D92] rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 relative z-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#68B684]/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#68B684]">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">TechYaka</h1>
            <p className="text-[#094D92] mt-1 text-sm font-semibold uppercase tracking-widest">Geleceğin kariyer haritası</p>
          </div>
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button onClick={() => setAuthMod('giris')} className={`flex-1 py-2 text-sm font-extrabold rounded-xl transition-all ${authMod === 'giris' ? 'bg-white text-[#094D92] shadow-sm' : 'text-gray-500'}`}>Giriş Yap</button>
            <button onClick={() => setAuthMod('kayit')} className={`flex-1 py-2 text-sm font-extrabold rounded-xl transition-all ${authMod === 'kayit' ? 'bg-white text-[#094D92] shadow-sm' : 'text-gray-500'}`}>Kayıt Ol</button>
          </div>
          <div className="space-y-4">
            {authMod === 'kayit' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Ad Soyad</label>
                <input type="text" value={authForm.ad_soyad} onChange={e => setAuthForm(p => ({ ...p, ad_soyad: e.target.value }))} placeholder="Deniz Yılmaz" className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#68B684] text-sm font-medium text-gray-900" />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">E-posta</label>
              <input type="email" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} placeholder="deniz@example.com" className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#68B684] text-sm font-medium text-gray-900" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Şifre</label>
              <input type="password" value={authForm.sifre} onChange={e => setAuthForm(p => ({ ...p, sifre: e.target.value }))} placeholder="••••••" onKeyDown={e => e.key === 'Enter' && (authMod === 'giris' ? handleGiris() : handleKayit())} className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:border-[#68B684] text-sm font-medium text-gray-900" />
            </div>
            {authHata && <p className="text-red-500 text-sm font-bold text-center">{authHata}</p>}
            <button onClick={authMod === 'giris' ? handleGiris : handleKayit} disabled={authYukleniyor} className="w-full bg-[#094D92] text-white font-extrabold rounded-xl py-4 hover:bg-[#073d75] transition-colors shadow-lg disabled:opacity-50">
              {authYukleniyor ? 'Yükleniyor...' : authMod === 'giris' ? 'Giriş Yap' : 'Hesap Oluştur'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAppliedToActiveEvent = activeEvent ? appliedEvents.some(app => app.eventId === activeEvent.id) : false;

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="h-full overflow-y-auto pb-32 bg-[#f4f6f8] dark:bg-[#1C1018] px-6 pt-12 transition-colors duration-500">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">Merhaba {kullanici?.ad_soyad?.split(' ')[0]} 👋</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">İstanbul'da {backendEvents.length} fırsat seni bekliyor.</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-6">
              {['swipe', 'Hackathon', 'Staj', 'Meetup', 'Etkinlik'].map(filter => (
                <button key={filter} onClick={() => setHomeFilter(filter)} className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${homeFilter === filter
                  ? filter === 'swipe' ? 'bg-[#094D92] text-white shadow-md'
                  : filter === 'Hackathon' ? 'bg-blue-600 text-white shadow-md'
                  : filter === 'Staj' ? 'bg-green-500 text-white shadow-md'
                  : filter === 'Meetup' ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-red-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
                  {filter === 'swipe' ? '🔥 Senin İçin' : filter === 'Hackathon' ? '🚀 Hackathon' : filter === 'Staj' ? '💼 Staj' : filter === 'Meetup' ? '🎯 Meetup' : '🎪 Etkinlik'}
                </button>
              ))}
            </div>
            {homeFilter === 'swipe' ? (
              mevcutKart ? (
                <div>
                  <p className="text-xs font-bold text-gray-400 text-center mb-4">{swipeKartlari.length} ilan kaldı · Sürükle veya butonları kullan</p>
                  <div className="relative h-[440px]">
                    {swipeKartlari[1] && <div className="absolute inset-0 scale-95 opacity-50 pointer-events-none"><div className="bg-white dark:bg-gray-800 rounded-3xl h-full" /></div>}
                    <SwipeKarti key={mevcutKart.id} event={mevcutKart} onSwipe={handleSwipe} token={token} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-gray-900 dark:text-white font-black text-xl mb-2">Hepsi bitti!</h3>
                  <p className="text-gray-500 text-sm">Yeni ilanlar eklenince tekrar görünecek.</p>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {backendEvents.filter(e => e.category === homeFilter).length === 0 ? (
                  <div className="text-center py-10 text-gray-400">Bu kategoride henüz etkinlik yok.</div>
                ) : backendEvents.filter(e => e.category === homeFilter).map(event => (
                  <div key={event.id} onClick={() => handleOpenModal(event)} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        <span className={`w-2 h-2 rounded-full ${dotColors[event.category] || 'bg-gray-400'}`} />{event.category}
                      </span>
                      <UyumlulukRozeti etkinlikId={event.id} token={token} />
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg mb-1">{event.title}</h3>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><span className="text-[#094D92]">📍</span>{event.location_text}</p>
                      <span className="text-[11px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-md">{event.date_start}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'saved':
        const savedList = backendEvents.filter(e => savedEventIds.includes(e.id));
        return (
          <div className="h-full overflow-y-auto pb-32 bg-[#f4f6f8] dark:bg-[#1C1018] px-6 pt-12">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Kayıtlı</h1>
            {savedList.length === 0 ? (
              <div className="text-center py-20"><div className="text-4xl mb-4">🔖</div><p className="text-gray-400 text-sm">Sağa swipe ettikleriniz burada görünür.</p></div>
            ) : (
              <div className="space-y-4">
                {savedList.map(event => (
                  <div key={event.id} onClick={() => handleOpenModal(event)} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        <span className={`w-2 h-2 rounded-full ${dotColors[event.category] || 'bg-gray-400'}`} />{event.category}
                      </span>
                      <UyumlulukRozeti etkinlikId={event.id} token={token} />
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg mb-1">{event.title}</h3>
                    <p className="text-xs text-gray-500">📍 {event.location_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'applied':
        const totalApps = appliedEvents.length;
        const pendingApps = appliedEvents.filter(a => a.type === 'pending').length;
        const successApps = appliedEvents.filter(a => a.type === 'success').length;
        return (
          <div className="h-full overflow-y-auto pb-32 bg-[#f4f6f8] dark:bg-[#1C1018] px-6 pt-12">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Başvurularım</h1>
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-center"><span className="block text-2xl font-black text-[#094D92]">{totalApps}</span><span className="text-[9px] font-bold text-gray-400 uppercase">Toplam</span></div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center"><span className="block text-2xl font-black text-amber-600">{pendingApps}</span><span className="text-[9px] font-bold text-amber-600 uppercase">Bekleyen</span></div>
              <div className="bg-[#68B684]/10 p-3 rounded-2xl border border-[#68B684]/30 text-center"><span className="block text-2xl font-black text-[#68B684]">{successApps}</span><span className="text-[9px] font-bold text-[#68B684] uppercase">Olumlu</span></div>
            </div>
            <div className="space-y-4">
              {appliedEvents.length === 0 ? (
                <div className="text-center py-10 text-gray-400">Henüz başvuru yok.</div>
              ) : appliedEvents.map(app => (
                <div key={app.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-black text-gray-900 dark:text-white">{app.company}</span>
                    <div className="flex items-center gap-2">
                      <select value={app.type} onChange={(e) => updateApplicationStatus(app.id, e.target.value)} className={`appearance-none text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-md cursor-pointer outline-none shadow-sm border ${app.type === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : app.type === 'success' ? 'bg-[#68B684]/10 text-[#68B684] border-[#68B684]/30' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        <option value="pending">Bekliyor ⏳</option>
                        <option value="success">Olumlu ✅</option>
                        <option value="rejected">Red ❌</option>
                      </select>
                      <button onClick={(e) => deleteApplication(e, app.id)} className="w-7 h-7 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:bg-red-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-base mb-1">{app.title}</h3>
                  <p className="text-xs text-gray-500">📅 {app.date}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="h-full overflow-y-auto pb-32 bg-[#f4f6f8] dark:bg-[#1C1018] px-6 pt-12">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Profil</h1>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-[#094D92] text-white' : 'bg-yellow-100 text-yellow-500'}`}>{isDarkMode ? '🌙' : '☀️'}</div>
                <p className="font-extrabold text-gray-900 dark:text-white text-sm">Tema Seçimi</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={() => {
  const yeni = !isDarkMode;
  setIsDarkMode(yeni);
  localStorage.setItem('techyaka_theme', yeni ? 'dark' : 'light');
}} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#094D92]"></div>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-[#094D92]/10 text-[#094D92] rounded-full flex items-center justify-center text-xl font-black">
                {kullanici?.ad_soyad?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'TY'}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{kullanici?.ad_soyad}</h2>
                <p className="text-xs text-gray-500">{kullanici?.email}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
              <h2 className="font-black text-gray-900 dark:text-white mb-4">👤 Kariyer Bilgileri</h2>
              <div className="space-y-3">
                {[
                  { key: 'bolum', label: 'Bölüm', placeholder: 'Yazılım Mühendisliği' },
                  { key: 'sinif', label: 'Sınıf', placeholder: '3. Sınıf' },
                  { key: 'beceriler', label: 'Beceriler', placeholder: 'Python, React, FastAPI' },
                  { key: 'ilgi_alanlari', label: 'İlgi Alanları', placeholder: 'Backend, AI, Startup' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{label}</label>
                    <input type="text" value={profil[key] || ''} onChange={e => setProfil(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-[#094D92]" />
                  </div>
                ))}
              </div>
              {profilMesaj && <p className="text-sm font-bold text-center mt-3">{profilMesaj}</p>}
              <button onClick={handleProfilKaydet} disabled={profilKaydediliyor} className="w-full mt-4 bg-[#094D92] text-white font-extrabold rounded-xl py-3 hover:bg-[#073d75] transition-colors disabled:opacity-50">
                {profilKaydediliyor ? 'Kaydediliyor...' : '💾 Kaydet'}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
              <h2 className="font-black text-gray-900 dark:text-white mb-2">📄 CV Yükle</h2>
              <p className="text-xs text-gray-500 mb-4">PDF formatında CV yükle. AI uyumluluk skorları için kullanılır.</p>
              <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#094D92]/30 bg-[#094D92]/5 hover:bg-[#094D92]/10 rounded-xl py-4 cursor-pointer transition-colors">
                <input type="file" accept=".pdf" onChange={handleCvYukle} className="hidden" />
                <span className="text-2xl">{cvYukleniyor ? '⏳' : '📎'}</span>
                <span className="text-sm font-bold text-[#094D92]">{cvYukleniyor ? 'Yükleniyor...' : 'PDF CV seç'}</span>
              </label>
            </div>

            {cvDegerlendirme && (
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-gray-900 dark:text-white">🎯 CV Değerlendirmesi</h2>
                  <span className={`text-2xl font-black px-4 py-1 rounded-full text-white ${cvDegerlendirme.puan >= 80 ? 'bg-green-500' : cvDegerlendirme.puan >= 60 ? 'bg-yellow-500' : 'bg-red-400'}`}>
                    {cvDegerlendirme.puan}/100
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{cvDegerlendirme.ozet}</p>
                <div className="mb-3">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">✅ Güçlü Yönler</p>
                  {cvDegerlendirme.guclu_yonler?.map((item, i) => <p key={i} className="text-xs text-gray-600 dark:text-gray-400 mb-1">• {item}</p>)}
                </div>
                <div className="mb-3">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">⚠️ Geliştirilmesi Gerekenler</p>
                  {cvDegerlendirme.gelistirilmesi_gerekenler?.map((item, i) => <p key={i} className="text-xs text-gray-600 dark:text-gray-400 mb-1">• {item}</p>)}
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#094D92] uppercase tracking-widest mb-2">💡 Öneriler</p>
                  {cvDegerlendirme.oneriler?.map((item, i) => <p key={i} className="text-xs text-gray-600 dark:text-gray-400 mb-1">• {item}</p>)}
                </div>
              </div>
            )}

            <button onClick={handleCikis} className="w-full bg-white dark:bg-gray-800 border border-red-100 text-red-500 font-extrabold rounded-2xl py-4 hover:bg-red-50 transition-colors">Çıkış Yap</button>
          </div>
        );

      case 'map':
      default:
        return (
          <>
            <div className="absolute top-0 w-full z-[1000] p-4 bg-gradient-to-b from-[#f4f6f8] dark:from-[#1C1018] to-transparent pointer-events-none">
              <div className="pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 w-fit">
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
              <div className="flex gap-4 w-max">
                {backendEvents.map(event => (
                  <div key={event.id} id={`event-card-${event.id}`} onClick={() => handleOpenModal(event)} className={`snap-center shrink-0 w-[280px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-5 rounded-3xl cursor-pointer shadow-xl transition-all duration-300 border ${activeEvent?.id === event.id ? 'border-[#094D92] scale-105' : 'border-gray-100 dark:border-gray-700'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        <span className={`w-2 h-2 rounded-full ${dotColors[event.category] || 'bg-gray-400'}`} />{event.category}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-md">{event.date_start}</span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-[15px] truncate mb-1.5">{event.title}</h3>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1.5"><span className="text-[#094D92]">📍</span>{event.location_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#f4f6f8] dark:bg-[#1C1018] text-gray-900 dark:text-white font-sans overflow-hidden flex flex-col transition-colors duration-500">
      <div className="flex-1 relative z-0 overflow-hidden">{renderContent()}</div>

      <div className="absolute bottom-0 w-full z-[1000] bg-white/95 dark:bg-[#1C1018]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 flex justify-around items-center py-2 pb-safe">
        {[
          { id: 'home', label: 'Ana Sayfa', d: 'm2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
          { id: 'map', label: 'Harita', d: 'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z' },
          { id: 'saved', label: 'Kayıtlı', d: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z' },
          { id: 'applied', label: 'Başvurular', d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
          { id: 'profile', label: 'Profil', d: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center w-[20%] p-1 transition-colors ${activeTab === tab.id ? 'text-[#094D92] dark:text-[#68B684]' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill={activeTab === tab.id ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={activeTab === tab.id ? 0 : 2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.d} />
            </svg>
            <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {!chatAcik && (
        <button onClick={() => setChatAcik(true)} className="absolute bottom-20 right-4 z-[1003] w-14 h-14 bg-[#094D92] dark:bg-[#68B684] rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform">🤖</button>
      )}

      {chatAcik && (
        <div className="absolute inset-0 z-[1003] bg-white dark:bg-gray-900 flex flex-col">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 bg-[#094D92]/10 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div className="flex-1"><h2 className="font-black text-gray-900 dark:text-white text-sm">TechYaka AI</h2><p className="text-[10px] text-green-500 font-bold">● Çevrimiçi</p></div>
            <button onClick={() => setChatAcik(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {chatMesajlar.map((msg, i) => (
              <div key={i} className={`flex ${msg.rol === 'kullanici' ? 'justify-end' : 'justify-start'}`}>
                {msg.rol === 'ai' && <div className="w-7 h-7 bg-[#094D92]/10 rounded-full flex items-center justify-center text-sm mr-2 shrink-0 mt-1">🤖</div>}
                <ChatMesaj msg={msg} />
              </div>
            ))}
            {chatYukleniyor && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-[#094D92]/10 rounded-full flex items-center justify-center mr-2">🤖</div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">{[0,150,300].map(d => <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />)}</div>
                </div>
              </div>
            )}
          </div>
          <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatGonder()} placeholder="Kariyer sorusu sor..." className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none" />
            <button onClick={handleChatGonder} disabled={chatYukleniyor} className="w-11 h-11 bg-[#094D92] dark:bg-[#68B684] rounded-2xl flex items-center justify-center text-white disabled:opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
            </button>
          </div>
        </div>
      )}

      {isModalOpen && activeEvent && (
        <>
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 z-[1001] backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-[2.5rem] z-[1002] p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.15)] border-t border-gray-100 dark:border-gray-700">
            <div className="w-14 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="flex items-center gap-2 text-[11px] font-black uppercase px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                <span className={`w-2 h-2 rounded-full ${dotColors[activeEvent.category] || 'bg-gray-400'}`} />{activeEvent.category}
              </span>
              <UyumlulukRozeti etkinlikId={activeEvent.id} token={token} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{activeEvent.title}</h2>
            <p className="text-sm text-gray-500 mb-6 flex items-center gap-1.5"><span className="text-[#094D92]">📍</span>{activeEvent.location_text}</p>
            <div className="grid grid-cols-2 gap-3 mb-8 bg-[#f8fafc] dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Etkinlik Tarihi</p><p className="font-extrabold text-gray-800 dark:text-gray-200 text-sm">{activeEvent.date_start}</p></div>
              <div><p className="text-[10px] font-black text-[#094D92] uppercase tracking-widest mb-1">Son Başvuru</p><p className="font-extrabold text-gray-800 dark:text-gray-200 text-sm">{activeEvent.deadline}</p></div>
            </div>
            <div className="flex gap-3">
              <a href={activeEvent.url} target="_blank" rel="noreferrer" className="flex-[2] flex justify-center items-center bg-[#094D92] dark:bg-[#68B684] text-white font-extrabold text-base py-4 rounded-2xl hover:opacity-90 shadow-lg">İlana Git & Başvur</a>
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