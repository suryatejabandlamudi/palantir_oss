import Link from 'next/link';

const Sidebar = () => {
    return (
        <div style={{
            width: '60px',
            height: '100vh',
            background: '#10161a',
            borderRight: '1px solid #293742',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '20px',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 100
        }}>
            <div style={{ marginBottom: '40px' }}>
                {/* Logo Placeholder */}
                <div style={{ width: '32px', height: '32px', background: '#bfccd6', borderRadius: '50%' }}></div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Link href="/foundry" title="Foundry Manager">
                    <div className="nav-item" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '18px' }}>F</span>
                    </div>
                </Link>
                <Link href="/ontology" title="Ontology Explorer">
                    <div className="nav-item" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '18px' }}>⚛️</span>
                    </div>
                </Link>
                <Link href="/builder" title="AIP Logic Builder">
                    <div className="nav-item text-white hover:bg-slate-800" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '18px' }}>🤖</span>
                    </div>
                </Link>
                <Link href="/gotham" title="Gotham">
                    <div className="nav-item" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '18px' }}>G</span>
                    </div>
                </Link>
                <Link href="/apollo" title="Apollo">
                    <div className="nav-item" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '18px' }}>Ω</span>
                    </div>
                </Link>

                <div className="w-8 h-px bg-slate-700 my-2"></div>

                <Link href="/command-center" title="Command Center">
                    <div className="nav-item text-white hover:bg-slate-800" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '18px' }}>🛡️</span>
                    </div>
                </Link>

                {/* Enterprise Integrations */}
                <div className="w-8 h-px bg-slate-700 my-2"></div>

                <Link href="/erp" title="ERP: SAP">
                    <div className="nav-item text-white hover:bg-slate-800" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>SAP</span>
                    </div>
                </Link>
                <Link href="/crm" title="CRM: Salesforce">
                    <div className="nav-item text-white hover:bg-slate-800" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>SF</span>
                    </div>
                </Link>
                <Link href="/hcm" title="HCM: Workday">
                    <div className="nav-item text-white hover:bg-slate-800" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>WD</span>
                    </div>
                </Link>
                <Link href="/itsm" title="ITSM: ServiceNow">
                    <div className="nav-item text-white hover:bg-slate-800" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>SN</span>
                    </div>
                </Link>            </nav>
        </div >
    );
};

export default Sidebar;
