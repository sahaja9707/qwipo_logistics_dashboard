// Central mock data and filter helper functions for the Qwipo dashboard

export interface GlobalFilters {
  company: string;
  state: string;
  city: string;
  distributor: string;
  dateFrom: Date;
  dateTo: Date;
}

export function defaultFilters(): GlobalFilters {
  const now = new Date();
  return {
    company: '',
    state: '',
    city: '',
    distributor: '',
    dateFrom: new Date(now.getFullYear(), now.getMonth(), 1),
    dateTo: now,
  };
}

// ─── Reference data ────────────────────────────────────────────────────────────

export const COMPANIES = ['ITC', 'HUL (Hindustan Unilever)', 'Nestlé', 'Britannia', 'Dabur'];

export const STATE_CITIES: Record<string, string[]> = {
  'Telangana':   ['Hyderabad', 'Secunderabad', 'Warangal', 'Karimnagar'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'Karnataka':   ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru'],
  'Tamil Nadu':  ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
  'Delhi NCR':   ['New Delhi', 'Gurugram', 'Noida', 'Faridabad'],
  'Gujarat':     ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol'],
};

// City → State lookup (derived from STATE_CITIES)
export const CITY_STATE: Record<string, string> = Object.entries(STATE_CITIES).reduce(
  (acc, [state, cities]) => {
    cities.forEach(city => { acc[city] = state; });
    return acc;
  },
  {} as Record<string, string>
);

// All cities flat list
export const ALL_CITIES = Object.values(STATE_CITIES).flat();

export const DISTRIBUTOR_CODES = [
  'DIS-HYD-004', 'DIS-KRN-001', 'DIS-MUM-012', 'DIS-BAN-007',
  'DIS-CHN-003', 'DIS-DEL-009', 'DIS-PUN-015', 'DIS-AHM-006',
];

const DIST_LOCATION: Record<string, { state: string; city: string }> = {
  'DIS-HYD-004': { state: 'Telangana',   city: 'Hyderabad'  },
  'DIS-KRN-001': { state: 'Telangana',   city: 'Karimnagar' },
  'DIS-MUM-012': { state: 'Maharashtra', city: 'Mumbai'     },
  'DIS-BAN-007': { state: 'Karnataka',   city: 'Bengaluru'  },
  'DIS-CHN-003': { state: 'Tamil Nadu',  city: 'Chennai'    },
  'DIS-DEL-009': { state: 'Delhi NCR',   city: 'New Delhi'  },
  'DIS-PUN-015': { state: 'Maharashtra', city: 'Pune'       },
  'DIS-AHM-006': { state: 'Gujarat',     city: 'Ahmedabad'  },
};

/** Get distributor codes available for a given city (or all if no city) */
export function getDistributorsForCity(city: string): string[] {
  if (!city) return DISTRIBUTOR_CODES;
  return DISTRIBUTOR_CODES.filter(code => DIST_LOCATION[code]?.city === city);
}

/** Get distributor codes available for a given state (or all if no state) */
export function getDistributorsForState(state: string): string[] {
  if (!state) return DISTRIBUTOR_CODES;
  return DISTRIBUTOR_CODES.filter(code => DIST_LOCATION[code]?.state === state);
}

// ─── Company-level KPI snapshots ───────────────────────────────────────────────

export interface CompanySnapshot {
  totalOrders: number;
  fulfilledOrders: number;
  pendingOrders: number;
  returnedOrders: number;
  cancelledOrders: number;
  invoiceValue: string;
  invoiceValueNum: number;
  returnRate: number;
  vehicleUtil: number;
  timeUtil: number;
  dpUtil: number;
  avgVehicles: string;
  avgRunTime: string;
  plannedKm: number;
  liveKm: number;
  uniqueCustomers: number;
}

const COMPANY_SNAPSHOTS: Record<string, CompanySnapshot> = {
  'ITC': {
    totalOrders: 2714, fulfilledOrders: 2498, pendingOrders: 186, returnedOrders: 157, cancelledOrders: 59,
    invoiceValue: '₹48.2L', invoiceValueNum: 48.2, returnRate: 5.8,
    vehicleUtil: 84, timeUtil: 76, dpUtil: 91, avgVehicles: '87 / 96', avgRunTime: '5h 47m',
    plannedKm: 14820, liveKm: 15340, uniqueCustomers: 1842,
  },
  'HUL (Hindustan Unilever)': {
    totalOrders: 3284, fulfilledOrders: 3098, pendingOrders: 142, returnedOrders: 138, cancelledOrders: 44,
    invoiceValue: '₹62.7L', invoiceValueNum: 62.7, returnRate: 4.2,
    vehicleUtil: 88, timeUtil: 82, dpUtil: 93, avgVehicles: '104 / 116', avgRunTime: '5h 22m',
    plannedKm: 17640, liveKm: 18110, uniqueCustomers: 2214,
  },
  'Nestlé': {
    totalOrders: 1847, fulfilledOrders: 1686, pendingOrders: 98, returnedOrders: 113, cancelledOrders: 50,
    invoiceValue: '₹37.9L', invoiceValueNum: 37.9, returnRate: 6.1,
    vehicleUtil: 79, timeUtil: 71, dpUtil: 87, avgVehicles: '61 / 80', avgRunTime: '6h 05m',
    plannedKm: 11240, liveKm: 11890, uniqueCustomers: 1320,
  },
  'Britannia': {
    totalOrders: 2108, fulfilledOrders: 1952, pendingOrders: 124, returnedOrders: 112, cancelledOrders: 44,
    invoiceValue: '₹41.3L', invoiceValueNum: 41.3, returnRate: 5.3,
    vehicleUtil: 81, timeUtil: 74, dpUtil: 89, avgVehicles: '74 / 88', avgRunTime: '5h 58m',
    plannedKm: 12980, liveKm: 13450, uniqueCustomers: 1560,
  },
  'Dabur': {
    totalOrders: 1423, fulfilledOrders: 1271, pendingOrders: 108, returnedOrders: 102, cancelledOrders: 51,
    invoiceValue: '₹28.6L', invoiceValueNum: 28.6, returnRate: 7.2,
    vehicleUtil: 73, timeUtil: 68, dpUtil: 82, avgVehicles: '52 / 72', avgRunTime: '6h 18m',
    plannedKm: 9120, liveKm: 9680, uniqueCustomers: 980,
  },
};

const DEFAULT_SNAPSHOT: CompanySnapshot = {
  totalOrders: 11376, fulfilledOrders: 10505, pendingOrders: 658, returnedOrders: 622, cancelledOrders: 248,
  invoiceValue: '₹218.7L', invoiceValueNum: 218.7, returnRate: 5.5,
  vehicleUtil: 81, timeUtil: 74, dpUtil: 88, avgVehicles: '378 / 452', avgRunTime: '5h 54m',
  plannedKm: 65800, liveKm: 68470, uniqueCustomers: 7916,
};

function scaleSnapshot(base: CompanySnapshot, scale: number, vehicleStr: string): CompanySnapshot {
  return {
    ...base,
    totalOrders: Math.round(base.totalOrders * scale),
    fulfilledOrders: Math.round(base.fulfilledOrders * scale),
    pendingOrders: Math.round(base.pendingOrders * scale),
    returnedOrders: Math.round(base.returnedOrders * scale),
    cancelledOrders: Math.round(base.cancelledOrders * scale),
    invoiceValue: `₹${(base.invoiceValueNum * scale).toFixed(1)}L`,
    invoiceValueNum: parseFloat((base.invoiceValueNum * scale).toFixed(1)),
    uniqueCustomers: Math.round(base.uniqueCustomers * scale),
    avgVehicles: vehicleStr,
  };
}

export function getSnapshotForFilters(filters: GlobalFilters): CompanySnapshot {
  const base = filters.company ? (COMPANY_SNAPSHOTS[filters.company] ?? DEFAULT_SNAPSHOT) : DEFAULT_SNAPSHOT;

  if (filters.distributor) {
    return scaleSnapshot(base, 0.125, '11 / 12');
  }
  if (filters.state) {
    const stateDists = Object.values(DIST_LOCATION).filter(d => d.state === filters.state).length;
    const scale = stateDists / DISTRIBUTOR_CODES.length;
    const vCount = Math.round(12 * stateDists);
    return scaleSnapshot(base, scale, `${vCount} / ${vCount + 4}`);
  }
  return base;
}

// ─── Distributor performance ───────────────────────────────────────────────────

export interface DistributorPerf {
  code: string;
  name: string;
  state: string;
  city: string;
  orders: number;
  fulfilled: number;
  returned: number;
  cancelled: number;
  invoiceL: number;
  returnRate: number;
  vehicles: number;
  vehicleUtil: number;
}

const BASE_DISTRIBUTOR_PERF: DistributorPerf[] = [
  { code: 'DIS-HYD-004', name: 'Hyderabad Central', state: 'Telangana',   city: 'Hyderabad',  orders: 384, fulfilled: 358, returned: 22, cancelled: 4, invoiceL: 7.2, returnRate: 5.7,  vehicles: 12, vehicleUtil: 87 },
  { code: 'DIS-KRN-001', name: 'Karimnagar Dist.',  state: 'Telangana',   city: 'Karimnagar', orders: 271, fulfilled: 248, returned: 18, cancelled: 5, invoiceL: 5.1, returnRate: 6.6,  vehicles: 9,  vehicleUtil: 79 },
  { code: 'DIS-MUM-012', name: 'Mumbai Metro Dist.',state: 'Maharashtra', city: 'Mumbai',     orders: 512, fulfilled: 487, returned: 21, cancelled: 4, invoiceL: 9.4, returnRate: 4.1,  vehicles: 16, vehicleUtil: 91 },
  { code: 'DIS-BAN-007', name: 'Bengaluru North',   state: 'Karnataka',   city: 'Bengaluru',  orders: 447, fulfilled: 416, returned: 26, cancelled: 5, invoiceL: 8.2, returnRate: 5.8,  vehicles: 14, vehicleUtil: 88 },
  { code: 'DIS-CHN-003', name: 'Chennai East Dist.',state: 'Tamil Nadu',  city: 'Chennai',    orders: 318, fulfilled: 296, returned: 17, cancelled: 5, invoiceL: 5.9, returnRate: 5.3,  vehicles: 10, vehicleUtil: 82 },
  { code: 'DIS-DEL-009', name: 'Delhi NCR Dist.',   state: 'Delhi NCR',   city: 'New Delhi',  orders: 398, fulfilled: 371, returned: 20, cancelled: 7, invoiceL: 7.6, returnRate: 5.0,  vehicles: 13, vehicleUtil: 86 },
  { code: 'DIS-PUN-015', name: 'Pune Dist.',        state: 'Maharashtra', city: 'Pune',       orders: 224, fulfilled: 205, returned: 14, cancelled: 5, invoiceL: 4.1, returnRate: 6.3,  vehicles: 7,  vehicleUtil: 76 },
  { code: 'DIS-AHM-006', name: 'Ahmedabad Dist.',   state: 'Gujarat',     city: 'Ahmedabad',  orders: 160, fulfilled: 147, returned: 10, cancelled: 3, invoiceL: 2.9, returnRate: 6.3,  vehicles: 6,  vehicleUtil: 72 },
];

export function getFilteredDistributorPerf(filters: GlobalFilters): DistributorPerf[] {
  let result = [...BASE_DISTRIBUTOR_PERF];
  if (filters.state)       result = result.filter(d => d.state === filters.state);
  if (filters.city)        result = result.filter(d => d.city  === filters.city);
  if (filters.distributor) result = result.filter(d => d.code  === filters.distributor);

  if (filters.company) {
    const snap = COMPANY_SNAPSHOTS[filters.company];
    const scale = snap ? snap.totalOrders / DEFAULT_SNAPSHOT.totalOrders : 1;
    result = result.map(d => ({
      ...d,
      orders:    Math.round(d.orders    * scale),
      fulfilled: Math.round(d.fulfilled * scale),
      returned:  Math.round(d.returned  * scale),
      cancelled: Math.round(d.cancelled * scale),
      invoiceL:  parseFloat((d.invoiceL * scale).toFixed(1)),
    }));
  }
  return result;
}

// ─── Delivery Aging heatmap ────────────────────────────────────────────────────

export interface HeatmapRow { label: string; values: Record<string, number> }

const HEATMAP_BASE: Array<{ label: string; vals: number[] }> = [
  { label: 'D0 — Same Day', vals: [245, 142, 187, 163, 114, 147, 82,  58] },
  { label: 'D1 — Next Day', vals: [112,  89, 124, 108,  77,  96, 51,  36] },
  { label: 'D2 — 2 Days',   vals: [48,   62,  68,  57,  41,  52, 28,  19] },
  { label: 'D3 — 3 Days',   vals: [14,   18,  31,  26,  18,  24, 13,   9] },
  { label: 'D4+ — Overdue', vals: [4,    14,  12,  10,   7,   9,  5,   3] },
];

export function getAgingHeatmapData(filters: GlobalFilters): { codes: string[]; rows: HeatmapRow[] } {
  let codes = [...DISTRIBUTOR_CODES];

  if (filters.distributor) {
    codes = [filters.distributor];
  } else if (filters.state) {
    codes = codes.filter(c => DIST_LOCATION[c]?.state === filters.state);
    if (filters.city) codes = codes.filter(c => DIST_LOCATION[c]?.city === filters.city);
  }

  const companyScale = filters.company
    ? (COMPANY_SNAPSHOTS[filters.company]?.totalOrders ?? DEFAULT_SNAPSHOT.totalOrders) / DEFAULT_SNAPSHOT.totalOrders
    : 1;

  const rows: HeatmapRow[] = HEATMAP_BASE.map(({ label, vals }) => ({
    label,
    values: Object.fromEntries(
      codes.map(code => {
        const idx = DISTRIBUTOR_CODES.indexOf(code);
        const base = vals[idx >= 0 ? idx : 0];
        return [code, Math.round(base * companyScale)];
      })
    ),
  }));

  return { codes, rows };
}

// ─── Order trend ───────────────────────────────────────────────────────────────

export interface OrderTrendPoint { date: string; orders: number; totalPrice: number }

// Deterministic variation pattern (day index → multiplier)
const DAY_PATTERNS = [0.91, 0.87, 1.05, 1.08, 0.97, 1.03, 0.95, 0.88, 1.02, 1.07,
                      0.94, 0.99, 1.04, 0.90, 0.86, 1.06, 1.09, 0.98, 1.01, 0.93,
                      0.89, 1.03, 1.07, 0.96, 1.00, 0.92, 0.85, 1.04, 1.08, 0.97];

export function getOrderTrend(filters: GlobalFilters): OrderTrendPoint[] {
  const snap = filters.company ? (COMPANY_SNAPSHOTS[filters.company] ?? DEFAULT_SNAPSHOT) : DEFAULT_SNAPSHOT;

  const msRange = filters.dateTo.getTime() - filters.dateFrom.getTime();
  const days = Math.max(7, Math.min(30, Math.ceil(msRange / 86400000) + 1));

  let baseOrders = Math.round(snap.totalOrders / 30);
  let basePrice  = snap.invoiceValueNum / 30;

  if (filters.distributor) {
    baseOrders = Math.round(baseOrders / 8);
    basePrice  = parseFloat((basePrice  / 8).toFixed(2));
  } else if (filters.state) {
    const n = Object.values(DIST_LOCATION).filter(d => d.state === filters.state).length;
    const s = n / DISTRIBUTOR_CODES.length;
    baseOrders = Math.round(baseOrders * s);
    basePrice  = parseFloat((basePrice  * s).toFixed(2));
  }

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(filters.dateTo);
    d.setDate(d.getDate() - (days - 1 - i));
    const dow = d.getDay();
    const weekendFactor = dow === 0 ? 0.55 : dow === 6 ? 0.78 : 1.0;
    const noise = DAY_PATTERNS[i % DAY_PATTERNS.length];
    const orders = Math.round(baseOrders * weekendFactor * noise);
    return {
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      orders,
      totalPrice: parseFloat((basePrice * weekendFactor * noise).toFixed(1)),
    };
  });
}

