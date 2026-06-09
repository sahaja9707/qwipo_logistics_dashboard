// Central mock data and filter helper functions for the Qwipo dashboard

export interface GlobalFilters {
  company: string;
  state: string;
  city: string;
  distributor: string;
  dateFrom: Date;
  dateTo: Date;
  singleDay: boolean; // true when dateFrom === dateTo (single-day mode)
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
    singleDay: false,
  };
}

// ─── Reference data ────────────────────────────────────────────────────────────

export const COMPANIES = ['ITC', 'HUL (Hindustan Unilever)', 'Qwipo 3PL Logistics', 'Nestlé', 'Britannia', 'Dabur'];

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

// ─── Extended distributor data with zones (20–30 per city branch) ─────────────

export interface DistributorInfo {
  code: string;
  name: string;
  state: string;
  city: string;
  zone: string; // area/locality grouping within city
}

export const ALL_DISTRIBUTORS: DistributorInfo[] = [
  // ── Hyderabad (zone-based) ──────────────────────────────────────────────────
  { code: 'DIS-HYD-001', name: 'Ameerpet Central',    state: 'Telangana', city: 'Hyderabad', zone: 'Ameerpet'      },
  { code: 'DIS-HYD-002', name: 'Kukatpally North',    state: 'Telangana', city: 'Hyderabad', zone: 'Kukatpally'    },
  { code: 'DIS-HYD-003', name: 'Kukatpally South',    state: 'Telangana', city: 'Hyderabad', zone: 'Kukatpally'    },
  { code: 'DIS-HYD-004', name: 'Hyderabad Central',   state: 'Telangana', city: 'Hyderabad', zone: 'Secunderabad'  },
  { code: 'SECD123DIS',  name: 'Secd123 Dist.',        state: 'Telangana', city: 'Hyderabad', zone: 'Secunderabad'  },
  { code: 'SECD456DIS',  name: 'Secd456 Dist.',        state: 'Telangana', city: 'Hyderabad', zone: 'Secunderabad'  },
  { code: 'DIS-HYD-007', name: 'LB Nagar West',       state: 'Telangana', city: 'Hyderabad', zone: 'LB Nagar'      },
  { code: 'DIS-HYD-008', name: 'LB Nagar East',       state: 'Telangana', city: 'Hyderabad', zone: 'LB Nagar'      },
  { code: 'DIS-HYD-009', name: 'Dilsukhnagar Dist.',  state: 'Telangana', city: 'Hyderabad', zone: 'Dilsukhnagar'  },
  { code: 'DIS-HYD-010', name: 'Mehdipatnam Dist.',   state: 'Telangana', city: 'Hyderabad', zone: 'Mehdipatnam'   },
  { code: 'DIS-HYD-011', name: 'Gachibowli North',    state: 'Telangana', city: 'Hyderabad', zone: 'Gachibowli'    },
  { code: 'DIS-HYD-012', name: 'Gachibowli South',    state: 'Telangana', city: 'Hyderabad', zone: 'Gachibowli'    },
  { code: 'DIS-HYD-013', name: 'Banjara Hills Dist.', state: 'Telangana', city: 'Hyderabad', zone: 'Banjara Hills' },
  { code: 'DIS-HYD-014', name: 'Jubilee Hills Dist.', state: 'Telangana', city: 'Hyderabad', zone: 'Jubilee Hills' },
  { code: 'DIS-HYD-015', name: 'Kondapur West',       state: 'Telangana', city: 'Hyderabad', zone: 'Kondapur'      },
  { code: 'DIS-HYD-016', name: 'Kondapur East',       state: 'Telangana', city: 'Hyderabad', zone: 'Kondapur'      },
  { code: 'DIS-HYD-017', name: 'Madhapur Dist.',      state: 'Telangana', city: 'Hyderabad', zone: 'Madhapur'      },
  { code: 'DIS-HYD-018', name: 'Kompally North',      state: 'Telangana', city: 'Hyderabad', zone: 'Kompally'      },
  { code: 'DIS-HYD-019', name: 'Kompally South',      state: 'Telangana', city: 'Hyderabad', zone: 'Kompally'      },
  { code: 'DIS-HYD-020', name: 'Uppal East Dist.',    state: 'Telangana', city: 'Hyderabad', zone: 'Uppal'         },
  { code: 'DIS-HYD-021', name: 'Uppal West Dist.',    state: 'Telangana', city: 'Hyderabad', zone: 'Uppal'         },
  { code: 'DIS-HYD-022', name: 'Nacharam Dist.',      state: 'Telangana', city: 'Hyderabad', zone: 'Nacharam'      },
  { code: 'DIS-HYD-023', name: 'Tarnaka Dist.',       state: 'Telangana', city: 'Hyderabad', zone: 'Tarnaka'       },
  { code: 'DIS-HYD-024', name: 'Malkajgiri Dist.',    state: 'Telangana', city: 'Hyderabad', zone: 'Malkajgiri'    },
  // ── Karimnagar ─────────────────────────────────────────────────────────────
  { code: 'DIS-KRN-001', name: 'Karimnagar Central',  state: 'Telangana', city: 'Karimnagar', zone: 'Central'      },
  { code: 'DIS-KRN-002', name: 'Karimnagar North',    state: 'Telangana', city: 'Karimnagar', zone: 'North'        },
  { code: 'DIS-KRN-003', name: 'Karimnagar South',    state: 'Telangana', city: 'Karimnagar', zone: 'South'        },
  // ── Mumbai ──────────────────────────────────────────────────────────────────
  { code: 'DIS-MUM-001', name: 'Andheri East Dist.',  state: 'Maharashtra', city: 'Mumbai', zone: 'Andheri'       },
  { code: 'DIS-MUM-002', name: 'Andheri West Dist.',  state: 'Maharashtra', city: 'Mumbai', zone: 'Andheri'       },
  { code: 'DIS-MUM-003', name: 'Malad North',         state: 'Maharashtra', city: 'Mumbai', zone: 'Malad'         },
  { code: 'DIS-MUM-004', name: 'Malad South',         state: 'Maharashtra', city: 'Mumbai', zone: 'Malad'         },
  { code: 'DIS-MUM-005', name: 'Goregaon East',       state: 'Maharashtra', city: 'Mumbai', zone: 'Goregaon'      },
  { code: 'DIS-MUM-006', name: 'Goregaon West',       state: 'Maharashtra', city: 'Mumbai', zone: 'Goregaon'      },
  { code: 'DIS-MUM-007', name: 'Bhandup Dist.',       state: 'Maharashtra', city: 'Mumbai', zone: 'Bhandup'       },
  { code: 'DIS-MUM-008', name: 'Thane West Dist.',    state: 'Maharashtra', city: 'Mumbai', zone: 'Thane'         },
  { code: 'DIS-MUM-009', name: 'Thane East Dist.',    state: 'Maharashtra', city: 'Mumbai', zone: 'Thane'         },
  { code: 'DIS-MUM-010', name: 'Borivali North',      state: 'Maharashtra', city: 'Mumbai', zone: 'Borivali'      },
  { code: 'DIS-MUM-011', name: 'Borivali South',      state: 'Maharashtra', city: 'Mumbai', zone: 'Borivali'      },
  { code: 'DIS-MUM-012', name: 'Mumbai Metro Dist.',  state: 'Maharashtra', city: 'Mumbai', zone: 'Central'       },
  { code: 'DIS-MUM-013', name: 'Kandivali East',      state: 'Maharashtra', city: 'Mumbai', zone: 'Kandivali'     },
  { code: 'DIS-MUM-014', name: 'Kandivali West',      state: 'Maharashtra', city: 'Mumbai', zone: 'Kandivali'     },
  { code: 'DIS-MUM-015', name: 'Dahisar Dist.',       state: 'Maharashtra', city: 'Mumbai', zone: 'Dahisar'       },
  { code: 'DIS-MUM-016', name: 'Powai Dist.',         state: 'Maharashtra', city: 'Mumbai', zone: 'Powai'         },
  { code: 'DIS-MUM-017', name: 'Vikhroli Dist.',      state: 'Maharashtra', city: 'Mumbai', zone: 'Vikhroli'      },
  { code: 'DIS-MUM-018', name: 'Kurla North',         state: 'Maharashtra', city: 'Mumbai', zone: 'Kurla'         },
  { code: 'DIS-MUM-019', name: 'Kurla South',         state: 'Maharashtra', city: 'Mumbai', zone: 'Kurla'         },
  { code: 'DIS-MUM-020', name: 'Ghatkopar East',      state: 'Maharashtra', city: 'Mumbai', zone: 'Ghatkopar'     },
  { code: 'DIS-MUM-021', name: 'Ghatkopar West',      state: 'Maharashtra', city: 'Mumbai', zone: 'Ghatkopar'     },
  { code: 'DIS-MUM-022', name: 'Mulund West',         state: 'Maharashtra', city: 'Mumbai', zone: 'Mulund'        },
  { code: 'DIS-MUM-023', name: 'Mulund East',         state: 'Maharashtra', city: 'Mumbai', zone: 'Mulund'        },
  // ── Bengaluru ───────────────────────────────────────────────────────────────
  { code: 'DIS-BAN-001', name: 'Whitefield North',    state: 'Karnataka', city: 'Bengaluru', zone: 'Whitefield'   },
  { code: 'DIS-BAN-002', name: 'Whitefield South',    state: 'Karnataka', city: 'Bengaluru', zone: 'Whitefield'   },
  { code: 'DIS-BAN-003', name: 'Electronic City',     state: 'Karnataka', city: 'Bengaluru', zone: 'Electronic City'},
  { code: 'DIS-BAN-004', name: 'Koramangala North',   state: 'Karnataka', city: 'Bengaluru', zone: 'Koramangala'  },
  { code: 'DIS-BAN-005', name: 'Koramangala South',   state: 'Karnataka', city: 'Bengaluru', zone: 'Koramangala'  },
  { code: 'DIS-BAN-006', name: 'HSR Layout Dist.',    state: 'Karnataka', city: 'Bengaluru', zone: 'HSR Layout'   },
  { code: 'DIS-BAN-007', name: 'Bengaluru North',     state: 'Karnataka', city: 'Bengaluru', zone: 'North Zone'   },
  { code: 'DIS-BAN-008', name: 'Indiranagar Dist.',   state: 'Karnataka', city: 'Bengaluru', zone: 'Indiranagar'  },
  { code: 'DIS-BAN-009', name: 'Marathahalli Dist.',  state: 'Karnataka', city: 'Bengaluru', zone: 'Marathahalli' },
  { code: 'DIS-BAN-010', name: 'Jayanagar Dist.',     state: 'Karnataka', city: 'Bengaluru', zone: 'Jayanagar'    },
  { code: 'DIS-BAN-011', name: 'BTM Layout Dist.',    state: 'Karnataka', city: 'Bengaluru', zone: 'BTM Layout'   },
  { code: 'DIS-BAN-012', name: 'Hebbal Dist.',        state: 'Karnataka', city: 'Bengaluru', zone: 'Hebbal'       },
  { code: 'DIS-BAN-013', name: 'Yelahanka Dist.',     state: 'Karnataka', city: 'Bengaluru', zone: 'Yelahanka'    },
  { code: 'DIS-BAN-014', name: 'Rajajinagar Dist.',   state: 'Karnataka', city: 'Bengaluru', zone: 'Rajajinagar'  },
  { code: 'DIS-BAN-015', name: 'Malleswaram Dist.',   state: 'Karnataka', city: 'Bengaluru', zone: 'Malleswaram'  },
  // ── Chennai ─────────────────────────────────────────────────────────────────
  { code: 'DIS-CHN-001', name: 'Velachery Dist.',     state: 'Tamil Nadu', city: 'Chennai', zone: 'South Chennai' },
  { code: 'DIS-CHN-002', name: 'Tambaram Dist.',      state: 'Tamil Nadu', city: 'Chennai', zone: 'South Chennai' },
  { code: 'DIS-CHN-003', name: 'Chennai East Dist.',  state: 'Tamil Nadu', city: 'Chennai', zone: 'East Chennai'  },
  { code: 'DIS-CHN-004', name: 'Perambur Dist.',      state: 'Tamil Nadu', city: 'Chennai', zone: 'North Chennai' },
  { code: 'DIS-CHN-005', name: 'Anna Nagar Dist.',    state: 'Tamil Nadu', city: 'Chennai', zone: 'Central'       },
  { code: 'DIS-CHN-006', name: 'T Nagar Dist.',       state: 'Tamil Nadu', city: 'Chennai', zone: 'Central'       },
  { code: 'DIS-CHN-007', name: 'Porur Dist.',         state: 'Tamil Nadu', city: 'Chennai', zone: 'West Chennai'  },
  { code: 'DIS-CHN-008', name: 'Ambattur Dist.',      state: 'Tamil Nadu', city: 'Chennai', zone: 'North Chennai' },
  // ── Delhi NCR ───────────────────────────────────────────────────────────────
  { code: 'DIS-DEL-001', name: 'Connaught Place',     state: 'Delhi NCR', city: 'New Delhi', zone: 'Central Delhi' },
  { code: 'DIS-DEL-002', name: 'Dwarka North',        state: 'Delhi NCR', city: 'New Delhi', zone: 'West Delhi'    },
  { code: 'DIS-DEL-003', name: 'Dwarka South',        state: 'Delhi NCR', city: 'New Delhi', zone: 'West Delhi'    },
  { code: 'DIS-DEL-004', name: 'Rohini Sector A',     state: 'Delhi NCR', city: 'New Delhi', zone: 'North Delhi'   },
  { code: 'DIS-DEL-005', name: 'Rohini Sector B',     state: 'Delhi NCR', city: 'New Delhi', zone: 'North Delhi'   },
  { code: 'DIS-DEL-006', name: 'Laxmi Nagar Dist.',   state: 'Delhi NCR', city: 'New Delhi', zone: 'East Delhi'    },
  { code: 'DIS-DEL-007', name: 'Preet Vihar Dist.',   state: 'Delhi NCR', city: 'New Delhi', zone: 'East Delhi'    },
  { code: 'DIS-DEL-008', name: 'Saket Dist.',         state: 'Delhi NCR', city: 'New Delhi', zone: 'South Delhi'   },
  { code: 'DIS-DEL-009', name: 'Delhi NCR Dist.',     state: 'Delhi NCR', city: 'New Delhi', zone: 'Central Delhi' },
  { code: 'DIS-DEL-010', name: 'Vasant Kunj Dist.',   state: 'Delhi NCR', city: 'New Delhi', zone: 'South Delhi'   },
  { code: 'DIS-DEL-011', name: 'Janakpuri Dist.',     state: 'Delhi NCR', city: 'New Delhi', zone: 'West Delhi'    },
  { code: 'DIS-DEL-012', name: 'Gurugram Central',    state: 'Delhi NCR', city: 'Gurugram',  zone: 'Gurugram'      },
  // ── Pune ────────────────────────────────────────────────────────────────────
  { code: 'DIS-PUN-001', name: 'Hinjewadi Dist.',     state: 'Maharashtra', city: 'Pune', zone: 'West Pune'       },
  { code: 'DIS-PUN-002', name: 'Kothrud Dist.',       state: 'Maharashtra', city: 'Pune', zone: 'West Pune'       },
  { code: 'DIS-PUN-003', name: 'Wakad Dist.',         state: 'Maharashtra', city: 'Pune', zone: 'West Pune'       },
  { code: 'DIS-PUN-004', name: 'Viman Nagar Dist.',   state: 'Maharashtra', city: 'Pune', zone: 'East Pune'       },
  { code: 'DIS-PUN-005', name: 'Hadapsar Dist.',      state: 'Maharashtra', city: 'Pune', zone: 'East Pune'       },
  { code: 'DIS-PUN-006', name: 'Kondhwa Dist.',       state: 'Maharashtra', city: 'Pune', zone: 'South Pune'      },
  { code: 'DIS-PUN-007', name: 'Katraj Dist.',        state: 'Maharashtra', city: 'Pune', zone: 'South Pune'      },
  { code: 'DIS-PUN-008', name: 'Pimpri North',        state: 'Maharashtra', city: 'Pune', zone: 'Pimpri-Chinchwad'},
  { code: 'DIS-PUN-009', name: 'Chinchwad South',     state: 'Maharashtra', city: 'Pune', zone: 'Pimpri-Chinchwad'},
  { code: 'DIS-PUN-010', name: 'Aundh Dist.',         state: 'Maharashtra', city: 'Pune', zone: 'North Pune'      },
  { code: 'DIS-PUN-011', name: 'Baner Dist.',         state: 'Maharashtra', city: 'Pune', zone: 'North Pune'      },
  { code: 'DIS-PUN-012', name: 'Deccan Dist.',        state: 'Maharashtra', city: 'Pune', zone: 'Central Pune'    },
  { code: 'DIS-PUN-013', name: 'Shivajinagar Dist.',  state: 'Maharashtra', city: 'Pune', zone: 'Central Pune'    },
  { code: 'DIS-PUN-014', name: 'Bibwewadi Dist.',     state: 'Maharashtra', city: 'Pune', zone: 'South Pune'      },
  { code: 'DIS-PUN-015', name: 'Pune Central Dist.',  state: 'Maharashtra', city: 'Pune', zone: 'Central Pune'    },
  // ── Ahmedabad ───────────────────────────────────────────────────────────────
  { code: 'DIS-AHM-001', name: 'Navrangpura Dist.',   state: 'Gujarat', city: 'Ahmedabad', zone: 'Central'        },
  { code: 'DIS-AHM-002', name: 'Satellite Dist.',     state: 'Gujarat', city: 'Ahmedabad', zone: 'West'           },
  { code: 'DIS-AHM-003', name: 'Bopal Dist.',         state: 'Gujarat', city: 'Ahmedabad', zone: 'West'           },
  { code: 'DIS-AHM-004', name: 'Maninagar Dist.',     state: 'Gujarat', city: 'Ahmedabad', zone: 'East'           },
  { code: 'DIS-AHM-005', name: 'Odhav Dist.',         state: 'Gujarat', city: 'Ahmedabad', zone: 'East'           },
  { code: 'DIS-AHM-006', name: 'Ahmedabad Central',   state: 'Gujarat', city: 'Ahmedabad', zone: 'Central'        },
  { code: 'DIS-AHM-007', name: 'Vastral Dist.',       state: 'Gujarat', city: 'Ahmedabad', zone: 'East'           },
  { code: 'DIS-AHM-008', name: 'Chandkheda Dist.',    state: 'Gujarat', city: 'Ahmedabad', zone: 'North'          },
  { code: 'DIS-AHM-009', name: 'Gota Dist.',          state: 'Gujarat', city: 'Ahmedabad', zone: 'North'          },
];

