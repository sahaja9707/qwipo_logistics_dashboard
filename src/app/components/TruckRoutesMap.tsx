import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

// Hub at Ameerpet — central Hyderabad distribution point
const HUB: [number, number] = [17.4374, 78.4487];

const STOPS: Record<string, { latlng: [number, number]; name: string; deliveries: number }> = {
  hub:          { latlng: HUB,                  name: 'Distribution Hub', deliveries: 0 },
  banjaraHills: { latlng: [17.4156, 78.4347],   name: 'Banjara Hills',    deliveries: 342 },
  jubileeHills: { latlng: [17.4323, 78.4083],   name: 'Jubilee Hills',    deliveries: 278 },
  madhapur:     { latlng: [17.4435, 78.3772],   name: 'Madhapur',         deliveries: 391 },
  gachibowli:   { latlng: [17.4401, 78.3489],   name: 'Gachibowli',       deliveries: 215 },
  mehdipatnam:  { latlng: [17.3934, 78.4381],   name: 'Mehdipatnam',      deliveries: 187 },
  lbNagar:      { latlng: [17.3467, 78.5477],   name: 'LB Nagar',         deliveries: 298 },
  dilsukhnagar: { latlng: [17.3686, 78.5265],   name: 'Dilsukhnagar',     deliveries: 244 },
  secunderabad: { latlng: [17.4399, 78.4983],   name: 'Secunderabad',     deliveries: 319 },
  kompally:     { latlng: [17.5503, 78.4864],   name: 'Kompally',         deliveries: 176 },
  uppal:        { latlng: [17.4050, 78.5598],   name: 'Uppal',            deliveries: 261 },
  tarnaka:      { latlng: [17.4250, 78.5350],   name: 'Tarnaka',          deliveries: 193 },
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  on_track:  { label: 'On Track',  color: '#059669', bg: '#ECFDF5' },
  delayed:   { label: 'Delayed',   color: '#D97706', bg: '#FFFBEB' },
  completed: { label: 'Completed', color: '#4F46E5', bg: '#EEF2FF' },
  anomaly:   { label: 'Anomaly',   color: '#DC2626', bg: '#FEF2F2' },
};

interface RouteData {
  id: string;
  tripId: string;
  driver: string;
  vehicle: string;
  color: string;
  status: string;
  stopIds: string[];
  latlngs: [number, number][];
  stopsComplete: number;
  stopsTotal: number;
  kmLeft: number;
  runtime: string;
  truckAt: [number, number];
}

