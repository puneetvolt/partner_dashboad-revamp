import axios from 'axios';
import html2pdf from 'html2pdf.js';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useFormValidation from './hooks/useFormValidation';
import { findPartnerById, loadPartnerData, mapPartnerToInvoiceData } from './utils/csvUtils';
import { invoiceTemplate } from './utils/invoiceTemplate';
import { generateInvoiceHTML, generateReferenceNumber, numberToWords, prepareInvoiceData } from './utils/invoiceUtils';

// List of Indian states and union territories
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Mapping of GSTIN state codes to state names
const stateCodeMapping = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Dadra and Nagar Haveli and Daman and Diu',
  '26': 'Maharashtra',
  '27': 'Karnataka',
  '28': 'Goa',
  '29': 'Karnataka',
  '30': 'Tamil Nadu',
  '31': 'Puducherry',
  '32': 'Andaman and Nicobar Islands',
  '33': 'Telangana',
  '34': 'Andhra Pradesh',
  '35': 'Ladakh',
  '36': 'Lakshadweep',
  '37': 'Kerala'
};

// Function to fetch GST data from API endpoint
const fetchGSTData = async (destinationId) => {
  try {
    const response = await axios.get(`http://127.0.0.1:5001/api/payout/gst-dashboard?destination_id=${destinationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching GST data:', error);
    throw error;
  }
};

// Function to get state name from GSTIN
const getStateFromGSTIN = (gstin) => {
  if (!gstin || gstin.length < 2) return '';

  const stateCode = gstin.substring(0, 2);
  return stateCodeMapping[stateCode] || '';
};

const InvoiceForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize form data with navigation state if available
  const [formData, setFormData] = useState(() => {
    // Check if we need to clear the form based on location state
    if (location.state?.clearForm) {
      // Clear localStorage
      localStorage.removeItem('invoiceFormData');
      localStorage.removeItem('invoiceData');
      localStorage.removeItem('partnerId');

      // Return default form data
      return {
        Vendor_name: '',
        STATE: '',
        COUNTRY: 'India',
        GSTN: '',
        INVOICE_NO: '',
        INVOICE_DATE: new Date().toISOString().split('T')[0],
        TERMS: 'Net 30 days',
        PLACE_OF_SUPPLY: 'Karnataka(29)',
        BASE_AMOUNT: '',
        CGST_AMT: '',
        SGST_AMT: '',
        IGST_AMT: '',
        TOTAL_WITH_TAX: '',
        AMOUNT_IN_WORDS: '',
        TAX_NOTE: '',
        Bank_name: '',
        partner_bank_account: '',
        UTR: '',
        ADJUSTMENT: '0.00',
        TOTAL_AMOUNT: '',
        is_igst: false,
        SERVICE_DESCRIPTION: 'Financial intermediation services',
        masked_account_number: 'XXXXXXXX0000',
        masked_ifsc: 'ABCDXXXXx',
        service_month: '',
        service_year: new Date().getFullYear() + 1,
        REFERENCE_NO: ''
      };
    }

    // First check if we have data from navigation state
    if (location.state?.invoiceData) {
      // Save to localStorage when we get new data from navigation
      localStorage.setItem('invoiceFormData', JSON.stringify(location.state.invoiceData));
      return location.state.invoiceData;
    }

    // Then check if we have saved data in localStorage
    const savedData = localStorage.getItem('invoiceFormData');
    if (savedData) {
      return JSON.parse(savedData);
    }

    // If no saved data, use defaults
    return {
      Vendor_name: '',
      STATE: '',
      COUNTRY: 'India',
      GSTN: '',
      INVOICE_NO: '',
      INVOICE_DATE: new Date().toISOString().split('T')[0],
      TERMS: 'Net 30 days',
      PLACE_OF_SUPPLY: 'Karnataka(29)',
      BASE_AMOUNT: '',
      CGST_AMT: '',
      SGST_AMT: '',
      IGST_AMT: '',
      TOTAL_WITH_TAX: '',
      AMOUNT_IN_WORDS: '',
      TAX_NOTE: '',
      Bank_name: '',
      partner_bank_account: '',
      UTR: '',
      ADJUSTMENT: '0.00',
      TOTAL_AMOUNT: '',
      is_igst: false,
      SERVICE_DESCRIPTION: 'Financial intermediation services',
      masked_account_number: 'XXXXXXXX0000',
      masked_ifsc: 'ABCDXXXXx',
      service_month: '',
      service_year: new Date().getFullYear() + 1,
      REFERENCE_NO: ''
    };
  });

  // Initialize invoice data with navigation state if available
  const [invoiceData, setInvoiceData] = useState(() => {
    // Check if we need to clear the invoice data based on location state
    if (location.state?.clearForm) {
      localStorage.removeItem('invoiceData');
      return null;
    }

    if (location.state?.invoiceData) {
      localStorage.setItem('invoiceData', JSON.stringify(location.state.invoiceData));
      return location.state.invoiceData;
    }

    const savedData = localStorage.getItem('invoiceData');
    return savedData ? JSON.parse(savedData) : null;
  });

  // New state for GST data
  const [gstData, setGstData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [destinationId, setDestinationId] = useState('');
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'gst'

  // Inside InvoiceForm component, add these new state variables
  const [editingSupplier, setEditingSupplier] = useState(false);
  const [editedSupplierName, setEditedSupplierName] = useState('');
  const [editedInvoiceNumber, setEditedInvoiceNumber] = useState('');
  const [modalInvoiceData, setModalInvoiceData] = useState(null);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('invoiceFormData', JSON.stringify(formData));
  }, [formData]);

  // Save invoice data to localStorage whenever it changes
  useEffect(() => {
    if (invoiceData) {
      localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
    }
  }, [invoiceData]);

  // Save partner ID to localStorage
  const [partnerId, setPartnerId] = useState(() => {
    const savedPartnerId = localStorage.getItem('partnerId');
    return savedPartnerId || '';
  });

  // Save partner ID to localStorage whenever it changes
  useEffect(() => {
    if (partnerId) {
      localStorage.setItem('partnerId', partnerId);
    }
  }, [partnerId]);

  const [partnersList, setPartnersList] = useState([]);

  const { handleChange: validateChange, errors, validateForm } = useFormValidation(formData);
  const previewIframeRef = useRef(null);

  // Load partner data when component mounts
  useEffect(() => {
    const fetchPartnerData = async () => {
      setIsLoading(true);
      try {
        const partners = await loadPartnerData();
        setPartnersList(partners);
      } catch (error) {
        console.error('Failed to load partner data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerData();
  }, []);

  // Function to load GST data
  const loadGSTData = async (id) => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await fetchGSTData(id);
      setGstData(data);
    } catch (error) {
      console.error('Failed to load GST data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load GST data when destination ID changes
  useEffect(() => {
    if (destinationId) {
      loadGSTData(destinationId);
    }
  }, [destinationId]);

  // Check for clearForm parameter in URL when component mounts
  useEffect(() => {
    // Check if we're on the home page and there's no saved data
    if (location.pathname === '/' && !localStorage.getItem('invoiceFormData')) {
      // This means we just reloaded the page after clicking "New Invoice"
      // The form is already initialized with default values, so we don't need to do anything
      console.log('New invoice form initialized');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Parse URL parameters to get partnerId
    const queryParams = new URLSearchParams(location.search);
    const partnerIdFromUrl = queryParams.get('partnerId');
    const destinationIdFromUrl = queryParams.get('destinationId');

    if (partnerIdFromUrl) {
      // Set the partner ID and trigger the data loading
      setPartnerId(partnerIdFromUrl);
      handlePartnerIdChange({ target: { value: partnerIdFromUrl } });
    }

    if (destinationIdFromUrl) {
      // Set destination ID and load GST data
      setDestinationId(destinationIdFromUrl);
      setActiveTab('gst'); // Switch to GST tab automatically
      loadGSTData(destinationIdFromUrl);
    }
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePartnerIdChange = (e) => {
    const id = e.target.value;
    setPartnerId(id);

    if (id.trim() === '') return;

    const partner = findPartnerById(id);
    if (partner) {
      console.log('Applying partner data for ID:', id);
      const partnerFormData = mapPartnerToInvoiceData(partner);
      console.log('Mapped form data:', partnerFormData);

      if (partnerFormData) {
        setFormData(prevData => {
          const newData = {
            ...prevData,
            ...partnerFormData,
            REFERENCE_NO: generateReferenceNumber(
              id,
              prevData.service_month,
              prevData.service_year
            )
          };
          console.log('Updated form data:', newData);
          return newData;
        });
      }
    } else {
      console.warn('No partner found with ID:', id);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Update the form data
    setFormData(prevData => {
      const updatedData = {
        ...prevData,
        [name]: newValue
      };

      // Auto determine IGST vs CGST+SGST based on GSTN state code
      if (name === 'GSTN' && value.length >= 2) {
        const stateCode = value.substring(0, 2);
        console.log('GSTN state code detected:', stateCode);

        // If state code is 29 (Karnataka), apply IGST; otherwise apply CGST+SGST
        updatedData.is_igst = stateCode === '29';
        console.log('Auto-setting is_igst to:', updatedData.is_igst);

        // Set state based on GSTIN state code
        const stateName = getStateFromGSTIN(value);
        if (stateName) {
          updatedData.STATE = stateName;
        }
      }

      // Auto-generate reference number when service month, year, or partner ID changes
      if ((name === 'service_month' || name === 'service_year') && partnerId &&
        updatedData.service_month && updatedData.service_year) {
        updatedData.REFERENCE_NO = generateReferenceNumber(
          partnerId,
          updatedData.service_month,
          updatedData.service_year
        );
      }

      return updatedData;
    });

    // Also validate the field
    validateChange(e);
  };

  const calculateTaxes = () => {
    if (formData.BASE_AMOUNT) {
      const baseAmount = parseFloat(formData.BASE_AMOUNT);

      if (formData.is_igst) {
        // IGST calculation (18%)
        const igstAmount = (baseAmount * 0.18).toFixed(2);
        const totalWithTax = (baseAmount + parseFloat(igstAmount)).toFixed(2);

        setFormData(prev => ({
          ...prev,
          IGST_AMT: igstAmount,
          CGST_AMT: '0.00',
          SGST_AMT: '0.00',
          TOTAL_WITH_TAX: totalWithTax,
          TOTAL_AMOUNT: totalWithTax,
          AMOUNT_IN_WORDS: numberToWords(parseFloat(totalWithTax))
        }));
      } else {
        // CGST and SGST calculation (9% each)
        const cgstAmount = (baseAmount * 0.09).toFixed(2);
        const sgstAmount = (baseAmount * 0.09).toFixed(2);
        const totalWithTax = (baseAmount + parseFloat(cgstAmount) + parseFloat(sgstAmount)).toFixed(2);

        setFormData(prev => ({
          ...prev,
          CGST_AMT: cgstAmount,
          SGST_AMT: sgstAmount,
          IGST_AMT: '0.00',
          TOTAL_WITH_TAX: totalWithTax,
          TOTAL_AMOUNT: totalWithTax,
          AMOUNT_IN_WORDS: numberToWords(parseFloat(totalWithTax))
        }));
      }
    }
  };

  // Recalculate when is_igst or BASE_AMOUNT changes
  useEffect(() => {
    calculateTaxes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.is_igst, formData.BASE_AMOUNT]);

  // Update preview in real-time as user types
  useEffect(() => {
    // Prepare invoice data even if BASE_AMOUNT is not yet filled
    const preparedData = prepareInvoiceData(formData);
    setInvoiceData(preparedData);
  }, [formData]);

  // Update service description when month/year change
  useEffect(() => {
    const baseDescription = 'Financial intermediation services';
    let description = baseDescription;

    if (formData.service_month || formData.service_year) {
      description += '-';
      if (formData.service_month) {
        description += formData.service_month;
      }
      if (formData.service_year) {
        description += (formData.service_month ? ' ' : '') + formData.service_year;
      }
    }

    if (description !== formData.SERVICE_DESCRIPTION) {
      setFormData(prev => ({
        ...prev,
        SERVICE_DESCRIPTION: description
      }));
    }
  }, [formData.service_month, formData.service_year]);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Submit button clicked, validating form...");
    console.log("Current form data:", formData);

    // CRITICAL FIX - Ensure formData is properly updated before validation
    // Force update the formData from the actual DOM form elements to ensure latest values
    const form = e.target;
    const vendorNameInput = form.querySelector('#Vendor_name');
    const gstnInput = form.querySelector('#GSTN');
    const stateSelect = form.querySelector('#STATE');

    if (vendorNameInput && vendorNameInput.value && vendorNameInput.value.trim() !== '') {
      formData.Vendor_name = vendorNameInput.value.trim();
    }

    if (gstnInput && gstnInput.value && gstnInput.value.trim() !== '') {
      formData.GSTN = gstnInput.value.trim();
    }

    if (stateSelect && stateSelect.value && stateSelect.value.trim() !== '') {
      formData.STATE = stateSelect.value.trim();
    }

    // Check for important missing fields manually to provide better error messages
    const criticalFields = {
      'Vendor_name': 'Vendor Name',
      'STATE': 'State',
      'GSTN': 'GSTN',
      'BASE_AMOUNT': 'Base Amount'
    };

    let missingFields = [];
    for (const [field, label] of Object.entries(criticalFields)) {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      console.log("Generating invoice with data:", formData);

      // Generate reference number using service month and year if needed
      let referenceNo = formData.REFERENCE_NO;
      if (!referenceNo && partnerId && formData.service_month && formData.service_year) {
        referenceNo = generateReferenceNumber(
          partnerId,
          formData.service_month,
          formData.service_year
        );
      }

      // Prepare invoice data with reference number
      const preparedData = prepareInvoiceData({
        ...formData,
        REFERENCE_NO: referenceNo
      });

      console.log("Invoice data generated successfully");
      setInvoiceData(preparedData);

      // After successfully generating the invoice, wait a moment for the preview to update,
      // then trigger the PDF download automatically
      setTimeout(() => {
        if (previewIframeRef.current) {
          const element = previewIframeRef.current.contentDocument.documentElement;

          // Use reference number for filename if available, then invoice number, then date
          const filename = formData.REFERENCE_NO
            ? `Invoice_${formData.REFERENCE_NO}.pdf`
            : formData.INVOICE_NO
              ? `Invoice_${formData.INVOICE_NO}.pdf`
              : `Invoice_${new Date().toISOString().slice(0, 10)}.pdf`;

          const options = {
            margin: 0.5,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          };

          html2pdf().set(options).from(element).save();

          // Show a success message
          alert('Invoice generated successfully! Your PDF download should begin automatically.');
        }
      }, 500); // Wait 500ms for the iframe to update

    } catch (error) {
      console.error("Error generating invoice:", error);
      alert(`Error generating invoice: ${error.message}`);
    }
  };

  const handlePrint = () => {
    if (previewIframeRef.current) {
      const iframeWindow = previewIframeRef.current.contentWindow;
      try {
        iframeWindow.focus();
        iframeWindow.print();
      } catch (error) {
        console.error('Error printing invoice:', error);
        alert('Error printing invoice. Please try again.');
      }
    }
  };

  const handleDownloadPDF = () => {
    if (!previewIframeRef.current) {
      alert('Invoice preview not ready. Please wait and try again.');
      return;
    }

    const element = previewIframeRef.current.contentDocument.documentElement;

    // Use reference number for filename if available, then invoice number, then date
    const filename = formData.REFERENCE_NO
      ? `Invoice_${formData.REFERENCE_NO}.pdf`
      : formData.INVOICE_NO
        ? `Invoice_${formData.INVOICE_NO}.pdf`
        : `Invoice_${new Date().toISOString().slice(0, 10)}.pdf`;

    const options = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  const handleEmailInvoice = () => {
    if (!invoiceData) {
      alert('Please generate an invoice first');
      return;
    }

    // Navigate to the email page with invoice data
    navigate('/email-invoice', { state: { invoiceData } });
  };

  // Add a function to clear saved data
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all invoice data? This cannot be undone.')) {
      localStorage.removeItem('invoiceFormData');
      localStorage.removeItem('invoiceData');
      localStorage.removeItem('partnerId');
      setFormData({
        Vendor_name: '',
        STATE: '',
        COUNTRY: 'India',
        GSTN: '',
        INVOICE_NO: '',
        INVOICE_DATE: new Date().toISOString().split('T')[0],
        TERMS: 'Net 30 days',
        PLACE_OF_SUPPLY: 'Karnataka(29)',
        BASE_AMOUNT: '',
        CGST_AMT: '',
        SGST_AMT: '',
        IGST_AMT: '',
        TOTAL_WITH_TAX: '',
        AMOUNT_IN_WORDS: '',
        TAX_NOTE: '',
        Bank_name: '',
        partner_bank_account: '',
        UTR: '',
        ADJUSTMENT: '0.00',
        TOTAL_AMOUNT: '',
        is_igst: false,
        SERVICE_DESCRIPTION: 'Financial intermediation services',
        masked_account_number: 'XXXXXXXX0000',
        masked_ifsc: 'ABCDXXXXx',
        service_month: '',
        service_year: new Date().getFullYear() + 1,
        REFERENCE_NO: ''
      });
      setInvoiceData(null);
      setPartnerId('');
    }
  };

  const formatBillingMonth = (dateString) => {
    try {
      // Handle both ISO date format and month name formats
      if (dateString.includes('-')) {
        return new Date(dateString).toLocaleString('default', { month: 'long' });
      }
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleDownloadInvoiceFromModal = () => {
    try {
      if (!editedInvoiceNumber) {
        alert('Please enter an invoice number before downloading');
        return;
      }

      const iframe = document.getElementById('modal-iframe');
      if (!iframe) {
        throw new Error('Invoice preview iframe not found');
      }

      const element = iframe.contentDocument.documentElement;
      const options = {
        margin: 0.5,
        filename: `Invoice_${editedInvoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  // Modify the prepareGstInvoiceData function to accept custom supplier name
  const prepareGstInvoiceData = (gstItem, customSupplierName = null, customInvoiceNumber = null) => {
    // Clean up bank account and IFSC data
    const bankAccount = gstItem.verified_bank_account_number?.replace(/[\[\]]/g, '') || '';
    const bankIfsc = gstItem.verified_bank_ifsc?.replace(/[\[\]]/g, '') || '';
    const billingMonth = formatBillingMonth(gstItem.billing_month);

    // Get state from GSTIN if available
    const state = gstItem.gst_no ? getStateFromGSTIN(gstItem.gst_no) : gstItem.state || 'N/A';

    // Determine if IGST applies based on state code
    const stateCode = gstItem.gst_no && gstItem.gst_no.length >= 2 ? gstItem.gst_no.substring(0, 2) : '';
    const isIgst = stateCode === '29';

    // Calculate tax amounts
    const baseAmount = gstItem.total_taxable_amount;
    let cgstAmount = '0.00';
    let sgstAmount = '0.00';
    let igstAmount = '0.00';

    if (isIgst) {
      // Apply IGST at 18%
      igstAmount = (baseAmount * 0.18).toFixed(2);
    } else {
      // Apply CGST+SGST at 9% each
      cgstAmount = (baseAmount * 0.09).toFixed(2);
      sgstAmount = (baseAmount * 0.09).toFixed(2);
    }

    const totalWithTax = (baseAmount * 1.18).toFixed(2);

    // Generate reference number
    const monthMap = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    const month = monthMap[billingMonth] || '01';
    const year = gstItem.billing_year.toString().slice(-2);
    const referenceNo = `${gstItem.destination_id}-${month}-${year}`;

    return {
      Vendor_name: customSupplierName || gstItem.partner_name,
      GSTN: gstItem.gst_no || 'N/A',
      STATE: state,
      COUNTRY: 'India',
      INVOICE_NO: customInvoiceNumber || `INV-${gstItem.destination_id.substring(0, 8)}`,
      INVOICE_DATE: new Date().toLocaleDateString(),
      TERMS: 'Net 30 days',
      PLACE_OF_SUPPLY: 'Karnataka(29)',
      BASE_AMOUNT: baseAmount.toFixed(2),
      CGST_AMT: cgstAmount,
      SGST_AMT: sgstAmount,
      IGST_AMT: igstAmount,
      TOTAL_WITH_TAX: totalWithTax,
      TOTAL_TAX: (baseAmount * 0.18).toFixed(2),
      AMOUNT_IN_WORDS: numberToWords(parseFloat(totalWithTax)),
      Bank_name: bankIfsc,
      masked_ifsc: bankIfsc,
      partner_bank_account: bankAccount,
      masked_account_number: bankAccount,
      UTR: '',
      ADJUSTMENT: '0.00',
      TOTAL_AMOUNT: totalWithTax,
      SERVICE_DESCRIPTION: `Financial intermediation services - ${billingMonth} ${gstItem.billing_year}`,
      TAX_NOTE: gstItem.gst_remarks || 'GST is applied as per regulations.',
      REFERENCE_NO: referenceNo,
      is_igst: isIgst,
      cgst_sgst_style: isIgst ? 'style="display:none;"' : '',
      igst_style: isIgst ? '' : 'style="display:none;"'
    };
  };

  // Create a function to regenerate invoice data when editing
  const regenerateInvoiceData = () => {
    if (!selectedInvoice) return;

    const updatedData = prepareGstInvoiceData(
      selectedInvoice,
      editedSupplierName,
      editedInvoiceNumber
    );

    setModalInvoiceData(updatedData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        {/* Title and description removed */}
      </div>

      {/* Tabs - removing tabs, only keeping GST Invoice content */}
      <div className="mb-6">
        {/* Tab navigation removed */}
      </div>

      {/* Content - GST invoice tab now shown by default */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading GST data...</p>
        </div>
      ) : (
        <div className="gst-invoice-content">
          {/* GST Data Table */}
          <div className="brand-card overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">GST Invoice Data</h2>
              <p className="mt-1 text-sm text-gray-500">Select an invoice to generate</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partner Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Billing Month
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Billing Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GST No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxable Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : gstData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        No data available. Please enter a valid destination ID.
                      </td>
                    </tr>
                  ) : (
                    gstData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.partner_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.billing_month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.billing_year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.gst_no || item.gst_remarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{item.total_taxable_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedInvoice(item);
                              setShowPreviewModal(true);
                              setEditedSupplierName(item.partner_name);
                              setEditedInvoiceNumber(''); // Reset invoice number

                              // Prepare the initial invoice data
                              const initialData = prepareGstInvoiceData(item);
                              setModalInvoiceData(initialData);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Generate Invoice
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Section (only show in form tab) */}
      {activeTab === 'form' && (
        <div className="mt-8">
          <div className="brand-card">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
              <p className="mt-1 text-sm text-gray-500">Real-time preview of your invoice document</p>
            </div>
            <div className="preview-container">
              <div className="relative h-[800px]">
                <div id="invoice-preview" className="w-full h-full">
                  <iframe
                    ref={previewIframeRef}
                    srcDoc={invoiceData
                      ? generateInvoiceHTML(invoiceTemplate, invoiceData)
                      : generateInvoiceHTML(invoiceTemplate, {
                        Vendor_name: 'Your Company Name',
                        GSTN: 'GSTIN12345678',
                        STATE: 'State',
                        COUNTRY: 'India',
                        INVOICE_NO: 'INV-XXXX',
                        INVOICE_DATE: new Date().toLocaleDateString(),
                        TERMS: 'Net 30 days',
                        PLACE_OF_SUPPLY: 'Place of Supply',
                        BASE_AMOUNT: '0.00',
                        CGST_AMT: '0.00',
                        SGST_AMT: '0.00',
                        IGST_AMT: '0.00',
                        TOTAL_WITH_TAX: '0.00',
                        TOTAL_TAX: '0.00',
                        AMOUNT_IN_WORDS: 'Zero rupees only',
                        Bank_name: 'ABCD0123456',
                        masked_ifsc: 'ABCDXXXXx',
                        partner_bank_account: 'XXXXXXXXXXXX',
                        masked_account_number: 'XXXXXXXX0000',
                        UTR: '',
                        ADJUSTMENT: '0.00',
                        TOTAL_AMOUNT: '0.00',
                        SERVICE_DESCRIPTION: 'Financial intermediation services',
                        TAX_NOTE: 'Fill out the form to create your invoice'
                      })
                    }
                    className="w-full h-full border-0"
                    title="Invoice Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showPreviewModal && selectedInvoice && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Invoice Preview
                    </h3>

                    {/* Edit supplier name and invoice number area */}
                    <div className="mt-4 mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="modalSupplierName" className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier Name
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            id="modalSupplierName"
                            value={editedSupplierName}
                            onChange={(e) => setEditedSupplierName(e.target.value)}
                            className="brand-input flex-grow"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="modalInvoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Invoice Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="modalInvoiceNumber"
                          value={editedInvoiceNumber}
                          onChange={(e) => setEditedInvoiceNumber(e.target.value)}
                          className="brand-input"
                          placeholder="Enter invoice number (required)"
                        />
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={regenerateInvoiceData}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Update Invoice
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 border border-gray-200 p-4 h-[600px] overflow-y-auto">
                      {/* Render invoice preview using selected invoice data */}
                      <iframe
                        id="modal-iframe"
                        srcDoc={generateInvoiceHTML(invoiceTemplate, modalInvoiceData || prepareGstInvoiceData(selectedInvoice))}
                        className="w-full h-full border-0"
                        title="Invoice Preview"
                      />
                    </div>

                    {!editedInvoiceNumber && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-700">
                          <span className="font-medium">Please note:</span> Invoice number is required before you can download or approve the invoice.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${editedInvoiceNumber ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={handleDownloadInvoiceFromModal}
                  disabled={!editedInvoiceNumber}
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${editedInvoiceNumber ? 'border-green-300 text-green-700 hover:bg-green-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'} shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={() => {
                    if (editedInvoiceNumber) {
                      // Approve logic (can be implemented later)
                      alert('Invoice approved!');
                      setShowPreviewModal(false);
                    }
                  }}
                  disabled={!editedInvoiceNumber}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm; 