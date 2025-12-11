from nexus_os.core.integrations.crm.client import CRMConnector
from nexus_os.core.integrations.erp.client import ERPConnector

def test_crm():
    print("\n--- Testing CRM Connector (Mock DB) ---")
    crm = CRMConnector()
    
    # Test Get Leads (should read from DB seed, if we added seed, otherwise empty)
    # We didn't explicitly seed Leads, but we seeded Inventory.
    # Let's seed a Lead first.
    crm.db.execute("INSERT INTO leads (id, name, email, company, status) VALUES ('L-1', 'Elon Musk', 'elon@spacex.com', 'SpaceX', 'New')")
    
    leads = crm.execute_tool("crm_get_leads", email="elon@spacex.com")
    print(f"Leads Found: {leads}")
    assert len(leads) > 0
    assert leads[0]['Email'] == 'elon@spacex.com'

    # Test Create Quote
    quote = crm.execute_tool("crm_create_quote", opportunity_id="OPP-101", products=[{"productId": "P-1", "quantity": 10}])
    print(f"Quote Created: {quote}")
    assert quote['status'] == 'Draft'

def test_erp():
    print("\n--- Testing ERP Connector (Mock DB) ---")
    erp = ERPConnector()

    # Test Get Inventory (Seeded in db.py)
    items = erp.execute_tool("erp_get_inventory", item_id="Titanium")
    print(f"Inventory Found: {items}")
    assert len(items) > 0
    assert "Titanium" in items[0]['displayName']

    # Test Create PO
    po = erp.execute_tool("erp_create_po", vendor_id="VEN-999", items=[{"itemId": "P-1044", "quantity": 50}])
    print(f"PO Created: {po}")
    assert po['vendorId'] == 'VEN-999'
    
    # Verify PO in DB
    po_db = erp.db.query("SELECT * FROM purchase_orders WHERE vendor = ?", ("VEN-999",))
    print(f"PO in DB: {po_db}")
    assert len(po_db) > 0

if __name__ == "__main__":
    try:
        test_crm()
        test_erp()
        print("\n✅ Verification Successful: DB Integration works!")
    except Exception as e:
        print(f"\n❌ Verification Failed: {e}")
        import traceback
        traceback.print_exc()
