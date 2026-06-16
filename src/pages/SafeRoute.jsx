import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Navigation, MapPin, Clock, Shield, AlertTriangle, ChevronRight, Crosshair } from 'lucide-react';

const DEMO_ROUTES = {
  origin: { lat: 6.9271, lng: 79.8612 },
  destination: { lat: 6.9101, lng: 79.8498 },
  routes: [
    {
      type: 'safest', label: 'Safest Route', description: 'Via Galle Road — well-lit, busy',
      estimated_time: '18 min', safety_rating: 'medium', incidents_nearby: 2,
      tips: ['Well-lit throughout', 'Busy commercial area', 'Police post at Kollupitiya', 'CCTV covered'],
    },
    {
      type: 'fastest', label: 'Fastest Route', description: 'Via Union Place — shorter but quieter',
      estimated_time: '11 min', safety_rating: 'low', incidents_nearby: 5,
      tips: ['Some isolated stretches', 'Less lighting after 9 PM', 'Not recommended at night'],
    },
  ],
  recommendation: 'Take the Safest Route. 2 incidents reported nearby this week.',
};

function RouteCard({ route, selected, onSelect }) {
  const ratingColor = route.safety_rating === 'high'
    ? 'text-green-600 bg-green-50 border-green-200'
    : route.safety_rating === 'medium'
    ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-red-600 bg-red-50 border-red-200';

  const ratingLabel = route.safety_rating === 'high' ? 'Safe' : route.safety_rating === 'medium' ? 'Moderate' : 'Risky';
  const ratingIcon = route.safety_rating === 'high' ? '🟢' : route.safety_rating === 'medium' ? '🟡' : '🔴';

  return (
    <button
      onClick={() => onSelect(route)}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all active:scale-[0.99] ${
        selected ? 'border-violet-500 bg-violet-50' : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-sm">{route.label}</span>
            {route.type === 'safest' && (
              <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full">RECOMMENDED</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{route.description}</p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${ratingColor}`}>
          {ratingIcon} {ratingLabel}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={12} /> {route.estimated_time}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <AlertTriangle size={12} /> {route.incidents_nearby} incidents
        </div>
      </div>
      {selected && (
        <ul className="mt-3 space-y-1.5">
          {route.tips.map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
              <ChevronRight size={12} className="text-violet-500" /> {t}
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}

export default function SafeRoute() {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const useCurrentLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setOrigin(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        toast.success('Current location set');
      },
      () => toast.error('Location permission required')
    );
  };

  const getRoutes = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Parse coords or use demo
      const [oLat, oLng] = origin.includes(',')
        ? origin.split(',').map(Number)
        : [6.9271, 79.8612];
      const [dLat, dLng] = dest.includes(',')
        ? dest.split(',').map(Number)
        : [6.9101, 79.8498];

      const { data } = await axios.post('/api/route/recommend', {
        origin_lat: oLat, origin_lng: oLng,
        dest_lat: dLat, dest_lng: dLng,
      });
      setResult(data);
      setSelectedRoute(data.routes[0]);
    } catch {
      // Demo mode
      setResult(DEMO_ROUTES);
      setSelectedRoute(DEMO_ROUTES.routes[0]);
      toast('Showing demo route data', { icon: 'ℹ️' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Safe Route Finder</h1>
        <p className="text-sm text-gray-500 mt-0.5">Find the safest path to your destination</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Input form */}
        <div className="card space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">From</label>
            <div className="relative">
              <input
                className="input pr-12"
                placeholder="Current location or address"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
              />
              <button
                type="button"
                onClick={useCurrentLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center"
              >
                <Crosshair size={14} className="text-violet-600" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">To</label>
            <input
              className="input"
              placeholder="Destination address"
              value={dest}
              onChange={e => setDest(e.target.value)}
            />
          </div>
          <button
            onClick={getRoutes}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <><Navigation size={18} /> Find Safe Routes</>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Recommendation banner */}
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
              <Shield size={18} className="text-violet-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-violet-800">{result.recommendation}</p>
            </div>

            {/* Route cards */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Choose Your Route</h3>
              <div className="space-y-3">
                {result.routes.map(route => (
                  <RouteCard
                    key={route.type}
                    route={route}
                    selected={selectedRoute?.type === route.type}
                    onSelect={setSelectedRoute}
                  />
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="card overflow-hidden p-0">
              <div className="h-52 bg-gradient-to-br from-violet-100 to-blue-100 flex flex-col items-center justify-center gap-3">
                <MapPin size={32} className="text-violet-400" />
                <p className="text-sm text-violet-600 font-medium">Interactive Map</p>
                <p className="text-xs text-gray-500 px-6 text-center">
                  Connect Google Maps API in .env to show live map routing
                </p>
              </div>
            </div>

            {/* Start navigation */}
            {selectedRoute && (
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <Navigation size={18} /> Start {selectedRoute.label}
              </button>
            )}
          </>
        )}

        {/* Tips */}
        {!result && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Route Safety Tips</h3>
            <ul className="space-y-2.5">
              {[
                'Choose well-lit, busy streets over shortcuts',
                'Plan your route before leaving',
                'Share your destination with trusted contacts',
                'Avoid isolated areas especially at night',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
