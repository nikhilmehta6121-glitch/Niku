/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  Ticket, 
  CreditCard, 
  Navigation, 
  ShieldCheck, 
  PhoneCall, 
  Search,
  Clock,
  User,
  ChevronRight,
  AlertCircle,
  Menu,
  Bell,
  CalendarDays,
  Filter,
  Info,
  ArrowRightLeft,
  Map as MapIcon,
  ShieldAlert,
  CloudSun,
  Camera,
  Languages,
  Thermometer,
  Heart,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock data for buses
const MOCK_BUSES = [
  { id: 'HR-01', route: 'Shimla - Manali', status: 'On Time', departure: '08:30 AM', type: 'Volvo AC', price: 850 },
  { id: 'HR-02', route: 'Dharamshala - Delhi', status: 'Delayed', departure: '10:15 AM', type: 'Deluxe', price: 650 },
  { id: 'HR-03', route: 'Chandigarh - Shimla', status: 'On Time', departure: '11:00 AM', type: 'Ordinary', price: 250 },
  { id: 'HR-04', route: 'Manali - Leh', status: 'On Time', departure: '04:00 AM', type: 'Himsuta', price: 1200 },
  { id: 'HR-05', route: 'Shimla - Local', status: 'On Time', departure: '05:30 PM', type: 'Ladies Special', price: 20 },
];

// Mock data for Timetable
const TIMETABLE_DATA = [
  // Shimla
  { id: 1, route: 'Shimla - Delhi', operator: 'HRTC', type: 'Volvo', departure: '09:00 PM', arrival: '05:00 AM', frequency: 'Daily' },
  { id: 2, route: 'Shimla - Rohru', operator: 'HRTC', type: 'Ordinary', departure: '06:00 AM', arrival: '11:00 AM', frequency: 'Daily' },
  { id: 3, route: 'Shimla - Rampur', operator: 'HRTC', type: 'Ordinary', departure: '07:30 AM', arrival: '12:30 PM', frequency: 'Daily' },
  
  // Kangra
  { id: 4, route: 'Dharamshala - Delhi', operator: 'HRTC', type: 'Volvo', departure: '08:30 PM', arrival: '06:00 AM', frequency: 'Daily' },
  { id: 5, route: 'Dharamshala - Pathankot', operator: 'HRTC', type: 'Ordinary', departure: '06:30 AM', arrival: '09:30 AM', frequency: 'Daily' },
  { id: 6, route: 'Kangra - Chandigarh', operator: 'HRTC', type: 'Deluxe', departure: '05:00 AM', arrival: '11:00 AM', frequency: 'Daily' },
  
  // Kullu
  { id: 7, route: 'Manali - Chandigarh', operator: 'HRTC', type: 'Deluxe', departure: '08:00 AM', arrival: '04:00 PM', frequency: 'Daily' },
  { id: 8, route: 'Kullu - Mandi', operator: 'HRTC', type: 'Ordinary', departure: '11:00 AM', arrival: '01:30 PM', frequency: 'Daily' },
  { id: 9, route: 'Manali - Delhi', operator: 'HRTC', type: 'Volvo', departure: '07:00 PM', arrival: '06:00 AM', frequency: 'Daily' },
  
  // Mandi
  { id: 10, route: 'Mandi - Shimla', operator: 'HRTC', type: 'Ordinary', departure: '05:30 AM', arrival: '10:30 AM', frequency: 'Daily' },
  { id: 11, route: 'Mandi - Pathankot', operator: 'HRTC', type: 'Ordinary', departure: '08:00 AM', arrival: '03:00 PM', frequency: 'Daily' },
  
  // Hamirpur
  { id: 12, route: 'Hamirpur - Shimla', operator: 'HRTC', type: 'Deluxe', departure: '05:30 AM', arrival: '09:30 AM', frequency: 'Daily' },
  { id: 13, route: 'Hamirpur - Delhi', operator: 'HRTC', type: 'Volvo', departure: '09:30 PM', arrival: '05:30 AM', frequency: 'Daily' },
  
  // Chamba
  { id: 14, route: 'Chamba - Dalhousie', operator: 'HRTC', type: 'Ordinary', departure: '09:00 AM', arrival: '11:00 AM', frequency: 'Daily' },
  { id: 15, route: 'Chamba - Shimla', operator: 'HRTC', type: 'Ordinary', departure: '04:00 PM', arrival: '06:00 AM', frequency: 'Daily' },
  
  // Una
  { id: 16, route: 'Una - Delhi', operator: 'HRTC', type: 'Volvo', departure: '10:00 PM', arrival: '05:00 AM', frequency: 'Daily' },
  { id: 17, route: 'Una - Haridwar', operator: 'HRTC', type: 'Ordinary', departure: '06:00 AM', arrival: '02:00 PM', frequency: 'Daily' },
  
  // Solan
  { id: 18, route: 'Solan - Shimla', operator: 'HRTC', type: 'Ordinary', departure: '07:00 AM', arrival: '08:30 AM', frequency: 'Daily' },
  { id: 19, route: 'Solan - Chandigarh', operator: 'HRTC', type: 'Ordinary', departure: '08:00 AM', arrival: '10:00 AM', frequency: 'Daily' },
  
  // Bilaspur
  { id: 20, route: 'Bilaspur - Shimla', operator: 'HRTC', type: 'Ordinary', departure: '06:30 AM', arrival: '09:30 AM', frequency: 'Daily' },
  { id: 21, route: 'Bilaspur - Chandigarh', operator: 'HRTC', type: 'Ordinary', departure: '07:30 AM', arrival: '10:30 AM', frequency: 'Daily' },
  
  // Sirmaur
  { id: 22, route: 'Nahan - Shimla', operator: 'HRTC', type: 'Ordinary', departure: '05:00 AM', arrival: '10:00 AM', frequency: 'Daily' },
  { id: 23, route: 'Nahan - Dehradun', operator: 'HRTC', type: 'Ordinary', departure: '08:00 AM', arrival: '11:00 AM', frequency: 'Daily' },
  
  // Kinnaur
  { id: 24, route: 'Reckong Peo - Shimla', operator: 'HRTC', type: 'Ordinary', departure: '05:00 AM', arrival: '02:00 PM', frequency: 'Daily' },
  { id: 25, route: 'Reckong Peo - Rampur', operator: 'HRTC', type: 'Ordinary', departure: '09:00 AM', arrival: '01:00 PM', frequency: 'Daily' },
  
  // Lahaul and Spiti
  { id: 26, route: 'Keylong - Manali', operator: 'HRTC', type: 'Ordinary', departure: '07:00 AM', arrival: '12:00 PM', frequency: 'Daily' },
  { id: 27, route: 'Keylong - Kaza', operator: 'HRTC', type: 'Ordinary', departure: '05:00 AM', arrival: '03:00 PM', frequency: 'Daily' },
  { id: 28, route: 'Kaza - Shimla', operator: 'HRTC', type: 'Ordinary', departure: '04:00 AM', arrival: '08:00 PM', frequency: 'Daily' },
];

