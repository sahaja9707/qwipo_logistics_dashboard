# Logistics Dashboard Requirements (Grouped Properly)

Much cleaner structure this way. If you present everything as one giant KPI soup, stakeholders start nodding seriously while understanding absolutely nothing. Corporate survival mechanism.

---

# 1. DISTRIBUTOR MODULE

Focus: Distributor-level operational performance, branch efficiency, and logistics health.

---

## Distributor Overview KPIs

| Requirement                           | Super Admin | Company Admin | Distributor Admin | Branch Manager |
| ------------------------------------- | ----------- | ------------- | ----------------- | -------------- |
| Total Active Distributors             | Yes         | Yes           | No                | No             |
| Distributor-wise Delivery Performance | Yes         | Yes           | Yes               | Limited        |
| Distributor Utilization %             | Yes         | Yes           | Yes               | No             |
| Distributor Success Rate              | Yes         | Yes           | Yes               | Limited        |
| Distributor Return %                  | Yes         | Yes           | Yes               | Limited        |
| Distributor Delivery Aging            | Yes         | Yes           | Yes               | Limited        |
| Distributor Active Vehicles           | Yes         | Yes           | Yes               | No             |
| Distributor Operational Status        | Yes         | Yes           | Yes               | Yes            |

---

## Distributor Analytics

| Requirement                  | Super Admin | Company Admin | Distributor Admin | Branch Manager |
| ---------------------------- | ----------- | ------------- | ----------------- | -------------- |
| Vehicle Utilization %        | Yes         | Yes           | Yes               | Limited        |
| Time Utilization %           | Yes         | Yes           | Yes               | Limited        |
| Delivery Point Utilization % | Yes         | Yes           | Yes               | No             |
| Average Vehicles Used        | Yes         | Yes           | Yes               | No             |
| Route Efficiency             | Yes         | Yes           | Yes               | Limited        |
| Idle Vehicle Analysis        | Yes         | Yes           | Yes               | No             |
| Branch-wise Performance      | Yes         | Yes           | Yes               | Limited        |
| Driver Performance Analytics | Yes         | Yes           | Yes               | Limited        |

---

## Distributor Alerts & Exceptions

| Requirement                | Super Admin | Company Admin | Distributor Admin | Branch Manager |
| -------------------------- | ----------- | ------------- | ----------------- | -------------- |
| Distributor Anomalies      | Yes         | Yes           | Yes               | Yes            |
| High Return Alerts         | Yes         | Yes           | Yes               | Yes            |
| Delivery Delay Alerts      | Yes         | Yes           | Yes               | Yes            |
| Underutilized Fleet Alerts | Yes         | Yes           | Yes               | No             |
| Branch Risk Flags          | Yes         | Yes           | Limited           | No             |

---

# 2. ORDERS MODULE

Focus: Order lifecycle, fulfillment tracking, returns, and operational commerce.

---

## Orders Overview KPIs

| Requirement      | Super Admin | Company Admin | Distributor Admin | Branch Manager |
| ---------------- | ----------- | ------------- | ----------------- | -------------- |
| Total Orders     | Yes         | Yes           | Yes               | Yes            |
| Active Orders    | Yes         | Yes           | Yes               | Yes            |
| Delivered Orders | Yes         | Yes           | Yes               | Yes            |
| Delayed Orders   | Yes         | Yes           | Yes               | Yes            |
| Cancelled Orders | Yes         | Yes           | Yes               | Yes            |
| Returned Orders  | Yes         | Yes           | Yes               | Yes            |
| Partial Returns  | Yes         | Yes           | Yes               | Yes            |
| Retry Deliveries | Yes         | Yes           | Yes               | Yes            |
| Unique Customers | Yes         | Yes           | Yes               | Yes            |
| Invoice Value    | Yes         | Yes           | Yes               | Yes            |

---

## Order Status & Tracking

| Requirement                                              | Super Admin | Company Admin | Distributor Admin | Branch Manager |
| -------------------------------------------------------- | ----------- | ------------- | ----------------- | -------------- |
| Order Status Distribution                                | Yes         | Yes           | Yes               | Yes            |
| Delivered / In Planning / Returned / Cancelled Breakdown | Yes         | Yes           | Yes               | Yes            |
| Delivery Aging (D0, D1, D2, D3, D4+)                     | Yes         | Yes           | Yes               | Yes            |
| Delivery Retry Tracking                                  | Yes         | Yes           | Yes               | Yes            |
| Order Fulfillment Rate                                   | Yes         | Yes           | Yes               | Yes            |
| Order Failure Trends                                     | Yes         | Yes           | Yes               | Limited        |
| Orders by Channel (Sales / Digital)                      | Yes         | Yes           | Yes               | No             |

