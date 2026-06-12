# End-to-End Dashboard Requirement Documentation
## Logistics Analytics Dashboard
**Version:** 2.0 (Final)
**Date:** June 2026
**Purpose:** Complete technical and product-level specification for building the Logistics Dashboard — covering data flow, UI structure, every component, role-based access, search behavior, interaction design, and visualization specs.

---

## 📌 Table of Contents
1. [Data Flow: Source to Screen](#1-data-flow-source-to-screen)
2. [Application Entry Points & Routing (Role-Based)](#2-application-entry-points--routing-role-based)
3. [Global Layout Structure](#3-global-layout-structure)
4. [Filter System — Per Role](#4-filter-system--per-role)
5. [Search Functionality — Per Context](#5-search-functionality--per-context)
6. [Page 1: Summary Dashboard — Super Admin Only](#6-page-1-summary-dashboard--super-admin-only)
7. [Page 2: Orders Management — All Roles](#7-page-2-orders-management--all-roles)
8. [Page 3: Trips Monitoring — All Roles](#8-page-3-trips-monitoring--all-roles)
9. [Reports Page](#9-reports-page)
10. [Interaction & Drill-Down Specification](#10-interaction--drill-down-specification)
11. [KPI Visualization Master Reference Table](#11-kpi-visualization-master-reference-table)

---

## 1. Data Flow: Source to Screen

### Step 1: Source Data (LSP Performance Report)

The LSP system generates a performance report — an Excel file or API export — with the following tabs:

```
qwipo_full_report.xlsx
├── Reports               ← Trip-level aggregated metrics per day
├── Details               ← Hop/stop-level trip detail
├── Invoice Level Details ← Order-by-order invoice, status, beat
├── Delivery Aging        ← Orders with aging bucket labels (D1–D4+)
├── Vehicle Raw           ← Vehicle registry (registration, capacity, status)
└── Summary               ← Driver and stop-level summary
```

### Step 2: Buyer Application Master Data

Separate from the LSP report, the Buyer Application database provides:

```
Company Master       → Company ID, Name, Status
Distributor Master   → Distributor ID, Name, Company ID (FK), Brand Type, Status
```

### Step 3: Data Enrichment (Join)

Before serving to the dashboard, operational data is joined with master data:

```
Invoice Record
  └── Distributor ID
        └── Joins: Distributor Master
              └── Pulls: Company ID, Brand Type
                    └── Joins: Company Master
                          └── Pulls: Company Name
```

This enables grouping all deliveries, revenue, and trips **by company**.

### Step 4: API Layer

```
GET /api/master/companies            → Company list (Super Admin only)
GET /api/master/distributors         → Distributor list (filterable by company)
GET /api/summary                     → Summary KPIs (Super Admin only)
GET /api/orders                      → Order-level metrics
GET /api/orders/aging                → Delivery aging heatmap data
GET /api/trips                       → Trip status and fleet metrics
GET /api/drivers                     → Driver performance data
GET /api/search?q=                   → Global search (Super Admin + Company Admin only)
```

**Security middleware on all endpoints:**
- Distributor Admin requests are server-side overridden with `assignedCompanyId` + `distributorId`
- Super Admin / Company Admin requests pass their filter params through
- Cross-company requests return `403 Forbidden`

### Step 5: Frontend State & Rendering

```
User logs in
  → Role + Company context loaded into FilterContext
  → Route guard applies:
      Super Admin   → /summary
      Company Admin → /orders  (Summary sidebar link hidden)
      Dist. Admin   → /orders  (Summary link hidden, filters locked to date only)
  ↓
User changes date range (all) or other filters (Super Admin / Company Admin only)
  ↓
FilterContext updates → Widgets re-fetch + re-render with new data
```

---

## 2. Application Entry Points & Routing (Role-Based)

| Route | Page | Super Admin | Company Admin | Distributor Admin |
| :--- | :--- | :---: | :---: | :---: |
| `/summary` | Summary Dashboard | ✅ (default) | ❌ Redirected to /orders | ❌ Redirected to /orders |
| `/orders` | Orders Management | ✅ | ✅ (default) | ✅ (default) |
| `/trips` | Trips Monitoring | ✅ | ✅ | ✅ |
| `/reports` | Reports Download | ✅ | ✅ | ✅ |

**Login redirect logic:**
```
IF role == 'super_admin'    → redirect to /summary
IF role == 'company_admin'  → redirect to /orders
IF role == 'distributor_admin' → redirect to /orders
```

**Sidebar link visibility:**
- Summary link: shown only for Super Admin. Hidden entirely for Company Admin and Distributor Admin.
- Orders, Trips, Reports: shown for all roles.

---

## 3. Global Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  [SIDEBAR]     │  [TOP BAR]                                │
│                │  Page Title | [Filters] | Search | User   │
│  [Summary]*    │────────────────────────────────────────── │
│  Orders        │                                           │
│  Trips         │   [CONTENT AREA — Active Page]            │
│  Reports       │                                           │
│                │                                           │
│  [User/Logout] │                                           │
└────────────────────────────────────────────────────────────┘
* Summary link visible only to Super Admin
```

### 3.1 Sidebar
- Logo / app name at top
- Navigation links (role-filtered — see above)
- Active page highlighted
- User name + role + logout at bottom

### 3.2 Top Bar
Contains, left to right:
1. **Page Title** (changes per active page)
2. **Filters** (see Section 4 — role-dependent)
3. **Global Search Bar** (Super Admin + Company Admin only — see Section 5)
4. **User Avatar / Name**

---

## 4. Filter System — Per Role

### 4.1 Filter Components

| Filter | Component | Default | Super Admin | Company Admin | Distributor Admin |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Date Range** | Date Picker w/ presets (7d / 30d / 90d / Custom) | Last 30 days | ✅ | ✅ | ✅ only filter shown |
| **Company** | Searchable Dropdown | All Companies | ✅ | ❌ Hidden (auto = their company) | ❌ Hidden |
| **Distributor** | Searchable Dropdown (cascades from Company) | All | ✅ | ✅ | ❌ Hidden |
| **Business Type** | Multi-select Dropdown | All Types | ✅ | ✅ | ❌ Hidden |

### 4.2 Distributor Admin Filter Rules (Critical)

- The Top Bar shows **only the Date Range picker** for Distributor Admin users.
- Company, Distributor, and Business Type filter components are **completely hidden** from the DOM — not just disabled.
- Their data scope is enforced by the backend using their session's `assignedCompanyId` and `distributorId`.
- No manual override is possible from the frontend.

### 4.3 Filter Cascade Behavior
- Changing **Company** → Distributor dropdown reloads with only that company's distributors. Previous Distributor selection is cleared.
- Changing **any** filter → all widgets on the current page re-fetch and re-render.
- Changing page (navigating Orders → Trips) → filters persist; Trips page loads with the current filter context.

### 4.4 FilterContext State Shape

```typescript
interface FilterState {
  dateRange: [Date, Date];           // Always present for all roles
  selectedCompany: string | null;    // null = all (Super Admin); locked for others
  selectedDistributor: string | null;// null = all; locked for Distributor Admin
  selectedBusinessType: string | null;
  userRole: 'super_admin' | 'company_admin' | 'distributor_admin';
  assignedCompanyId: string | null;  // Populated from session on login
  assignedDistributorId: string | null; // Populated from session on login
}
```

---

## 5. Search Functionality — Per Context

### 5.1 Global Search Bar (Top Bar)

> **Available for:** Super Admin, Company Admin  
> **Not available for:** Distributor Admin

**Placement:** Top Bar, between filters and user avatar.

**Behavior:**
- **Placeholder:** "Search distributors, drivers, stores..."
- **Trigger:** Real-time search starts after **2 characters** typed
- **Debounce:** 300ms after user stops typing before API call fires
- **Display:** Results appear in a floating dropdown overlay below the search bar

**Result Categories and Searchable Fields:**

| Category | Searched Against | Result Display | On Click |
| :--- | :--- | :--- | :--- |
| **Distributors** | Distributor Name, Distributor Code, City | Name + Code + City pill | Navigate to Orders page, pre-filter to that distributor |
| **Drivers** | Driver Name | Name + Vehicle Registration | Navigate to Trips page, scroll to driver in table + highlight row |
| **Stores / Beats** | Store Name, Sales Beat Name | Store Name + Beat | Navigate to Orders → Delivery Aging, filtered to that store/beat |

**Result Dropdown Structure:**
```
┌─────────────────────────────────────────┐
│  Distributors (3)                       │
│  ├── DIS-HYD-004 · Hyderabad           │
│  ├── DIS-KRN-001 · Kurnool             │
│  └── DIS-MUM-012 · Mumbai              │
│─────────────────────────────────────────│
│  Drivers (2)                            │
│  ├── Ramesh Kumar  · AP09TA7790         │
│  └── Suresh Babu  · TS07AB1234         │
│─────────────────────────────────────────│
│  Stores (2)                             │
│  ├── SABA K/G/S(L-2) · RING ROAD 1A   │
│  └── Denakara Enterprises              │
└─────────────────────────────────────────┘
```

- Max **5 results per category** in the dropdown
- If no results: single row "No results found for '[query]'"
- Pressing **Escape** closes dropdown without navigating
- Pressing **Enter** on the highlighted result navigates to it

---

### 5.2 In-Table Search — Driver Performance Table (Trips Page)

> **Available for:** All roles

**Placement:** Top-right of the Driver Performance Analytics table header section.

| Property | Detail |
| :--- | :--- |
| **Input placeholder** | "Search by driver name or vehicle..." |
| **Trigger** | Instant, from first character typed |
| **Type** | Client-side filter (no API call — filters the already-loaded table rows) |
| **Searched fields** | `Driver Name`, `Vehicle Registration Number` |
| **Match type** | Substring match, case-insensitive |
| **No match state** | Table body shows: "No drivers match your search." |
| **Clear** | `×` button in the input clears and restores all rows |
| **Affects** | Only the visible table rows — summary KPI cards above the table are NOT affected |

**Example:**
- User types "ram" → only rows where Driver Name or Vehicle contains "ram" (e.g., "Ramesh Kumar") are shown
- Other rows disappear from the table; the footer total row updates to reflect visible rows only

---

### 5.3 In-Table Search — Distributor Performance Table (Orders Page / Dashboard)

> **Available for:** Super Admin, Company Admin only

**Placement:** Top-right of the Distributor Performance Comparison table header.

| Property | Detail |
| :--- | :--- |
| **Input placeholder** | "Search distributor..." |
| **Trigger** | Instant, from first character |
| **Type** | Client-side filter |
| **Searched fields** | `Distributor Code`, `City` |
| **Match type** | Substring match, case-insensitive |
| **No match state** | "No distributors match your search." |

---

### 5.4 Column Highlight Search — Delivery Aging Heatmap

> **Available for:** Super Admin, Company Admin only

**Placement:** Above the Delivery Aging Matrix, left-aligned.

| Property | Detail |
| :--- | :--- |
| **Input placeholder** | "Highlight distributor in matrix..." |
| **Trigger** | Instant, from first character |
| **Type** | Client-side column highlight (no row/data removal) |
| **Searched fields** | Distributor Code (column headers) |
| **Match behavior** | Matching columns become visually prominent (full opacity); non-matching columns are dimmed (30% opacity) |
| **Clear** | Clearing input restores all columns to full opacity |
| **Purpose** | Quickly locate a specific distributor's aging data in a wide heatmap with many columns |

---

## 6. Page 1: Summary Dashboard — Super Admin Only

> ⚠️ **This page is EXCLUSIVELY for the Super Admin.** The Sidebar Summary link is hidden for Company Admin and Distributor Admin. Any direct navigation to `/summary` by non-Super Admin is redirected to `/orders`.

**Default landing page for Super Admin.**

### Layout Grid

```
Row 1 (4 columns):  [Companies] [Distributors] [Deliveries] [Invoice Value]
Row 2:              "Customer Companies" section header
Row 3 (2 columns):  [ITC Entity Card]  [HUL Entity Card]  ← dynamic, one per company
```

---

### Component 1.1: Companies KPI Card
- **Type:** Scorecard
- **Value:** Active / Total (e.g., "2 / 2")
- **Icon:** Building2
- **Accent:** Indigo (#6366F1)
- **Source:** `/api/master/companies` — COUNT Active + Total
- **No sparkline** — count doesn't change frequently

---

### Component 1.2: Distributors KPI Card
- **Type:** Scorecard
- **Value:** Active / Total (e.g., "20 / 20")
- **Icon:** Building
- **Accent:** Cyan (#0891B2)
- **Source:** `/api/master/distributors`

---

### Component 1.3: Deliveries KPI Card
- **Type:** Scorecard + 7-day sparkline
- **Value:** "22,682" total deliveries in period
- **Sparkline:** Daily delivery count mini line chart
- **Trend badge:** % change vs prior period
- **Accent:** Emerald (#10B981)
- **Source:** Reports: `SUM(Delivered)` grouped by `Trip Date`

---

### Component 1.4: Invoice Value KPI Card
- **Type:** Scorecard + 7-day sparkline
- **Value:** "₹9.97 Cr"
- **Sparkline:** Daily revenue mini line chart
- **Trend badge:** % change vs prior period
- **Accent:** Green (#059669)
- **Source:** Reports: `SUM(Net Sale Value)`

---

### Component 1.5: Company Entity Cards (Dynamic)

Rendered one per company. Generated dynamically from Company Master — no hardcoding.

```typescript
companies.map(company => <CompanyCard key={company.id} ... />)
```

**Each Card contains:**

**Header row:**
- Company logo badge (colored abbreviation)
- Company Name + Onboarded date
- Status badge: "Active" (green pill)

**Metrics Grid (3 columns × 2 rows):**

| Metric | Formula | Source |
| :--- | :--- | :--- |
| Distributors | COUNT active for this company | Buyer App Master |
| Beats | COUNT UNIQUE(Sales Beat Name) for this company's distributors | Invoice Level Details |
| Vehicles | COUNT UNIQUE(Registration Number) for this company's distributors | Vehicle Raw |
| Deliveries | SUM(Delivered) for this company's distributors | Reports |
| Revenue | SUM(Total Net Sale) for this company's distributors | Reports |

**Visualization:** Information Panel — company badge + 5-metric grid of Simple Numeric Indicators.

---

## 7. Page 2: Orders Management — All Roles

**Available to:** Super Admin, Company Admin, Distributor Admin  
**Default landing page for:** Company Admin, Distributor Admin

### Layout Grid

```
Row 1 (3 columns): [Total Orders] [Orders in Progress] [Delivered Orders]
Row 2 (2 columns): [Invoice Value] [Sales vs Digital]   ← hidden for Distributor Admin
Row 3 (full):      [Delivery Aging Matrix Heatmap + column search]
Row 4 (3 cols):    [Order Volume Trend (2/3)] [Order Status Donut (1/3)]
```

---

### Component 2.1: Total Orders KPI Card
- **Type:** Scorecard + 7-day sparkline bar chart
- **Value:** Total delivery attempts this week
- **Trend:** % vs last week
- **Accent:** Indigo
- **Source:** Reports: `SUM(Total Delivery Attempt)` for selected period
- **Visible:** All roles

---

### Component 2.2: Orders in Progress KPI Card
- **Type:** Scorecard (no sparkline)
- **Value:** Count of live orders
- **Accent:** Cyan
- **Source:** Invoice Level Details: `COUNT WHERE Status = 'started'`
- **Visible:** All roles

---

### Component 2.3: Delivered Orders KPI Card
- **Type:** Scorecard
- **Value:** Count + delivery success % as subtitle
- **Accent:** Green
- **Source:** Invoice Level Details: `SUM(Delivered)`
- **Visible:** All roles

---

### Component 2.4: Invoice Value KPI Card
- **Type:** Scorecard
- **Value:** This week's net sale value
- **Accent:** Green
- **Source:** Reports: `SUM(Net Sale Value)`
- **Visible:** Super Admin + Company Admin only. **HIDDEN for Distributor Admin.**

---

### Component 2.5: Sales vs Digital Split
- **Type:** Segmented Horizontal Bar
- **Layout:** Left stat (Sales count) → Gradient bar → Right stat (Digital count)
- **Bar colors:** Indigo-Purple (Sales) | Cyan-Blue (Digital)
- **Labels:** Percentage at each end
- **Source:** Invoice Level Details: `COUNT grouped by Order Type`
- **Visible:** Super Admin + Company Admin only. **HIDDEN for Distributor Admin.**

---

### Component 2.6: Delivery Aging Matrix (Heatmap)
- **Type:** Heatmap Grid
- **Rows:** D1, D2, D3, D4+ (aging buckets)
- **Columns:** Distributor codes (horizontally scrollable if many)
- **Cells:** Order count for that Bucket × Distributor
- **Color scale:**
  - < 10% of max → Light green (#ECFDF5)
  - 10–44% → Yellow (#FEF9C3)
  - 45–64% → Light orange (#FED7AA)
  - 65–81% → Light red (#FECACA)
  - 82%+ → Solid red (#EF4444)
- **D4+ row:** Always labeled in red
- **Footer:** Column totals per distributor
- **Tooltip:** Hover → "D3 · DIS-HYD-004: 14 orders"
- **Drill-down:** Click cell → modal with individual order list
- **Search:** Column highlight search above the heatmap (Super Admin + Company Admin only — see Section 5.4)
- **Source:** Delivery Aging: `COUNT grouped by Delivery Aging Bucket × Distributor ID`
- **Visible:** All roles (Distributor Admin sees only their own column)

---

### Component 2.7: Order Volume Trend Chart
- **Type:** Dual-Axis Composed Chart (Bar + Line)
- **Left Y-axis:** Order count → Bars in Indigo
- **Right Y-axis:** Invoice value in ₹ Lakh → Line in Emerald
- **X-axis:** Dates
- **Tooltip:** Both values on hover
- **Invoice line:** Hidden for Distributor Admin
- **Source:** Reports: daily aggregation of `Total Delivery Attempt + Net Sale Value`
- **Visible:** All roles (Distributor Admin sees bar only, no ₹ line)

---

### Component 2.8: Order Status Distribution Donut
- **Type:** Donut Pie Chart
- **Segments:**
  | Status | Color |
  | :--- | :--- |
  | Delivered | Emerald (#10B981) |
  | In Planning | Indigo (#6366F1) |
  | Returned | Amber (#F59E0B) |
  | Partial Return | Orange (#FB923C) |
  | Cancelled | Red (#EF4444) |
- **Donut hole center:** Total order count
- **Legend:** Name + Count + % below the chart
- **Tooltip:** Hover segment → count + %
- **Source:** Invoice Level Details + Summary: COUNT by Status
- **Visible:** All roles

---

## 8. Page 3: Trips Monitoring — All Roles

**Available to:** Super Admin, Company Admin, Distributor Admin

### Layout Grid

```
Row 1 (4 columns): [Planned] [In Progress] [Completed] [Cancelled]
Row 2 (full):      [Avg Run Time Card + Sparkline]
Row 3 (3 cols):    [Fleet Utilization Gauges (2/3)] [Total Delivery Stops (1/3)]
Row 4 (full):      [Trips per Day Bar Chart]
Row 5 (3 cols):    [Total Drivers] [Total Trips] [Total Distance]
Row 6 (full):      [Driver Performance Table + in-table search]
```

---

### Components 3.1–3.4: Trip Lifecycle Status Cards (4 Cards)

| Card | Color | Formula | Source |
| :--- | :--- | :--- | :--- |
| **Planned** | Indigo | COUNT UNIQUE(Trip Number) | Details: Trip Number |
| **In Progress** | Amber | COUNT WHERE Delivery Status = 'started' | Details: Delivery Status |
| **Completed** | Emerald | COUNT WHERE Trip Complete = true | Details: Trip Complete |
| **Cancelled** | Slate | COUNT(Returned Cancelled) | Reports: Returned: Cancelled |

Each card: colored top border, large numeric, "X% of Y total" sub-text, mini progress bar. All roles see these.

---

### Component 3.5: Average Run Time Card (Full-Width Row)
- **Type:** KPI Card + Area Sparkline
- **Left:** "3.2 hrs per trip" value + "Per trip · target ≤ 4h" subtitle
- **Right:** 8-point area chart (daily avg run time). Dashed reference line at 4h target.
- **Trend badge:** % change (downward = green = good)
- **Accent:** Purple (#8B5CF6)
- **Source:** Reports: `AVERAGE(Average Run Time (Min/Hr))`
- **Visible:** All roles

---

### Component 3.6: Fleet Utilization Panel (3 Gauges)
- **Type:** Panel with 3 × Semicircular SVG Gauge Charts
- **Each gauge:** Arc fills to current %. Shows "✓ On target" or "Target: X%" below.

| Gauge | Source Field | Target | Color |
| :--- | :--- | :--- | :--- |
| Vehicle Utilization | `Weight Utilization` | 90% | Indigo |
| Time Utilization | `Time Utilization` | 85% | Cyan |
| Delivery Point Util. | `Delivery Point Utilization` | 90% | Green |

- **Source:** Reports tab
- **Visible:** All roles

---

### Component 3.7: Total Delivery Stops Card
- **Type:** KPI Card + Area Chart (fills card body)
- **Value:** "4,218 stops covered today"
- **Area chart:** Mon–Sun daily stop count
- **Trend badge:** % vs previous week
- **Accent:** Purple (#8B5CF6)
- **Source:** Summary: `SUM(Total Delivered)` grouped by date
- **Visible:** All roles

---

### Component 3.8: Trips per Day Bar Chart
- **Type:** Color-intensity Bar Chart
- **X-axis:** Day (Mon–Sun) or Week (W1–W4) based on toggle
- **Bar intensity by trip count:**
  - < 50% of peak → #A5B4FC (light purple)
  - 50–69% → #818CF8
  - 70–89% → #6366F1
  - 90%+ → #4F46E5 (dark indigo)
- **Top-right toggle:** "This Week" / "Monthly"
- **Inline stats above chart:** Total trips count + Avg/day
- **Tooltip:** Click or hover → exact trip count
- **Source:** Reports: `Number of Trips` grouped by `Trip Date`
- **Visible:** All roles

---

### Components 3.9–3.11: Driver Summary Stat Cards

| Card | Value | Sub-label | Color |
| :--- | :--- | :--- | :--- |
| **Total Drivers** | COUNT(active drivers) | "Active this period" | Indigo |
| **Total Trips** | SUM(trips per driver) | "X avg per driver" | Green |
| **Total Distance** | SUM(Total Trip Km) | "X avg km/driver" | Cyan |

Visible: All roles.

---

### Component 3.12: Driver Performance Analytics Table
- **Type:** Sortable Data Table with in-table search
- **Search:** See Section 5.2 — searches Driver Name + Vehicle Registration
- **Columns:**

| Column | Data | Notes |
| :--- | :--- | :--- |
| # (Rank) | 1–N | Rows 1–3 get gold badge |
| Driver Name | Text | — |
| Vehicle | Registration (monospace) | — |
| Trips | Count | Sortable |
| Distance (km) | Total km | Sortable |
| Attempts | Total | — |
| Returns | Total | — |
| Success Rate | % = (Attempts − Returns) / Attempts | Color-coded |
| Runtime | Avg formatted time | — |

- **Success Rate colors:** ≥ 95% = Green, 90–94% = Amber, < 90% = Red
- **Footer row:** Total trips, total km, driver count, avg km/driver
- **Drill-down:** Click row → modal with day-by-day trip breakdown
- **Source:** Summary + Vehicle Raw, aggregated by Driver Name
- **Visible:** All roles

---

## 9. Reports Page

### Component 9.1: Report Download
- **Type:** Full-page centered CTA
- **States:**
  - Default: "Download Report" — Indigo gradient button
  - Downloading: "Generating Excel..." — Grey, disabled
  - Success: "Downloaded Successfully" — Green + checkmark icon (auto-resets after 3 seconds)
- **Output:** Multi-sheet Excel:
  - Sheet 1: Reports
  - Sheet 2: Summary
  - Sheet 3: Details
  - Sheet 4: Invoice Level Details
  - Sheet 5: Delivery Aging
  - Sheet 6: Vehicle Raw
- **File name:** `qwipo_full_report_YYYY-MM-DD.xlsx`
- **Filter respect:** The downloaded Excel is scoped to the current filter context (date range, company, distributor)
- **Visible:** All roles (export content scoped by role automatically)

---

## 10. Interaction & Drill-Down Specification

| Trigger | Action | Result |
| :--- | :--- | :--- |
| **Click Company Card** (Summary, Super Admin) | Navigate | Opens Orders page, pre-filtered to that company |
| **Click Distributor row** in performance table | Navigate | Opens Orders page pre-filtered to distributor; shows "Back to Dashboard" banner |
| **Click Heatmap cell** | Open modal | Shows list of individual orders for that aging bucket × distributor combination |
| **Click Trips per Day bar** | Tooltip / highlight | Exact trip count shown; bar highlighted |
| **Click Driver row** in table | Open modal | Day-by-day trip breakdown for that driver |
| **Type in Global Search** | Overlay dropdown | Grouped results: Distributors / Drivers / Stores (max 5 per group) |
| **Select search result** | Navigate | Goes to relevant page with that entity pre-filtered |
| **Type in Driver table search** | Filter rows | Real-time; matching rows shown, non-matching hidden |
| **Type in Distributor table search** | Filter rows | Real-time; matching distributor rows shown |
| **Type in Heatmap column search** | Column highlight | Matching columns = full opacity; others dimmed to 30% |
| **Change Date Range** | Re-render | All widgets on current page re-fetch |
| **Change Company filter** | Re-render + cascade | Distributor dropdown reloads; all widgets re-render |
| **Change Distributor filter** | Re-render | All widgets update to that distributor's data |
| **Hover any chart element** | Tooltip | Formatted value with context label shown |
| **Navigate to new page** | Filter persist | Active filters carry over to the new page |

---

## 11. KPI Visualization Master Reference Table

| # | KPI Name | Page | Visible To | Visualization Type | Chart Component |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | Companies | Summary | Super Admin only | Scorecard | KPICard |
| 2 | Distributors | Summary | Super Admin only | Scorecard | KPICard |
| 3 | Deliveries (30d) | Summary | Super Admin only | Scorecard + Sparkline | KPICard + mini line |
| 4 | Invoice Value (30d) | Summary | Super Admin only | Scorecard + Sparkline | KPICard + mini line |
| 5 | Company Entity Cards | Summary | Super Admin only | Information Panel | Custom card |
| 6 | Total Orders | Orders | All roles | Scorecard + Sparkline | KPICard + sparkData |
| 7 | Orders in Progress | Orders | All roles | Scorecard | KPICard |
| 8 | Delivered Orders | Orders | All roles | Scorecard | KPICard |
| 9 | Invoice Value (weekly) | Orders | Super Admin + Company Admin | Scorecard | KPICard |
| 10 | Sales vs Digital | Orders | Super Admin + Company Admin | Segmented Horizontal Bar | Custom component |
| 11 | Delivery Aging Matrix | Orders | All roles | Heatmap Grid + Column Search | Custom CSS grid |
| 12 | Order Volume Trend | Orders | All roles (₹ line hidden for Dist. Admin) | Dual-Axis Composed Chart | ComposedChart (Recharts) |
| 13 | Order Status Distribution | Orders | All roles | Donut Pie Chart | PieChart w/ innerRadius |
| 14 | Planned Trips | Trips | All roles | Status Card | Custom card |
| 15 | In Progress Trips | Trips | All roles | Status Card | Custom card |
| 16 | Completed Trips | Trips | All roles | Status Card | Custom card |
| 17 | Cancelled Trips | Trips | All roles | Status Card | Custom card |
| 18 | Average Run Time | Trips | All roles | KPI Card + Area Sparkline + Reference Line | AreaChart + ReferenceLine |
| 19a | Vehicle Utilization | Trips | All roles | Semicircular Gauge | Custom SVG |
| 19b | Time Utilization | Trips | All roles | Semicircular Gauge | Custom SVG |
| 19c | Delivery Point Util. | Trips | All roles | Semicircular Gauge | Custom SVG |
| 20 | Total Delivery Stops | Trips | All roles | KPI Card + Area Chart | AreaChart (Recharts) |
| 21 | Trips per Day | Trips | All roles | Intensity Bar Chart | BarChart + Cell |
| 22a | Total Drivers | Trips | All roles | Stat Card | Custom card |
| 22b | Total Trips (Driver) | Trips | All roles | Stat Card | Custom card |
| 22c | Total Distance | Trips | All roles | Stat Card | Custom card |
| 23 | Driver Performance Table | Trips | All roles | Sortable Table + In-Table Search | HTML table |
| — | Global Search | Top Bar | Super Admin + Company Admin | Overlay Dropdown | Custom search |
| — | Distributor Table Search | Orders | Super Admin + Company Admin | Inline Text Filter | Input + client filter |
| — | Heatmap Column Search | Orders | Super Admin + Company Admin | Column Highlight | Input + opacity filter |
| — | Driver Table Search | Trips | All roles | Inline Text Filter | Input + client filter |