const ROUTES: RouteData[] = [
  {
    // West corridor: Ameerpet → Banjara Hills → Jubilee Hills → Madhapur
    id: 'A', tripId: 'TRP-3852', driver: 'Ramesh Kumar', vehicle: 'TS-09-EA-7823',
    color: '#6366F1', status: 'on_track',
    stopIds: ['hub', 'banjaraHills', 'jubileeHills', 'madhapur'],
    latlngs: [HUB, [17.4280, 78.4420], [17.4156, 78.4347], [17.4240, 78.4220], [17.4323, 78.4083], [17.4380, 78.3930], [17.4435, 78.3772]],
    stopsComplete: 24, stopsTotal: 38, kmLeft: 18, runtime: '4h 12m',
    truckAt: [17.4240, 78.4220],
  },
  {
    // South-west corridor: Ameerpet → Mehdipatnam → Gachibowli
    id: 'B', tripId: 'TRP-3851', driver: 'Suresh Reddy', vehicle: 'TS-09-EA-4421',
    color: '#F59E0B', status: 'delayed',
    stopIds: ['hub', 'mehdipatnam', 'gachibowli'],
    latlngs: [HUB, [17.4200, 78.4440], [17.3934, 78.4381], [17.4050, 78.4000], [17.4150, 78.3750], [17.4401, 78.3489]],
    stopsComplete: 18, stopsTotal: 32, kmLeft: 27, runtime: '5h 48m',
    truckAt: [17.4050, 78.4000],
  },
  {
    // South-east corridor: Ameerpet → Dilsukhnagar → LB Nagar
    id: 'C', tripId: 'TRP-3850', driver: 'Mahesh Sharma', vehicle: 'TS-09-EB-1234',
    color: '#10B981', status: 'completed',
    stopIds: ['hub', 'dilsukhnagar', 'lbNagar'],
    latlngs: [HUB, [17.4200, 78.4700], [17.4000, 78.4950], [17.3686, 78.5265], [17.3560, 78.5380], [17.3467, 78.5477]],
    stopsComplete: 31, stopsTotal: 31, kmLeft: 0, runtime: '6h 02m',
    truckAt: [17.3467, 78.5477],
  },
  {
    // North corridor: Ameerpet → Secunderabad → Kompally
    id: 'D', tripId: 'TRP-3849', driver: 'Rajesh Verma', vehicle: 'TS-09-EA-9910',
    color: '#0891B2', status: 'on_track',
    stopIds: ['hub', 'secunderabad', 'kompally'],
    latlngs: [HUB, [17.4387, 78.4700], [17.4399, 78.4983], [17.4700, 78.4920], [17.5100, 78.4890], [17.5503, 78.4864]],
    stopsComplete: 8, stopsTotal: 28, kmLeft: 52, runtime: '1h 55m',
    truckAt: [17.4700, 78.4920],
  },
  {
    // East corridor: Ameerpet → Tarnaka → Uppal
    id: 'E', tripId: 'TRP-3848', driver: 'Anand Singh', vehicle: 'TS-09-EB-5678',
    color: '#EF4444', status: 'anomaly',
    stopIds: ['hub', 'tarnaka', 'uppal'],
    latlngs: [HUB, [17.4350, 78.4800], [17.4300, 78.5100], [17.4250, 78.5350], [17.4150, 78.5480], [17.4050, 78.5598]],
    stopsComplete: 22, stopsTotal: 26, kmLeft: 8, runtime: '7h 14m',
    truckAt: [17.4300, 78.5100],
  },
];

function makeTruckIcon(color: string, label: string, pulsing: boolean): L.DivIcon {
  const pulse = pulsing
    ? `<circle cx="16" cy="16" r="14" fill="none" stroke="${color}" stroke-width="2" opacity="0.5">
        <animate attributeName="r" from="14" to="26" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite"/>
       </circle>`
    : '';
  const html = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    ${pulse}
    <circle cx="16" cy="16" r="11" fill="${color}" stroke="white" stroke-width="2.5"/>
    <text x="16" y="20.5" text-anchor="middle" fill="white" font-size="10" font-weight="800" font-family="system-ui,sans-serif">${label}</text>
  </svg>`;
  return L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
}

function makeHubIcon(): L.DivIcon {
  const html = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="16" fill="#6366F1" opacity="0.18"/>
    <circle cx="18" cy="18" r="10" fill="#6366F1" stroke="white" stroke-width="2.5"/>
    <circle cx="18" cy="18" r="4" fill="white"/>
  </svg>`;
  return L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
}

interface LayerSet {
  polyline: L.Polyline;
  stops: L.CircleMarker[];
  truck: L.Marker;
}

