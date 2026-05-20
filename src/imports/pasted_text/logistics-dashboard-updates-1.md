# Logistics Dashboard UI/UX Changes & Feature Updates

## Global Dashboard Changes

* Remove the separate main dashboard landing page entirely.
* After login, directly redirect users into their role-specific dashboard view similar to the provided reference images.
* Maintain role-based perspectives:

  * Super Admin
  * Company Admin
  * Distributor Admin
  * Other existing role-based dashboards

---

# Global Filters (Applicable Across Dashboard)


 Add a top-level filter section   

## Required Filters

* Company

  * Dropdown should include sample FMCG companies such as:

    * ITC
    * HUL (Hindustan Unilever)
    * Nestlé
    * Britannia
    * Dabur
* State

  * Dropdown should display state names
* City

  * Dropdown should display city names based on the selected state
* Distributor

  * Distributor dropdown should display distributor codes
* From Date- To Date--> similar to the “Customized Reports” filter design.  

## Filter Behavior

* Filters should dynamically update all dashboard widgets/charts/tables.
* Date selection UI should match the existing customized reports section design.

---

# Orders Module Changes

## Delivery Aging Heatmap 

* Replace branch-based grouping with distributor-name-based grouping.
* Add horizontal scrolling support for multiple utilities/distributors.
* Maintain the same layout height currently used on the webpage.

---

## Order Volume Trend

Enhance the graph by adding:

* total price for each specific day  
* Total number of orders

Display both metrics together in a visually readable way.

---

## Recent Orders

* Remove the Recent Orders section completely.

---

## Anomalies Section

Replace current anomaly display with:

* A structured anomaly list view

Each anomaly item should:

* Be clickable
* Redirect to a detailed anomaly insights page

### Anomaly Details Page Should Include

* Origin/source of anomaly
* Estimated financial loss
* Related distributor/utility
* Time/date information
* Severity level
* Operational impact
* Recommended action or cause analysis
* Any other relevant logistics insights

---

## Order Status Pie Chart

* Keep only the pie chart visualization.
* Remove the dropdown interaction/functionality that displays the underlying order list.
* No drilldown required.

---

# Distribution Module Changes

## Remove Cards

Remove the following cards entirely:

* Active Vehicles
* Vehicle Allocation
* Active Branch
* Customer Satisfaction

---

## Avg Vehicles Used

Instead of the removed Active Vehicles card:

* Add a trend visualization for Average Vehicles Used
* On clicking/interacting, users should get expanded trend insights/history for better operational understanding

---

## Driver Performance Table

### Remove Column

* Remove:

  * Deliveries/Vehicle/Day column

### High Return Rate Drivers Visibility

Current red highlight is not noticeable enough.

Implement a stronger visual indicator for drivers with high return rates, such as:

* Alert badges
* Warning icons
* Pulsing/highlighted rows
* Sticky priority positioning
* Risk labels
* Heat indicators
* Any better UX solution that makes them immediately noticeable

Focus on operational visibility and quick detection.

---

## Vehicle Usage Trend

Current graph lacks clarity and insight.

Redesign/improve the visualization by:

* Making trends more readable
* Improving data storytelling
* Showing usage efficiency patterns
* Highlighting peak and low utilization periods
* Using a more meaningful chart type if necessary

---

# Trips Module Changes

## Rename Metric

Rename:

* “Distance Variance”

To:

* “Planned vs Live Distance”

---

# Reports Module Changes

## Remove Gmail Option

* Remove email/Gmail sharing/export option.
* Keep only download/export functionality.

---

## Delivery Retry Metric

* Re-add the Delivery Retry section/metric that was previously removed.
* Ensure it is visible in reports/dashboard where relevant.

---

# UI/UX Expectations

* Keep the dashboard visually clean and minimal.
* Avoid overcrowding cards and widgets.
* Prioritize readability and operational insights.
* Ensure responsive scrolling where data density is high.
* Maintain consistent spacing and hierarchy throughout the dashboard.
* Preserve executive-level readability while supporting drill-down workflows.\

 

| Also make sure that all the skus given below are there in the wireframe in some form or the other                     |
| --------------------------------------------------------------------------------------------------------------------- |
| Logistics                                                                                                             |
| No of Kms (Planned Vs Live Distance)                                                                                  |
| Trips                                                                                                                 |
| Anomalies                                                                                                             |
| Delivery Cost                                                                                                         |
| Vehicle utilization %                                                                                                 |
| Time utilization %                                                                                                    |
| Delivery Point Utilization %                                                                                          |
| Invoice value                                                                                                         |
| Average Run time                                                                                                      |
| Returned : Cancelled                                                                                                  |
| Returned : Delivery Retry                                                                                             |
| Delivery Aging:  D0, D1, D2, D3, D+4 & More                                                                           |
|                                                                                                                       |
|                                                                                                                       |
| Operations                                                                                                            |
| Average Vehicles Used                                                                                                 |
| No of Orders                                                                                                          |
| Unique Customers                                                                                                      |
| Order Status Distribution: Delivered · In Planning · Returned · Partial Return · Cancelled                            |
| Orders Contribution by Type(sales,Digital)                                                                            |
| Driver Performance Analytics :  Delivery Attempts, Total Returns, Net Sale (Rs. Lakhs), Net Sale Contri %, % Returns  |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
|                                                                                                                       |
| Reports                                                                                                               |
| Delivery Aging Report:  Start & End date of order creation                                                            |
| Day Wise perfomance Summary:Start & End date of Trip Creation date                                                    |

  