// Legacy flat codes list (kept for backward compat with heatmap etc.)
export const DISTRIBUTOR_CODES = ALL_DISTRIBUTORS.map(d => d.code);

// Get distributors grouped by zone for a given city
export function getDistributorsByZone(city: string): Record<string, DistributorInfo[]> {
  const dists = city
    ? ALL_DISTRIBUTORS.filter(d => d.city === city)
    : ALL_DISTRIBUTORS;
  return dists.reduce((acc, d) => {
    if (!acc[d.zone]) acc[d.zone] = [];
    acc[d.zone].push(d);
    return acc;
  }, {} as Record<string, DistributorInfo[]>);
}

/** Get distributor codes available for a given city (or all if no city) */
export function getDistributorsForCity(city: string): DistributorInfo[] {
  if (!city) return ALL_DISTRIBUTORS;
  return ALL_DISTRIBUTORS.filter(d => d.city === city);
}

/** Get distributor codes available for a given state (or all if no state) */
export function getDistributorsForState(state: string): DistributorInfo[] {
  if (!state) return ALL_DISTRIBUTORS;
  return ALL_DISTRIBUTORS.filter(d => d.state === state);
}

// ─── High-return customer data ─────────────────────────────────────────────────

export interface HighReturnCustomer {
  id: string;
  retailerName: string;
  city: string;
  distributor: string;
  returnCount: number;    // returns in last 30 days
  totalOrders: number;    // orders in last 30 days
  returnRate: number;     // %
  returnValue: string;    // ₹
  lastReturnDate: string;
  riskLevel: 'high' | 'medium';
  pattern: string;
}

