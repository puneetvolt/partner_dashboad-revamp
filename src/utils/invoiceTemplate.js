export const invoiceTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tax Invoice</title>
    <style>
        @page {
            size: letter;
            margin: 0.5in;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background: white;
        }

        .invoice-container {
            width: 100%;
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            border: 1px solid #000;
            box-sizing: border-box;
        }

        .header {
            display: table;
            width: 100%;
            border-bottom: 1px solid #000;
        }

        .company-details, .invoice-title {
            display: table-cell;
            vertical-align: middle;
            padding: 10px;
        }

        .company-details {
            width: 75%;
        }

        .invoice-title {
            width: 25%;
            border-left: 1px solid #000;
            text-align: center;
        }

        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .invoice-title h1 {
            font-size: 20px;
            margin: 0;
        }

        .info-section {
            display: table;
            width: 100%;
            border-bottom: 1px solid #000;
        }

        .left-info, .right-info {
            display: table-cell;
            vertical-align: top;
            padding: 10px;
        }

        .left-info {
            width: 75%;
        }

        .right-info {
            width: 25%;
            border-left: 1px solid #000;
        }

        .address-section {
            display: table;
            width: 100%;
            border-bottom: 1px solid #000;
        }

        .bill-to, .ship-to {
            display: table-cell;
            vertical-align: top;
            padding: 10px;
        }

        .bill-to {
            width: 75%;
        }

        .ship-to {
            width: 25%;
            border-left: 1px solid #000;
        }

        .section-title {
            background-color: #f2f2f3;
            padding: 5px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
        }

        .items-table th, .items-table td {
            border: 1px solid #000;
            padding: 5px;
            text-align: center;
            font-size: 11px;
            background-color: white;
        }

        .items-table th {
            background-color: #f2f2f3;
            font-weight: bold;
            white-space: nowrap;
        }

        .totals-section {
            display: table;
            width: 100%;
            border-top: 1px solid #000;
        }

        .total-words, .total-amounts {
            display: table-cell;
            vertical-align: top;
            padding: 10px;
        }

        .total-words {
            width: 60%;
        }

        .total-amounts {
            width: 40%;
            border-left: 1px solid #000;
        }

        .amount-table {
            width: 100%;
            margin-top: 10px;
        }

        .amount-table tr td {
            padding: 4px;
        }

        .amount-table tr td:last-child {
            text-align: right;
        }

        .bank-details {
            margin-top: 20px;
            border-top: 1px solid #9e9e9e;
            padding-top: 10px;
        }

        .signature-section {
            border-top: 1px solid #000;
            padding: 20px;
            text-align: right;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .text-center {
            text-align: center;
        }

        .font-bold {
            font-weight: bold;
        }

        .mt-10 {
            margin-top: 10px;
        }

        .mt-20 {
            margin-top: 20px;
        }

        .tax-note {
            font-size: 11px;
            margin-top: 10px;
            color: #666;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
                background: white;
            }

            .invoice-container {
                border: 1px solid #000;
                margin: 0;
                padding: 0;
                width: 100%;
                max-width: none;
            }

            .items-table {
                page-break-inside: avoid;
            }

            .items-table th, .items-table td {
                background-color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
            }

            .section-title {
                background-color: #f2f2f3 !important;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header Section -->
        <div class="header">
            <div class="company-details">
                <div class="company-name">{{Vendor_name}}</div>
                <div>{{STATE}}</div>
                <div>{{COUNTRY}}</div>
                <div>GSTN: <span id="vendor_gstn">{{GSTN}}</span></div>
            </div>
            <div class="invoice-title">
                <h1>TAX INVOICE</h1>
            </div>
        </div>


        <!-- Invoice Info Section -->
        <div class="info-section">
            <div class="left-info">
                <div>Invoice No: <strong>{{INVOICE_NO}}</strong></div>
                <div>Invoice Date: <strong>{{INVOICE_DATE}}</strong></div>
                <div>Terms: <strong>{{TERMS}}</strong></div>
            </div>
            <div class="right-info">
                <div>Place Of Supply: <strong>{{PLACE_OF_SUPPLY}}</strong></div>
            </div>
        </div>


        <!-- Address Section -->
        <div class="address-section">
            <div class="bill-to">
                <div class="section-title">Bill To</div>
                <div>
                    <strong>Salter Technologies Private Limited</strong><br>
                    <strong>GSTN: <span id="client_gstn">29ABICS0071M1ZY</span></strong><br>
                    T-9 Shirping Chirping Woods, Villament103, Tower-9, Haralur Road,<br>
                    Shubh Enclave, Ambalipura, Bengaluru,<br>
                    Bengaluru Urban, Karnataka, 560102
                </div>
            </div>
            <div class="ship-to">
                <div class="section-title">Ship To</div>
                <div>Same as Billing</div>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th rowspan="2">#</th>
                    <th rowspan="2" width="30%">Item & Description</th>
                    <th rowspan="2">HSN/SAC</th>
                    <th rowspan="2">Qty</th>
                    <th rowspan="2">Base Amount</th>
                    <th colspan="2" class="cgst-sgst" {{cgst_sgst_style}}>CGST</th>
                    <th colspan="2" class="cgst-sgst" {{cgst_sgst_style}}>SGST</th>
                    <th colspan="2" class="igst" {{igst_style}}>IGST</th>
                    <th rowspan="2">Total Amount</th>
                </tr>
                <tr>
                    <th class="cgst-sgst" {{cgst_sgst_style}}>%</th>
                    <th class="cgst-sgst" {{cgst_sgst_style}}>Amt</th>
                    <th class="cgst-sgst" {{cgst_sgst_style}}>%</th>
                    <th class="cgst-sgst" {{cgst_sgst_style}}>Amt</th>
                    <th class="igst" {{igst_style}}>%</th>
                    <th class="igst" {{igst_style}}>Amt</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td class="text-left">{{SERVICE_DESCRIPTION}}</td>
                    <td>997156</td>
                    <td>1.00</td>
                    <td class="text-right">{{BASE_AMOUNT}}</td>
                    <td class="cgst-sgst" {{cgst_sgst_style}}>9%</td>
                    <td class="text-right cgst-sgst" {{cgst_sgst_style}}>{{CGST_AMT}}</td>
                    <td class="cgst-sgst" {{cgst_sgst_style}}>9%</td>
                    <td class="text-right cgst-sgst" {{cgst_sgst_style}}>{{SGST_AMT}}</td>
                    <td class="igst" {{igst_style}}>18%</td>
                    <td class="text-right igst" {{igst_style}}>{{IGST_AMT}}</td>
                    <td class="text-right">{{TOTAL_WITH_TAX}}</td>
                </tr>
            </tbody>
        </table>

        <!-- Totals Section -->
        <div class="totals-section">
            <div class="total-words">
                <strong>Total Amount in Words:</strong><br>
                <em>{{AMOUNT_IN_WORDS}}</em>
                
                <div class="tax-note" id="tax-note" style="display: {{TAX_NOTE ? 'block' : 'none'}};">
                    {{TAX_NOTE}}
                </div>
                
                <div class="mt-20">
                    <div class="section-title">Notes:</div>
                    <div>
                        1. This is a computer generated invoice<br>
                        2. Payment terms: {{TERMS}}<br>
                        3. Please quote Invoice Reference number <strong>{{REFERENCE_NO}}</strong> for all communications
                    </div>
                </div>

                <div class="bank-details">
                    <div class="section-title">Bank Details:</div>
                    <div>
                        <strong>Bank IFSC:</strong> {{masked_ifsc}}<br>
                        <strong>Account Number:</strong> {{masked_account_number}}<br>
                        <strong>Payment Reference:</strong> {{UTR}}
                    </div>
                </div>
            </div>
            <div class="total-amounts">
                <table class="amount-table">
                    <tr>
                        <td>Taxable Amount</td>
                        <td>{{BASE_AMOUNT}}</td>
                    </tr>
                    <tr class="cgst-sgst" {{cgst_sgst_style}}>
                        <td>CGST @ 9%</td>
                        <td>{{CGST_AMT}}</td>
                    </tr>
                    <tr class="cgst-sgst" {{cgst_sgst_style}}>
                        <td>SGST @ 9%</td>
                        <td>{{SGST_AMT}}</td>
                    </tr>
                    <tr class="igst" {{igst_style}}>
                        <td>IGST @ 18%</td>
                        <td>{{IGST_AMT}}</td>
                    </tr>
                    <tr>
                        <td>Adjustment</td>
                        <td>{{ADJUSTMENT}}</td>
                    </tr>
                    <tr class="font-bold">
                        <td>Total Amount</td>
                        <td>{{TOTAL_WITH_TAX}}</td>
                    </tr>
                    <tr class="font-bold">
                        <td>Balance Due</td>
                        <td>{{TOTAL_TAX}}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div>For {{Vendor_name}}</div>
            <div class="mt-20">Authorized Signatory</div>
        </div>
    </div>
</body>
</html>`;