// ─── Drivers ───────────────────────────────────────────────────────────────────

export interface Driver {
  rank: number; name: string; vehicle: string;
  distributor: string; state: string; city: string;
  attempts: number; returns: number; netSale: string;
  contribution: number; returnPct: number; successRate: number; runtime: string;
}

const ALL_DRIVERS: Driver[] = [
  { rank: 1,  name: 'Ramesh Kumar',  vehicle: 'TS-09-EA-7823', distributor: 'DIS-HYD-004', state: 'Telangana',   city: 'Hyderabad',  attempts: 38, returns: 2, netSale: '₹8.4L', contribution: 12.3, returnPct: 5.3,  successRate: 94.7, runtime: '5h 12m' },
  { rank: 2,  name: 'Suresh Patil',  vehicle: 'TS-09-EA-4421', distributor: 'DIS-HYD-004', state: 'Telangana',   city: 'Hyderabad',  attempts: 36, returns: 3, netSale: '₹7.9L', contribution: 11.6, returnPct: 8.3,  successRate: 91.7, runtime: '5h 48m' },
  { rank: 3,  name: 'Mahesh Sharma', vehicle: 'TS-09-AB-1234', distributor: 'DIS-HYD-004', state: 'Telangana',   city: 'Hyderabad',  attempts: 34, returns: 1, netSale: '₹7.6L', contribution: 11.1, returnPct: 2.9,  successRate: 97.1, runtime: '6h 02m' },
  { rank: 4,  name: 'Rajesh Verma',  vehicle: 'TS-09-EA-9910', distributor: 'DIS-KRN-001', state: 'Telangana',   city: 'Karimnagar', attempts: 33, returns: 4, netSale: '₹7.1L', contribution: 10.4, returnPct: 12.1, successRate: 87.9, runtime: '5h 20m' },
  { rank: 5,  name: 'Anand Singh',   vehicle: 'TS-09-AB-5678', distributor: 'DIS-KRN-001', state: 'Telangana',   city: 'Karimnagar', attempts: 31, returns: 2, netSale: '₹6.8L', contribution: 9.9,  returnPct: 6.5,  successRate: 93.5, runtime: '7h 14m' },
  { rank: 6,  name: 'Vikram Nair',   vehicle: 'MH-12-MG-3312', distributor: 'DIS-MUM-012', state: 'Maharashtra', city: 'Mumbai',     attempts: 30, returns: 5, netSale: '₹6.4L', contribution: 9.4,  returnPct: 16.7, successRate: 83.3, runtime: '4h 55m' },
  { rank: 7,  name: 'Prakash Rao',   vehicle: 'MH-12-MG-9012', distributor: 'DIS-MUM-012', state: 'Maharashtra', city: 'Mumbai',     attempts: 28, returns: 1, netSale: '₹6.1L', contribution: 8.9,  returnPct: 3.6,  successRate: 96.4, runtime: '4h 38m' },
  { rank: 8,  name: 'Arun Krishnan', vehicle: 'KA-03-MG-4521', distributor: 'DIS-BAN-007', state: 'Karnataka',   city: 'Bengaluru',  attempts: 42, returns: 3, netSale: '₹9.1L', contribution: 13.2, returnPct: 7.1,  successRate: 92.9, runtime: '5h 35m' },
  { rank: 9,  name: 'Deepak Gupta',  vehicle: 'KA-03-MG-7834', distributor: 'DIS-BAN-007', state: 'Karnataka',   city: 'Bengaluru',  attempts: 39, returns: 6, netSale: '₹8.2L', contribution: 11.9, returnPct: 15.4, successRate: 84.6, runtime: '5h 10m' },
  { rank: 10, name: 'Sanjay Mehra',  vehicle: 'TN-22-CN-1122', distributor: 'DIS-CHN-003', state: 'Tamil Nadu',  city: 'Chennai',    attempts: 35, returns: 2, netSale: '₹7.4L', contribution: 10.8, returnPct: 5.7,  successRate: 94.3, runtime: '5h 50m' },
  { rank: 11, name: 'Ravi Shankar',  vehicle: 'TN-22-CN-5566', distributor: 'DIS-CHN-003', state: 'Tamil Nadu',  city: 'Chennai',    attempts: 29, returns: 4, netSale: '₹6.0L', contribution: 8.7,  returnPct: 13.8, successRate: 86.2, runtime: '6h 22m' },
  { rank: 12, name: 'Manish Tiwari', vehicle: 'DL-01-AB-7890', distributor: 'DIS-DEL-009', state: 'Delhi NCR',   city: 'New Delhi',  attempts: 44, returns: 2, netSale: '₹9.6L', contribution: 14.0, returnPct: 4.5,  successRate: 95.5, runtime: '5h 00m' },
  { rank: 13, name: 'Ajay Kapoor',   vehicle: 'DL-01-AB-3344', distributor: 'DIS-DEL-009', state: 'Delhi NCR',   city: 'New Delhi',  attempts: 37, returns: 3, netSale: '₹8.0L', contribution: 11.6, returnPct: 8.1,  successRate: 91.9, runtime: '5h 42m' },
  { rank: 14, name: 'Pradeep Joshi', vehicle: 'MH-12-PQ-2233', distributor: 'DIS-PUN-015', state: 'Maharashtra', city: 'Pune',       attempts: 26, returns: 3, netSale: '₹5.5L', contribution: 8.0,  returnPct: 11.5, successRate: 88.5, runtime: '6h 10m' },
  { rank: 15, name: 'Nilesh Patil',  vehicle: 'GJ-01-RR-4455', distributor: 'DIS-AHM-006', state: 'Gujarat',     city: 'Ahmedabad',  attempts: 22, returns: 2, netSale: '₹4.8L', contribution: 7.0,  returnPct: 9.1,  successRate: 90.9, runtime: '5h 30m' },
  { rank: 16, name: 'Kiran Shah',    vehicle: 'GJ-01-RR-6677', distributor: 'DIS-AHM-006', state: 'Gujarat',     city: 'Ahmedabad',  attempts: 18, returns: 2, netSale: '₹3.9L', contribution: 5.7,  returnPct: 11.1, successRate: 88.9, runtime: '5h 45m' },
];