export const HIGH_RETURN_CUSTOMERS: HighReturnCustomer[] = [
  { id: 'RET-001', retailerName: 'Sai Kirana Stores',      city: 'Hyderabad',  distributor: 'DIS-HYD-004', returnCount: 14, totalOrders: 22, returnRate: 63.6, returnValue: '₹28,400', lastReturnDate: '20 May 2026', riskLevel: 'high',   pattern: 'Consistent returns after 5PM deliveries' },
  { id: 'RET-002', retailerName: 'Lakshmi General Stores', city: 'Mumbai',     distributor: 'DIS-MUM-012', returnCount: 11, totalOrders: 18, returnRate: 61.1, returnValue: '₹22,100', lastReturnDate: '19 May 2026', riskLevel: 'high',   pattern: 'Returns on Tuesdays & Thursdays' },
  { id: 'RET-003', retailerName: 'Rama Provisions',        city: 'Bengaluru',  distributor: 'DIS-BAN-007', returnCount: 9,  totalOrders: 17, returnRate: 52.9, returnValue: '₹18,750', lastReturnDate: '21 May 2026', riskLevel: 'high',   pattern: 'Claims damaged goods repeatedly' },
  { id: 'RET-004', retailerName: 'Shivam Traders',         city: 'Hyderabad',  distributor: 'SECD123DIS',  returnCount: 8,  totalOrders: 16, returnRate: 50.0, returnValue: '₹15,300', lastReturnDate: '18 May 2026', riskLevel: 'high',   pattern: 'Returns concentrated on specific SKUs' },
  { id: 'RET-005', retailerName: 'Krishna Supermarket',    city: 'Chennai',    distributor: 'DIS-CHN-003', returnCount: 7,  totalOrders: 15, returnRate: 46.7, returnValue: '₹12,900', lastReturnDate: '20 May 2026', riskLevel: 'high',   pattern: 'Unreachable during delivery window' },
  { id: 'RET-006', retailerName: 'Durga Provisions',       city: 'New Delhi',  distributor: 'DIS-DEL-009', returnCount: 6,  totalOrders: 14, returnRate: 42.9, returnValue: '₹11,200', lastReturnDate: '17 May 2026', riskLevel: 'medium', pattern: 'Returns on Mondays only' },
  { id: 'RET-007', retailerName: 'Ganapathi Stores',       city: 'Hyderabad',  distributor: 'DIS-HYD-002', returnCount: 6,  totalOrders: 15, returnRate: 40.0, returnValue: '₹10,800', lastReturnDate: '19 May 2026', riskLevel: 'medium', pattern: 'Short delivery window compliance' },
  { id: 'RET-008', retailerName: 'Anjali General Mart',    city: 'Pune',       distributor: 'DIS-PUN-015', returnCount: 5,  totalOrders: 13, returnRate: 38.5, returnValue: '₹9,400',  lastReturnDate: '16 May 2026', riskLevel: 'medium', pattern: 'Repeat returns on beverage SKUs' },
  { id: 'RET-009', retailerName: 'Venkatesh Kirana',       city: 'Bengaluru',  distributor: 'DIS-BAN-004', returnCount: 5,  totalOrders: 14, returnRate: 35.7, returnValue: '₹8,750',  lastReturnDate: '21 May 2026', riskLevel: 'medium', pattern: 'Order placed and returned same day' },
  { id: 'RET-010', retailerName: 'Radha Trading Co.',      city: 'Mumbai',     distributor: 'DIS-MUM-005', returnCount: 5,  totalOrders: 15, returnRate: 33.3, returnValue: '₹7,800',  lastReturnDate: '18 May 2026', riskLevel: 'medium', pattern: 'Excess order quantities returned' },
];

