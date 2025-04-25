/**
 * Transforms raw API commission data to the format expected by the frontend
 */
export const transformCommissionData = (apiData) => {
    return apiData.map(item => ({
        month: formatMonthYear(item.month),
        customerCreated: item.customer_created || 0,
        totalCustomer: item.total_customers || 0,
        upfrontReferral: item.upfront_referral || 0,
        trailReferral: item.trail_referral || 0,
        totalPayoutAmount: item.total_payout_amount || 0,
        tds: item.tds || 0,
        payable: item.actual_payout || 0,
        gst: item.gst_amount || 0,
        avgAum: item.avg_aum || 0
    }));
};

/**
 * Transforms raw API offer data to the format expected by the frontend
 */
export const transformOfferData = (apiData) => {
    return apiData.map(item => ({
        month: formatMonthYear(item.month),
        offerName: item.reason_name || 'Unknown Offer',
        payment_type: item.payment_type || 'Unknown Payment Type',
        customerCreated: item.customer_created || 0,
        offerPayout: item.total_payout_amount || 0,
        totalPayoutAmount: item.total_payout_amount || 0,
        tds: item.tds || 0,
        payable: item.actual_payout || 0
    }));
};

/**
 * Transforms transaction data from API to frontend format
 */
export const transformTransactionData = (apiData) => {
    return apiData.map((item, index) => ({
        id: index + 1,
        month: formatMonthYear(item.payment_month),
        amount: item.payment_amount || 0,
        utr: item.utr_number || `UTR-${index}`,
        status: item.transaction_status || 'Pending',
        paymentDate: item.payment_date || item.payment_month
    }));
};

/**
 * Helper function to format date to Month Year format
 */
export const formatMonthYear = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}; 