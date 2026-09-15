import React, { useState, useEffect, useRef } from 'react';
import { Car, Bus, Bike, Footprints, Map, Plus, Trash2, Home, Utensils, BarChart, Sparkles, ArrowRight, UtensilsCrossed, Carrot, Leaf, CheckCircle, Zap, ClipboardList, Globe, TrendingUp, CircleDashed, Circle, TreeDeciduous, Sprout, X, Flame } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

// Shared data
const TRANSPORT_MODES = [
  { id: 'car', label: 'Car', factor: 0.19, icon: Car },
  { id: 'transit', label: 'Transit', factor: 0.04, icon: Bus },
  { id: 'motorcycle', label: 'Moto', factor: 0.10, icon: Bike },
  { id: 'active', label: 'Walk/Bike', factor: 0, icon: Footprints },
];

const FOOD_MODES = [
  { id: 'meat', label: 'Meat-heavy', factor: 4.2, icon: Utensils },
  { id: 'mixed', label: 'Mixed', factor: 2.4, icon: UtensilsCrossed },
  { id: 'plant', label: 'Plant-based', factor: 1.2, icon: Carrot },
  { id: 'vegan', label: 'Vegan', factor: 0.7, icon: Leaf },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [entries, setEntries] = useState<any[]>([]);
  const [demoDayOffset, setDemoDayOffset] = useState(0);

  const getToday = () => {
    const d = new Date();
    d.setDate(d.getDate() + demoDayOffset);
    return d;
  };

  // Lifted state for the day's logs
  const [commuteTrips, setCommuteTrips] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [electricityKwh, setElectricityKwh] = useState<number>(0);
  const [targetLogDate, setTargetLogDate] = useState<Date | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('trace-log-v1') || localStorage.getItem('trace_entries');
    const loadedEntries = saved ? JSON.parse(saved) : [];
    
    // Ensure we have at least 75 days of data for the 10-week charts
    if (loadedEntries.length < 75) {
      const seed = Array.from({length: 75}).map((_, i) => {
        const d = getToday();
        d.setDate(d.getDate() - (74 - i));
        return {
          date: d.toISOString(),
          total: 6 + Math.random() * 4,
          commute: 2 + Math.random() * 2,
          food: 2 + Math.random(),
          energy: 2 + Math.random()
        };
      });
      setEntries(seed);
      localStorage.setItem('trace-log-v1', JSON.stringify(seed));
    } else {
      setEntries(loadedEntries);
    }
  }, []);

  const handleSaveDay = () => {
    const commuteImpact = commuteTrips.reduce((sum, t) => sum + t.impact, 0);
    const foodImpact = foodItems.reduce((sum, t) => sum + t.impact, 0);
    const energyImpact = electricityKwh * 0.4; // 0.4 kg CO2e per kWh
    
    const total = commuteImpact + foodImpact + energyImpact;
    
    const newEntry = {
      date: targetLogDate ? targetLogDate.toISOString() : getToday().toISOString(),
      total,
      commute: commuteImpact,
      food: foodImpact,
      energy: energyImpact,
      estimated: !!targetLogDate // Optional: mark backfilled days as estimated
    };
    
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    localStorage.setItem('trace-log-v1', JSON.stringify(newEntries));
    
    // Reset state
    setCommuteTrips([]);
    setFoodItems([]);
    setElectricityKwh(0);
    setTargetLogDate(null);
    
    setActiveTab('dashboard');
  };

    const getLocalYYYYMMDD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const datesSet = new Set(entries.map(e => getLocalYYYYMMDD(new Date(e.date))));
    
    let currentStreak = 0;
    if (entries.length > 0) {
      let checkDate = getToday();
      let todayStr = getLocalYYYYMMDD(checkDate);
      
      if (!datesSet.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = getLocalYYYYMMDD(checkDate);
        if (datesSet.has(yesterdayStr)) {
          while (datesSet.has(getLocalYYYYMMDD(checkDate))) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }
        }
      } else {
        while (datesSet.has(getLocalYYYYMMDD(checkDate))) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    const yesterday = getToday();
    yesterday.setDate(yesterday.getDate() - 1);
    const hasYesterday = datesSet.has(getLocalYYYYMMDD(yesterday));

  return (
    <div className="min-h-screen bg-bg text-text pb-28 flex flex-col">
      {/* Top Navbar */}
      <header className="h-20 flex items-center justify-between px-6 border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('home')}
        >
          <div className="flex items-end gap-[3px] h-6 group-hover:scale-105 transition-transform">
            <div className="w-1.5 h-2.5 bg-brand rounded-t-sm rounded-b-md"></div>
            <div className="w-1.5 h-4 bg-brand rounded-t-sm rounded-b-md"></div>
            <div className="w-1.5 h-6 bg-brand rounded-t-sm rounded-b-md"></div>
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-text">trace<span className="text-brand">.</span></span>
        </div>
        <div className="flex items-center gap-4">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 bg-surface-raised border border-border px-3 py-1.5 rounded-full shadow-lg">
              <Flame className="w-4 h-4 text-brand" />
              <span className="font-bold font-mono text-text text-sm">
                {currentStreak}
              </span>
            </div>
          )}
          <div className="text-text-muted font-mono text-xs uppercase tracking-wider hidden md:block">
            {getToday().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 flex-1 w-full">
        {activeTab === 'home' && (
          <HomeView 
            onNext={() => setActiveTab('commute')} 
            onForecast={() => setActiveTab('forecast')} 
          />
        )}
        {activeTab === 'forecast' && (
          <ForecastView 
            entries={entries}
            onNext={() => setActiveTab('dashboard')}
            getToday={getToday}
          />
        )}
        {activeTab === 'commute' && (
          <CommuteView 
            trips={commuteTrips} 
            setTrips={setCommuteTrips} 
            onNext={() => setActiveTab('food')}
            onSkipDay={() => { setDemoDayOffset(prev => prev + 1); setActiveTab('dashboard'); }}
          />
        )}
        {activeTab === 'food' && (
          <FoodView 
            foodItems={foodItems}
            setFoodItems={setFoodItems}
            onNext={() => setActiveTab('power')}
            onSkipDay={() => { setDemoDayOffset(prev => prev + 1); setActiveTab('dashboard'); }}
          />
        )}
        {activeTab === 'power' && (
          <PowerView 
            kwh={electricityKwh}
            setKwh={setElectricityKwh}
            onNext={() => setActiveTab('result')}
            onSkipDay={() => { setDemoDayOffset(prev => prev + 1); setActiveTab('dashboard'); }}
          />
        )}
        {activeTab === 'result' && (
          <ResultView 
            commuteTrips={commuteTrips}
            foodItems={foodItems}
            kwh={electricityKwh}
            onSave={handleSaveDay}
          />
        )}
        {activeTab === 'dashboard' && (
          <DashboardView 
            entries={entries} 
            hasYesterday={hasYesterday}
            getToday={getToday}
            onQuickEstimate={() => setActiveTab('quick-estimate')}
            onLogActivity={(date) => {
              if (date) {
                setTargetLogDate(date);
              }
              setActiveTab('commute');
            }}
          />
        )}
        {activeTab === 'quick-estimate' && (
          <QuickEstimateView
            onCancel={() => setActiveTab('dashboard')}
            onSave={(total, commute, food, energy) => {
              const d = getToday();
              d.setDate(d.getDate() - 1);
              const newEntry = {
                date: d.toISOString(),
                total,
                commute,
                food,
                energy,
                estimated: true
              };
              const newEntries = [...entries, newEntry];
              setEntries(newEntries);
              localStorage.setItem('trace-log-v1', JSON.stringify(newEntries));
              setActiveTab('dashboard');
            }}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {activeTab !== 'result' && activeTab !== 'home' && activeTab !== 'forecast' && activeTab !== 'quick-estimate' && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-raised border border-border rounded-full flex items-center px-2 py-2 gap-2 shadow-2xl z-50">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`flex items-center gap-2 px-4 md:px-5 py-3 rounded-full transition-all text-sm font-bold ${activeTab === 'home' ? 'bg-surface-overlay text-text shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]' : 'text-text-muted hover:text-text hover:bg-surface'}`}
            title="Home"
          >
            <Globe className="w-4 h-4" /> <span className="hidden md:inline">Home</span>
          </button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <button 
            onClick={() => setActiveTab('commute')} 
            className={`flex items-center gap-2 px-4 md:px-5 py-3 rounded-full transition-all text-sm font-bold ${activeTab === 'commute' ? 'bg-brand/15 text-brand shadow-[inset_0_0_0_1px_rgba(255,153,92,0.2)]' : 'text-text-muted hover:text-text hover:bg-surface'}`}
          >
            <Map className="w-4 h-4" /> <span className="hidden md:inline">Commute</span>
          </button>
          <button 
            onClick={() => setActiveTab('food')} 
            className={`flex items-center gap-2 px-4 md:px-5 py-3 rounded-full transition-all text-sm font-bold ${activeTab === 'food' ? 'bg-success/15 text-success shadow-[inset_0_0_0_1px_rgba(147,212,148,0.2)]' : 'text-text-muted hover:text-text hover:bg-surface'}`}
          >
            <Utensils className="w-4 h-4" /> <span className="hidden md:inline">Food</span>
          </button>
          <button 
            onClick={() => setActiveTab('power')} 
            className={`flex items-center gap-2 px-4 md:px-5 py-3 rounded-full transition-all text-sm font-bold ${activeTab === 'power' ? 'bg-energy/15 text-energy shadow-[inset_0_0_0_1px_rgba(244,201,103,0.2)]' : 'text-text-muted hover:text-text hover:bg-surface'}`}
          >
            <Zap className="w-4 h-4" /> <span className="hidden md:inline">Power</span>
          </button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center gap-2 px-4 md:px-5 py-3 rounded-full transition-all text-sm font-bold ${activeTab === 'dashboard' ? 'bg-brand/15 text-brand shadow-[inset_0_0_0_1px_rgba(255,153,92,0.2)]' : 'text-text-muted hover:text-text hover:bg-surface'}`}
          >
            <BarChart className="w-4 h-4" /> <span className="hidden md:inline">Dashboard</span>
          </button>
        </nav>
      )}
    </div>
  );
}

// --- HOME / LANDING VIEW ---
function HomeView({ onNext, onForecast }: { onNext: () => void, onForecast: () => void }) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text uppercase font-mono">
          Trace Your Impact.
        </h1>
      </div>

      <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center my-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand/30 via-success/30 to-energy/30 blur-[80px] rounded-full pointer-events-none"></div>
        <AnimatedGlobe />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <button 
          onClick={onNext}
          className="group relative overflow-hidden rounded-3xl bg-surface border border-border p-8 hover:border-brand transition-all shadow-xl hover:shadow-brand/10 flex flex-col items-center text-center md:items-start md:text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand/20 transition-colors"></div>
          <Map className="w-10 h-10 text-brand mb-4" />
          <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-text mb-2">Log Data</h2>
          <p className="text-text-secondary text-sm">Track your daily commute, food, and home energy usage.</p>
        </button>

        <button 
          onClick={onForecast}
          className="group relative overflow-hidden rounded-3xl bg-surface border border-border p-8 hover:border-brand transition-all shadow-xl hover:shadow-brand/10 flex flex-col items-center text-center md:items-start md:text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand/20 transition-colors"></div>
          <TrendingUp className="w-10 h-10 text-brand mb-4" />
          <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-text mb-2">Future Projection</h2>
          <p className="text-text-secondary text-sm">View your carbon trends and AI-powered insights.</p>
        </button>
      </div>
    </div>
  );
}

function AnimatedGlobe() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      {/* Outer rotating dashed ring */}
      <div className="absolute inset-0 border-2 border-dashed border-brand/20 rounded-full animate-[spin_40s_linear_infinite]" />
      
      {/* Inner glowing globe container */}
      <div className="absolute inset-4 rounded-full bg-surface shadow-[0_0_60px_rgba(255,153,92,0.15)] flex items-center justify-center border border-brand/10 overflow-hidden">
        {/* Abstract globe mesh - spinning */}
        <div className="animate-[spin_20s_linear_infinite] w-full h-full flex items-center justify-center text-brand/40">
          <Globe strokeWidth={0.5} className="w-[150%] h-[150%]" />
        </div>
      </div>
      
      {/* Static foreground globe icon */}
      <Globe strokeWidth={1} className="w-32 h-32 text-brand drop-shadow-[0_0_15px_rgba(255,153,92,0.5)] z-10" />
    </div>
  );
}

// --- FORECAST VIEW ---
function ForecastView({ entries, onNext, getToday }: { entries: any[], onNext: () => void, getToday: () => Date }) {
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Get historical data duration based on mode
  const daysToInclude = displayMode === 'daily' ? 140 : displayMode === 'weekly' ? 140 : 365;
  const lastDays = entries.slice(-daysToInclude);
  const avgDaily = lastDays.length ? lastDays.reduce((s: any, e: any) => s + e.total, 0) / lastDays.length : 8.4;

  const bucketKey = (date: Date, mode: string) => {
    if (mode === 'monthly') return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (mode === 'weekly') {
      const d = new Date(date);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const histBuckets: Record<string, number> = {};
  lastDays.forEach((e: any) => {
    const key = bucketKey(new Date(e.date), displayMode);
    histBuckets[key] = (histBuckets[key] || 0) + e.total;
  });

  const futBuckets: Record<string, number> = {};
  const lastDate = lastDays.length > 0 ? new Date(lastDays[lastDays.length - 1].date) : getToday();
  for (let i = 1; i <= daysToInclude; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + i);
    // Add slight organic noise to the projection line
    const noise = (Math.random() - 0.5) * 1.5; 
    const val = Math.max(0, avgDaily + noise);
    
    const key = bucketKey(nextDate, displayMode);
    futBuckets[key] = (futBuckets[key] || 0) + val;
  }

  const chartData: any[] = [];
  const validHistKeys = Object.keys(histBuckets).filter(k => histBuckets[k] > 0);
  
  validHistKeys.forEach((k, i) => {
    chartData.push({
      name: k,
      Historical: parseFloat(histBuckets[k].toFixed(1)),
      Projected: i === validHistKeys.length - 1 ? parseFloat(histBuckets[k].toFixed(1)) : null
    });
  });
  
  const futKeys = Object.keys(futBuckets);
  futKeys.forEach(k => {
    chartData.push({
      name: k,
      Historical: null,
      Projected: parseFloat(futBuckets[k].toFixed(1))
    });
  });

  const zeroDaysCount = lastDays.filter((e: any) => !e.total || e.total === 0).length;
  const missingDays = Math.max(0, daysToInclude - lastDays.length);
  const totalZeroOrMissing = zeroDaysCount + missingDays;
  const loggedCount = daysToInclude - totalZeroOrMissing;

  const timeframeLabel = displayMode === 'daily' ? 'Past 20 Weeks' : displayMode === 'weekly' ? 'Past 20 Weeks' : 'Past 12 Months';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto pb-12">
      <div className="text-center md:text-left space-y-2 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text uppercase font-mono flex items-center justify-center md:justify-start gap-3">
          <TrendingUp className="w-10 h-10 text-brand" /> PROJECTION
        </h1>
        <p className="text-text-secondary text-lg">Your footprint timeline, forecasting into the future.</p>
      </div>

      <div className="bg-surface border border-border p-6 rounded-3xl shadow-2xl">
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-end">
          <div>
            <h3 className="text-xl font-bold mb-1">Timeline ({displayMode})</h3>
            <p className="text-sm text-text-muted flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand"></span> Historical</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-success"></span> Projected</span>
            </p>
          </div>

          <div className="flex bg-surface-raised border border-border rounded-xl p-1">
            <button onClick={() => setDisplayMode('daily')} className={`px-4 py-2 text-sm font-mono rounded-lg transition-all ${displayMode === 'daily' ? 'bg-surface shadow text-text' : 'text-text-muted hover:text-text-secondary'}`}>Daily</button>
            <button onClick={() => setDisplayMode('weekly')} className={`px-4 py-2 text-sm font-mono rounded-lg transition-all ${displayMode === 'weekly' ? 'bg-surface shadow text-text' : 'text-text-muted hover:text-text-secondary'}`}>Weekly</button>
            <button onClick={() => setDisplayMode('monthly')} className={`px-4 py-2 text-sm font-mono rounded-lg transition-all ${displayMode === 'monthly' ? 'bg-surface shadow text-text' : 'text-text-muted hover:text-text-secondary'}`}>Monthly</button>
          </div>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF995C" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#FF995C" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#93D494" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#93D494" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#314A3C" vertical={false} />
              <XAxis dataKey="name" stroke="#728378" fontSize={10} tickLine={false} axisLine={false} minTickGap={40} />
              <YAxis stroke="#728378" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121E19', borderColor: '#314A3C', borderRadius: '12px', color: '#F2F5EE' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="Historical" stroke="#FF995C" strokeWidth={3} fill="url(#colorHist)" />
              <Area type="monotone" dataKey="Projected" stroke="#93D494" strokeWidth={3} strokeDasharray="5 5" fill="url(#colorProj)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted">Active Logged Days ({timeframeLabel})</span>
          <span className="text-sm font-bold font-mono text-brand">
            {loggedCount}
          </span>
        </div>
      </div>

      <button 
        onClick={onNext}
        className="w-full py-4 rounded-xl bg-surface-raised border border-border hover:bg-surface-overlay text-text font-extrabold text-lg transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Continue to Full Dashboard <ArrowRight className="w-5 h-5 text-brand" />
      </button>
    </div>
  );
}

// --- COMMUTE VIEW ---
function CommuteView({ trips, setTrips, onNext, onSkipDay }: { trips: any[], setTrips: any, onNext: () => void, onSkipDay: () => void }) {
  const [activeMode, setActiveMode] = useState(TRANSPORT_MODES[0]);
  const [distance, setDistance] = useState(0); 
  const [noEmission, setNoEmission] = useState(false);
  const [skipDemo, setSkipDemo] = useState(false);
  
  const currentTripImpact = distance * activeMode.factor;
  const totalCommuteImpact = trips.reduce((sum, t) => sum + t.impact, 0);

  const addTrip = () => {
    if (distance === 0 && activeMode.factor > 0) return; 
    setTrips([...trips, {
      id: Math.random().toString(),
      mode: activeMode.label,
      icon: activeMode.icon,
      distance,
      impact: currentTripImpact
    }]);
    setDistance(0); 
  };

  const removeTrip = (id: string) => {
    setTrips(trips.filter((t: any) => t.id !== id));
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text uppercase font-mono">
          COMMUTE
        </h1>
        <p className="text-text-secondary text-lg max-w-lg">Track your daily travels. Add each trip individually to build a complete picture of your commute footprint.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <h3 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">Select Mode</h3>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar snap-x">
            {TRANSPORT_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode)}
                className={`flex-none w-[120px] p-5 rounded-2xl flex flex-col items-center gap-3 transition-all border snap-start ${
                  activeMode.id === mode.id 
                    ? 'bg-brand/10 border-brand text-text shadow-[inset_0_0_0_1px_rgba(255,153,92,0.2),0_0_20px_rgba(255,153,92,0.08)]' 
                    : 'bg-surface-raised border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-overlay'
                }`}
              >
                <mode.icon className={`w-8 h-8 ${activeMode.id === mode.id ? 'text-brand' : ''}`} />
                <div className="text-center">
                  <div className="font-bold text-sm">{mode.label}</div>
                  <div className={`text-[10px] font-mono mt-1 ${activeMode.id === mode.id ? 'text-brand-soft' : 'text-text-muted/60'}`}>
                    {mode.factor.toFixed(2)} kg/km
                  </div>
                </div>
              </button>
            ))}
          </div>

          <h3 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4 mt-4">Distance (km)</h3>
          <div className="flex items-center justify-between bg-surface-raised border border-border p-4 rounded-2xl mb-auto">
            <button 
              onClick={() => setDistance(Math.max(0, distance - 1))}
              className="w-12 h-12 rounded-xl bg-surface hover:bg-surface-overlay border border-border flex items-center justify-center text-2xl"
            >-</button>
            <div className="text-5xl font-bold font-mono tracking-tighter text-text">
              {distance}
            </div>
            <button 
              onClick={() => setDistance(distance + 1)}
              className="w-12 h-12 rounded-xl bg-surface hover:bg-surface-overlay border border-border flex items-center justify-center text-2xl"
            >+</button>
          </div>

          <div className="pt-8 mt-8 border-t border-border flex items-center justify-between">
            <div>
              <div className="text-xs text-text-muted mb-1 uppercase font-mono tracking-wider">Trip Impact</div>
              <div className="text-3xl font-bold font-mono text-brand-soft">
                {currentTripImpact.toFixed(1)} <span className="text-sm font-sans font-normal text-text-secondary">kg CO₂e</span>
              </div>
            </div>
            <button 
              onClick={addTrip}
              className="bg-brand text-bg font-extrabold px-6 py-4 rounded-xl hover:bg-brand-soft transition-transform active:scale-95 flex items-center gap-2 shadow-lg shadow-brand/20"
            >
              <Plus className="w-5 h-5" /> Add Trip
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-raised border border-border rounded-3xl p-6 shadow-lg">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-text uppercase font-mono tracking-wider">
              <Map className="w-4 h-4 text-brand" /> Today's Commutes
            </h3>
            
            <div className="space-y-3 mb-6 min-h-[140px] max-h-[300px] overflow-y-auto pr-2">
              {trips.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-muted py-10 border border-dashed border-border rounded-2xl">
                  <Map className="w-6 h-6 mb-3 opacity-30" />
                  <p className="text-xs font-medium">No trips logged today.</p>
                </div>
              ) : (
                trips.map((trip: any) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        <trip.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-text">{trip.mode}</div>
                        <div className="text-xs font-mono text-text-muted">{trip.distance} km</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-medium text-brand-soft">{trip.impact.toFixed(1)} kg</span>
                      <button onClick={() => removeTrip(trip.id)} className="text-text-muted hover:text-danger p-2 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="pt-4 border-t border-border flex justify-between items-end">
              <div>
                <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1">Total Commute</div>
                <div className="text-2xl font-bold font-mono text-text">{totalCommuteImpact.toFixed(1)} <span className="text-sm font-sans font-normal text-text-muted">kg CO₂e</span></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-4 border border-border rounded-xl bg-surface cursor-pointer hover:border-brand transition-colors group">
              <input 
                type="checkbox" 
                checked={skipDemo} 
                onChange={(e) => setSkipDemo(e.target.checked)}
                className="w-5 h-5 accent-brand"
              />
              <span className="text-sm font-medium text-text group-hover:text-brand transition-colors">Demo: Skip logging & advance to tomorrow</span>
            </label>
            {skipDemo ? (
              <button 
                onClick={onSkipDay}
                className="w-full py-4 rounded-xl border bg-brand text-bg font-extrabold text-lg shadow-lg active:scale-[0.98]"
              >
                Skip & Advance Day
              </button>
            ) : (
              <>
                {trips.length === 0 && (
                  <label className="flex items-center gap-3 p-4 border border-border rounded-xl bg-surface cursor-pointer hover:border-brand transition-colors group">
                    <input 
                      type="checkbox" 
                      checked={noEmission} 
                      onChange={(e) => setNoEmission(e.target.checked)}
                      className="w-5 h-5 accent-brand"
                    />
                    <span className="text-sm font-medium text-text group-hover:text-brand transition-colors">I stayed home today</span>
                  </label>
                )}
                <button 
                  onClick={onNext}
                  disabled={trips.length === 0 && !noEmission}
                  className={`w-full py-4 rounded-xl border font-extrabold text-lg transition-all flex items-center justify-center gap-2 ${trips.length === 0 && !noEmission ? 'bg-surface border-border text-text-muted opacity-50 cursor-not-allowed' : 'bg-surface hover:bg-surface-overlay border-border text-text shadow-lg active:scale-[0.98]'}`}
                >
                  Continue to Food <ArrowRight className={`w-5 h-5 ${trips.length === 0 && !noEmission ? 'text-text-muted' : 'text-brand'}`} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- FOOD VIEW ---
function FoodView({ foodItems, setFoodItems, onNext, onSkipDay }: any) {
  const [activeMode, setActiveMode] = useState(FOOD_MODES[1]);
  const [mealCount, setMealCount] = useState(1); 
  const [noEmission, setNoEmission] = useState(false);
  const [skipDemo, setSkipDemo] = useState(false);
  
  const currentMealImpact = mealCount * activeMode.factor;
  const totalFoodImpact = foodItems.reduce((sum: any, t: any) => sum + t.impact, 0);

  const addMeal = () => {
    if (mealCount === 0) return;
    setFoodItems([...foodItems, {
      id: Math.random().toString(),
      mode: activeMode.label,
      icon: activeMode.icon,
      count: mealCount,
      impact: currentMealImpact
    }]);
    setMealCount(1);
  };

  const removeMeal = (id: string) => {
    setFoodItems(foodItems.filter((t: any) => t.id !== id));
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text uppercase font-mono">
          FOOD
        </h1>
        <p className="text-text-secondary text-lg max-w-lg">Add your meals for the day to estimate your dietary carbon footprint.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <h3 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">Meal Type</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {FOOD_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode)}
                className={`p-4 rounded-xl flex flex-col items-center gap-3 transition-all border ${
                  activeMode.id === mode.id 
                    ? 'bg-success/10 border-success text-text shadow-[inset_0_0_0_1px_rgba(147,212,148,0.2),0_0_20px_rgba(147,212,148,0.08)]' 
                    : 'bg-surface-raised border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-overlay'
                }`}
              >
                <mode.icon className={`w-6 h-6 ${activeMode.id === mode.id ? 'text-success' : ''}`} />
                <div className="text-center">
                  <div className="font-bold text-xs">{mode.label}</div>
                  <div className={`text-[10px] font-mono mt-1 ${activeMode.id === mode.id ? 'text-success' : 'text-text-muted/60'}`}>
                    {mode.factor.toFixed(1)} kg/meal
                  </div>
                </div>
              </button>
            ))}
          </div>

          <h3 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4 mt-auto">Number of Meals</h3>
          <div className="flex items-center justify-between bg-surface-raised border border-border p-4 rounded-2xl mb-8">
            <button 
              onClick={() => setMealCount(Math.max(1, mealCount - 1))}
              className="w-12 h-12 rounded-xl bg-surface hover:bg-surface-overlay border border-border flex items-center justify-center text-2xl"
            >-</button>
            <div className="text-5xl font-bold font-mono tracking-tighter text-text">
              {mealCount}
            </div>
            <button 
              onClick={() => setMealCount(mealCount + 1)}
              className="w-12 h-12 rounded-xl bg-surface hover:bg-surface-overlay border border-border flex items-center justify-center text-2xl"
            >+</button>
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <div>
              <div className="text-xs text-text-muted mb-1 uppercase font-mono tracking-wider">Meal Impact</div>
              <div className="text-3xl font-bold font-mono text-success">
                {currentMealImpact.toFixed(1)} <span className="text-sm font-sans font-normal text-text-secondary">kg CO₂e</span>
              </div>
            </div>
            <button 
              onClick={addMeal}
              className="bg-success text-bg font-extrabold px-6 py-4 rounded-xl hover:bg-success/90 transition-transform active:scale-95 flex items-center gap-2 shadow-lg shadow-success/20"
            >
              <Plus className="w-5 h-5" /> Add Meal
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-raised border border-border rounded-3xl p-6 shadow-lg">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-text uppercase font-mono tracking-wider">
              <Utensils className="w-4 h-4 text-success" /> Today's Meals
            </h3>
            
            <div className="space-y-3 mb-6 min-h-[120px] max-h-[300px] overflow-y-auto pr-2">
              {foodItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-muted py-10 border border-dashed border-border rounded-2xl">
                  <Utensils className="w-6 h-6 mb-3 opacity-30" />
                  <p className="text-xs font-medium">No meals logged today.</p>
                </div>
              ) : (
                foodItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-text">{item.mode}</div>
                        <div className="text-xs font-mono text-text-muted">{item.count} {item.count > 1 ? 'meals' : 'meal'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-medium text-success">{item.impact.toFixed(1)} kg</span>
                      <button onClick={() => removeMeal(item.id)} className="text-text-muted hover:text-danger p-2 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="pt-4 border-t border-border flex justify-between items-end">
              <div>
                <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1">Total Food</div>
                <div className="text-2xl font-bold font-mono text-text">{totalFoodImpact.toFixed(1)} <span className="text-sm font-sans font-normal text-text-muted">kg CO₂e</span></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-4 border border-border rounded-xl bg-surface cursor-pointer hover:border-success transition-colors group">
              <input 
                type="checkbox" 
                checked={skipDemo} 
                onChange={(e) => setSkipDemo(e.target.checked)}
                className="w-5 h-5 accent-success"
              />
              <span className="text-sm font-medium text-text group-hover:text-success transition-colors">Demo: Skip logging & advance to tomorrow</span>
            </label>
            {skipDemo ? (
              <button 
                onClick={onSkipDay}
                className="w-full py-4 rounded-xl border bg-success text-bg font-extrabold text-lg shadow-lg active:scale-[0.98]"
              >
                Skip & Advance Day
              </button>
            ) : (
              <>
                {foodItems.length === 0 && (
                  <label className="flex items-center gap-3 p-4 border border-border rounded-xl bg-surface cursor-pointer hover:border-success transition-colors group">
                    <input 
                      type="checkbox" 
                      checked={noEmission} 
                      onChange={(e) => setNoEmission(e.target.checked)}
                      className="w-5 h-5 accent-success"
                    />
                    <span className="text-sm font-medium text-text group-hover:text-success transition-colors">I was on a fast today</span>
                  </label>
                )}
                <button 
                  onClick={onNext}
                  disabled={foodItems.length === 0 && !noEmission}
                  className={`w-full py-4 rounded-xl border font-extrabold text-lg transition-all flex items-center justify-center gap-2 ${foodItems.length === 0 && !noEmission ? 'bg-surface border-border text-text-muted opacity-50 cursor-not-allowed' : 'bg-energy/10 border-energy/50 text-energy hover:bg-energy/20 active:scale-[0.98]'}`}
                >
                  Continue to Power <Zap className={`w-5 h-5 ${foodItems.length === 0 && !noEmission ? 'text-text-muted' : ''}`} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- POWER VIEW ---
function PowerView({ kwh, setKwh, onNext, onSkipDay }: any) {
  const [noEmission, setNoEmission] = useState(false);
  const [skipDemo, setSkipDemo] = useState(false);
  const energyImpact = kwh * 0.4; // rough average 0.4 kg CO2e per kWh
  const isEmpty = !kwh || kwh === 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text uppercase font-mono">
          POWER
        </h1>
        <p className="text-text-secondary text-lg">Log your household electricity usage for the day.</p>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-48 bg-energy/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <Zap className="w-12 h-12 text-energy mb-6" />
        
        <h3 className="text-sm font-mono text-text-muted uppercase tracking-widest mb-8">Electricity Usage</h3>
        
        <div className="flex items-end justify-center gap-3 border-b-4 border-energy/30 focus-within:border-energy transition-colors pb-2 mb-12 w-full max-w-xs relative">
          <input 
            type="number"
            value={kwh === 0 ? '' : kwh}
            onChange={(e) => setKwh(Number(e.target.value))}
            placeholder="0"
            className="w-full text-center text-7xl md:text-8xl font-extrabold font-mono bg-transparent outline-none text-text"
          />
          <span className="text-xl font-mono text-text-muted uppercase tracking-widest mb-2 absolute -right-12">kWh</span>
        </div>

        <div className="space-y-2 mb-12">
          <div className="text-sm text-text-muted uppercase font-mono tracking-wider">Carbon Emitted</div>
          <div className="text-5xl font-bold font-mono text-energy">
            {energyImpact.toFixed(1)} <span className="text-xl font-sans font-normal text-text-secondary">kg CO₂e</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <label className="flex items-center gap-3 p-4 border border-border rounded-xl bg-surface cursor-pointer hover:border-energy transition-colors group text-left">
            <input 
              type="checkbox" 
              checked={skipDemo} 
              onChange={(e) => setSkipDemo(e.target.checked)}
              className="w-5 h-5 accent-energy"
            />
            <span className="text-sm font-medium text-text group-hover:text-energy transition-colors">Demo: Skip logging & advance to tomorrow</span>
          </label>
          {skipDemo ? (
            <button 
              onClick={onSkipDay}
              className="w-full py-4 rounded-xl border bg-energy text-bg font-extrabold text-lg shadow-lg active:scale-[0.98]"
            >
              Skip & Advance Day
            </button>
          ) : (
            <>
              {isEmpty && (
                <label className="flex items-center gap-3 p-4 border border-border rounded-xl bg-surface cursor-pointer hover:border-energy transition-colors group text-left">
                  <input 
                    type="checkbox" 
                    checked={noEmission} 
                    onChange={(e) => setNoEmission(e.target.checked)}
                    className="w-5 h-5 accent-energy"
                  />
                  <span className="text-sm font-medium text-text group-hover:text-energy transition-colors">There was no electricity today</span>
                </label>
              )}
              <button 
                onClick={onNext}
                disabled={isEmpty && !noEmission}
                className={`w-full py-4 rounded-xl border font-extrabold text-lg transition-all flex items-center justify-center gap-2 ${isEmpty && !noEmission ? 'bg-surface border-border text-text-muted opacity-50 cursor-not-allowed' : 'bg-surface-raised hover:bg-surface-overlay border-border text-text shadow-lg active:scale-[0.98]'}`}
              >
                Result <ArrowRight className={`w-5 h-5 ${isEmpty && !noEmission ? 'text-text-muted' : 'text-text-secondary'}`} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- RESULT VIEW ---
function ResultView({ commuteTrips, foodItems, kwh, onSave }: any) {
  const commuteTotal = commuteTrips.reduce((s: any, t: any) => s + t.impact, 0);
  const foodTotal = foodItems.reduce((s: any, t: any) => s + t.impact, 0);
  const powerTotal = kwh * 0.4;
  
  const grandTotal = commuteTotal + foodTotal + powerTotal;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-xl mx-auto pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text uppercase font-mono flex items-center justify-center gap-3">
          <ClipboardList className="w-10 h-10 text-brand" /> RESULT
        </h1>
        <p className="text-text-secondary text-lg">Your carbon footprint for the day is ready.</p>
      </div>

      <div className="bg-surface-raised border border-border rounded-3xl p-6 shadow-2xl">
        <div className="space-y-6">
          
          {/* Commute Summary */}
          <div className="pb-6 border-b border-border">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-mono text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Map className="w-4 h-4 text-brand" /> Commute
              </div>
              <div className="font-mono font-bold text-brand">{commuteTotal.toFixed(1)} kg</div>
            </div>
            <div className="space-y-2 pl-6">
              {commuteTrips.length === 0 && <div className="text-sm text-text-muted">No trips logged.</div>}
              {commuteTrips.map((t: any) => (
                <div key={t.id} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{t.mode} ({t.distance} km)</span>
                  <span className="text-text-muted font-mono">{t.impact.toFixed(1)} kg</span>
                </div>
              ))}
            </div>
          </div>

          {/* Food Summary */}
          <div className="pb-6 border-b border-border">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-mono text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Utensils className="w-4 h-4 text-success" /> Food
              </div>
              <div className="font-mono font-bold text-success">{foodTotal.toFixed(1)} kg</div>
            </div>
            <div className="space-y-2 pl-6">
              {foodItems.length === 0 && <div className="text-sm text-text-muted">No meals logged.</div>}
              {foodItems.map((f: any) => (
                <div key={f.id} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{f.count}x {f.mode}</span>
                  <span className="text-text-muted font-mono">{f.impact.toFixed(1)} kg</span>
                </div>
              ))}
            </div>
          </div>

          {/* Power Summary */}
          <div className="pb-6 border-b border-border">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-mono text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-energy" /> Power
              </div>
              <div className="font-mono font-bold text-energy">{powerTotal.toFixed(1)} kg</div>
            </div>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Grid Usage ({kwh} kWh)</span>
                <span className="text-text-muted font-mono">{powerTotal.toFixed(1)} kg</span>
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-2 flex justify-between items-center">
            <div className="text-2xl font-bold uppercase font-mono">Total</div>
            <div className="text-4xl font-extrabold font-mono text-text">{grandTotal.toFixed(1)} <span className="text-lg font-sans font-normal text-text-muted">kg CO₂e</span></div>
          </div>
        </div>
      </div>

      <button 
        onClick={onSave}
        className="w-full py-4 rounded-xl bg-brand hover:bg-brand-soft text-bg font-extrabold text-xl transition-all shadow-[0_0_40px_rgba(255,153,92,0.2)] active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <CheckCircle className="w-6 h-6" /> Save Log
      </button>
    </div>
  );
}

// --- DASHBOARD VIEW ---
function MiniChart({ title, entries, dataKey, color, icon: Icon }: any) {
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const daysToInclude = displayMode === 'daily' ? 21 : displayMode === 'weekly' ? 84 : 365;
  const recentEntries = entries.slice(-daysToInclude);
  
  const field = dataKey === 'Power' ? 'energy' : dataKey.toLowerCase();

  const zeroDaysCount = recentEntries.filter((d: any) => !d[field] || d[field] === 0).length;
  const missingDays = Math.max(0, daysToInclude - recentEntries.length);
  const totalZeroOrMissing = zeroDaysCount + missingDays;
  const loggedCount = daysToInclude - totalZeroOrMissing;

  const bucketKey = (dateStr: string) => {
    const d = new Date(dateStr);
    if (displayMode === 'monthly') return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (displayMode === 'weekly') {
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const buckets: Record<string, number> = {};
  recentEntries.forEach((e: any) => {
    const key = bucketKey(e.date);
    buckets[key] = (buckets[key] || 0) + e[field];
  });

  const chartData = Object.keys(buckets)
    .filter(k => buckets[k] > 0)
    .map(k => ({
      name: k,
      [dataKey]: parseFloat(buckets[k].toFixed(1))
    }));

  const timeframeLabel = displayMode === 'daily' ? 'Past 3 Weeks' : displayMode === 'weekly' ? 'Past 12 Weeks' : 'Past 12 Months';

  return (
    <div className="bg-surface border border-border p-5 rounded-3xl shadow-lg flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-text">
          <Icon className="w-5 h-5" style={{ color }} />
          <h3 className="font-bold font-mono tracking-tight">{title}</h3>
        </div>
        <div className="flex bg-surface-raised border border-border rounded-lg p-0.5">
          <button onClick={() => setDisplayMode('daily')} className={`px-2 py-1 text-[10px] font-mono rounded-md ${displayMode === 'daily' ? 'bg-surface shadow text-text' : 'text-text-muted hover:text-text-secondary'}`}>D</button>
          <button onClick={() => setDisplayMode('weekly')} className={`px-2 py-1 text-[10px] font-mono rounded-md ${displayMode === 'weekly' ? 'bg-surface shadow text-text' : 'text-text-muted hover:text-text-secondary'}`}>W</button>
          <button onClick={() => setDisplayMode('monthly')} className={`px-2 py-1 text-[10px] font-mono rounded-md ${displayMode === 'monthly' ? 'bg-surface shadow text-text' : 'text-text-muted hover:text-text-secondary'}`}>M</button>
        </div>
      </div>
      <div className="h-48 w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#314A3C" vertical={false} />
            <XAxis dataKey="name" stroke="#728378" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis stroke="#728378" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#121E19', borderColor: '#314A3C', borderRadius: '12px', color: '#F2F5EE' }}
              itemStyle={{ color: color, fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#color${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
        <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted">Active Logged Days ({timeframeLabel})</span>
        <span className="text-sm font-bold font-mono" style={{ color }}>{loggedCount}</span>
      </div>
    </div>
  );
}

function CarbonGarden({ entries, onLogActivity, getToday }: { entries: any[], onLogActivity: (d: Date) => void, getToday: () => Date }) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const getWeekDays = () => {
    const today = getToday();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diffToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const now = getToday();
  now.setHours(0, 0, 0, 0);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getEntryForDate = (d: Date) => entries.find(e => e.date.startsWith(formatDate(d)));

  const weekEntries = weekDays.map(getEntryForDate).filter(Boolean);
  const loggedCount = weekEntries.length;
  const weekTotal = weekEntries.reduce((sum, e) => sum + e.total, 0);
  const weekAvg = loggedCount > 0 ? weekTotal / loggedCount : 0;
  const minTotal = loggedCount > 0 ? Math.min(...weekEntries.map(e => e.total)) : null;

  const dayCards = weekDays.map((d, i) => {
    const entry = getEntryForDate(d);
    const isFuture = d.getTime() > now.getTime();
    const isToday = d.getTime() === now.getTime();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    let IconComp = Circle;
    let label = "";
    let colorClass = "";

    if (isFuture) {
      IconComp = CircleDashed;
      label = "Upcoming";
      colorClass = "text-text-muted opacity-50";
    } else if (entry) {
      if (entry.total === minTotal && loggedCount > 1) {
        IconComp = TreeDeciduous;
        label = "Best this week";
        colorClass = "text-success drop-shadow-[0_0_8px_rgba(147,212,148,0.4)]";
      } else if (entry.total < weekAvg * 0.9) {
        IconComp = Sprout;
        label = "Lighter day";
        colorClass = "text-success";
      } else if (entry.total > weekAvg * 1.1) {
        IconComp = Leaf;
        label = "Higher than usual";
        colorClass = "text-energy"; // Amber
      } else {
        IconComp = Leaf;
        label = "Typical day";
        colorClass = "text-success";
      }
    } else {
      IconComp = Circle;
      label = "Not logged";
      colorClass = "text-text-muted";
    }

    return (
      <button
        key={i}
        onClick={() => setSelectedDay(d)}
        className={`flex-shrink-0 w-[100px] md:w-auto md:flex-1 flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 snap-center outline-none focus-visible:ring-2 focus-visible:ring-brand
          ${isToday ? 'bg-surface-raised border-brand/50 ring-1 ring-brand/20' : 'bg-surface border-border hover:-translate-y-1 hover:border-text-muted'}
        `}
        aria-label={`${dayName}, ${entry ? `${entry.total.toFixed(1)} kg, ${label}` : label}`}
      >
        <span className="text-xs font-mono text-text-muted mb-3 uppercase tracking-wider">{dayName}</span>
        <IconComp className={`w-8 h-8 mb-3 ${colorClass}`} strokeWidth={1.5} />
        {entry ? (
          <span className="text-sm font-bold font-mono text-text">{entry.total.toFixed(1)} <span className="text-[10px] text-text-muted">kg</span></span>
        ) : (
          <span className="text-sm font-bold font-mono text-text-muted">—</span>
        )}
        <span className="text-[10px] text-text-muted mt-1 leading-tight text-center">{label}</span>
      </button>
    );
  });

  const getSubtext = () => {
    if (loggedCount === 0) return "Your garden is waiting for its first trace.";
    if (loggedCount < 3) return "Your pattern is still growing. A few more check-ins will reveal a clearer weekly picture.";
    return `Based on ${loggedCount} of 7 days logged`;
  };

  const getMotivationalCopy = () => {
    if (loggedCount === 0) return "Start planting by logging your first day.";
    if (loggedCount === 7) return "A full week of tracking! Your garden is flourishing.";
    if (loggedCount > 4) return `Your garden grew on ${loggedCount} days this week.`;
    return "A quiet day still counts. Log when you can.";
  };

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-mono uppercase tracking-tight flex items-center gap-2">
            <TreeDeciduous className="w-6 h-6 text-success" /> Your carbon garden
          </h2>
          <p className="text-text-secondary text-sm mt-1">Each saved day grows a small part of your weekly garden.</p>
        </div>
        <p className="text-xs font-mono text-text-muted uppercase bg-surface-raised px-3 py-1.5 rounded-full border border-border inline-flex items-center w-max">
          {getMotivationalCopy()}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-7" style={{ scrollbarWidth: 'none' }}>
        {dayCards}
      </div>

      <div className="text-center mt-2">
        <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted">{getSubtext()}</p>
        {loggedCount === 0 && (
          <button onClick={() => onLogActivity(getToday())} className="mt-4 px-6 py-2 bg-brand text-bg font-bold rounded-full text-sm hover:opacity-90 transition-opacity">
            Start today's check-in
          </button>
        )}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedDay(null)}>
          <div className="bg-surface border border-border p-6 rounded-3xl shadow-2xl max-w-xs w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg">{selectedDay.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
                <p className="text-xs text-text-muted">{selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-text-muted hover:text-text bg-surface-raised p-1 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            
            {(() => {
              const entry = getEntryForDate(selectedDay);
              const isFuture = selectedDay.getTime() > now.getTime();
              const isToday = selectedDay.getTime() === now.getTime();

              if (isFuture) {
                return <div className="text-center py-6 text-text-muted text-sm">Upcoming day.</div>;
              }

              if (entry) {
                return (
                  <div className="space-y-4">
                    <div className="text-center py-4 bg-surface-raised rounded-xl border border-border">
                      <div className="text-3xl font-black font-mono text-text">{entry.total.toFixed(1)}</div>
                      <div className="text-xs text-text-muted uppercase tracking-widest mt-1">kg CO₂e</div>
                      {entry.estimated && (
                        <div className="mt-2 text-[10px] bg-brand/20 text-brand px-2 py-0.5 rounded-full inline-block uppercase font-bold tracking-wider">Estimated</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary flex items-center gap-1.5"><Map className="w-3.5 h-3.5"/> Travel</span>
                        <span className="font-mono">{entry.commute.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5"/> Food</span>
                        <span className="font-mono">{entry.food.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary flex items-center gap-1.5"><Zap className="w-3.5 h-3.5"/> Energy</span>
                        <span className="font-mono">{entry.energy.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="text-center py-4 space-y-4">
                  <p className="text-sm text-text-secondary mb-2">No check-in saved for this day.</p>
                  {isToday ? (
                    <button onClick={() => { setSelectedDay(null); onLogActivity(selectedDay); }} className="w-full px-4 py-2 bg-brand text-bg font-bold rounded-xl text-sm hover:opacity-90 transition-opacity">
                      Log today
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button onClick={() => { setSelectedDay(null); onLogActivity(selectedDay); }} className="w-full px-4 py-2 bg-surface-raised text-text border border-border font-bold rounded-xl text-sm hover:bg-surface-overlay transition-colors">
                        Add a quick estimate
                      </button>
                      <button onClick={() => setSelectedDay(null)} className="w-full px-4 py-2 text-text-muted font-medium rounded-xl text-sm hover:text-text transition-colors">
                        Skip for now
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickEstimateView({ onSave, onCancel }: { onSave: (total: number, commute: number, food: number, energy: number) => void, onCancel: () => void }) {
  const [commuteCar, setCommuteCar] = useState('');
  const [commuteTransit, setCommuteTransit] = useState('');
  const [commuteMoto, setCommuteMoto] = useState('');
  const [commuteActive, setCommuteActive] = useState('');
  
  const [foodMeat, setFoodMeat] = useState('');
  const [foodMixed, setFoodMixed] = useState('');
  const [foodPlant, setFoodPlant] = useState('');
  const [foodVegan, setFoodVegan] = useState('');
  
  const [powerKwh, setPowerKwh] = useState('');

  const calcCommute = () => {
    return (parseFloat(commuteCar)||0)*0.19 + (parseFloat(commuteTransit)||0)*0.04 + (parseFloat(commuteMoto)||0)*0.10 + (parseFloat(commuteActive)||0)*0;
  };

  const calcFood = () => {
    return (parseFloat(foodMeat)||0)*4.2 + (parseFloat(foodMixed)||0)*2.4 + (parseFloat(foodPlant)||0)*1.2 + (parseFloat(foodVegan)||0)*0.7;
  };

  const calcPower = () => {
    return (parseFloat(powerKwh)||0) * 0.4;
  };

  const handleSave = () => {
    const c = calcCommute();
    const f = calcFood();
    const p = calcPower();
    onSave(c + f + p, c, f, p);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-black font-mono uppercase tracking-tighter">Yesterday's Estimate</h2>
        <p className="text-text-secondary mt-2">Quickly backfill your missing data using standard categories.</p>
      </div>
      
      {/* COMMUTE */}
      <div className="bg-surface border border-border p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-brand/10 rounded-2xl">
            <Map className="text-brand w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-mono uppercase tracking-tight">Travel</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Car Miles</label>
            <input type="number" placeholder="0" value={commuteCar} onChange={e=>setCommuteCar(e.target.value)} className="w-full bg-surface-raised text-text p-4 rounded-2xl border border-border focus:border-brand outline-none font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Transit Miles</label>
            <input type="number" placeholder="0" value={commuteTransit} onChange={e=>setCommuteTransit(e.target.value)} className="w-full bg-surface-raised text-text p-4 rounded-2xl border border-border focus:border-brand outline-none font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Moto Miles</label>
            <input type="number" placeholder="0" value={commuteMoto} onChange={e=>setCommuteMoto(e.target.value)} className="w-full bg-surface-raised text-text p-4 rounded-2xl border border-border focus:border-brand outline-none font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Walk/Bike Miles</label>
            <input type="number" placeholder="0" value={commuteActive} onChange={e=>setCommuteActive(e.target.value)} className="w-full bg-surface-raised text-text p-4 rounded-2xl border border-border focus:border-brand outline-none font-mono" />
          </div>
        </div>
      </div>

      {/* FOOD */}
      <div className="bg-surface border border-border p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#93D494]/10 rounded-2xl">
            <Utensils className="text-[#93D494] w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-mono uppercase tracking-tight">Food</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Meat Meals</label>
            <input type="number" placeholder="0" value={foodMeat} onChange={e=>setFoodMeat(e.target.value)} className="w-full bg-surface-raised text-text p-4 rounded-2xl border border-border focus:border-brand outline-none font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Mixed Meals</label>
            <input type="number" placeholder="0" value={foodMixed} onChange={e=>setFoodMixed(e.target.value)} className="w-full bg-surface-raised text-text p-4 rounded-2xl border border-border focus:border-brand outline-none font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Plant Meals</label>
            <input type="number" placeholder="0" value={foodPlant} onChange={e=>setFoodPlant(e.target.value)} className="w-full bg-surface-raised text-text p-4 rounded-2xl border border-border focus:border-brand outline-none font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Vegan Meals</label>
            <input type="number" placeholder="0" value={foodVegan} onChange={e=>setFoodVegan(e.target.value)} className="w-full bg-surface-raised text-text p-4 rounded-2xl border border-border focus:border-brand outline-none font-mono" />
          </div>
        </div>
      </div>

      {/* POWER */}
      <div className="bg-surface border border-border p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#F4C967]/10 rounded-2xl">
            <Zap className="text-[#F4C967] w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-mono uppercase tracking-tight">Energy</h3>
        </div>
        
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Electricity (kWh)</label>
          <input type="number" placeholder="0" value={powerKwh} onChange={e=>setPowerKwh(e.target.value)} className="w-full bg-surface-raised text-text p-4 rounded-2xl border border-border focus:border-brand outline-none font-mono" />
        </div>
      </div>

      <div className="pt-6 flex gap-4">
        <button onClick={onCancel} className="flex-1 px-6 py-4 bg-surface-raised border border-border text-text font-bold font-mono uppercase tracking-wider rounded-2xl hover:bg-surface-overlay transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} className="flex-1 px-6 py-4 bg-brand text-bg font-bold font-mono uppercase tracking-wider rounded-2xl hover:opacity-90 transition-opacity">
          Save Estimate
        </button>
      </div>
    </div>
  );
}

function DashboardView({ entries, hasYesterday, getToday, onQuickEstimate, onLogActivity }: { entries: any[], hasYesterday: boolean, getToday: () => Date, onQuickEstimate: () => void, onLogActivity: (d: Date) => void }) {
  const [insight, setInsight] = useState("Analyzing your recent footprint trends...");
  const [projection, setProjection] = useState("Loading projections...");
  const [loading, setLoading] = useState(true);

  // Totals for 2, 5, 10 weeks
  const sumLastN = (n: number) => {
    const slice = entries.slice(-n);
    return slice.reduce((sum, e) => sum + e.total, 0);
  };

  const total2Weeks = sumLastN(14);
  const total5Weeks = sumLastN(35);
  const total10Weeks = sumLastN(70);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const [resI, resP] = await Promise.all([
          fetch('/api/insights', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ entries })
          }),
          fetch('/api/projection', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ entries })
          })
        ]);
        const dataI = await resI.json();
        const dataP = await resP.json();
        if (dataI.text) setInsight(dataI.text);
        if (dataP.text) setProjection(dataP.text);
      } catch (err) {
        setInsight("Unable to load AI insights. Check your network or API key.");
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [entries]);

  // Format data for chart (last 21 days for the 3 individual charts)
  const chartData = entries.slice(-21).map(e => ({
    name: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Commute: parseFloat(e.commute.toFixed(1)),
    Food: parseFloat(e.food.toFixed(1)),
    Power: parseFloat(e.energy.toFixed(1))
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-8">
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text uppercase font-mono">
            Dashboard
          </h1>
          <p className="text-text-secondary text-lg">Your footprint overview and trends.</p>
        </div>
      </div>

      <CarbonGarden entries={entries} onLogActivity={onLogActivity} getToday={getToday} />

      {/* Top Totals: 2, 5, 10 weeks */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-4 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="text-[10px] md:text-xs text-text-muted mb-2 font-mono uppercase tracking-widest">Past 2 Weeks</div>
          <div className="text-xl md:text-3xl font-extrabold font-mono text-text">{total2Weeks.toFixed(0)} <span className="text-xs md:text-sm font-sans font-normal text-text-muted">kg</span></div>
        </div>
        <div className="bg-surface border border-border p-4 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="text-[10px] md:text-xs text-text-muted mb-2 font-mono uppercase tracking-widest">Past 5 Weeks</div>
          <div className="text-xl md:text-3xl font-extrabold font-mono text-text">{total5Weeks.toFixed(0)} <span className="text-xs md:text-sm font-sans font-normal text-text-muted">kg</span></div>
        </div>
        <div className="bg-surface border border-border p-4 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="text-[10px] md:text-xs text-text-muted mb-2 font-mono uppercase tracking-widest">Past 10 Weeks</div>
          <div className="text-xl md:text-3xl font-extrabold font-mono text-text">{total10Weeks.toFixed(0)} <span className="text-xs md:text-sm font-sans font-normal text-text-muted">kg</span></div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-surface border border-border p-6 rounded-3xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-12 h-12 text-brand"/></div>
        <div className="text-xs text-brand mb-3 font-mono uppercase tracking-widest flex items-center gap-2">
           AI Insight
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {loading ? 'Analyzing data patterns...' : insight}
        </p>
      </div>

      {/* The 3 Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MiniChart title="Commute" entries={entries} dataKey="Commute" color="#FF995C" icon={Map} />
        <MiniChart title="Food" entries={entries} dataKey="Food" color="#93D494" icon={Utensils} />
        <MiniChart title="Power" entries={entries} dataKey="Power" color="#F4C967" icon={Zap} />
      </div>

      {/* Bottom Actions */}
      <div className="mt-12 flex justify-center pb-8 border-t border-border pt-8">
        {hasYesterday ? (
          <button disabled className="px-6 py-3 bg-surface-raised text-text-muted font-bold font-mono uppercase tracking-wider rounded-xl border border-border cursor-not-allowed flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Yesterday Logged
          </button>
        ) : (
          <button onClick={onQuickEstimate} className="px-6 py-3 bg-surface-overlay text-text font-bold font-mono uppercase tracking-wider rounded-xl border border-border hover:bg-surface-raised transition-colors flex items-center gap-2 shadow-lg group">
            <Sparkles className="w-5 h-5 text-brand group-hover:scale-110 transition-transform" /> Quick Estimate for Yesterday
          </button>
        )}
      </div>

    </div>
  );
}