export default function TruckRoutesMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Record<string, LayerSet>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  // Keep ref in sync with state for use inside Leaflet event handlers
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Fix default icon path issue with bundlers
    (L.Icon.Default.prototype as any)._getIconUrl = undefined;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(containerRef.current, { zoomControl: true }).setView(HUB, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Hub marker
    L.marker(HUB, { icon: makeHubIcon() })
      .addTo(map)
      .bindPopup('<strong>Distribution Hub</strong><br>Ameerpet, Hyderabad');

    // Route layers
    ROUTES.forEach(route => {
      const polyline = L.polyline(route.latlngs, {
        color: route.color,
        weight: 4,
        opacity: 0.9,
        dashArray: route.status === 'completed' ? '10 6' : undefined,
      }).addTo(map);

      polyline.bindTooltip(
        `<strong style="color:${route.color}">Route ${route.id} · ${route.tripId}</strong><br>
         ${route.driver} · ${route.vehicle}<br>
         <span style="color:${STATUS_CFG[route.status].color}">${STATUS_CFG[route.status].label}</span>
         &nbsp;·&nbsp; ${route.stopsComplete}/${route.stopsTotal} stops`,
        { sticky: true }
      );

      polyline.on('click', () => {
        const cur = selectedRef.current;
        setSelected(cur === route.id ? null : route.id);
      });
      polyline.on('mouseover', () => polyline.setStyle({ weight: 6 }));
      polyline.on('mouseout', () => {
        polyline.setStyle({ weight: selectedRef.current === route.id ? 6 : 4 });
      });

      // Stop markers
      const stops = route.stopIds
        .filter(s => s !== 'hub')
        .map(stopId => {
          const stop = STOPS[stopId];
          return L.circleMarker(stop.latlng, {
            radius: 6,
            color: route.color,
            weight: 2,
            fillColor: '#fff',
            fillOpacity: 1,
          })
            .addTo(map)
            .bindTooltip(`<strong>${stop.name}</strong> — ${stop.deliveries} deliveries`);
        });

      // Truck marker
      const truck = L.marker(route.truckAt, {
        icon: makeTruckIcon(route.color, route.id, route.status !== 'completed'),
      })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:180px">
            <div style="font-weight:700;color:${route.color};margin-bottom:4px">Route ${route.id} · ${route.tripId}</div>
            <div style="color:#475569;margin-bottom:2px">${route.driver}</div>
            <div style="color:#94A3B8;font-size:11px;margin-bottom:6px">${route.vehicle}</div>
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span>${route.stopsComplete}/${route.stopsTotal} stops</span>
              <span style="color:${STATUS_CFG[route.status].color}">${STATUS_CFG[route.status].label}</span>
            </div>
            ${route.kmLeft > 0 ? `<div style="font-size:11px;color:#94A3B8;margin-top:2px">${route.kmLeft} km · ${route.runtime}</div>` : ''}
          </div>`
        );

      truck.on('click', () => {
        const cur = selectedRef.current;
        setSelected(cur === route.id ? null : route.id);
      });

      layersRef.current[route.id] = { polyline, stops, truck };
    });

    // Fit all routes
    const allPoints = ROUTES.flatMap(r => r.latlngs);
    map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 13 });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = {};
    };
  }, []);

  // Update layer visibility / weight when selection changes
  useEffect(() => {
    if (!mapRef.current) return;

    ROUTES.forEach(route => {
      const layers = layersRef.current[route.id];
      if (!layers) return;
      const active = selected === null || selected === route.id;
      const opacity = active ? 0.9 : 0.12;
      const weight = selected === route.id ? 6 : 4;

      layers.polyline.setStyle({ opacity, weight });
      layers.stops.forEach(m => m.setStyle({ opacity: active ? 1 : 0.15 }));
      const el = layers.truck.getElement();
      if (el) (el as HTMLElement).style.opacity = active ? '1' : '0.12';
    });

    // Zoom to selection
    if (selected) {
      const route = ROUTES.find(r => r.id === selected);
      if (route && mapRef.current) {
        mapRef.current.fitBounds(L.latLngBounds(route.latlngs), { padding: [50, 50], maxZoom: 13 });
      }
    } else if (mapRef.current) {
      const allPoints = ROUTES.flatMap(r => r.latlngs);
      mapRef.current.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 13 });
    }
  }, [selected]);

  const selRoute = selected ? ROUTES.find(r => r.id === selected) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <div>
          <div className="text-slate-800 text-sm font-semibold">Live Route Map</div>
          <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>
            {ROUTES.length} active routes across Hyderabad · click a route or truck marker to inspect
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {ROUTES.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(prev => prev === r.id ? null : r.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all"
              style={{
                background: selected === r.id ? r.color : `${r.color}18`,
                border: `1px solid ${r.color}60`,
                fontSize: '11px',
                color: selected === r.id ? '#fff' : r.color,
                fontWeight: 600,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: selected === r.id ? '#fff' : r.color }} />
              {r.id} · {r.driver.split(' ')[0]}
            </button>
          ))}
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="text-slate-400 hover:text-slate-600 px-2 py-1 rounded-full transition-colors"
              style={{ fontSize: '11px', background: '#F1F5F9' }}
            >
              ✕ All
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div ref={containerRef} style={{ height: 420, position: 'relative', zIndex: 0 }} />

      {/* Selected route detail panel */}
      {selRoute && (() => {
        const sc = STATUS_CFG[selRoute.status];
        const pct = Math.round((selRoute.stopsComplete / selRoute.stopsTotal) * 100);
        return (
          <div style={{ borderTop: `2px solid ${selRoute.color}50`, background: `${selRoute.color}06` }}>
            <div className="px-5 py-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: selRoute.color }} />
                    <span className="font-bold text-slate-800" style={{ fontSize: '13px' }}>
                      Route {selRoute.id} — {selRoute.tripId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-medium"
                      style={{ background: sc.bg, color: sc.color, fontSize: '10px' }}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="text-slate-500" style={{ fontSize: '11px' }}>
                    {selRoute.driver} · {selRoute.vehicle}
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="text-slate-300 hover:text-slate-500 transition-colors"
                  style={{ fontSize: '18px' }}>✕</button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                {[
                  { label: 'Stops Done', val: `${selRoute.stopsComplete} / ${selRoute.stopsTotal}` },
                  { label: 'Progress',   val: `${pct}%` },
                  { label: 'KM Left',    val: selRoute.kmLeft > 0 ? `${selRoute.kmLeft} km` : '—' },
                  { label: 'Runtime',    val: selRoute.runtime },
                  { label: 'Route',      val: selRoute.stopIds.map(s => STOPS[s]?.name.split(' ')[0] ?? s).join(' → ') },
                ].map(item => (
                  <div key={item.label} className="rounded-lg px-3 py-2"
                    style={{ background: `${selRoute.color}12`, border: `1px solid ${selRoute.color}25` }}>
                    <div className="text-slate-400" style={{ fontSize: '10px' }}>{item.label}</div>
                    <div className="font-semibold text-slate-700 mt-0.5"
                      style={{ fontSize: item.label === 'Route' ? '10px' : '13px' }}>
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: '#F1F5F9' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: selRoute.color }} />
                </div>
                <span className="font-semibold flex-shrink-0"
                  style={{ fontSize: '11px', color: selRoute.color }}>
                  {pct}% complete
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="px-5 py-3 flex items-center gap-5 flex-wrap"
        style={{ borderTop: '1px solid #F1F5F9', background: '#FAFBFC' }}>
        <span className="text-slate-400 font-medium"
          style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Routes
        </span>
        {ROUTES.map(r => {
          const sc = STATUS_CFG[r.status];
          return (
            <button
              key={r.id}
              onClick={() => setSelected(prev => prev === r.id ? null : r.id)}
              className="flex items-center gap-1.5 hover:opacity-80 transition-all"
              style={{ fontSize: '11px', color: '#475569' }}
            >
              <span className="inline-block rounded-full"
                style={{ width: 10, height: 10, background: r.color, flexShrink: 0 }} />
              <span className="font-medium" style={{ color: r.color }}>Route {r.id}</span>
              <span className="text-slate-300">·</span>
              <span>{r.driver.split(' ')[0]}</span>
              <span className="px-1.5 py-0.5 rounded"
                style={{ background: sc.bg, color: sc.color, fontSize: '9px' }}>
                {sc.label}
              </span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-3" style={{ fontSize: '10px', color: '#94A3B8' }}>
          <span>Dashed = completed route</span>
          <span>·</span>
          <span>Pulsing marker = active truck</span>
        </div>
      </div>
    </div>
  );
}