const TOURIST_PLACES = [
  { id: 1, name: 'Shimla', description: 'The Queen of Hills', image: 'https://picsum.photos/seed/shimla/400/300' },
  { id: 2, name: 'Manali', description: 'Valley of the Gods', image: 'https://picsum.photos/seed/manali/400/300' },
  { id: 3, name: 'Dharamshala', description: 'Home of Dalai Lama', image: 'https://picsum.photos/seed/dharamshala/400/300' },
  { id: 4, name: 'Dalhousie', description: 'Little Switzerland of India', image: 'https://picsum.photos/seed/dalhousie/400/300' },
  { id: 5, name: 'Spiti Valley', description: 'The Cold Desert', image: 'https://picsum.photos/seed/spiti/400/300' },
  { id: 6, name: 'Kasol', description: 'Mini Israel of India', image: 'https://picsum.photos/seed/kasol/400/300' },
  { id: 7, name: 'Khajjiar', description: 'Mini Switzerland', image: 'https://picsum.photos/seed/khajjiar/400/300' },
  { id: 8, name: 'Kaza', description: 'High Altitude Paradise', image: 'https://picsum.photos/seed/kaza/400/300' },
  { id: 9, name: 'Nahan', description: 'City of Gardens', image: 'https://picsum.photos/seed/nahan/400/300' },
  { id: 10, name: 'Chamba', description: 'Land of Temples', image: 'https://picsum.photos/seed/chamba/400/300' },
  { id: 11, name: 'Solan', description: 'Mushroom City of India', image: 'https://picsum.photos/seed/solan/400/300' },
  { id: 12, name: 'Hamirpur', description: 'Educational Hub', image: 'https://picsum.photos/seed/hamirpur/400/300' },
];

const WEATHER_DATA = [
  { city: 'Shimla', temp: '15°C', condition: 'Clear' },
  { city: 'Manali', temp: '10°C', condition: 'Cloudy' },
  { city: 'Dharamshala', temp: '18°C', condition: 'Sunny' },
  { city: 'Kullu', temp: '20°C', condition: 'Sunny' },
  { city: 'Mandi', temp: '22°C', condition: 'Clear' },
  { city: 'Solan', temp: '21°C', condition: 'Sunny' },
  { city: 'Hamirpur', temp: '25°C', condition: 'Clear' },
  { city: 'Una', temp: '28°C', condition: 'Hot' },
  { city: 'Bilaspur', temp: '26°C', condition: 'Clear' },
  { city: 'Chamba', temp: '19°C', condition: 'Cloudy' },
  { city: 'Nahan', temp: '23°C', condition: 'Sunny' },
  { city: 'Keylong', temp: '5°C', condition: 'Snow' },
];

