import { Calendar, CreditCard, Download, FileText, Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPayoutDashboard, fetchTransactions } from '../services/api';
import {
    formatDate,
    transformCommissionData,
    transformOfferData,
    transformTransactionData
} from '../utils/dataTransformers';

// This will be replaced with actual API data
const SAMPLE_DESTINATION_ID = "partner123";

export default function PartnerPayoutDashboard() {
    const [activeTab, setActiveTab] = useState('summary');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [financialYear, setFinancialYear] = useState(null);
    const [destinationId, setDestinationId] = useState(SAMPLE_DESTINATION_ID);
    const [inputDestinationId, setInputDestinationId] = useState(SAMPLE_DESTINATION_ID);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [commissionData, setCommissionData] = useState([]);
    const [offerData, setOfferData] = useState([]);
    const [transactionData, setTransactionData] = useState([]);

    const navigate = useNavigate();

    // Handler for destination ID search
    const handleDestinationSearch = (e) => {
        e.preventDefault();
        if (inputDestinationId.trim()) {
            setDestinationId(inputDestinationId.trim());
        }
    };

    // Fetch data based on active tab
    useEffect(() => {
        const fetchData = async () => {
            if (!destinationId) return;

            setLoading(true);
            setError(null);

            try {
                console.log(`Fetching data for destination: ${destinationId}, tab: ${activeTab}, selectedMonth: ${selectedMonth}`);
                // For commission data
                if (activeTab === 'summary') {
                    const response = await fetchPayoutDashboard(
                        destinationId,
                        'commission',
                        financialYear,
                        selectedMonth !== 'All' ? getApiMonthFormat(selectedMonth) : null
                    );
                    console.log('API Response for summary:', response);
                    setCommissionData(transformCommissionData(response));
                }
                // For offers data
                else if (activeTab === 'offers') {
                    const response = await fetchPayoutDashboard(
                        destinationId,
                        'offer',
                        financialYear,
                        selectedMonth !== 'All' ? getApiMonthFormat(selectedMonth) : null
                    );
                    console.log('API Response for offers:', response);
                    setOfferData(transformOfferData(response));
                }
                // For transactions data - now using the dedicated transactions endpoint
                else if (activeTab === 'transactions') {
                    const response = await fetchTransactions(
                        destinationId,
                        financialYear,
                        selectedMonth !== 'All' ? getApiMonthFormat(selectedMonth) : null
                    );
                    console.log('API Response for transactions:', response);
                    setTransactionData(transformTransactionData(response));
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, destinationId, financialYear, selectedMonth]);

    // Helper function to convert UI month format to API format
    const getApiMonthFormat = (uiMonth) => {
        if (uiMonth === 'All') return null;

        const parts = uiMonth.split(' ');
        if (parts.length !== 2) return null;

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = monthNames.indexOf(parts[0]);
        if (monthIndex === -1) return null;

        const year = parts[1];
        // Return in YYYY-MM-DD format
        return `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-01`;
    };

    // Filter data based on search term AND selected month
    const filteredCommissionData = useMemo(() => {
        console.log('Filtering commission data with month:', selectedMonth);
        return commissionData.filter(item => {
            const matchesMonth = selectedMonth === 'All' || item.month === selectedMonth;
            const matchesSearch = item.month.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesMonth && matchesSearch;
        });
    }, [commissionData, selectedMonth, searchTerm]);

    const filteredOfferData = useMemo(() => {
        console.log('Filtering offer data with month:', selectedMonth);
        return offerData.filter(item => {
            const matchesMonth = selectedMonth === 'All' || item.month === selectedMonth;
            const matchesSearch = (
                item.payment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.month.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return matchesMonth && matchesSearch;
        });
    }, [offerData, selectedMonth, searchTerm]);

    const filteredTransactionData = useMemo(() => {
        console.log('Filtering transaction data with month:', selectedMonth);
        return transactionData.filter(item => {
            const matchesMonth = selectedMonth === 'All' || item.month === selectedMonth;
            const matchesSearch = (
                item.utr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.status?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return matchesMonth && matchesSearch;
        });
    }, [transactionData, selectedMonth, searchTerm]);

    // Get unique months for filter dropdown
    const uniqueMonths = useMemo(() => {
        console.log('Recalculating uniqueMonths for tab:', activeTab);

        // Start with 'All' option
        const allOption = ['All'];

        // Get months based on active tab
        let months = [];
        if (activeTab === 'summary' && commissionData.length > 0) {
            months = commissionData.map(item => item.month);
            console.log('Summary tab months:', months);
        } else if (activeTab === 'offers' && offerData.length > 0) {
            months = offerData.map(item => item.month);
            console.log('Offers tab months:', months);
        } else if (activeTab === 'transactions' && transactionData.length > 0) {
            months = transactionData.map(item => item.month);
            console.log('Transactions tab months:', months);
        }

        // Remove duplicates using Set and combine with 'All'
        const uniqueMonthsList = [...allOption, ...Array.from(new Set(months))];
        console.log('Final uniqueMonths list:', uniqueMonthsList);
        return uniqueMonthsList;
    }, [activeTab, commissionData, offerData, transactionData]);

    // Handle month selection change - simplified for reliability
    const handleMonthChange = (e) => {
        // Don't use preventDefault as it can interfere with select behavior
        // Just update the state directly
        const newMonth = e.target.value;
        console.log('Month selection changed from', selectedMonth, 'to', newMonth);
        setSelectedMonth(newMonth);
    };

    // Add a separate handler for tab changes that doesn't affect the month
    const handleTabChange = (tab) => {
        console.log('Changing tab from', activeTab, 'to', tab);

        // Only change the tab, don't reset the month filter
        setActiveTab(tab);
    };

    // Handle export functionality with robust error handling
    const handleExport = () => {
        try {
            console.log('Export button clicked for tab:', activeTab);

            let dataToExport = [];
            let filename = 'export.csv';

            // Select the correct data based on active tab
            if (activeTab === 'summary') {
                dataToExport = filteredCommissionData;
                filename = 'commission_data.csv';
            } else if (activeTab === 'offers') {
                dataToExport = filteredOfferData;
                filename = 'offer_data.csv';
            } else if (activeTab === 'transactions') {
                dataToExport = filteredTransactionData;
                filename = 'transaction_data.csv';
            }

            console.log('Data to export:', dataToExport);

            // Check if there's data to export
            if (!dataToExport || dataToExport.length === 0) {
                alert('No data available to export');
                return;
            }

            // Convert data to CSV format safely
            const headers = Object.keys(dataToExport[0]).join(',');

            // Safely convert values to strings, handling null/undefined values
            const rows = dataToExport.map(item => {
                return Object.values(item).map(value => {
                    if (value === null || value === undefined) return '';
                    // Escape commas and quotes in string values
                    if (typeof value === 'string') {
                        value = value.replace(/"/g, '""');
                        return `"${value}"`;
                    }
                    return value;
                }).join(',');
            });

            const csvContent = [headers, ...rows].join('\n');
            console.log('CSV content created with', rows.length, 'rows');

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            // Create download link
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';

            // Add to document, click and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('Export successful:', filename);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert(`Export failed: ${error.message || 'Unknown error'}`);
        }
    };

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
                {/* Destination ID Search */}
                <div className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden p-4">
                    <form onSubmit={handleDestinationSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow">
                            <label htmlFor="destinationId" className="block text-sm font-medium text-gray-700 mb-1">
                                Partner/Destination ID
                            </label>
                            <input
                                type="text"
                                id="destinationId"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Enter destination ID"
                                value={inputDestinationId}
                                onChange={(e) => setInputDestinationId(e.target.value)}
                            />
                        </div>
                        <div className="self-end">
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tabs */}
                <div className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            <TabButton
                                label="Summary"
                                icon={<Calendar className="h-4 w-4" />}
                                active={activeTab === 'summary'}
                                onClick={() => handleTabChange('summary')}
                            />
                            <TabButton
                                label="Offers"
                                icon={<FileText className="h-4 w-4" />}
                                active={activeTab === 'offers'}
                                onClick={() => handleTabChange('offers')}
                            />
                            <TabButton
                                label="Transactions"
                                icon={<CreditCard className="h-4 w-4" />}
                                active={activeTab === 'transactions'}
                                onClick={() => handleTabChange('transactions')}
                            />
                            <TabButton
                                label="GST Invoice"
                                icon={<FileText className="h-4 w-4" />}
                                active={activeTab === 'gst-invoice'}
                                onClick={() => handleTabChange('gst-invoice')}
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
                                    onChange={handleMonthChange}
                                    // Add an id for debugging
                                    id="month-select"
                                >
                                    {uniqueMonths.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>

                                <button
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    onClick={handleExport}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Current Destination ID display */}
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Current Destination ID:</span> {destinationId}
                        </p>
                    </div>

                    {/* Loading and Error States */}
                    {loading && (
                        <div className="p-4 text-center text-gray-500">
                            Loading data...
                        </div>
                    )}

                    {error && (
                        <div className="p-4 text-center text-red-500">
                            {error}
                        </div>
                    )}

                    {/* Tab Content */}
                    {!loading && !error && (
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.payment_type}</td>
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.utr}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.amount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.payment_date || item.paymentDate)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Success' ? 'bg-green-100 text-green-800' :
                                                            item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
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
                                    </table>
                                </div>
                            )}

                            {activeTab === 'gst-invoice' && (
                                <div className="p-4">
                                    <iframe
                                        src={`/invoice-form?destinationId=${destinationId}`}
                                        className="w-full h-screen border-0"
                                        title="GST Invoice Form"
                                    />
                                </div>
                            )}
                        </div>
                    )}
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