// ─── DIST_LOCATION lookup ─────────────────────────────────────────────────────
// For backward compat with heatmap/snapshots that use old codes

const DIST_LOCATION: Record<string, { state: string; city: string }> = {};
ALL_DISTRIBUTORS.forEach(d => {
  DIST_LOCATION[d.code] = { state: d.state, city: d.city };
});

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
  // Distribution KPIs
  dispatchValue: number;   // ₹L
  returnValue: number;     // ₹L
  netSalesValue: number;   // ₹L
  totalVolumetricWeight: number; // kg
  deliveryRetryReturns: number;
  cancelledReturns: number;
}

const COMPANY_SNAPSHOTS: Record<string, CompanySnapshot> = {
  'ITC': {
    totalOrders: 2714, fulfilledOrders: 2498, pendingOrders: 186, returnedOrders: 157, cancelledOrders: 59,
    invoiceValue: '₹48.2L', invoiceValueNum: 48.2, returnRate: 5.8,
    vehicleUtil: 84, timeUtil: 76, dpUtil: 91, avgVehicles: '87 / 96', avgRunTime: '5h 47m',
    plannedKm: 14820, liveKm: 15340, uniqueCustomers: 1842,
    dispatchValue: 52.4, returnValue: 4.2, netSalesValue: 48.2,
    totalVolumetricWeight: 18420, deliveryRetryReturns: 55, cancelledReturns: 102,
  },
  'HUL (Hindustan Unilever)': {
    totalOrders: 3284, fulfilledOrders: 3098, pendingOrders: 142, returnedOrders: 138, cancelledOrders: 44,
    invoiceValue: '₹62.7L', invoiceValueNum: 62.7, returnRate: 4.2,
    vehicleUtil: 88, timeUtil: 82, dpUtil: 93, avgVehicles: '104 / 116', avgRunTime: '5h 22m',
    plannedKm: 17640, liveKm: 18110, uniqueCustomers: 2214,
    dispatchValue: 66.8, returnValue: 4.1, netSalesValue: 62.7,
    totalVolumetricWeight: 22180, deliveryRetryReturns: 48, cancelledReturns: 90,
  },
  'Nestlé': {
    totalOrders: 1847, fulfilledOrders: 1686, pendingOrders: 98, returnedOrders: 113, cancelledOrders: 50,
    invoiceValue: '₹37.9L', invoiceValueNum: 37.9, returnRate: 6.1,
    vehicleUtil: 79, timeUtil: 71, dpUtil: 87, avgVehicles: '61 / 80', avgRunTime: '6h 05m',
    plannedKm: 11240, liveKm: 11890, uniqueCustomers: 1320,
    dispatchValue: 40.8, returnValue: 2.9, netSalesValue: 37.9,
    totalVolumetricWeight: 12640, deliveryRetryReturns: 40, cancelledReturns: 73,
  },
  'Britannia': {
    totalOrders: 2108, fulfilledOrders: 1952, pendingOrders: 124, returnedOrders: 112, cancelledOrders: 44,
    invoiceValue: '₹41.3L', invoiceValueNum: 41.3, returnRate: 5.3,
    vehicleUtil: 81, timeUtil: 74, dpUtil: 89, avgVehicles: '74 / 88', avgRunTime: '5h 58m',
    plannedKm: 12980, liveKm: 13450, uniqueCustomers: 1560,
    dispatchValue: 44.6, returnValue: 3.3, netSalesValue: 41.3,
    totalVolumetricWeight: 15380, deliveryRetryReturns: 39, cancelledReturns: 73,
  },
  'Qwipo 3PL Logistics': {
    totalOrders: 2240, fulfilledOrders: 2098, pendingOrders: 112, returnedOrders: 94, cancelledOrders: 36,
    invoiceValue: '₹44.7L', invoiceValueNum: 44.7, returnRate: 4.2,
    vehicleUtil: 86, timeUtil: 80, dpUtil: 91, avgVehicles: '68 / 74', avgRunTime: '5h 31m',
    plannedKm: 13280, liveKm: 13740, uniqueCustomers: 1640,
    dispatchValue: 47.1, returnValue: 2.4, netSalesValue: 44.7,
    totalVolumetricWeight: 16820, deliveryRetryReturns: 33, cancelledReturns: 61,
  },
  'Dabur': {
    totalOrders: 1423, fulfilledOrders: 1271, pendingOrders: 108, returnedOrders: 102, cancelledOrders: 51,
    invoiceValue: '₹28.6L', invoiceValueNum: 28.6, returnRate: 7.2,
    vehicleUtil: 73, timeUtil: 68, dpUtil: 82, avgVehicles: '52 / 72', avgRunTime: '6h 18m',
    plannedKm: 9120, liveKm: 9680, uniqueCustomers: 980,
    dispatchValue: 31.2, returnValue: 2.6, netSalesValue: 28.6,
    totalVolumetricWeight: 9840, deliveryRetryReturns: 36, cancelledReturns: 66,
  },
};

