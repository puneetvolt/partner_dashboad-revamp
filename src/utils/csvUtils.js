// Simple utility functions for partner data

export const loadPartnerData = async () => {
    // This is a placeholder function that would normally fetch data from a CSV or API
    // For now, just return sample data
    return [
        {
            id: '01fc065b-36dc-491e-a665-e3e35778504d',
            name: 'Gurmeet Singh Sabharwal',
            gst: null,
            state: 'Karnataka',
            bank_name: 'YES BANK',
            bank_account: '011353100000498',
            ifsc: 'YESB0000113'
        }
    ];
};

export const findPartnerById = (id) => {
    // In a real app, this would search through the partner data
    // For now, return a sample if ID matches
    if (id === '01fc065b-36dc-491e-a665-e3e35778504d') {
        return {
            id: '01fc065b-36dc-491e-a665-e3e35778504d',
            name: 'Gurmeet Singh Sabharwal',
            gst: null,
            state: 'Karnataka',
            bank_name: 'YES BANK',
            bank_account: '011353100000498',
            ifsc: 'YESB0000113'
        };
    }
    return null;
};

export const mapPartnerToInvoiceData = (partner) => {
    if (!partner) return null;

    return {
        Vendor_name: partner.name || '',
        GSTN: partner.gst || '',
        STATE: partner.state || '',
        Bank_name: partner.ifsc || '',
        partner_bank_account: partner.bank_account || '',
        masked_account_number: partner.bank_account ?
            'XXXX' + partner.bank_account.substring(Math.max(0, partner.bank_account.length - 4)) :
            'XXXXXXXX0000',
        masked_ifsc: partner.ifsc || 'XXXXXXXX'
    };
}; 