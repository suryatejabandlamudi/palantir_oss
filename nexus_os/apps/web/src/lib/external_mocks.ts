import { v4 as uuidv4 } from 'uuid';

export const ExternalSystemMocks = {
    // ServiceNow Mock Generator
    serviceNow: {
        createTicket: (description: string) => {
            const id = `INC-${Math.floor(Math.random() * 1000000)}`;
            const slaBreach = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // +4 hours
            return {
                sys_id: uuidv4(),
                number: id,
                state: 'New',
                priority: '2 - High',
                short_description: description,
                assigned_to: 'Service Desk',
                sla_due: slaBreach,
                created_on: new Date().toISOString()
            };
        },
        searchAssets: (query: string) => {
            return [
                {
                    sys_id: uuidv4(),
                    name: query.includes('ip') ? 'Unknown Host' : 'MacBook Pro 16"',
                    install_status: 'Installed',
                    asset_tag: `AST-${Math.floor(Math.random() * 10000)}`,
                    assigned_to: 'Unassigned'
                }
            ];
        }
    },

    // Salesforce Mock Generator
    salesforce: {
        getOpportunity: (oppId: string) => {
            const margin = 20 + Math.random() * 15; // 20-35%
            return {
                Id: oppId || '0065e000002Xy7z',
                Name: 'Global Enterprise Deal',
                StageName: 'Negotiation',
                Amount: 850000,
                Margin__c: margin.toFixed(2),
                CloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                Probability: 80
            };
        },
        updateQuote: (quoteId: string, discount: number) => {
            return {
                success: true,
                id: quoteId,
                status: 'Draft',
                discount_approved: discount <= 15,
                message: discount > 15 ? 'Requires VP Approval' : 'Auto-Approved'
            };
        }
    },

    // SAP ERP Mock Generator
    sap: {
        checkInventory: (sku: string) => {
            const stock = Math.floor(Math.random() * 500);
            return {
                Material: sku,
                Plant: 'US01',
                StorageLocation: 'SL01',
                UnrestrictedStock: stock,
                SafetyStock: 100,
                LeadTime: 45 // days
            };
        },
        createPO: (quantity: number) => {
            return {
                PurchaseOrder: `45000${Math.floor(Math.random() * 10000)}`,
                Vendor: '100239 - Global Tech Supplies',
                DocDate: new Date().toISOString().split('T')[0],
                NetValue: quantity * 150.00,
                Currency: 'USD'
            };
        }
    },

    // Workday HCM Mock Generator
    workday: {
        getEmployee: (id: string) => {
            return {
                Employee_ID: id,
                Legal_Name: 'Alex Smith',
                Position: 'Senior Engineer',
                Cost_Center: 'CC-4022',
                Status: 'Active',
                Location: 'New York Office'
            };
        }
    },

    // SecOps Logic App Mock
    secOps: {
        analyzeThreat: (ip: string) => {
            const score = Math.floor(Math.random() * 100);
            return {
                Indicator: ip,
                ReputationScore: score,
                GeoLocation: 'Unknown',
                ThreatLevel: score > 80 ? 'CRITICAL' : (score > 50 ? 'HIGH' : 'LOW'),
                LastSeen: new Date().toISOString()
            };
        }
    }
};