export function getFilteredDrivers(filters: GlobalFilters): Driver[] {
  let result = [...ALL_DRIVERS];
  if (filters.distributor)      result = result.filter(d => d.distributor === filters.distributor);
  else if (filters.city)        result = result.filter(d => d.city        === filters.city);
  else if (filters.state)       result = result.filter(d => d.state       === filters.state);
  return result.map((d, i) => ({ ...d, rank: i + 1 }));
}

// ─── Category contribution per company ────────────────────────────────────────

export interface CategoryData { name: string; value: number; color: string; revenue: number; share: number }

const COMPANY_CATEGORIES: Record<string, CategoryData[]> = {
  'ITC': [
    { name: 'Snacks',    value: 32, color: '#6366F1', revenue: 15.4, share: 31.9 },
    { name: 'Biscuits',  value: 28, color: '#F59E0B', revenue: 13.2, share: 27.4 },
    { name: 'Noodles',   value: 18, color: '#10B981', revenue: 9.1,  share: 18.9 },
    { name: 'Atta',      value: 13, color: '#0891B2', revenue: 6.8,  share: 14.1 },
    { name: 'Beverages', value: 9,  color: '#EC4899', revenue: 3.7,  share: 7.7  },
  ],
  'HUL (Hindustan Unilever)': [
    { name: 'Personal Care', value: 38, color: '#6366F1', revenue: 23.8, share: 37.9 },
    { name: 'Home Care',     value: 29, color: '#F59E0B', revenue: 18.2, share: 29.0 },
    { name: 'Foods',         value: 21, color: '#10B981', revenue: 13.2, share: 21.1 },
    { name: 'Beverages',     value: 12, color: '#0891B2', revenue: 7.5,  share: 11.9 },
  ],
  'Nestlé': [
    { name: 'Dairy',         value: 34, color: '#6366F1', revenue: 12.9, share: 34.0 },
    { name: 'Beverages',     value: 26, color: '#F59E0B', revenue: 9.9,  share: 26.0 },
    { name: 'Confectionery', value: 22, color: '#10B981', revenue: 8.3,  share: 22.0 },
    { name: 'Culinary',      value: 18, color: '#0891B2', revenue: 6.8,  share: 18.0 },
  ],
  'Britannia': [
    { name: 'Biscuits', value: 48, color: '#6366F1', revenue: 19.8, share: 47.9 },
    { name: 'Cakes',    value: 22, color: '#F59E0B', revenue: 9.1,  share: 22.0 },
    { name: 'Dairy',    value: 18, color: '#10B981', revenue: 7.4,  share: 17.9 },
    { name: 'Breads',   value: 12, color: '#0891B2', revenue: 5.0,  share: 12.1 },
  ],
  'Dabur': [
    { name: 'Juices',        value: 35, color: '#6366F1', revenue: 10.0, share: 35.0 },
    { name: 'Healthcare',    value: 28, color: '#F59E0B', revenue: 8.0,  share: 28.0 },
    { name: 'Personal Care', value: 22, color: '#10B981', revenue: 6.3,  share: 22.0 },
    { name: 'OTC Products',  value: 15, color: '#0891B2', revenue: 4.3,  share: 15.0 },
  ],
  '': [
    { name: 'Snacks & Food', value: 28, color: '#6366F1', revenue: 61.1, share: 27.9 },
    { name: 'Personal Care', value: 24, color: '#F59E0B', revenue: 52.4, share: 24.0 },
    { name: 'Beverages',     value: 18, color: '#10B981', revenue: 39.3, share: 18.0 },
    { name: 'Home Care',     value: 16, color: '#0891B2', revenue: 35.0, share: 16.0 },
    { name: 'Healthcare',    value: 14, color: '#EC4899', revenue: 30.6, share: 14.0 },
  ],
};

