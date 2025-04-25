import { Calendar, CreditCard, Download, FileText, Search } from 'lucide-react';
import { useState } from 'react';

// Sample data based on your Excel
const commissionData = [
  {
    month: "Jan 2025",
    customerCreated: 10,
    totalCustomer: 20,
    upfrontReferral: 200,
    trailReferral: 50,
    totalPayoutAmount: 250,
    tds: 5,
    payable: 245,
    gst: 45,
    avgAum: 28000
  },
  {
    month: "Feb 2025",
    customerCreated: 15,
    totalCustomer: 35,
    upfrontReferral: 300,
    trailReferral: 75,
    totalPayoutAmount: 375,
    tds: 8,
    payable: 367,
    gst: 68,
    avgAum: 42000
  },
  {
    month: "Mar 2025",
    customerCreated: 8,
    totalCustomer: 43,
    upfrontReferral: 160,
    trailReferral: 90,
    totalPayoutAmount: 250,
    tds: 5,
    payable: 245,
    gst: 45,
    avgAum: 35000
  }
];

const offerData = [
  {
    month: "Jan 2025",
    offerName: "p2p",
    customerCreated: 2,
    offerPayout: 2000,
    totalPayoutAmount: 2000,
    tds: 0,
    payable: 2000
  },
  {
    month: "Jan 2025",
    offerName: "selfline",
    customerCreated: 1,
    offerPayout: -200,
    totalPayoutAmount: -200,
    tds: 0,
    payable: -200
  },
  {
    month: "Jan 2025",
    offerName: "mfd offer march 2025",
    customerCreated: 10,
    offerPayout: 1000,
    totalPayoutAmount: 1000,
    tds: 0,
    payable: 1000
  },
  {
    month: "Feb 2025",
    offerName: "p2p",
    customerCreated: 5,
    offerPayout: 5000,
    totalPayoutAmount: 5000,
    tds: 0,
    payable: 5000
  },
  {
    month: "Mar 2025",
    offerName: "selfline premium",
    customerCreated: 3,
    offerPayout: 1500,
    totalPayoutAmount: 1500,
    tds: 0,
    payable: 1500
  }
];

// Transaction data with UTR
const transactionData = [
  {
    id: 1,
    month: "Jan 2025",
    amount: 245,
    utr: "UTR2025010112345",
    status: "Success",
    paymentDate: "2025-01-15"
  },
  {
    id: 2,
    month: "Feb 2025",
    amount: 367,
    utr: "UTR2025020154321",
    status: "Success",
    paymentDate: "2025-02-15"
  },
  {
    id: 3,
    month: "Mar 2025",
    amount: 245,
    utr: "UTR2025030198765",
    status: "Pending",
    paymentDate: "2025-03-15"
  }
];

export default function PartnerPayoutDashboard() {
  const [activeTab, setActiveTab] = useState('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');

  const filteredCommissionData = commissionData.filter(item =>
    (selectedMonth === 'All' || item.month === selectedMonth) &&
    (item.month.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredOfferData = offerData.filter(item =>
    (selectedMonth === 'All' || item.month === selectedMonth) &&
    (item.offerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.month.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTransactionData = transactionData.filter(item =>
    (selectedMonth === 'All' || item.month === selectedMonth) &&
    (item.utr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const uniqueMonths = ['All', ...new Set(commissionData.map(item => item.month))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900">Partner Payout Ledger</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <TabButton
                label="Summary"
                icon={<Calendar className="h-4 w-4" />}
                active={activeTab === 'summary'}
                onClick={() => setActiveTab('summary')}
              />
              <TabButton
                label="Offers"
                icon={<FileText className="h-4 w-4" />}
                active={activeTab === 'offers'}
                onClick={() => setActiveTab('offers')}
              />
              <TabButton
                label="Transactions"
                icon={<CreditCard className="h-4 w-4" />}
                active={activeTab === 'transactions'}
                onClick={() => setActiveTab('transactions')}
              />
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  className="block w-full sm:w-32 py-2 px-3 border border-gray-300 bg-white rounded-md text-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {uniqueMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>

                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'summary' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Customers</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Customers</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upfront Referral</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trail Referral</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TDS</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payable</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg AUM</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCommissionData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.customerCreated}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalCustomer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.upfrontReferral}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.trailReferral}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.totalPayoutAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.tds}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.payable}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.gst}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.avgAum}</td>
                      </tr>
                    ))}
                    {filteredCommissionData.length === 0 && (
                      <tr>
                        <td colSpan="10" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No data found</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{filteredCommissionData.reduce((sum, item) => sum + item.customerCreated, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{filteredCommissionData.length > 0 ? filteredCommissionData[filteredCommissionData.length - 1].totalCustomer : 0}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">₹{filteredCommissionData.reduce((sum, item) => sum + item.upfrontReferral, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">₹{filteredCommissionData.reduce((sum, item) => sum + item.trailReferral, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">₹{filteredCommissionData.reduce((sum, item) => sum + item.totalPayoutAmount, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">₹{filteredCommissionData.reduce((sum, item) => sum + item.tds, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">₹{filteredCommissionData.reduce((sum, item) => sum + item.payable, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">₹{filteredCommissionData.reduce((sum, item) => sum + item.gst, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {activeTab === 'offers' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Payout</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TDS</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payable</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOfferData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.offerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.customerCreated}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.offerPayout < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          ₹{item.offerPayout}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.totalPayoutAmount < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          ₹{item.totalPayoutAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.tds}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.payable < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          ₹{item.payable}
                        </td>
                      </tr>
                    ))}
                    {filteredOfferData.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No data found</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{filteredOfferData.reduce((sum, item) => sum + item.customerCreated, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">₹{filteredOfferData.reduce((sum, item) => sum + item.offerPayout, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">₹{filteredOfferData.reduce((sum, item) => sum + item.totalPayoutAmount, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">₹{filteredOfferData.reduce((sum, item) => sum + item.tds, 0)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">₹{filteredOfferData.reduce((sum, item) => sum + item.payable, 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTR Number</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactionData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{item.utr}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.paymentDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredTransactionData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No data found</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">₹{filteredTransactionData.reduce((sum, item) => sum + item.amount, 0)}</td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper Components
function TabButton({ label, icon, active, onClick }) {
  return (
    <button
      className={`flex items-center py-4 px-6 text-sm font-medium border-b-2 ${active
        ? 'border-blue-500 text-blue-600 bg-white'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-gray-50'
        }`}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
}

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
