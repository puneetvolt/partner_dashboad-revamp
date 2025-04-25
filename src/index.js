import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PartnerPayoutDashboard from './components/PartnerPayoutDashboard';
import './index.css';
import InvoiceForm from './InvoiceForm';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PartnerPayoutDashboard />} />
                <Route path="/invoice-form" element={<InvoiceForm />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
); 