const TRANSLATIONS = {
  en: {
    home: 'Home',
    bookings: 'Bookings',
    timetable: 'Timetable',
    liveMap: 'Live Map',
    explore: 'Explore',
    safety: 'Safety',
    emergency: 'Emergency',
    bookNow: 'Book Now',
    viewTimings: 'View Timings',
    weather: 'Weather',
    touristPlaces: 'Tourist Places',
    selectSeats: 'Select Seats',
    pay: 'Pay',
    sos: 'ACTIVATE SOS',
    guardianMode: 'Guardian Mode',
    language: 'Language',
    womenSafety: "Women's Safety",
    ladiesHelpline: "Ladies Helpline",
    nirbhayaSupport: "Nirbhaya Support",
    safetyTips: "Safety Guidelines",
    ladiesSpecial: "Ladies Special",
  },
  hi: {
    home: 'होम',
    bookings: 'बुकिंग',
    timetable: 'समय सारिणी',
    liveMap: 'लाइव मैप',
    explore: 'एक्सप्लोर',
    safety: 'सुरक्षा',
    emergency: 'आपातकालीन',
    bookNow: 'अभी बुक करें',
    viewTimings: 'समय देखें',
    weather: 'मौसम',
    touristPlaces: 'पर्यटन स्थल',
    selectSeats: 'सीट चुनें',
    pay: 'भुगतान करें',
    sos: 'SOS सक्रिय करें',
    guardianMode: 'गार्जियन मोड',
    language: 'भाषा',
    womenSafety: "महिला सुरक्षा",
    ladiesHelpline: "महिला हेल्पलाइन",
    nirbhayaSupport: "निर्भया सहायता",
    safetyTips: "सुरक्षा दिशानिर्देश",
    ladiesSpecial: "महिला स्पेशल",
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [selectedBus, setSelectedBus] = useState<typeof MOCK_BUSES[0] | null>(null);
  const [timetableFilter, setTimetableFilter] = useState('all');
  const [timetableSearch, setTimetableSearch] = useState('');
  
  // New states for booking and location
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [bookingStep, setBookingStep] = useState<'seats' | 'payment' | 'success'>('seats');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Guardian Safety states
  const [guardianNumber, setGuardianNumber] = useState('6230715655');
  const [isGuardianActive, setIsGuardianActive] = useState(false);
  const [lastKnownLocation, setLastKnownLocation] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const t = TRANSLATIONS[language];

  useEffect(() => {
    console.log("Active Tab:", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'tracking') {
      requestLocation();
    }
  }, [activeTab]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location obtained:", position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          showNotification("Location updated successfully", "success");
        },
        (error) => {
          console.error("Geolocation error:", error);
          showNotification("Please enable location access in your browser settings", "error");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      showNotification("Geolocation is not supported by your browser", "error");
    }
  };

  const toggleSeat = (seatNumber: number) => {
    setSelectedSeats(prev => 
      prev.includes(seatNumber) 
        ? prev.filter(s => s !== seatNumber) 
        : [...prev, seatNumber]
    );
  };

  const handleBookingReset = () => {
    setSelectedSeats([]);
    setBookingStep('seats');
    setPaymentMethod('');
    setSelectedBus(null);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      showNotification("Search completed! Found 5 buses for your route.", "success");
    }, 1500);
  };

  const handleTrackBus = () => {
    setIsTrackLoading(true);
    setTimeout(() => {
      setIsTrackLoading(false);
      showNotification("Bus HR-01 (Shimla Express) is currently near Bilaspur. Expected arrival in 2 hours.", "info");
    }, 1500);
  };

  const filteredTimetable = TIMETABLE_DATA.filter(item => {
    const matchesSearch = item.route.toLowerCase().includes(timetableSearch.toLowerCase()) || 
                         item.operator.toLowerCase().includes(timetableSearch.toLowerCase());
    // Only show HRTC buses as requested
    const isHRTC = item.operator === 'HRTC';
    return matchesSearch && isHRTC;
  });

  const handleEmergency = () => {
    showNotification("Emergency SOS Activated! Calling 112...", "error");
    setTimeout(() => {
      window.location.href = "tel:112";
    }, 1000);
  };

  const handleTabSwitch = (tab: string, label: string) => {
    setActiveTab(tab);
    showNotification(`Opening ${label}...`, "info");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-2.5 rounded-2xl shadow-xl shadow-blue-900/20 border border-white/10"
            >
              <Bus className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
                  HRTC<span className="text-blue-600">.</span>
                </h1>
                <Badge className="bg-blue-600 text-white hover:bg-blue-700 border-none text-[8px] font-black px-2 py-0.5 h-4 rounded-full">PRO</Badge>
              </div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-400 mt-1">Himachal Transport</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6 text-sm font-semibold text-slate-500">
              {[
                { id: 'dashboard', label: t.home },
                { id: 'booking', label: t.bookings },
                { id: 'timetable', label: t.timetable },
                { id: 'tracking', label: t.liveMap },
                { id: 'explore', label: t.explore }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)} 
                  className={`relative py-2 transition-colors hover:text-blue-600 ${activeTab === item.id ? 'text-blue-600' : ''}`}
                >
                  {item.label}
                  {activeTab === item.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                    />
                  )}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2"
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              >
                <Languages className="w-4 h-4" />
                {language === 'en' ? 'हिन्दी' : 'English'}
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs cursor-pointer hover:border-blue-300 transition-colors">
                NM
              </div>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{language === 'en' ? 'HRTC Menu' : 'HRTC मेनू'}</SheetTitle>
                <SheetDescription>{language === 'en' ? 'Access all bus services' : 'सभी बस सेवाओं तक पहुँचें'}</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab('dashboard')}><Clock className="mr-2 h-4 w-4" /> {t.home}</Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab('booking')}><Ticket className="mr-2 h-4 w-4" /> {t.bookings}</Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab('timetable')}><CalendarDays className="mr-2 h-4 w-4" /> {t.timetable}</Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab('tracking')}><Navigation className="mr-2 h-4 w-4" /> {t.liveMap}</Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab('explore')}><Camera className="mr-2 h-4 w-4" /> {t.explore}</Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab('safety')}><ShieldCheck className="mr-2 h-4 w-4" /> {t.safety}</Button>
                <Button variant="destructive" className="justify-start" onClick={handleEmergency}><PhoneCall className="mr-2 h-4 w-4" /> {t.emergency} (112)</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {isGuardianActive && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-emerald-500 text-white p-4 rounded-[1.5rem] flex items-center justify-between shadow-lg shadow-emerald-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.guardianMode} Active</p>
                      <p className="text-sm font-bold">
                        {language === 'en' 
                          ? `Your journey is being tracked by ${guardianNumber}`
                          : `आपकी यात्रा ${guardianNumber} द्वारा ट्रैक की जा रही है`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 font-bold"
                    onClick={() => setActiveTab('safety')}
                  >
                    {language === 'en' ? 'View Details' : 'विवरण देखें'}
                  </Button>
                </motion.div>
              )}

              {/* Hero Section */}
              <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-8 md:p-20 text-white shadow-2xl shadow-blue-900/40 border border-white/5">
                <div className="relative z-10 max-w-2xl">
                  <Badge className="mb-8 bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-black rounded-full backdrop-blur-md">
                    {language === 'en' ? "Himachal's Pride since 1974" : "1974 से हिमाचल का गौरव"}
                  </Badge>
                  <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-[0.95]">
                    {language === 'en' ? "Journey Through the" : "देवभूमि की"} <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{language === 'en' ? "Himalayas" : "यात्रा"}</span>
                  </h2>
                  <p className="text-slate-400 text-xl mb-12 leading-relaxed font-medium max-w-lg">
                    {language === 'en' 
                      ? "Safe, reliable, and comfortable travel to every corner of Himachal Pradesh. Your mountain adventure starts here."
                      : "हिमाचल प्रदेश के हर कोने में सुरक्षित, विश्वसनीय और आरामदायक यात्रा। आपका पहाड़ी रोमांच यहाँ से शुरू होता है।"}
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-8 rounded-[1.5rem] font-black shadow-2xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95" onClick={() => setActiveTab('booking')}>
                      {t.bookNow}
                    </Button>
                    <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 px-10 py-8 rounded-[1.5rem] font-black backdrop-blur-md transition-all hover:border-white/20" onClick={() => setActiveTab('timetable')}>
                      {t.viewTimings}
                    </Button>
                  </div>
                </div>
                
                {/* Weather Widget */}
                <div className="absolute top-12 right-12 hidden lg:block">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] space-y-6 shadow-2xl"
                  >
                    <div className="flex items-center justify-between gap-12">
                      <div>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t.weather}</p>
                        <h4 className="text-3xl font-black tracking-tight">Shimla</h4>
                      </div>
                      <div className="bg-blue-500/10 p-3 rounded-2xl">
                        <CloudSun className="w-10 h-10 text-blue-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <Thermometer className="w-5 h-5 text-blue-400" />
                        <span className="text-4xl font-black tracking-tighter">15°C</span>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full font-bold">Clear Sky</Badge>
                    </div>
                  </motion.div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
                  <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600 rounded-full blur-[150px]" />
                  <div className="absolute bottom-[-30%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px]" />
                </div>
                
                {/* Subtle Mountain Pattern (Simulated) */}
                <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent z-0" />
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[
                  { icon: MapPin, label: language === 'en' ? 'Live Track' : 'लाइव ट्रैक', color: 'from-blue-500 to-blue-600', action: () => handleTabSwitch('tracking', language === 'en' ? 'Live Tracking' : 'लाइव ट्रैकिंग') },
                  { icon: Ticket, label: language === 'en' ? 'Booking' : 'बुकिंग', color: 'from-indigo-500 to-indigo-600', action: () => handleTabSwitch('booking', language === 'en' ? 'Booking' : 'बुकिंग') },
                  { icon: CalendarDays, label: language === 'en' ? 'Timetable' : 'समय सारिणी', color: 'from-slate-700 to-slate-800', action: () => handleTabSwitch('timetable', language === 'en' ? 'Timetable' : 'समय सारिणी') },
                  { icon: Camera, label: language === 'en' ? 'Explore' : 'एक्सप्लोर', color: 'from-emerald-500 to-emerald-600', action: () => handleTabSwitch('explore', language === 'en' ? 'Explore' : 'एक्सप्लोर') },
                  { icon: ShieldCheck, label: language === 'en' ? 'Safety' : 'सुरक्षा', color: 'from-cyan-500 to-cyan-600', action: () => handleTabSwitch('safety', language === 'en' ? 'Safety' : 'सुरक्षा') },
                  { icon: PhoneCall, label: language === 'en' ? 'SOS' : 'SOS', color: 'from-red-500 to-red-600', action: handleEmergency },
                ].map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={item.action}
                    className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-100 transition-all group relative overflow-hidden"
                  >
                    <div className={`p-4 rounded-2xl mb-4 bg-gradient-to-br ${item.color} text-white group-hover:scale-110 transition-transform shadow-lg`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-blue-600 transition-colors">{item.label}</span>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>

              {/* Recent Searches / Popular Routes */}
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 border-b border-slate-50">
                    <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight">
                      <div className="bg-blue-100 p-2 rounded-xl">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      {language === 'en' ? 'Popular Routes' : 'लोकप्रिय मार्ग'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {MOCK_BUSES.map((bus) => (
                        <div key={bus.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100 group">
                          <div className="flex items-center gap-5">
                            <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <Bus className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 tracking-tight">{bus.route}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{bus.type} • {bus.departure}</p>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 border-b border-slate-50">
                    <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight">
                      <div className="bg-orange-100 p-2 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      </div>
                      {language === 'en' ? 'Travel Alerts' : 'यात्रा अलर्ट'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="p-6 rounded-[2rem] bg-orange-50 border border-orange-100 relative overflow-hidden group">
                        <div className="relative z-10">
                          <p className="text-sm font-black text-orange-900 mb-2 uppercase tracking-tight">Weather Update: Manali Route</p>
                          <p className="text-xs text-orange-700 font-medium leading-relaxed opacity-80">Expect delays due to heavy snowfall near Rohtang Pass. Safety protocols in place.</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <CloudSun className="w-12 h-12 text-orange-600" />
                        </div>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 relative overflow-hidden group">
                        <div className="relative z-10">
                          <p className="text-sm font-black text-blue-900 mb-2 uppercase tracking-tight">New Route: Shimla to Spiti</p>
                          <p className="text-xs text-blue-700 font-medium leading-relaxed opacity-80">Volvo services now available for the scenic Spiti Valley route. Book now!</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <MapIcon className="w-12 h-12 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tourist Places Preview */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t.touristPlaces}</h3>
                    <p className="text-slate-500 font-medium">Popular destinations in Himachal</p>
                  </div>
                  <Button variant="ghost" className="text-blue-600 font-bold" onClick={() => setActiveTab('explore')}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {TOURIST_PLACES.slice(0, 3).map((place) => (
                    <motion.div 
                      key={place.id}
                      whileHover={{ y: -10 }}
                      className="group cursor-pointer"
                      onClick={() => setActiveTab('explore')}
                    >
                      <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
                        <div className="relative h-56 overflow-hidden">
                          <img 
                            src={place.image} 
                            alt={place.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-6 left-8">
                            <h4 className="text-2xl font-black text-white tracking-tight">{place.name}</h4>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">{place.description}</p>
                          </div>
                          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timetable' && (
            <motion.div
              key="timetable"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">HRTC Bus Timetable</h2>
                  <p className="text-slate-500 font-medium">Official schedules for all HRTC routes</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search routes (e.g. Shimla, Delhi)..." 
                      className="pl-12 py-6 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-blue-500" 
                      value={timetableSearch}
                      onChange={(e) => setTimetableSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white rounded-[2rem]">
                <ScrollArea className="h-[650px] w-full">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="w-[250px] py-6 font-bold text-slate-900">Route</TableHead>
                        <TableHead className="font-bold text-slate-900">Operator</TableHead>
                        <TableHead className="font-bold text-slate-900">Type</TableHead>
                        <TableHead className="font-bold text-slate-900">Departure</TableHead>
                        <TableHead className="font-bold text-slate-900">Arrival</TableHead>
                        <TableHead className="font-bold text-slate-900">Frequency</TableHead>
                        <TableHead className="text-right font-bold text-slate-900 pr-8">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimetable.length > 0 ? (
                        filteredTimetable.map((item) => (
                          <TableRow key={item.id} className="hover:bg-blue-50/30 transition-colors border-slate-50">
                            <TableCell className="py-5">
                              <div className="flex items-center gap-3">
                                <div className="bg-slate-100 p-2 rounded-lg">
                                  <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                                </div>
                                <span className="font-bold text-slate-800">{item.route}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={item.operator === 'HRTC' ? 'default' : 'outline'} 
                                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${item.operator === 'HRTC' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-200 text-slate-600'}`}
                              >
                                {item.operator}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600 font-medium">{item.type}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-blue-700 font-black">
                                <Clock className="w-3.5 h-3.5" />
                                {item.departure}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-500 font-medium">{item.arrival}</TableCell>
                            <TableCell>
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{item.frequency}</span>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                              <Dialog onOpenChange={(open) => !open && handleBookingReset()}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 rounded-xl" 
                                    onClick={() => setSelectedBus({
                                      id: `HR-${item.id}`,
                                      route: item.route,
                                      status: 'On Time',
                                      departure: item.departure,
                                      type: item.type,
                                      price: item.type === 'Volvo' ? 850 : 450
                                    })}
                                  >
                                    Book
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md rounded-[2rem]">
                                  {/* Reusing the same booking flow content */}
                                  <AnimatePresence mode="wait">
                                    {bookingStep === 'seats' && (
                                      <motion.div
                                        key="seats"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                      >
                                        <DialogHeader>
                                          <DialogTitle className="text-2xl font-black">Select Seats</DialogTitle>
                                          <DialogDescription className="font-medium">
                                            {selectedBus?.route} • {selectedBus?.type}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-8">
                                          <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                                            {Array.from({ length: 20 }).map((_, i) => {
                                              const seatNum = i + 1;
                                              const isBooked = i % 7 === 0;
                                              const isSelected = selectedSeats.includes(seatNum);
                                              return (
                                                <button
                                                  key={seatNum}
                                                  type="button"
                                                  disabled={isBooked}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleSeat(seatNum);
                                                  }}
                                                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xs font-black transition-all cursor-pointer
                                                    ${isBooked ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed' : 
                                                      isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-200' : 
                                                      'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50'}
                                                  `}
                                                >
                                                  {seatNum}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="mt-8 flex justify-between items-center px-2">
                                            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-slate-200 rounded" /> Available</div>
                                              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-200 border border-slate-300 rounded" /> Booked</div>
                                              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-600 rounded" /> Selected</div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                          <div className="text-left">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Total Price</p>
                                            <p className="text-2xl font-black text-blue-900">₹{(selectedBus?.price || 0) * selectedSeats.length}</p>
                                          </div>
                                          <Button 
                                            disabled={selectedSeats.length === 0}
                                            className="bg-blue-600 hover:bg-blue-700 px-8 py-6 rounded-2xl font-bold shadow-lg shadow-blue-200"
                                            onClick={() => setBookingStep('payment')}
                                          >
                                            Continue to Pay
                                          </Button>
                                        </div>
                                      </motion.div>
                                    )}

                                    {bookingStep === 'payment' && (
                                      <motion.div
                                        key="payment"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                      >
                                        <DialogHeader>
                                          <DialogTitle className="text-2xl font-black">Payment Method</DialogTitle>
                                          <DialogDescription className="font-medium">Choose how you'd like to pay</DialogDescription>
                                        </DialogHeader>
                                        <div className="py-8 space-y-4">
                                          <div className="grid gap-3">
                                            {[
                                              { id: 'upi', label: 'UPI (GPay, PhonePe)', icon: CreditCard },
                                              { id: 'netbanking', label: 'NetBanking', icon: ArrowRightLeft },
                                              { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                                            ].map((method) => (
                                              <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all
                                                  ${paymentMethod === method.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200'}
                                                `}
                                              >
                                                <div className="flex items-center gap-4">
                                                  <div className={`p-2 rounded-lg ${paymentMethod === method.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    <method.icon className="w-5 h-5" />
                                                  </div>
                                                  <span className="font-bold text-slate-700">{method.label}</span>
                                                </div>
                                                {paymentMethod === method.id && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                                              </button>
                                            ))}
                                          </div>

                                          {paymentMethod === 'netbanking' && (
                                            <motion.div 
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: 'auto' }}
                                              className="pt-4"
                                            >
                                              <Label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Select Bank</Label>
                                              <Select>
                                                <SelectTrigger className="w-full py-6 rounded-xl border-slate-200">
                                                  <SelectValue placeholder="Choose your bank" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                  <SelectItem value="sbi">State Bank of India</SelectItem>
                                                  <SelectItem value="hdfc">HDFC Bank</SelectItem>
                                                  <SelectItem value="icici">ICICI Bank</SelectItem>
                                                  <SelectItem value="pnb">Punjab National Bank</SelectItem>
                                                  <SelectItem value="axis">Axis Bank</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </motion.div>
                                          )}
                                        </div>
                                        <div className="flex gap-3">
                                          <Button variant="ghost" className="flex-1 py-6 rounded-2xl font-bold" onClick={() => setBookingStep('seats')}>Back</Button>
                                          <Button 
                                            disabled={!paymentMethod}
                                            className="flex-[2] bg-blue-600 hover:bg-blue-700 py-6 rounded-2xl font-bold shadow-lg shadow-blue-200"
                                            onClick={() => setBookingStep('success')}
                                          >
                                            Pay ₹{(selectedBus?.price || 0) * selectedSeats.length}
                                          </Button>
                                        </div>
                                      </motion.div>
                                    )}

                                    {bookingStep === 'success' && (
                                      <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-12 text-center space-y-6"
                                      >
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                          <ShieldCheck className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                          <h3 className="text-3xl font-black text-slate-900">Booking Confirmed!</h3>
                                          <p className="text-slate-500 font-medium">Your tickets have been sent to your email.</p>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left space-y-3">
                                          <div className="flex justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Bus</span>
                                            <span className="font-bold text-slate-800">{selectedBus?.id}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Seats</span>
                                            <span className="font-bold text-slate-800">{selectedSeats.join(', ')}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Route</span>
                                            <span className="font-bold text-slate-800">{selectedBus?.route}</span>
                                          </div>
                                        </div>
                                        <Button className="w-full bg-slate-900 py-6 rounded-2xl font-bold" onClick={() => {
                                          handleBookingReset();
                                          setActiveTab('dashboard');
                                        }}>
                                          Back to Home
                                        </Button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                              <Search className="w-10 h-10 opacity-20" />
                              <p className="font-medium">No schedules found for your search.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>

              <div className="p-6 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-blue-800 text-white flex items-start gap-5 shadow-xl shadow-blue-900/10">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-lg tracking-tight">Travel Advisory</p>
                  <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                    Schedules are subject to real-time adjustments based on mountain weather and road conditions. 
                    Private bus timings are updated weekly. For critical journeys, we recommend using the <span className="font-bold underline cursor-pointer" onClick={() => setActiveTab('tracking')}>Live Tracking</span> feature.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Book Your Journey</h2>
                <p className="text-slate-500">Select your destination and travel in comfort</p>
              </div>

              <Card className="p-6 border-none shadow-lg bg-white">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input className="pl-10" placeholder="Source City" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input className="pl-10" placeholder="Destination City" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" defaultValue="2026-04-10" />
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold rounded-2xl shadow-lg shadow-blue-200"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                      <Clock className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <Search className="mr-2 h-5 w-5" />
                  )}
                  {isSearching ? ' Searching...' : ' Search HRTC Buses'}
                </Button>
              </Card>

              {hasSearched && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-slate-800">Available HRTC Buses</h3>
                  {MOCK_BUSES.map((bus) => (
                  <Card key={bus.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="outline" className="mb-2">{bus.type}</Badge>
                            <h4 className="text-xl font-bold text-slate-900">{bus.route}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">₹{bus.price}</p>
                            <p className="text-xs text-slate-500">per person</p>
                          </div>
                        </div>
                        <div className="flex gap-8 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Departs: {bus.departure}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={bus.status === 'On Time' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}>
                              {bus.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-100">
                        <Dialog onOpenChange={(open) => !open && handleBookingReset()}>
                          <DialogTrigger asChild>
                            <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700" onClick={() => setSelectedBus(bus)}>
                              Select Seats
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md rounded-[2rem]">
                            <AnimatePresence mode="wait">
                              {bookingStep === 'seats' && (
                                <motion.div
                                  key="seats"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                >
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">Select Seats</DialogTitle>
                                    <DialogDescription className="font-medium">
                                      {selectedBus?.route} • {selectedBus?.type}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-8">
                                    <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                                      {Array.from({ length: 20 }).map((_, i) => {
                                        const seatNum = i + 1;
                                        const isBooked = i % 7 === 0;
                                        const isSelected = selectedSeats.includes(seatNum);
                                        return (
                                          <button
                                            key={seatNum}
                                            type="button"
                                            disabled={isBooked}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              toggleSeat(seatNum);
                                            }}
                                            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xs font-black transition-all cursor-pointer
                                              ${isBooked ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed' : 
                                                isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-200' : 
                                                'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50'}
                                            `}
                                          >
                                            {seatNum}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <div className="mt-8 flex justify-between items-center px-2">
                                      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-slate-200 rounded" /> Available</div>
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-200 border border-slate-300 rounded" /> Booked</div>
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-600 rounded" /> Selected</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="text-left">
                                      <p className="text-xs font-bold text-slate-400 uppercase">Total Price</p>
                                      <p className="text-2xl font-black text-blue-900">₹{(selectedBus?.price || 0) * selectedSeats.length}</p>
                                    </div>
                                    <Button 
                                      disabled={selectedSeats.length === 0}
                                      className="bg-blue-600 hover:bg-blue-700 px-8 py-6 rounded-2xl font-bold shadow-lg shadow-blue-200"
                                      onClick={() => setBookingStep('payment')}
                                    >
                                      Continue to Pay
                                    </Button>
                                  </div>
                                </motion.div>
                              )}

                              {bookingStep === 'payment' && (
                                <motion.div
                                  key="payment"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                >
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">Payment Method</DialogTitle>
                                    <DialogDescription className="font-medium">Choose how you'd like to pay</DialogDescription>
                                  </DialogHeader>
                                  <div className="py-8 space-y-4">
                                    <div className="grid gap-3">
                                      {[
                                        { id: 'upi', label: 'UPI (GPay, PhonePe)', icon: CreditCard },
                                        { id: 'netbanking', label: 'NetBanking', icon: ArrowRightLeft },
                                        { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                                      ].map((method) => (
                                        <button
                                          key={method.id}
                                          onClick={() => setPaymentMethod(method.id)}
                                          className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all
                                            ${paymentMethod === method.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200'}
                                          `}
                                        >
                                          <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${paymentMethod === method.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                              <method.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-slate-700">{method.label}</span>
                                          </div>
                                          {paymentMethod === method.id && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                                        </button>
                                      ))}
                                    </div>

                                    {paymentMethod === 'netbanking' && (
                                      <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="pt-4"
                                      >
                                        <Label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Select Bank</Label>
                                        <Select>
                                          <SelectTrigger className="w-full py-6 rounded-xl border-slate-200">
                                            <SelectValue placeholder="Choose your bank" />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-xl">
                                            <SelectItem value="sbi">State Bank of India</SelectItem>
                                            <SelectItem value="hdfc">HDFC Bank</SelectItem>
                                            <SelectItem value="icici">ICICI Bank</SelectItem>
                                            <SelectItem value="pnb">Punjab National Bank</SelectItem>
                                            <SelectItem value="axis">Axis Bank</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </motion.div>
                                    )}
                                  </div>
                                  <div className="flex gap-3">
                                    <Button variant="ghost" className="flex-1 py-6 rounded-2xl font-bold" onClick={() => setBookingStep('seats')}>Back</Button>
                                    <Button 
                                      disabled={!paymentMethod}
                                      className="flex-[2] bg-blue-600 hover:bg-blue-700 py-6 rounded-2xl font-bold shadow-lg shadow-blue-200"
                                      onClick={() => setBookingStep('success')}
                                    >
                                      Pay ₹{(selectedBus?.price || 0) * selectedSeats.length}
                                    </Button>
                                  </div>
                                </motion.div>
                              )}

                              {bookingStep === 'success' && (
                                <motion.div
                                  key="success"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="py-12 text-center space-y-6"
                                >
                                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <ShieldCheck className="w-10 h-10" />
                                  </div>
                                  <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-900">Booking Confirmed!</h3>
                                    <p className="text-slate-500 font-medium">Your tickets have been sent to your email.</p>
                                  </div>
                                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-xs font-bold text-slate-400 uppercase">Bus</span>
                                      <span className="font-bold text-slate-800">{selectedBus?.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-xs font-bold text-slate-400 uppercase">Seats</span>
                                      <span className="font-bold text-slate-800">{selectedSeats.join(', ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-xs font-bold text-slate-400 uppercase">Route</span>
                                      <span className="font-bold text-slate-800">{selectedBus?.route}</span>
                                    </div>
                                  </div>
                                  <Button className="w-full bg-slate-900 py-6 rounded-2xl font-bold" onClick={() => {
                                    handleBookingReset();
                                    setActiveTab('dashboard');
                                  }}>
                                    Back to Home
                                  </Button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Live Bus Tracking</h2>
                  <p className="text-slate-500">Real-time GPS location of HRTC fleet</p>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Enter Bus Number (e.g. HR-01)" className="max-w-xs bg-white py-6 rounded-xl" />
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 px-8 rounded-xl font-bold"
                    onClick={handleTrackBus}
                    disabled={isTrackLoading}
                  >
                    {isTrackLoading ? '...' : 'Track'}
                  </Button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 h-[500px] relative overflow-hidden rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50">
                  <MapContainer 
                    center={[31.1048, 77.1734]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {userLocation && (
                      <Marker position={[userLocation.lat, userLocation.lng]}>
                        <Popup>You are here</Popup>
                      </Marker>
                    )}
                    <Marker position={[31.1048, 77.1734]}>
                      <Popup>HR-01 (Shimla Exp)</Popup>
                    </Marker>
                  </MapContainer>
                  
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/50 shadow-2xl flex items-center justify-between z-[1000]">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute opacity-20" />
                        <div className="w-4 h-4 bg-emerald-500 rounded-full relative border-2 border-white shadow-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Current Location: Bilaspur Crossing</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Last updated: 2 mins ago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl font-bold border-slate-200 hover:bg-slate-50" onClick={requestLocation}>
                      Refresh Map
                    </Button>
                  </div>
                </Card>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">Active Buses Nearby</h3>
                  <ScrollArea className="h-[430px]">
                    <div className="space-y-3 pr-4">
                      {MOCK_BUSES.map((bus) => (
                        <Card key={bus.id} className="p-4 border-none shadow-sm hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <Bus className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-slate-900">{bus.id}</p>
                                <Badge variant="secondary" className="text-[10px]">{bus.status}</Badge>
                              </div>
                              <p className="text-xs text-slate-500">{bus.route}</p>
                              <div className="mt-2 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full w-2/3" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Explore Himachal</h2>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto">Discover the hidden gems and popular tourist destinations across the beautiful state of Himachal Pradesh.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TOURIST_PLACES.map((place) => (
                  <motion.div 
                    key={place.id}
                    whileHover={{ y: -10 }}
                    className="group"
                  >
                    <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={place.image} 
                          alt={place.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1 rounded-full">
                            <Camera className="w-3 h-3 mr-1.5" />
                            Photo Spot
                          </Badge>
                        </div>
                        <div className="absolute bottom-6 left-8 right-8">
                          <h4 className="text-2xl font-black text-white mb-1">{place.name}</h4>
                          <p className="text-blue-200 text-sm font-medium">{place.description}</p>
                        </div>
                      </div>
                      <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold uppercase tracking-wider">Himachal Pradesh</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            <span className="text-sm font-black">4.9</span>
                            <span className="text-[10px] font-bold text-slate-400">(2.4k)</span>
                          </div>
                        </div>
                        <Button className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-2xl font-bold transition-all" onClick={() => setActiveTab('booking')}>
                          Book Bus to {place.name}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="bg-blue-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <MapIcon className="w-48 h-48" />
                </div>
                <div className="relative z-10 max-w-2xl space-y-6">
                  <h3 className="text-4xl font-black tracking-tight">Plan Your Custom Trip</h3>
                  <p className="text-blue-100 text-lg leading-relaxed">
                    Not sure where to go? Let our travel experts help you plan the perfect Himachal itinerary. 
                    From adventure sports in Manali to spiritual retreats in Dharamshala.
                  </p>
                  <Button 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-7 rounded-2xl font-black shadow-xl"
                    onClick={() => showNotification("Connecting to HRTC Travel Desk... Please wait.", "info")}
                  >
                    Contact Travel Desk
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'safety' && (
            <motion.div
              key="safety"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-10"
            >
              <div className="text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block p-6 bg-emerald-100 rounded-[2rem] text-emerald-600 mb-2 shadow-inner"
                >
                  <ShieldCheck className="w-16 h-16" />
                </motion.div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.safety}</h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto">
                  {language === 'en' 
                    ? "Your security is our priority. Special features for solo female travelers and emergency support."
                    : "आपकी सुरक्षा हमारी प्राथमिकता है। अकेले यात्रा करने वाली महिलाओं के लिए विशेष सुविधाएँ और आपातकालीन सहायता।"}
                </p>
              </div>

              {/* Women's Safety Special Section */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-xl shadow-pink-900/5 bg-gradient-to-br from-pink-50 to-white rounded-[2rem] border border-pink-100 flex flex-col items-center text-center group">
                  <div className="bg-pink-100 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <h4 className="font-black text-slate-900 mb-2">{t.womenSafety}</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Dedicated support for female passengers traveling alone.</p>
                </Card>
                <Card className="p-6 border-none shadow-xl shadow-purple-900/5 bg-gradient-to-br from-purple-50 to-white rounded-[2rem] border border-purple-100 flex flex-col items-center text-center group">
                  <div className="bg-purple-100 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-black text-slate-900 mb-2">{t.ladiesHelpline}</h4>
                  <p className="text-lg font-black text-purple-700">1091</p>
                  <p className="text-[10px] text-slate-500 font-medium">24/7 Women Helpline Number</p>
                </Card>
                <Card className="p-6 border-none shadow-xl shadow-blue-900/5 bg-gradient-to-br from-blue-50 to-white rounded-[2rem] border border-blue-100 flex flex-col items-center text-center group">
                  <div className="bg-blue-100 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-black text-slate-900 mb-2">{t.nirbhayaSupport}</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Integrated with Nirbhaya framework for rapid response.</p>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-8 border-none shadow-xl shadow-red-900/5 bg-white rounded-[2rem] hover:shadow-2xl transition-all border border-transparent hover:border-red-100 group">
                  <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-xl font-black mb-3 text-slate-900">SOS Emergency</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8">Instantly notify the nearest HRTC control room and local police with your GPS coordinates.</p>
                  <Button variant="destructive" className="w-full py-8 text-lg font-black rounded-2xl shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => showNotification("SOS Alert Sent to Control Room!", "error")}>
                    ACTIVATE SOS
                  </Button>
                </Card>

                <Card className="p-8 border-none shadow-xl shadow-emerald-900/5 bg-white rounded-[2rem] hover:shadow-2xl transition-all border border-transparent hover:border-emerald-100 group">
                  <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Navigation className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black mb-3 text-slate-900">Share Journey</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8">Let your loved ones track your live bus location and estimated arrival time in real-time.</p>
                  <Button variant="outline" className="w-full py-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl font-black transition-all" onClick={() => showNotification("Tracking Link Copied to Clipboard!", "success")}>
                    SHARE LIVE LINK
                  </Button>
                </Card>
              </div>

              {/* Guardian Tracking Section */}
              <Card className="p-8 border-none shadow-xl shadow-blue-900/5 bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldCheck className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">Guardian Mode</h3>
                      <p className="text-blue-200 text-sm font-medium">Safety even if your phone switches off</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                      <p className="text-sm text-blue-100 leading-relaxed">
                        Register your journey with a trusted contact. If your phone goes offline or switches off, 
                        your guardian can still track the **Bus Location** using your Ticket ID.
                      </p>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-blue-300">Guardian Phone Number</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Enter 10-digit number" 
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl py-6"
                            value={guardianNumber}
                            onChange={(e) => setGuardianNumber(e.target.value)}
                          />
                          <Button 
                            className={`${isGuardianActive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'} rounded-xl px-6 font-black`}
                            onClick={() => {
                              if(guardianNumber.length === 10) {
                                setIsGuardianActive(!isGuardianActive);
                                if(!isGuardianActive) showNotification("Guardian Mode Activated! Your journey details sent to " + guardianNumber, "success");
                                else showNotification("Guardian Mode Deactivated", "info");
                              } else {
                                showNotification("Please enter a valid 10-digit number", "error");
                              }
                            }}
                          >
                            {isGuardianActive ? 'ACTIVE' : 'ACTIVATE'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        Offline Tracking Protocol
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 items-start">
                          <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                          <p className="text-xs text-blue-100">App periodically syncs your location to HRTC servers.</p>
                        </div>
                        <div className="flex gap-3 items-start">
                          <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                          <p className="text-xs text-blue-100">If phone dies, the system switches to **Bus GPS Tracking**.</p>
                        </div>
                        <div className="flex gap-3 items-start">
                          <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                          <p className="text-xs text-blue-100">Guardian receives a link to track the bus directly.</p>
                        </div>
                      </div>

                      {isGuardianActive && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase text-blue-300">Last Sync</span>
                            <span className="text-[10px] font-bold text-emerald-400">SUCCESSFUL</span>
                          </div>
                          <p className="text-[11px] font-medium text-blue-100">
                            Location: {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Shimla Sector 4'}
                          </p>
                          <p className="text-[10px] text-blue-300 mt-1 italic">Synced 45 seconds ago</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
                <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-slate-900 tracking-tight">Safety Guidelines</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {(language === 'en' ? [
                    "Always keep your digital ticket ready for verification.",
                    "Do not board or deboard while the bus is in motion.",
                    "Report suspicious activity to the conductor or call 112.",
                    "Women's helpline numbers are active in all HRTC services.",
                    "CCTV surveillance is active for your protection."
                  ] : [
                    "सत्यापन के लिए हमेशा अपना डिजिटल टिकट तैयार रखें।",
                    "बस चलते समय न तो चढ़ें और न ही उतरें।",
                    "संदिग्ध गतिविधि की सूचना कंडक्टर को दें या 112 पर कॉल करें।",
                    "सभी HRTC सेवाओं में महिला हेल्पलाइन नंबर सक्रिय हैं।",
                    "आपकी सुरक्षा के लिए CCTV निगरानी सक्रिय है।"
                  ]).map((tip, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 flex gap-5 items-start hover:bg-slate-50/30 transition-colors"
                    >
                      <div className="bg-blue-600 text-white w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-lg shadow-blue-600/20">
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] border backdrop-blur-md
              ${notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 
                notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : 
                'bg-blue-600/90 border-blue-400 text-white'}
            `}
          >
            {notification.type === 'success' && <ShieldCheck className="w-5 h-5" />}
            {notification.type === 'error' && <ShieldAlert className="w-5 h-5" />}
            {notification.type === 'info' && <Info className="w-5 h-5" />}
            <span className="font-bold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bus className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-slate-900">HRTC</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Himachal Road Transport Corporation is committed to providing safe and reliable transport services across the hills of Himachal.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-blue-600">Home</button></li>
                <li><button onClick={() => setActiveTab('booking')} className="hover:text-blue-600">Book Tickets</button></li>
                <li><button onClick={() => setActiveTab('timetable')} className="hover:text-blue-600">Bus Timings</button></li>
                <li><button onClick={() => setActiveTab('tracking')} className="hover:text-blue-600">Track Bus</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><button className="hover:text-blue-600">Help Center</button></li>
                <li><button className="hover:text-blue-600">Contact Us</button></li>
                <li><button className="hover:text-blue-600">Refund Policy</button></li>
                <li><button className="hover:text-blue-600">Terms of Service</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Emergency</h4>
              <div className="space-y-4">
                <Button variant="destructive" className="w-full" onClick={handleEmergency}>
                  <PhoneCall className="mr-2 h-4 w-4" /> Call 112
                </Button>
                <p className="text-xs text-slate-500">Available 24/7 for passenger assistance and emergency support.</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">© 2026 Himachal Road Transport Corporation. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">Privacy Policy</span>
              <span className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">Cookies</span>
              <span className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">Accessibility</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