const DEFAULT_SNAPSHOT: CompanySnapshot = {
  totalOrders: 11376, fulfilledOrders: 10505, pendingOrders: 658, returnedOrders: 622, cancelledOrders: 248,
  invoiceValue: '₹218.7L', invoiceValueNum: 218.7, returnRate: 5.5,
  vehicleUtil: 81, timeUtil: 74, dpUtil: 88, avgVehicles: '378 / 452', avgRunTime: '5h 54m',
  plannedKm: 65800, liveKm: 68470, uniqueCustomers: 7916,
  dispatchValue: 235.8, returnValue: 17.1, netSalesValue: 218.7,
  totalVolumetricWeight: 78580, deliveryRetryReturns: 218, cancelledReturns: 404,
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
    dispatchValue: parseFloat((base.dispatchValue * scale).toFixed(1)),
    returnValue: parseFloat((base.returnValue * scale).toFixed(1)),
    netSalesValue: parseFloat((base.netSalesValue * scale).toFixed(1)),
    totalVolumetricWeight: Math.round(base.totalVolumetricWeight * scale),
    deliveryRetryReturns: Math.round(base.deliveryRetryReturns * scale),
    cancelledReturns: Math.round(base.cancelledReturns * scale),
  };
}

export function getSnapshotForFilters(filters: GlobalFilters): CompanySnapshot {
  const base = filters.company ? (COMPANY_SNAPSHOTS[filters.company] ?? DEFAULT_SNAPSHOT) : DEFAULT_SNAPSHOT;

  if (filters.distributor) {
    return scaleSnapshot(base, 0.065, '11 / 12');
  }
  if (filters.city) {
    const cityDists = ALL_DISTRIBUTORS.filter(d => d.city === filters.city).length;
    const scale = cityDists / ALL_DISTRIBUTORS.length;
    const vCount = Math.round(8 * cityDists);
    return scaleSnapshot(base, scale, `${vCount} / ${vCount + 4}`);
  }
  if (filters.state) {
    const stateDists = ALL_DISTRIBUTORS.filter(d => d.state === filters.state).length;
    const scale = stateDists / ALL_DISTRIBUTORS.length;
    const vCount = Math.round(6 * stateDists);
    return scaleSnapshot(base, scale, `${vCount} / ${vCount + 8}`);
  }
  return base;
}

// ─── Distributor performance ───────────────────────────────────────────────────

export interface DistributorPerf {
  code: string;
  name: string;
  state: string;
  city: string;
  zone: string;
  orders: number;
  fulfilled: number;
  returned: number;
  cancelled: number;
  invoiceL: number;
  returnRate: number;
  vehicles: number;
  vehicleUtil: number;
  fillRate: number;
  tripEfficiency: number;
}

