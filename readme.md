# Partner Payout Dashboard

A full-stack application that shows partner payout details including commissions, offers, and transactions.

## Project Structure

- Backend: Flask API with PostgreSQL database
- Frontend: React application with TailwindCSS for styling

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
   ```
   python -m venv back-env
   ```

2. Activate the virtual environment:
   - Windows: `back-env\Scripts\activate`
   - Mac/Linux: `source back-env/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and fill in your database credentials

5. Run the Flask server:
   ```
   python app.py
   ```

The backend will be available at http://localhost:5001

### Frontend Setup

1. Install Node.js dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with:
   ```
   REACT_APP_API_URL=http://localhost:5001
   ```

3. Start the development server:
   ```
   npm start
   ```

The frontend will be available at http://localhost:3000

## API Endpoints

- `GET /api/payout/dashboard`: Get payout dashboard data
  - Query parameters:
    - `destination_id`: ID of the destination to filter by (required)
    - `view_type`: 'commission' or 'offer' (defaults to 'commission')
    - `financial_year`: (optional) Filter by financial year
    - `month`: (optional) Filter by month in YYYY-MM-DD format

- `GET /api/payout/dashboard/summary`: Get summary of payout dashboard data
  - Query parameters:
    - `destination_id`: ID of the destination to filter by (required)
    - `financial_year`: (optional) Filter by financial year

## Data Models

The dashboard data is based on the `PayoutDashboardEntry` model with fields like:
- `destination_id`: Partner ID
- `financial_year`: Year of the payout
- `month`: Month of the payout
- `customer_created`: Number of new customers created
- `total_customers`: Total number of customers
- And more financial metrics

## Features

- Filter by month
- Search functionality
- Different views (Summary, Offers, Transactions)
- Export data (to be implemented)