---

## Order Analytics

| Requirement              | Super Admin | Company Admin | Distributor Admin | Branch Manager |
| ------------------------ | ----------- | ------------- | ----------------- | -------------- |
| Daily Order Trends       | Yes         | Yes           | Yes               | Yes            |
| Branch-wise Orders       | Yes         | Yes           | Yes               | Yes            |
| Region-wise Orders       | Yes         | Yes           | Yes               | Limited        |
| Peak Order Time Analysis | Yes         | Yes           | Yes               | No             |
| Order Volume Heatmap     | Yes         | Yes           | Yes               | Limited        |

---

# 3. TRIPS MODULE

Focus: Route execution, trip tracking, fleet movement, and operational runtime.

---

## Trips Overview KPIs

| Requirement              | Super Admin | Company Admin | Distributor Admin | Branch Manager |
| ------------------------ | ----------- | ------------- | ----------------- | -------------- |
| Total Trips              | Yes         | Yes           | Yes               | Yes            |
| Active Trips             | Yes         | Yes           | Yes               | Yes            |
| Completed Trips          | Yes         | Yes           | Yes               | Yes            |
| Delayed Trips            | Yes         | Yes           | Yes               | Yes            |
| Cancelled Trips          | Yes         | Yes           | Yes               | Yes            |
| Average Run Time         | Yes         | Yes           | Yes               | Yes            |
| Planned vs Live Distance | Yes         | Yes           | Yes               | Yes            |
| Total Delivery Stops     | Yes         | Yes           | Yes               | Yes            |

---

## Trip Execution Analytics

| Requirement                  | Super Admin | Company Admin | Distributor Admin | Branch Manager |
| ---------------------------- | ----------- | ------------- | ----------------- | -------------- |
| Route Efficiency             | Yes         | Yes           | Yes               | Limited        |
| Vehicle-wise Trip Count      | Yes         | Yes           | Yes               | Yes            |
| Trip Completion Rate         | Yes         | Yes           | Yes               | Yes            |
| Average Stops per Trip       | Yes         | Yes           | Yes               | Limited        |
| Average Distance per Trip    | Yes         | Yes           | Yes               | Limited        |
| Trip Delay Analysis          | Yes         | Yes           | Yes               | Yes            |
| Driver-wise Trip Performance | Yes         | Yes           | Yes               | Limited        |

---

## Trip Monitoring & Alerts

| Requirement               | Super Admin | Company Admin | Distributor Admin | Branch Manager |
| ------------------------- | ----------- | ------------- | ----------------- | -------------- |
| Real-time Trip Monitoring | Yes         | Yes           | Yes               | Yes            |
| Trip Delay Alerts         | Yes         | Yes           | Yes               | Yes            |
| Route Deviation Alerts    | Yes         | Yes           | Yes               | Limited        |
| Excess Runtime Alerts     | Yes         | Yes           | Yes               | Limited        |
| Trip Failure Alerts       | Yes         | Yes           | Yes               | Yes            |

---

# 4. GLOBAL ADMIN & SYSTEM MODULE

Because eventually someone always asks “who deleted the user?” five minutes before a client demo.

---

## User & Access Management

| Requirement       | Super Admin | Company Admin | Distributor Admin | Branch Manager |
| ----------------- | ----------- | ------------- | ----------------- | -------------- |
| Users List        | Yes         | Scoped        | Scoped            | No             |
| Create Users      | Yes         | Yes           | Limited           | No             |
| Edit Users        | Yes         | Yes           | Limited           | No             |
| Delete Users      | Yes         | Yes           | No                | No             |
| Role Assignment   | Yes         | Yes           | No                | No             |
| Scheduled Reports | Yes         | Yes           | No                | No             |

---

# Recommended Final Navigation Structure

## Sidebar Structure

* Dashboard Overview
* Distributor Analytics
* Orders Management
* Trips Monitoring
* Fleet & Drivers
* Alerts & Exceptions
* Reports
* User Management
* Settings

This structure feels enterprise-grade without becoming one of those dashboards where every click opens six nested tabs and a small emotional breakdown.
