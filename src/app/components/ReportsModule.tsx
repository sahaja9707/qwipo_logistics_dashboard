import { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const REPORTS_DATA = [
  {
    'Trip Date': '04/03/2026',
    'Number of Trips': 4,
    'Number of Vehicles': 4,
    'Total Trip (Km)': 89.87,
    'Delivered': 63,
    'Returned': 20,
    'Returned : Cancelled': 0,
    'Returned : Delivery Retry': 0,
    'Total Delivery Attempt': 83,
    'Net Sale Value': 148083,
    'Return Value': 25893,
    'Total Net Sale': 173976,
    'Total Delivery Weight': 2365,
    'Vehicle Vol. Capacity': 4419,
    'Average Run Time (Min)': 356,
    'Average Run Time (Hr)': '5h 56m 1s',
    'Weight Utilization': '54.00%',
    'Delivery Point Utilization': 103.75,
    'Time Utilization': '69.53%'
  }
];

const DETAILS_DATA = [
  {
    'Trip Date': '28/03/2026',
    'Trip Number': '6661293',
    'Buyer Name': 'Denakara Enterprises',
    'Hop Type': 'Pickup',
    'Delivery status': 'Completed',
    'Date & Time Stamp': '28/03/2026, 15:03:30',
    'Total Distance (km)': 0,
    'Hop Name': 'Denakara Enterprises',
    'Travel Time': 'N/A',
    'Unloading Time': '15s',
    'Time taken': '15s',
    'Latitude': 17.40957,
    'Longitude': 78.37952,
    'Hop Weight': 'N/A',
    'Net Invoice Value': 'N/A'
  }
];

const INVOICE_LEVEL_DETAILS_DATA = [
  {
    'Status': 'Returned',
    'Net Invoice Value': 385.38,
    'Weight': 2.81,
    'Volumetric Weight': 3.98,
    'Order Type': 'Sales',
    'Sales Beat Name': 'RING ROAD PRIME 1A',
    'Sales Person Name': 'G VENKATESH ..',
    'Return remark': 'Store is closed or merchant not available',
    'LBNP Trip Number': 'Q-20260330181210-GULO'
  }
];

const DELIVERY_AGING_DATA = [
  {
    'Store Name': 'SABA K/G/S(L-2)',
    'Status': 'Returned',
    'Net Invoice Value': 385.38,
    'Weight': 2.81,
    'Volumetric Weight': 3.98,
    'Order Type': 'Sales',
    'Sales Beat Name': 'RING ROAD PRIME 1A',
    'Sales Person Name': 'G VENKATESH ..',
    'Delivery Aging Bucket': 'T + 2 & More'
  }
];

const VEHICLE_RAW_DATA = [
  {
    'ID': '72d8ad32-2212-43b1-8382-4a2ed7d6e73e',
    'Name': 'WD-AP09TA7790',
    'Registration Number': 'AP09TA7790',
    'Ownership Type': 'Own',
    'Volumetric Capacity': '999.75',
    'Status': 'active'
  }
];

function downloadExcel() {
  const wb = XLSX.utils.book_new();

  const wsReports = XLSX.utils.json_to_sheet(REPORTS_DATA);
  XLSX.utils.book_append_sheet(wb, wsReports, 'Reports');

  const wsSummary = XLSX.utils.json_to_sheet([{ 'Summary Info': 'Detailed summary based on selected filters will appear here.' }]);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const wsDetails = XLSX.utils.json_to_sheet(DETAILS_DATA);
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Details');

  const wsInvoice = XLSX.utils.json_to_sheet(INVOICE_LEVEL_DETAILS_DATA);
  XLSX.utils.book_append_sheet(wb, wsInvoice, 'Invoice Level Details');

  const wsAging = XLSX.utils.json_to_sheet(DELIVERY_AGING_DATA);
  XLSX.utils.book_append_sheet(wb, wsAging, 'Delivery Aging');

  const wsVehicle = XLSX.utils.json_to_sheet(VEHICLE_RAW_DATA);
  XLSX.utils.book_append_sheet(wb, wsVehicle, 'Vehicle Raw');

  XLSX.writeFile(wb, `qwipo_full_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export default function ReportsModule({ role }: { role: string }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      downloadExcel();
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Qwipo Full Report</h2>
        <p className="text-slate-500 text-sm mt-2">Download the comprehensive multi-sheet Excel report covering Operations, Logistics, and Fleet data.</p>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          background: downloading
            ? '#94A3B8'
            : downloaded
            ? '#10B981'
            : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          cursor: downloading ? 'not-allowed' : 'pointer',
        }}
      >
        {downloaded ? (
          <>
            <CheckCircle2 size={20} />
            Downloaded Successfully
          </>
        ) : (
          <>
            <Download size={20} style={{ animation: downloading ? 'bounce 0.6s infinite' : 'none' }} />
            {downloading ? 'Generating Excel...' : 'Download Report'}
          </>
        )}
      </button>
    </div>
  );
}