export function getCategoryData(filters: GlobalFilters): CategoryData[] {
  return COMPANY_CATEGORIES[filters.company] ?? COMPANY_CATEGORIES[''];
}

// ─── Weekly trend for Company Admin dashboard ─────────────────────────────────

export interface WeeklyTrendPoint { week: string; orders: number; invoiceL: number }

const WEEK_FACTORS = [0.88, 0.93, 0.97, 0.91, 1.02, 1.05, 1.00];
const WEEK_LABELS  = ['W1 Apr','W2 Apr','W3 Apr','W4 Apr','W1 May','W2 May','W3 May'];

export function getWeeklyTrend(filters: GlobalFilters): WeeklyTrendPoint[] {
  const snap = filters.company ? (COMPANY_SNAPSHOTS[filters.company] ?? DEFAULT_SNAPSHOT) : DEFAULT_SNAPSHOT;

  let baseOrders  = Math.round(snap.totalOrders / 4);
  let baseInvoice = snap.invoiceValueNum / 4;

  if (filters.distributor) {
    baseOrders  = Math.round(baseOrders / 8);
    baseInvoice = parseFloat((baseInvoice / 8).toFixed(1));
  } else if (filters.state) {
    const n = Object.values(DIST_LOCATION).filter(d => d.state === filters.state).length;
    const s = n / DISTRIBUTOR_CODES.length;
    baseOrders  = Math.round(baseOrders * s);
    baseInvoice = parseFloat((baseInvoice * s).toFixed(1));
  }

  return WEEK_LABELS.map((week, i) => ({
    week,
    orders:   Math.round(baseOrders  * WEEK_FACTORS[i]),
    invoiceL: parseFloat((baseInvoice * WEEK_FACTORS[i]).toFixed(1)),
  }));
}
