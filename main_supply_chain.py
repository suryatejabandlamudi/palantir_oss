from agent.supply_chain_agent import SupplyChainAgent
import datetime

def main():
    print("Initializing Enterprise Process Brain - Supply Chain Wedge...")
    agent = SupplyChainAgent()
    
    # Simulate Event: Component Delivery Delayed
    event = {
        "event_type": "ComponentDeliveryDelayed",
        "source": "SAP",
        "timestamp": datetime.datetime.now().isoformat(),
        "payload": {
            "component_id": "COMP-X",
            "po_number": "PO-998877",
            "original_delivery_date": "2025-09-01",
            "new_delivery_date": "2025-09-10",
            "delay_days": 9
        }
    }
    
    print("\n>>> EVENT BUS: Emitting Event <<<")
    agent.run(event)

if __name__ == "__main__":
    main()
