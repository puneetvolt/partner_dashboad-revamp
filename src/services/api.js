import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

console.log('API URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor for logging
api.interceptors.request.use(request => {
    console.log('API Request:', {
        url: request.url,
        method: request.method,
        params: request.params,
        data: request.data
    });
    return request;
});

// Add response interceptor for logging
api.interceptors.response.use(
    response => {
        console.log('API Response:', {
            status: response.status,
            data: response.data,
            url: response.config.url
        });
        return response;
    },
    error => {
        console.error('API Error:', {
            message: error.message,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data
            } : 'No response',
            request: error.config ? {
                url: error.config.url,
                method: error.config.method,
                params: error.config.params
            } : 'No request config'
        });
        return Promise.reject(error);
    }
);

export const fetchPayoutDashboard = async (destinationId, viewType = 'commission', financialYear = null, month = null) => {
    try {
        if (!destinationId) {
            throw new Error('Destination ID is required');
        }

        const params = { destination_id: destinationId, view_type: viewType };

        if (financialYear) params.financial_year = financialYear;
        if (month) params.month = month;

        console.log(`Fetching dashboard data for destination ID: ${destinationId}`);

        const response = await api.get('/api/payout/dashboard', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching payout dashboard:', error);
        throw error;
    }
};

export const fetchPayoutSummary = async (destinationId, financialYear = null) => {
    try {
        if (!destinationId) {
            throw new Error('Destination ID is required');
        }

        const params = { destination_id: destinationId };

        if (financialYear) params.financial_year = financialYear;

        console.log(`Fetching summary data for destination ID: ${destinationId}`);

        const response = await api.get('/api/payout/dashboard/summary', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching payout summary:', error);
        throw error;
    }
};

export const fetchTransactions = async (destinationId, financialYear = null, month = null) => {
    try {
        if (!destinationId) {
            throw new Error('Destination ID is required');
        }

        const params = { destination_id: destinationId };

        if (financialYear) params.financial_year = financialYear;
        if (month) params.month = month;

        console.log(`Fetching transaction data for destination ID: ${destinationId}`);

        const response = await api.get('/api/payout/transactions', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};

export default api; 