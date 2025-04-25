/**
 * Convert number to words
 * @param {number} num - The number to convert
 * @returns {string} The number in words
 */
export function numberToWords(num) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

    if (num === 0) return 'Zero';

    const numStr = num.toString().padStart(2, '0');
    let rupees = parseInt(numStr.split('.')[0]);
    const paise = numStr.includes('.') ? Math.round(parseFloat('0.' + numStr.split('.')[1]) * 100) : 0;

    let words = '';

    // Convert rupees to words
    if (rupees > 0) {
        let i = 0;
        const parts = [];

        while (rupees > 0) {
            const chunk = rupees % 1000;
            if (chunk !== 0) {
                const chunkWords = convertChunkToWords(chunk);
                parts.unshift(`${chunkWords} ${scales[i]}`);
            }
            rupees = Math.floor(rupees / 1000);
            i++;
        }

        words = parts.join(' ');
        words += ' Rupees';
    }

    // Convert paise to words
    if (paise > 0) {
        const paiseWords = convertChunkToWords(paise);
        words += ` and ${paiseWords} Paise`;
    }

    return words.trim();

    function convertChunkToWords(chunk) {
        let chunkWords = '';

        // Process hundreds
        if (chunk >= 100) {
            chunkWords += `${units[Math.floor(chunk / 100)]} Hundred`;
            chunk %= 100;
            if (chunk > 0) chunkWords += ' and ';
        }

        // Process tens and units
        if (chunk >= 10 && chunk < 20) {
            chunkWords += teens[chunk - 10];
        } else {
            if (chunk >= 20) {
                chunkWords += tens[Math.floor(chunk / 10)];
                chunk %= 10;
                if (chunk > 0) chunkWords += ' ';
            }
            if (chunk > 0) {
                chunkWords += units[chunk];
            }
        }

        return chunkWords;
    }
}

/**
 * Mask sensitive information like bank account numbers
 * @param {string} value - The value to mask
 * @param {number} visibleDigits - Number of digits to keep visible at the end
 * @param {boolean} isIFSC - Whether the value is an IFSC code (special masking rules)
 * @returns {string} Masked value
 */
function maskValue(value, visibleDigits = 4, isIFSC = false) {
    if (!value) return '';

    if (isIFSC) {
        // For IFSC, keep first 4 characters (bank code) visible and mask the rest
        // Format: AAAA0000000 - first 4 are bank code, rest is branch code
        if (value.length <= 4) return value;

        const bankCode = value.substring(0, 4);
        const branchCode = value.substring(4);

        // Show bank code and last character of branch code
        return bankCode + 'XXXX' + branchCode.slice(-1);
    } else {
        // Regular masking for account numbers, etc.
        // Convert to string and remove any non-alphanumeric characters
        const cleanValue = value.toString().replace(/\D/g, '');

        if (cleanValue.length <= visibleDigits) {
            return cleanValue; // Don't mask if too short
        }

        const hiddenPortion = cleanValue.slice(0, -visibleDigits);
        const visiblePortion = cleanValue.slice(-visibleDigits);

        // Replace hidden portion with X's
        return 'X'.repeat(hiddenPortion.length) + visiblePortion;
    }
}

/**
 * Prepare form data for invoice generation
 * @param {Object} formData - The form data
 * @returns {Object} The prepared data for invoice
 */