const BASE_DISTRIBUTOR_PERF: DistributorPerf[] = [
  { code: 'DIS-HYD-004', name: 'Hyderabad Central', state: 'Telangana',   city: 'Hyderabad',  zone: 'Secunderabad',  orders: 384, fulfilled: 358, returned: 22, cancelled: 4,  invoiceL: 7.2, returnRate: 5.7,  vehicles: 12, vehicleUtil: 87, fillRate: 93.2, tripEfficiency: 91.4 },
  { code: 'SECD123DIS',  name: 'Secd123 Dist.',      state: 'Telangana',   city: 'Hyderabad',  zone: 'Secunderabad',  orders: 312, fulfilled: 287, returned: 19, cancelled: 6,  invoiceL: 5.9, returnRate: 6.1,  vehicles: 10, vehicleUtil: 83, fillRate: 90.1, tripEfficiency: 88.7 },
  { code: 'DIS-HYD-002', name: 'Kukatpally North',   state: 'Telangana',   city: 'Hyderabad',  zone: 'Kukatpally',    orders: 298, fulfilled: 274, returned: 17, cancelled: 7,  invoiceL: 5.6, returnRate: 5.7,  vehicles: 9,  vehicleUtil: 81, fillRate: 91.8, tripEfficiency: 89.2 },
  { code: 'DIS-KRN-001', name: 'Karimnagar Central', state: 'Telangana',   city: 'Karimnagar', zone: 'Central',       orders: 271, fulfilled: 248, returned: 18, cancelled: 5,  invoiceL: 5.1, returnRate: 6.6,  vehicles: 9,  vehicleUtil: 79, fillRate: 88.4, tripEfficiency: 85.6 },
  { code: 'DIS-MUM-012', name: 'Mumbai Metro',        state: 'Maharashtra', city: 'Mumbai',     zone: 'Central',       orders: 512, fulfilled: 487, returned: 21, cancelled: 4,  invoiceL: 9.4, returnRate: 4.1,  vehicles: 16, vehicleUtil: 91, fillRate: 95.1, tripEfficiency: 93.8 },
  { code: 'DIS-MUM-001', name: 'Andheri East Dist.', state: 'Maharashtra', city: 'Mumbai',     zone: 'Andheri',       orders: 426, fulfilled: 398, returned: 20, cancelled: 8,  invoiceL: 7.9, returnRate: 4.7,  vehicles: 13, vehicleUtil: 88, fillRate: 93.4, tripEfficiency: 92.1 },
  { code: 'DIS-MUM-003', name: 'Malad North',         state: 'Maharashtra', city: 'Mumbai',     zone: 'Malad',         orders: 378, fulfilled: 350, returned: 18, cancelled: 10, invoiceL: 7.1, returnRate: 4.8,  vehicles: 12, vehicleUtil: 86, fillRate: 92.6, tripEfficiency: 90.4 },
  { code: 'DIS-BAN-007', name: 'Bengaluru North',     state: 'Karnataka',   city: 'Bengaluru',  zone: 'North Zone',    orders: 447, fulfilled: 416, returned: 26, cancelled: 5,  invoiceL: 8.2, returnRate: 5.8,  vehicles: 14, vehicleUtil: 88, fillRate: 93.0, tripEfficiency: 90.8 },
  { code: 'DIS-BAN-004', name: 'Koramangala North',   state: 'Karnataka',   city: 'Bengaluru',  zone: 'Koramangala',   orders: 362, fulfilled: 332, returned: 21, cancelled: 9,  invoiceL: 6.7, returnRate: 5.8,  vehicles: 11, vehicleUtil: 85, fillRate: 91.7, tripEfficiency: 89.3 },
  { code: 'DIS-CHN-003', name: 'Chennai East Dist.',  state: 'Tamil Nadu',  city: 'Chennai',    zone: 'East Chennai',  orders: 318, fulfilled: 296, returned: 17, cancelled: 5,  invoiceL: 5.9, returnRate: 5.3,  vehicles: 10, vehicleUtil: 82, fillRate: 90.6, tripEfficiency: 88.1 },
  { code: 'DIS-DEL-009', name: 'Delhi NCR Dist.',     state: 'Delhi NCR',   city: 'New Delhi',  zone: 'Central Delhi', orders: 398, fulfilled: 371, returned: 20, cancelled: 7,  invoiceL: 7.6, returnRate: 5.0,  vehicles: 13, vehicleUtil: 86, fillRate: 92.2, tripEfficiency: 90.5 },
  { code: 'DIS-PUN-015', name: 'Pune Central Dist.',  state: 'Maharashtra', city: 'Pune',       zone: 'Central Pune',  orders: 224, fulfilled: 205, returned: 14, cancelled: 5,  invoiceL: 4.1, returnRate: 6.3,  vehicles: 7,  vehicleUtil: 76, fillRate: 88.9, tripEfficiency: 86.2 },
  { code: 'DIS-AHM-006', name: 'Ahmedabad Central',   state: 'Gujarat',     city: 'Ahmedabad',  zone: 'Central',       orders: 160, fulfilled: 147, returned: 10, cancelled: 3,  invoiceL: 2.9, returnRate: 6.3,  vehicles: 6,  vehicleUtil: 72, fillRate: 87.5, tripEfficiency: 84.8 },
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

// Use a representative subset of distributors for the heatmap
const HEATMAP_CODES = [
  'DIS-HYD-004', 'SECD123DIS', 'DIS-HYD-002', 'DIS-KRN-001',
  'DIS-MUM-012', 'DIS-MUM-001', 'DIS-BAN-007', 'DIS-CHN-003',
  'DIS-DEL-009', 'DIS-PUN-015', 'DIS-AHM-006',
];

const HEATMAP_BASE: Array<{ label: string; vals: number[] }> = [
  { label: 'D0 — Same Day', vals: [245, 142, 187, 163, 114, 147, 82,  58, 94, 71, 38] },
  { label: 'D1 — Next Day', vals: [112,  89, 124, 108,  77,  96, 51,  36, 48, 32, 22] },
  { label: 'D2 — 2 Days',   vals: [48,   62,  68,  57,  41,  52, 28,  19, 27, 18, 11] },
  { label: 'D3 — 3 Days',   vals: [14,   18,  31,  26,  18,  24, 13,   9, 12,  8,  5] },
  { label: 'D4+ — Overdue', vals: [4,    14,  12,  10,   7,   9,  5,   3,  4,  3,  2] },
];

export function getAgingHeatmapData(filters: GlobalFilters): { codes: string[]; rows: HeatmapRow[] } {
  let codes = [...HEATMAP_CODES];

  if (filters.distributor) {
    codes = [filters.distributor];
  } else if (filters.state) {
    const stateCodes = new Set(ALL_DISTRIBUTORS.filter(d => d.state === filters.state).map(d => d.code));
    codes = codes.filter(c => stateCodes.has(c));
    if (filters.city) {
      const cityCodes = new Set(ALL_DISTRIBUTORS.filter(d => d.city === filters.city).map(d => d.code));
      codes = codes.filter(c => cityCodes.has(c));
    }
  }

  const companyScale = filters.company
    ? (COMPANY_SNAPSHOTS[filters.company]?.totalOrders ?? DEFAULT_SNAPSHOT.totalOrders) / DEFAULT_SNAPSHOT.totalOrders
    : 1;

  const rows: HeatmapRow[] = HEATMAP_BASE.map(({ label, vals }) => ({
    label,
    values: Object.fromEntries(
      codes.map(code => {
        const idx = HEATMAP_CODES.indexOf(code);
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

  // Single day mode: just return 1 data point
  const isSingle = filters.singleDay || (
    filters.dateFrom.getFullYear() === filters.dateTo.getFullYear() &&
    filters.dateFrom.getMonth() === filters.dateTo.getMonth() &&
    filters.dateFrom.getDate() === filters.dateTo.getDate()
  );
  if (isSingle) {
    const d = new Date(filters.dateFrom);
    const dow = d.getDay();
    const weekendFactor = dow === 0 ? 0.55 : dow === 6 ? 0.78 : 1.0;
    const baseOrders = Math.round(snap.totalOrders / 30);
    const basePrice  = snap.invoiceValueNum / 30;
    return [{
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      orders: Math.round(baseOrders * weekendFactor),
      totalPrice: parseFloat((basePrice * weekendFactor).toFixed(1)),
    }];
  }

  const msRange = filters.dateTo.getTime() - filters.dateFrom.getTime();
  const days = Math.max(7, Math.min(30, Math.ceil(msRange / 86400000) + 1));

  let baseOrders = Math.round(snap.totalOrders / 30);
  let basePrice  = snap.invoiceValueNum / 30;

  if (filters.distributor) {
    baseOrders = Math.round(baseOrders / 12);
    basePrice  = parseFloat((basePrice  / 12).toFixed(2));
  } else if (filters.city) {
    const n = ALL_DISTRIBUTORS.filter(d => d.city === filters.city).length;
    const s = n / ALL_DISTRIBUTORS.length;
    baseOrders = Math.round(baseOrders * s);
    basePrice  = parseFloat((basePrice  * s).toFixed(2));
  } else if (filters.state) {
    const n = ALL_DISTRIBUTORS.filter(d => d.state === filters.state).length;
    const s = n / ALL_DISTRIBUTORS.length;
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
  trips: number;       // number of trips
  distanceKm: number;  // total km covered
}

export const ALL_DRIVERS: Driver[] = [
  { rank: 1,  name: 'Ramesh Kumar',  vehicle: 'TS-09-EA-7823', distributor: 'DIS-HYD-004', state: 'Telangana',   city: 'Hyderabad',  attempts: 38, returns: 2, netSale: '₹8.4L', contribution: 12.3, returnPct: 5.3,  successRate: 94.7, runtime: '5h 12m', trips: 22, distanceKm: 412 },
  { rank: 2,  name: 'Suresh Patil',  vehicle: 'TS-09-EA-4421', distributor: 'DIS-HYD-004', state: 'Telangana',   city: 'Hyderabad',  attempts: 36, returns: 3, netSale: '₹7.9L', contribution: 11.6, returnPct: 8.3,  successRate: 91.7, runtime: '5h 48m', trips: 20, distanceKm: 384 },
  { rank: 3,  name: 'Mahesh Sharma', vehicle: 'TS-09-AB-1234', distributor: 'DIS-HYD-004', state: 'Telangana',   city: 'Hyderabad',  attempts: 34, returns: 1, netSale: '₹7.6L', contribution: 11.1, returnPct: 2.9,  successRate: 97.1, runtime: '6h 02m', trips: 19, distanceKm: 376 },
  { rank: 4,  name: 'Rajesh Verma',  vehicle: 'TS-09-EA-9910', distributor: 'DIS-KRN-001', state: 'Telangana',   city: 'Karimnagar', attempts: 33, returns: 4, netSale: '₹7.1L', contribution: 10.4, returnPct: 12.1, successRate: 87.9, runtime: '5h 20m', trips: 18, distanceKm: 354 },
  { rank: 5,  name: 'Anand Singh',   vehicle: 'TS-09-AB-5678', distributor: 'DIS-KRN-001', state: 'Telangana',   city: 'Karimnagar', attempts: 31, returns: 2, netSale: '₹6.8L', contribution: 9.9,  returnPct: 6.5,  successRate: 93.5, runtime: '7h 14m', trips: 17, distanceKm: 338 },
  { rank: 6,  name: 'Vikram Nair',   vehicle: 'MH-12-MG-3312', distributor: 'DIS-MUM-012', state: 'Maharashtra', city: 'Mumbai',     attempts: 30, returns: 5, netSale: '₹6.4L', contribution: 9.4,  returnPct: 16.7, successRate: 83.3, runtime: '4h 55m', trips: 16, distanceKm: 298 },
  { rank: 7,  name: 'Prakash Rao',   vehicle: 'MH-12-MG-9012', distributor: 'DIS-MUM-012', state: 'Maharashtra', city: 'Mumbai',     attempts: 28, returns: 1, netSale: '₹6.1L', contribution: 8.9,  returnPct: 3.6,  successRate: 96.4, runtime: '4h 38m', trips: 15, distanceKm: 282 },
  { rank: 8,  name: 'Arun Krishnan', vehicle: 'KA-03-MG-4521', distributor: 'DIS-BAN-007', state: 'Karnataka',   city: 'Bengaluru',  attempts: 42, returns: 3, netSale: '₹9.1L', contribution: 13.2, returnPct: 7.1,  successRate: 92.9, runtime: '5h 35m', trips: 24, distanceKm: 448 },
  { rank: 9,  name: 'Deepak Gupta',  vehicle: 'KA-03-MG-7834', distributor: 'DIS-BAN-007', state: 'Karnataka',   city: 'Bengaluru',  attempts: 39, returns: 6, netSale: '₹8.2L', contribution: 11.9, returnPct: 15.4, successRate: 84.6, runtime: '5h 10m', trips: 21, distanceKm: 418 },
  { rank: 10, name: 'Sanjay Mehra',  vehicle: 'TN-22-CN-1122', distributor: 'DIS-CHN-003', state: 'Tamil Nadu',  city: 'Chennai',    attempts: 35, returns: 2, netSale: '₹7.4L', contribution: 10.8, returnPct: 5.7,  successRate: 94.3, runtime: '5h 50m', trips: 19, distanceKm: 362 },
  { rank: 11, name: 'Ravi Shankar',  vehicle: 'TN-22-CN-5566', distributor: 'DIS-CHN-003', state: 'Tamil Nadu',  city: 'Chennai',    attempts: 29, returns: 4, netSale: '₹6.0L', contribution: 8.7,  returnPct: 13.8, successRate: 86.2, runtime: '6h 22m', trips: 16, distanceKm: 310 },
  { rank: 12, name: 'Manish Tiwari', vehicle: 'DL-01-AB-7890', distributor: 'DIS-DEL-009', state: 'Delhi NCR',   city: 'New Delhi',  attempts: 44, returns: 2, netSale: '₹9.6L', contribution: 14.0, returnPct: 4.5,  successRate: 95.5, runtime: '5h 00m', trips: 25, distanceKm: 464 },
  { rank: 13, name: 'Ajay Kapoor',   vehicle: 'DL-01-AB-3344', distributor: 'DIS-DEL-009', state: 'Delhi NCR',   city: 'New Delhi',  attempts: 37, returns: 3, netSale: '₹8.0L', contribution: 11.6, returnPct: 8.1,  successRate: 91.9, runtime: '5h 42m', trips: 21, distanceKm: 398 },
  { rank: 14, name: 'Pradeep Joshi', vehicle: 'MH-12-PQ-2233', distributor: 'DIS-PUN-015', state: 'Maharashtra', city: 'Pune',       attempts: 26, returns: 3, netSale: '₹5.5L', contribution: 8.0,  returnPct: 11.5, successRate: 88.5, runtime: '6h 10m', trips: 15, distanceKm: 284 },
  { rank: 15, name: 'Nilesh Patil',  vehicle: 'GJ-01-RR-4455', distributor: 'DIS-AHM-006', state: 'Gujarat',     city: 'Ahmedabad',  attempts: 22, returns: 2, netSale: '₹4.8L', contribution: 7.0,  returnPct: 9.1,  successRate: 90.9, runtime: '5h 30m', trips: 13, distanceKm: 246 },
  { rank: 16, name: 'Kiran Shah',    vehicle: 'GJ-01-RR-6677', distributor: 'DIS-AHM-006', state: 'Gujarat',     city: 'Ahmedabad',  attempts: 18, returns: 2, netSale: '₹3.9L', contribution: 5.7,  returnPct: 11.1, successRate: 88.9, runtime: '5h 45m', trips: 11, distanceKm: 214 },
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
    { name: 'Biscuits',  value: 28, color: '#0891B2', revenue: 13.2, share: 27.4 },
    { name: 'Noodles',   value: 18, color: '#10B981', revenue: 9.1,  share: 18.9 },
    { name: 'Atta',      value: 13, color: '#F59E0B', revenue: 6.8,  share: 14.1 },
    { name: 'Beverages', value: 9,  color: '#EF4444', revenue: 3.7,  share: 7.7  },
  ],
  'HUL (Hindustan Unilever)': [
    { name: 'Personal Care', value: 38, color: '#6366F1', revenue: 23.8, share: 37.9 },
    { name: 'Home Care',     value: 29, color: '#0891B2', revenue: 18.2, share: 29.0 },
    { name: 'Foods',         value: 21, color: '#10B981', revenue: 13.2, share: 21.1 },
    { name: 'Beverages',     value: 12, color: '#F59E0B', revenue: 7.5,  share: 11.9 },
  ],
  'Nestlé': [
    { name: 'Dairy',         value: 34, color: '#6366F1', revenue: 12.9, share: 34.0 },
    { name: 'Beverages',     value: 26, color: '#0891B2', revenue: 9.9,  share: 26.0 },
    { name: 'Confectionery', value: 22, color: '#10B981', revenue: 8.3,  share: 22.0 },
    { name: 'Culinary',      value: 18, color: '#F59E0B', revenue: 6.8,  share: 18.0 },
  ],
  'Britannia': [
    { name: 'Biscuits', value: 48, color: '#6366F1', revenue: 19.8, share: 47.9 },
    { name: 'Cakes',    value: 22, color: '#0891B2', revenue: 9.1,  share: 22.0 },
    { name: 'Dairy',    value: 18, color: '#10B981', revenue: 7.4,  share: 17.9 },
    { name: 'Breads',   value: 12, color: '#F59E0B', revenue: 5.0,  share: 12.1 },
  ],
  'Dabur': [
    { name: 'Juices',        value: 35, color: '#6366F1', revenue: 10.0, share: 35.0 },
    { name: 'Healthcare',    value: 28, color: '#0891B2', revenue: 8.0,  share: 28.0 },
    { name: 'Personal Care', value: 22, color: '#10B981', revenue: 6.3,  share: 22.0 },
    { name: 'OTC Products',  value: 15, color: '#F59E0B', revenue: 4.3,  share: 15.0 },
  ],
  '': [
    { name: 'Snacks & Food', value: 28, color: '#6366F1', revenue: 61.1, share: 27.9 },
    { name: 'Personal Care', value: 24, color: '#0891B2', revenue: 52.4, share: 24.0 },
    { name: 'Beverages',     value: 18, color: '#10B981', revenue: 39.3, share: 18.0 },
    { name: 'Home Care',     value: 16, color: '#F59E0B', revenue: 35.0, share: 16.0 },
    { name: 'Healthcare',    value: 14, color: '#EF4444', revenue: 30.6, share: 14.0 },
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
    baseOrders  = Math.round(baseOrders / 12);
    baseInvoice = parseFloat((baseInvoice / 12).toFixed(1));
  } else if (filters.city) {
    const n = ALL_DISTRIBUTORS.filter(d => d.city === filters.city).length;
    const s = n / ALL_DISTRIBUTORS.length;
    baseOrders  = Math.round(baseOrders * s);
    baseInvoice = parseFloat((baseInvoice * s).toFixed(1));
  } else if (filters.state) {
    const n = ALL_DISTRIBUTORS.filter(d => d.state === filters.state).length;
    const s = n / ALL_DISTRIBUTORS.length;
    baseOrders  = Math.round(baseOrders * s);
    baseInvoice = parseFloat((baseInvoice * s).toFixed(1));
  }

  return WEEK_LABELS.map((week, i) => ({
    week,
    orders:   Math.round(baseOrders  * WEEK_FACTORS[i]),
    invoiceL: parseFloat((baseInvoice * WEEK_FACTORS[i]).toFixed(1)),
  }));
}

// ─── Company-Distributor Mappings ─────────────────────────────────────────────

export interface CompanyDistributorMapping {
  companyId: string;
  distributorIds: string[];
}

// Mutable in-session (assignments persist until page reload)
export const companyDistributorMappings: CompanyDistributorMapping[] = [
  {
    companyId: 'ITC',
    distributorIds: [
      'DIS-HYD-004', 'DIS-KRN-001', 'DIS-MUM-012', 'DIS-BAN-007', 'DIS-DEL-009',
      'DIS-PUN-015', 'DIS-AHM-006', 'DIS-CHN-003', 'DIS-HYD-021', 'DIS-MUM-033',
      'DIS-BAN-044', 'DIS-DEL-052', 'DIS-PUN-060', 'DIS-CHN-071', 'DIS-AHM-082',
      'DIS-NAG-090', 'DIS-KOL-106',
    ],
  },
  {
    companyId: 'HUL (Hindustan Unilever)',
    distributorIds: ['DIS-HUL-MUM-01', 'DIS-HUL-BAN-02', 'DIS-HUL-DEL-03'],
  },
  {
    companyId: 'Qwipo 3PL Logistics',
    distributorIds: [
      'DIS-MUM-001', 'DIS-MUM-003', 'DIS-BAN-001', 'DIS-DEL-001', 'DIS-PUN-001',
    ],
  },
];

/** Returns distributor codes already assigned to the given company */
export function getAssignedDistributorIds(companyId: string): string[] {
  return companyDistributorMappings.find(m => m.companyId === companyId)?.distributorIds ?? [];
}

/** Returns distributors from ALL_DISTRIBUTORS not yet assigned to the given company */
export function getUnassignedDistributors(companyId: string): DistributorInfo[] {
  const assigned = new Set(getAssignedDistributorIds(companyId));
  return ALL_DISTRIBUTORS.filter(d => !assigned.has(d.code));
}

/** Assign additional distributor IDs to a company (mutates the mapping in place) */
export function assignDistributorsToCompany(companyId: string, newIds: string[]): void {
  const mapping = companyDistributorMappings.find(m => m.companyId === companyId);
  if (mapping) {
    const existing = new Set(mapping.distributorIds);
    newIds.forEach(id => existing.add(id));
    mapping.distributorIds = [...existing];
  } else {
    companyDistributorMappings.push({ companyId, distributorIds: [...newIds] });
  }
}

// ─── Platform Users (mock) ────────────────────────────────────────────────────

export type PlatformUserRole = 'distributor_user' | 'distributor_admin' | 'company_admin';

export interface PlatformUser {
  id: string;
  name: string;
  mobile: string;
  role: PlatformUserRole;
  companyId: string;
  distributorIds: string[];  // 1 for distributor_user, multiple for distributor_admin
}

export const platformUsers: PlatformUser[] = [
  {
    id: 'USR-001', name: 'Rajesh Malhotra', mobile: '9812340001',
    role: 'distributor_admin', companyId: 'ITC',
    distributorIds: ['DIS-HYD-004', 'DIS-KRN-001', 'DIS-MUM-012', 'DIS-BAN-007', 'DIS-DEL-009'],
  },
  {
    id: 'USR-002', name: 'Priya Nambiar', mobile: '9712340002',
    role: 'distributor_user', companyId: 'ITC',
    distributorIds: ['DIS-HYD-004'],
  },
  {
    id: 'USR-003', name: 'Anil Deshmukh', mobile: '9612340003',
    role: 'distributor_user', companyId: 'HUL (Hindustan Unilever)',
    distributorIds: ['DIS-HUL-MUM-01'],
  },
  {
    id: 'USR-004', name: 'Sneha Kaur', mobile: '9512340004',
    role: 'distributor_admin', companyId: 'HUL (Hindustan Unilever)',
    distributorIds: ['DIS-HUL-MUM-01', 'DIS-HUL-BAN-02', 'DIS-HUL-DEL-03'],
  },
  {
    id: 'USR-005', name: 'Farhan Qureshi', mobile: '9412340005',
    role: 'company_admin', companyId: 'ITC',
    distributorIds: [],
  },
  {
    id: 'USR-006', name: 'Lakshmi Reddy', mobile: '9312340006',
    role: 'distributor_user', companyId: 'Qwipo 3PL Logistics',
    distributorIds: ['DIS-MUM-001'],
  },
  {
    id: 'USR-007', name: 'Vikram Joshi', mobile: '9212340007',
    role: 'distributor_admin', companyId: 'Qwipo 3PL Logistics',
    distributorIds: ['DIS-MUM-001', 'DIS-MUM-003', 'DIS-BAN-001'],
  },
];

// ─── Company Records (mutable, drives Dashboard cards + Settings list) ────────

export interface CompanyRecord {
  id: string;        // same as companyId used in mappings (full name)
  name: string;      // display name
  shortCode: string; // 2–3 char avatar label
  logoBg: string;    // CSS gradient for the avatar
  onboarded: string; // YYYY-MM-DD
  status: 'Active' | 'Inactive';
}

export const COMPANY_RECORDS: CompanyRecord[] = [
  {
    id: 'ITC',
    name: 'ITC Limited',
    shortCode: 'ITC',
    logoBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    onboarded: '2024-01-15',
    status: 'Active',
  },
  {
    id: 'HUL (Hindustan Unilever)',
    name: 'Hindustan Unilever',
    shortCode: 'HUL',
    logoBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    onboarded: '2025-08-03',
    status: 'Active',
  },
  {
    id: 'Qwipo 3PL Logistics',
    name: 'Qwipo 3PL Logistics',
    shortCode: 'Q3L',
    logoBg: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    onboarded: '2026-02-10',
    status: 'Active',
  },
];

/**
 * Add a new company record in-session.
 * Also registers it in COMPANIES and creates an empty distributor mapping.
 */
export function addCompanyRecord(company: CompanyRecord): void {
  COMPANY_RECORDS.push(company);
  if (!COMPANIES.includes(company.name)) {
    COMPANIES.push(company.name);
  }
  if (!companyDistributorMappings.find(m => m.companyId === company.id)) {
    companyDistributorMappings.push({ companyId: company.id, distributorIds: [] });
  }
}

