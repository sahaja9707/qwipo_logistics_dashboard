Design a modern logistics analytics dashboard web application with role-based access control and separate dashboard experiences for:

1. Super Admin
2. Distributor Admin
3. Distributor Branch Manager
4. Distributor Admin Support

The platform should feel enterprise-grade, clean, modern, operationally focused, and optimized for quick decision-making. The UI should prioritize operational visibility, alerts, logistics efficiency, and drilldowns.

==================================================
AUTHENTICATION & ROLE-BASED ACCESS
==================================================

Create separate login experiences and dashboard visibility for each role.

Each login should:
- Have role-based permissions
- Display different KPIs
- Show different charts/tables/modules
- Restrict sensitive operational data where needed
- Maintain the same UI design system across all roles

==================================================
ROLE DEFINITIONS
==================================================

1. SUPER ADMIN
- Full platform visibility
- Access across all distributors and branches
- Can manage users and scheduled reports
- Can view operational analytics globally

2. DISTRIBUTOR ADMIN
- Access only to assigned distributor
- Can monitor branches, fleet, trips, and orders
- Can manage branch-level visibility
- Full operational visibility within distributor scope

3. DISTRIBUTOR BRANCH MANAGER
- Access only to assigned branch
- Can monitor trips, deliveries, delays, returns
- Limited operational analytics
- Focused on branch execution and delivery health

4. DISTRIBUTOR ADMIN SUPPORT
- Operational support role
- Can view trips/orders/issues
- Cannot access sensitive analytics or admin controls
- Read-heavy operational interface

==================================================
DASHBOARD STRUCTURE
==================================================

The dashboard should be divided into:

1. Overview Dashboard
2. Orders Module
3. Distribution Module
4. Trips Module
5. Alerts & Exceptions
6. User Management
7. Reports

==================================================
TOP KPI CARDS
==================================================

Use modern metric cards with:
- Mini sparklines
- Trend indicators
- Status colors
- Percentage movement

Suggested KPIs:
- Total Orders
- Active Trips
- Delivery Success Rate
- Delayed Deliveries
- Vehicle Utilization %
- Return %
- Active Vehicles
- Invoice Value
- Unique Customers

==================================================
ORDERS MODULE
==================================================

Include the following Order-based SKUs/features:

- Invoice Value
- Returned : Cancelled
- Returned : Delivery Retry
- Delivery Aging:
  - D0
  - D1
  - D2
  - D3
  - D4+
- No of Orders
- Order Status Distribution:
  - Delivered
  - In Planning
  - Returned
  - Partial Return
  - Cancelled
- Orders Contribution by Type:
  - Sales
  - Digital

==================================================
ORDER VISUALIZATIONS
==================================================

Use:
- Donut Chart for Order Status Distribution
- Stacked Bar Chart for Delivery Aging
- Trend Line for Order Volume
- Tables for detailed order lists
- Alert cards for delayed/cancelled orders

==================================================
DISTRIBUTION MODULE
==================================================

Include the following Distribution-based SKUs/features:

- Operations Overview
- Average Vehicles Used
- Unique Customers
- Driver Performance Analytics:
  - Delivery Attempts
  - Total Returns
  - Net Sale (Rs. Lakhs)
  - Net Sale Contribution %
  - Return %

==================================================
DISTRIBUTION VISUALIZATIONS
==================================================

Use:
- Horizontal Bar Charts for branch/distributor performance
- Driver leaderboard tables
- Vehicle utilization gauges
- Customer distribution charts
- Fleet usage trend graphs

==================================================
TRIPS MODULE
==================================================

Include the following Trips-based SKUs/features:

- No of KMs (Planned vs Live Distance)
- Trips
- Anomalies
- Delivery Cost
- Vehicle Utilization %
- Time Utilization %
- Delivery Point Utilization %
- Average Run Time

==================================================
TRIPS VISUALIZATIONS
==================================================

Use:
- Side-by-side Bar Chart for Planned vs Actual Distance
- Line Graph for Trips Trend
- Gauge Charts for Vehicle Utilization
- Timeline/Feed for Anomalies
- Runtime trend analysis charts

==================================================
ALERTS & EXCEPTIONS MODULE
==================================================

Create a centralized operational alert system.

Include:
- Delayed delivery alerts
- High return alerts
- Vehicle underutilization alerts
- Runtime anomalies
- Delivery failure spikes

Display alerts using:
- Timeline feed
- Alert cards
- Severity color coding
- Notification badges

==================================================
USER MANAGEMENT MODULE
==================================================

SUPER ADMIN ONLY:
- Users List
- Create/Delete Users
- Assign Roles
- Scheduled Reports
- Auto-email recipients

DISTRIBUTOR ADMIN:
- Limited branch user visibility

BRANCH MANAGER & SUPPORT:
- No user management access

==================================================
ROLE-BASED VISIBILITY MATRIX
==================================================

SUPER ADMIN:
- Full access to all modules and analytics

DISTRIBUTOR ADMIN:
- Full distributor-level access
- Cannot manage platform-level settings

BRANCH MANAGER:
- Branch-only operational metrics
- No advanced analytics
- No sensitive financial/admin data

DISTRIBUTOR ADMIN SUPPORT:
- Read-only operational dashboards
- No user management
- No sensitive analytics
- No high-level comparative insights

==================================================
DESIGN STYLE
==================================================

Design Requirements:
- Modern SaaS dashboard aesthetic
- Dark sidebar + light content area
- Clean spacing
- Enterprise-grade layout
- Responsive web design
- Minimal clutter
- Card-based UI
- Professional typography
- Logistics-focused operational feel

==================================================
MAIN NAVIGATION
==================================================

Sidebar navigation:
- Dashboard Overview
- Orders
- Distribution
- Trips
- Alerts & Exceptions
- Reports
- User Management
- Settings

==================================================
WIREFRAME REQUIREMENTS
==================================================

Generate:
1. Main dashboard wireframe
2. Separate dashboard states for each role
3. Different widgets/cards visible based on role
4. Mobile + desktop responsive layouts
5. Example tables/charts for operational monitoring
6. Role-specific sidebar/menu visibility
7. Example alerts panel
8. Drilldown interaction examples

The wireframe should clearly show how each role sees different data, permissions, KPIs, charts, and operational insights while maintaining one unified platform design system.