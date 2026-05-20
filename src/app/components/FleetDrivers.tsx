import KPICard from './KPICard';
import {
  Truck,
  User,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const vehicleUtilization = [
  { week: 'Week 1', utilized: 168, idle: 33 },
  { week: 'Week 2', utilized: 175, idle: 26 },
  { week: 'Week 3', utilized: 182, idle: 19 },
  { week: 'Week 4', utilized: 189, idle: 12 },
];

const driverPerformance = [
  { driver: 'John Smith', trips: 45, success: 97.8, rating: 4.8 },
  { driver: 'Sarah Johnson', trips: 52, success: 96.2, rating: 4.9 },
  { driver: 'Mike Davis', trips: 38, success: 98.5, rating: 4.7 },
  { driver: 'Emily Chen', trips: 41, success: 95.1, rating: 4.6 },
  { driver: 'David Lee', trips: 49, success: 97.3, rating: 4.8 },
  { driver: 'Lisa Wang', trips: 36, success: 94.4, rating: 4.5 },
];

const vehiclesList = [
  { id: 'V-042', type: 'Truck', driver: 'John Smith', status: 'Active', trips: 45, mileage: 2340, maintenance: 'Good' },
  { id: 'V-038', type: 'Van', driver: 'Sarah Johnson', status: 'Active', trips: 52, mileage: 1890, maintenance: 'Good' },
  { id: 'V-051', type: 'Truck', driver: 'Mike Davis', status: 'Idle', trips: 38, mileage: 2650, maintenance: 'Due' },
  { id: 'V-029', type: 'Van', driver: 'Emily Chen', status: 'Active', trips: 41, mileage: 1560, maintenance: 'Good' },
  { id: 'V-015', type: 'Truck', driver: 'David Lee', status: 'Active', trips: 49, mileage: 2120, maintenance: 'Good' },
  { id: 'V-067', type: 'Van', driver: 'Unassigned', status: 'Maintenance', trips: 0, mileage: 3450, maintenance: 'In Progress' },
];

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-800',
  'Idle': 'bg-gray-100 text-gray-800',
  'Maintenance': 'bg-orange-100 text-orange-800',
};

const maintenanceColors: Record<string, string> = {
  'Good': 'text-green-600',
  'Due': 'text-orange-600',
  'In Progress': 'text-blue-600',
};

export default function FleetDrivers() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fleet & Drivers</h2>
        <p className="text-gray-600">Monitor vehicle fleet and driver performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Vehicles"
          value="201"
          icon={Truck}
          trend={{ value: 3.5, isPositive: true }}
          subtitle="Active fleet"
          color="blue"
        />
        <KPICard
          title="Active Drivers"
          value="148"
          icon={User}
          trend={{ value: 5.2, isPositive: true }}
          subtitle="On duty"
          color="green"
        />
        <KPICard
          title="Vehicle Utilization"
          value="87.6%"
          icon={TrendingUp}
          trend={{ value: 4.8, isPositive: true }}
          subtitle="This month"
          color="purple"
        />
        <KPICard
          title="Avg Driver Rating"
          value="4.7"
          icon={Star}
          trend={{ value: 2.1, isPositive: true }}
          subtitle="Out of 5.0"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Utilization Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart id="fleet-util-bar" data={vehicleUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="utilized" fill="#10b981" name="Utilized" />
              <Bar dataKey="idle" fill="#9ca3af" name="Idle" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Driver Performance</h3>
          <div className="space-y-4">
            {driverPerformance.map((driver, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {driver.driver.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{driver.driver}</p>
                    <p className="text-sm text-gray-500">{driver.trips} trips completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Star size={16} fill="currentColor" />
                    <span className="font-semibold">{driver.rating}</span>
                  </div>
                  <p className="text-sm text-green-600">{driver.success}% success</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Fleet Overview</h3>
          <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            Add Vehicle
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vehicle ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Driver</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Trips</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Mileage (km)</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Maintenance</th>
              </tr>
            </thead>
            <tbody>
              {vehiclesList.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{vehicle.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{vehicle.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{vehicle.driver}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[vehicle.status]}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-gray-700">{vehicle.trips}</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-700">{vehicle.mileage.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className={`font-medium ${maintenanceColors[vehicle.maintenance]}`}>
                      {vehicle.maintenance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Truck className="text-gray-600" size={20} />
            </div>
            <h4 className="font-semibold text-gray-900">Idle Vehicles</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">23</p>
          <p className="text-sm text-gray-500 mt-1">11.4% of total fleet</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="text-orange-600" size={20} />
            </div>
            <h4 className="font-semibold text-gray-900">Maintenance Due</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-500 mt-1">Schedule soon</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <h4 className="font-semibold text-gray-900">Fleet Health</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">94%</p>
          <p className="text-sm text-gray-500 mt-1">Overall condition</p>
        </div>
      </div>
    </div>
  );
}