export function prepareInvoiceData(formData) {
    const data = { ...formData };

    // Mask sensitive data
    data.masked_account_number = maskValue(data.partner_bank_account);
    data.masked_ifsc = maskValue(data.Bank_name, 4, true);

    // Calculate tax and total amounts
    const baseAmount = parseFloat(data.BASE_AMOUNT);

    if (data.is_igst) {
        // IGST calculation
        data.IGST_AMT = '₹ ' + (baseAmount * 0.18).toFixed(2);
        data.CGST_AMT = '₹ 0.00';
        data.SGST_AMT = '₹ 0.00';
        data.cgst_sgst_style = 'style="display:none;"';
        data.igst_style = '';
    } else {
        // CGST and SGST calculation
        data.CGST_AMT = '₹ ' + (baseAmount * 0.09).toFixed(2);
        data.SGST_AMT = '₹ ' + (baseAmount * 0.09).toFixed(2);
        data.IGST_AMT = '₹ 0.00';
        data.cgst_sgst_style = '';
        data.igst_style = 'style="display:none;"';
    }

    // Calculate total tax amount
    const totalTax = parseFloat(data.IGST_AMT.replace('₹ ', '')) ||
        (parseFloat(data.CGST_AMT.replace('₹ ', '')) || 0) +
        (parseFloat(data.SGST_AMT.replace('₹ ', '')) || 0);
    data.TOTAL_TAX = '₹ ' + totalTax.toFixed(2);

    // Calculate total amount
    const adjustment = parseFloat(data.ADJUSTMENT || 0);
    data.TOTAL_WITH_TAX = '₹ ' + (baseAmount + totalTax + adjustment).toFixed(2);

    // Format base amount with Rupee symbol
    data.BASE_AMOUNT = '₹ ' + baseAmount.toFixed(2);

    // Format adjustment with Rupee symbol if it exists
    if (data.ADJUSTMENT) {
        data.ADJUSTMENT = '₹ ' + parseFloat(data.ADJUSTMENT).toFixed(2);
    }

    // Set default tax note if empty
    if (!data.TAX_NOTE) {
        data.TAX_NOTE = data.is_igst
            ? 'IGST is applicable as the place of supply is outside the state of the supplier.'
            : 'CGST and SGST are applicable as the place of supply is within the state of the supplier.';
    }

    // Generate amount in words if not provided
    if (!data.AMOUNT_IN_WORDS) {
        data.AMOUNT_IN_WORDS = numberToWords(parseFloat(data.TOTAL_WITH_TAX.replace('₹ ', '')));
    }

    // Add client details from localStorage
    try {
        const savedSettings = localStorage.getItem('businessSettings');
        if (savedSettings) {
            const businessSettings = JSON.parse(savedSettings);

            // Add client details to invoice data
            data.CLIENT_NAME = businessSettings.companyName || 'Salter Technologies Private Limited';
            data.CLIENT_GSTN = businessSettings.gstn || '29ABICS0071M1ZY';
            data.CLIENT_ADDRESS_LINE1 = businessSettings.addressLine1 || 'T-9 Shirping Chirping Woods, Villament103, Tower-9, Haralur Road,';
            data.CLIENT_ADDRESS_LINE2 = businessSettings.addressLine2 || 'Shubh Enclave, Ambalipura, Bengaluru,';
            data.CLIENT_ADDRESS_LINE3 = businessSettings.addressLine3 || 'Bengaluru Urban, Karnataka, 560102';
        } else {
            // Set default values if no saved settings
            data.CLIENT_NAME = 'Salter Technologies Private Limited';
            data.CLIENT_GSTN = '29ABICS0071M1ZY';
            data.CLIENT_ADDRESS_LINE1 = 'T-9 Shirping Chirping Woods, Villament103, Tower-9, Haralur Road,';
            data.CLIENT_ADDRESS_LINE2 = 'Shubh Enclave, Ambalipura, Bengaluru,';
            data.CLIENT_ADDRESS_LINE3 = 'Bengaluru Urban, Karnataka, 560102';
        }
    } catch (error) {
        console.error('Error loading business settings:', error);
        // Set default values if there's an error
        data.CLIENT_NAME = 'Salter Technologies Private Limited';
        data.CLIENT_GSTN = '29ABICS0071M1ZY';
        data.CLIENT_ADDRESS_LINE1 = 'T-9 Shirping Chirping Woods, Villament103, Tower-9, Haralur Road,';
        data.CLIENT_ADDRESS_LINE2 = 'Shubh Enclave, Ambalipura, Bengaluru,';
        data.CLIENT_ADDRESS_LINE3 = 'Bengaluru Urban, Karnataka, 560102';
    }

    return data;
}

/**
 * Generate HTML invoice from template and data
 * @param {string} template - The HTML template
 * @param {Object} data - The data to fill in the template
 * @returns {string} The generated HTML invoice
 */
export function generateInvoiceHTML(template, data) {
    let html = template;

    // Replace all placeholders with actual data
    Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(placeholder, data[key]);
    });

    return html;
}

/**
 * Generate a reference number from partner ID and date
 * Format: partner ID - month - year
 * Example: a629c123-03-2025
 * 
 * Note: partnerId and destination_id are the same value and can be used interchangeably
 * 
 * @param {string} partnerId - The partner's ID or destination_id
 * @param {string} serviceMonth - The service month
 * @param {string} serviceYear - The service year
 * @returns {string} The generated reference number
 */
export const generateReferenceNumber = (partnerId, serviceMonth, serviceYear) => {
    // Handle both partnerId and destination_id
    const id = partnerId || '';

    if (!id || !serviceMonth || !serviceYear) return '';

    // Get month number (1-12)
    const monthMap = {
        'January': '01', 'February': '02', 'March': '03', 'April': '04',
        'May': '05', 'June': '06', 'July': '07', 'August': '08',
        'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    const month = monthMap[serviceMonth] || '01';

    // Get year (last 2 digits)
    const year = serviceYear.toString().slice(-2);

    return `${id}-${month}-${year}`;
}; 