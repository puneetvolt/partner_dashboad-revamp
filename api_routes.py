from flask import Blueprint, request, jsonify
from database import get_connection

payout_api = Blueprint('payout_api', __name__)

@payout_api.route('/dashboard', methods=['GET'])
def get_payout_dashboard():
    """
    API endpoint to fetch payout dashboard data filtered by destination_id
    
    Query parameters:
    - destination_id: ID of the destination to filter by
    - view_type: 'commission' or 'offer' (defaults to 'commission')
    - financial_year: (optional) Filter by financial year
    - month: (optional) Filter by month in YYYY-MM-DD format
    """
    destination_id = request.args.get('destination_id')
    view_type = request.args.get('view_type', 'commission')
    financial_year = request.args.get('financial_year')
    month = request.args.get('month')
    
    if not destination_id:
        return jsonify({"error": "destination_id is required"}), 400
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Base query to get all records for the destination_id
    query = """
        SELECT * FROM derived_payout_dashboard 
        WHERE destination_id = %s
    """
    params = [destination_id]
    
    # Add filter for view type
    if view_type.lower() == 'commission':
        query += " AND payment_type = 'COMMISSION'"
    elif view_type.lower() == 'offer':
        query += " AND reason_name = 'OFFER'"
    
    # Add optional filters
    if financial_year:
        query += " AND financial_year = %s"
        params.append(financial_year)
    
    if month:
        query += " AND month = %s"
        params.append(month)
    
    # Execute query
    cursor.execute(query, params)
    columns = [desc[0] for desc in cursor.description]
    results = cursor.fetchall()
    
    # Convert to list of dictionaries
    data = []
    for row in results:
        data.append(dict(zip(columns, row)))
    
    cursor.close()
    conn.close()
    
    return jsonify(data)

@payout_api.route('/dashboard/summary', methods=['GET'])
def get_payout_summary():
    """
    API endpoint to fetch a summary of payout dashboard data for a destination_id
    
    Query parameters:
    - destination_id: ID of the destination to filter by
    - financial_year: (optional) Filter by financial year
    """
    destination_id = request.args.get('destination_id')
    financial_year = request.args.get('financial_year')
    
    if not destination_id:
        return jsonify({"error": "destination_id is required"}), 400
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Base query for summary
    query = """
        SELECT 
            financial_year,
            SUM(total_payout_amount) as total_amount,
            SUM(upfront_referral) as total_upfront,
            SUM(trail_referral) as total_trail,
            SUM(tds) as total_tds,
            SUM(gst_amount) as total_gst,
            MAX(total_customers) as max_customers
        FROM derived_payout_dashboard 
        WHERE destination_id = %s
    """
    params = [destination_id]
    
    # Add optional filter
    if financial_year:
        query += " AND financial_year = %s"
        params.append(financial_year)
    
    query += " GROUP BY financial_year"
    
    # Execute query
    cursor.execute(query, params)
    columns = [desc[0] for desc in cursor.description]
    results = cursor.fetchall()
    
    # Convert to list of dictionaries
    data = []
    for row in results:
        data.append(dict(zip(columns, row)))
    
    cursor.close()
    conn.close()
    
    return jsonify(data)

@payout_api.route('/gst-dashboard', methods=['GET'])
def get_gst_dashboard():
    """
    API endpoint to fetch GST dashboard data filtered by destination_id
    
    Query parameters:
    - destination_id: ID of the destination to filter by
    - financial_year: (optional) Filter by financial year
    - month: (optional) Filter by month in YYYY-MM-DD format
    """
    destination_id = request.args.get('destination_id')
    financial_year = request.args.get('financial_year')
    month = request.args.get('month')
    
    if not destination_id:
        return jsonify({"error": "destination_id is required"}), 400
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Base query to get all records for the destination_id
    query = """
        SELECT * FROM partner_prod_gst_dashboard 
        WHERE destination_id = %s
    """
    params = [destination_id]
    
    # Add optional filters
    if financial_year:
        query += " AND financial_year = %s"
        params.append(financial_year)
    
    if month:
        query += " AND month = %s"
        params.append(month)
    
    # Execute query
    cursor.execute(query, params)
    columns = [desc[0] for desc in cursor.description]
    results = cursor.fetchall()
    
    # Convert to list of dictionaries
    data = []
    for row in results:
        data.append(dict(zip(columns, row)))
    
    cursor.close()
    conn.close()
    
    return jsonify(data)

@payout_api.route('/transactions', methods=['GET'])
def get_transactions():
    """
    API endpoint to fetch transaction data filtered by destination_id
    
    Query parameters:
    - destination_id: ID of the destination to filter by
    - financial_year: (optional) Filter by financial year
    - month: (optional) Filter by month in YYYY-MM-DD format
    """
    destination_id = request.args.get('destination_id')
    financial_year = request.args.get('financial_year')
    month = request.args.get('month')
    
    if not destination_id:
        return jsonify({"error": "destination_id is required"}), 400
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Query to get transaction data
    query = """
        SELECT 
            payment_month, 
            destination_id, 
            utr_number, 
            (transaction_amount * -1) as payment_amount, 
            payment_date, 
            transaction_status
        FROM payout_transactions
        WHERE destination_id = %s
    """
    params = [destination_id]
    
    # Add optional filters
    if financial_year:
        query += " AND EXTRACT(YEAR FROM payment_month) = %s"
        params.append(financial_year)
    
    if month:
        query += " AND payment_month = %s"
        params.append(month)
    
    # Execute query
    cursor.execute(query, params)
    columns = [desc[0] for desc in cursor.description]
    results = cursor.fetchall()
    
    # Convert to list of dictionaries
    data = []
    for row in results:
        data.append(dict(zip(columns, row)))
    
    cursor.close()
    conn.close()
    
    return jsonify(data) 