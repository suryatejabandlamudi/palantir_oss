import duckdb
import os
from typing import List, Dict, Any

class NexusDB:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NexusDB, cls).__new__(cls)
            cls._instance.db_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
                "nexus.duckdb"
            )
            cls._instance.conn = duckdb.connect(cls._instance.db_path)
            cls._instance._init_tables()
        return cls._instance

    def _init_tables(self):
        """Initialize tables if they don't exist."""
        # CRM Tables
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id VARCHAR PRIMARY KEY,
                name VARCHAR,
                email VARCHAR,
                company VARCHAR,
                status VARCHAR
            )
        """)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS opportunities (
                id VARCHAR PRIMARY KEY,
                account_id VARCHAR,
                name VARCHAR,
                amount DECIMAL,
                stage VARCHAR,
                close_date DATE
            )
        """)
        # ERP Tables
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS inventory (
                material_id VARCHAR PRIMARY KEY,
                description VARCHAR,
                plant VARCHAR,
                stock INTEGER,
                status VARCHAR
            )
        """)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS purchase_orders (
                id VARCHAR PRIMARY KEY,
                material_id VARCHAR,
                quantity INTEGER,
                vendor VARCHAR,
                status VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                number VARCHAR PRIMARY KEY,
                short_description VARCHAR,
                description VARCHAR,
                urgency VARCHAR,
                state VARCHAR,
                assigned_to VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # HRIS Tables
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                id VARCHAR PRIMARY KEY,
                name VARCHAR,
                email VARCHAR,
                department VARCHAR,
                location VARCHAR,
                role VARCHAR,
                status VARCHAR,
                joining_date DATE,
                separation_date DATE
            )
        """)

        # Supply Chain / Finance Tables
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS vendors (
                id VARCHAR PRIMARY KEY,
                name VARCHAR,
                risk_score INTEGER,
                payment_terms VARCHAR,
                bank_account_hash VARCHAR
            )
        """)
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS shipments (
                id VARCHAR PRIMARY KEY,
                tracking_number VARCHAR,
                status VARCHAR,
                origin VARCHAR,
                destination VARCHAR,
                estimated_delivery TIMESTAMP,
                carrier VARCHAR
            )
        """)
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS invoices (
                id VARCHAR PRIMARY KEY,
                po_id VARCHAR,
                amount DECIMAL,
                vendor_id VARCHAR,
                status VARCHAR,
                pdf_path VARCHAR
            )
        """)

        # Manufacturing / Maintenance Tables
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS maintenance_orders (
                id VARCHAR PRIMARY KEY,
                machine_id VARCHAR,
                description VARCHAR,
                status VARCHAR,
                scheduled_date TIMESTAMP,
                tech_id VARCHAR
            )
        """)
        
        # Seed Data if empty
        self._seed_data()

    def _seed_data(self):
        # Seed Inventory
        count = self.conn.execute("SELECT COUNT(*) FROM inventory").fetchone()[0]
        if count == 0:
            self.conn.execute("INSERT INTO inventory VALUES ('P-1002', 'Titanium Alloy Casing', 'PL-01 NY', 142, 'Healthy')")
            self.conn.execute("INSERT INTO inventory VALUES ('P-1044', 'Thermal Sensor Module', 'PL-02 CA', 12, 'Low')")
            self.conn.execute("INSERT INTO inventory VALUES ('P-2201', 'Guidance Chipset v4', 'PL-01 NY', 850, 'Healthy')")
            
        # Seed Incidents
        count_inc = self.conn.execute("SELECT COUNT(*) FROM incidents").fetchone()[0]
        if count_inc == 0:
            self.conn.execute("INSERT INTO incidents (number, short_description, urgency, state, assigned_to) VALUES ('INC-2024-001', 'Payment Gateway High Latency', '1', 'New', 'Network Team')")
            self.conn.execute("INSERT INTO incidents (number, short_description, urgency, state, assigned_to) VALUES ('INC-9921', 'VPN Access failure', '2', 'In Progress', 'IT Support')")

        # Seed Employees
        count_emp = self.conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
        if count_emp == 0:
            self.conn.execute("INSERT INTO employees VALUES ('EMP-001', 'John Doe', 'john.doe@example.com', 'Engineering', 'NY', 'Developer', 'Active', '2024-01-15', NULL)")
            self.conn.execute("INSERT INTO employees VALUES ('EMP-002', 'Jane Smith', 'jane.smith@example.com', 'Sales', 'SF', 'Director', 'Terminated', '2023-01-01', '2023-12-31')")

        # Seed Vendors
        count_ven = self.conn.execute("SELECT COUNT(*) FROM vendors").fetchone()[0]
        if count_ven == 0:
            self.conn.execute("INSERT INTO vendors VALUES ('V-101', 'Acme Corp', 15, 'Net-30', 'hksjdhfksjdhf')")
            self.conn.execute("INSERT INTO vendors VALUES ('V-666', 'Suspect Supplies Ltd', 85, 'Due-on-Receipt', 'unknown_hash')")

        # Seed Shipments
        count_shp = self.conn.execute("SELECT COUNT(*) FROM shipments").fetchone()[0]
        if count_shp == 0:
            self.conn.execute("INSERT INTO shipments VALUES ('SHP-100', 'TRK-123456', 'In Transit', 'Shanghai', 'Los Angeles', '2024-05-20', 'Maersk')")
            self.conn.execute("INSERT INTO shipments VALUES ('SHP-101', 'TRK-987654', 'Delayed', 'Hamburg', 'New York', '2024-05-25', 'Hapag-Lloyd')")

        # Seed Invoices
        count_inv = self.conn.execute("SELECT COUNT(*) FROM invoices").fetchone()[0]
        if count_inv == 0:
            self.conn.execute("INSERT INTO invoices VALUES ('INV-001', 'PO-999', 5000.00, 'V-101', 'Pending', '/path/to/invoice.pdf')")

        # Seed Maintenance Orders
        count_mo = self.conn.execute("SELECT COUNT(*) FROM maintenance_orders").fetchone()[0]
        if count_mo == 0:
            self.conn.execute("INSERT INTO maintenance_orders VALUES ('MO-100', 'M-500', 'Hydraulic Pump Replacement', 'Scheduled', '2024-06-15', 'T-20')")

    def query(self, sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
        cursor = self.conn.execute(sql, params)
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def execute(self, sql: str, params: tuple = ()):
        self.conn.execute(sql, params)

db = NexusDB()
