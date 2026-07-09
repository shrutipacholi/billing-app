import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Receipt, LogOut, Menu, X, ChevronLeft, ChevronRight, ChevronDown, Users, User, CreditCard, DollarSign, Activity, Plus } from 'lucide-react';
import BillingScreen from './BillingScreen';
import { getUserInvoices, logoutUser } from '../utils/auth';

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'billing'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load invoices to compute quick statistics
  useEffect(() => {
    const loadInvoices = async () => {
      if (!user) return;
      setLoadingInvoices(true);
      try {
        const data = await getUserInvoices(user.id);
        setInvoices(data);
      } catch (err) {
        console.error('Failed to load invoices:', err);
        setInvoices([]);
      } finally {
        setLoadingInvoices(false);
      }
    };

    loadInvoices();
  }, [user, activeTab]);

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  // Calculations for overview statistics
  const totalBilled = Array.isArray(invoices) ? invoices.reduce((sum, inv) => sum + (inv?.grandTotal || 0), 0) : 0;
  const invoiceCount = Array.isArray(invoices) ? invoices.length : 0;
  const averageBill = invoiceCount > 0 ? (totalBilled / invoiceCount) : 0;
  
  // Count unique client names safely
  const uniqueClients = Array.isArray(invoices)
    ? [...new Set(invoices.map(inv => (inv?.clientName || '').trim().toLowerCase()))].filter(Boolean).length
    : 0;


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''} no-print`}>
        <div className="sidebar-header">
          <div className="sidebar-logo text-gradient-indigo-purple">
            <span>⚡ BillCraft</span>
          </div>
          <button 
            type="button"
            className="sidebar-toggle-btn"
            style={{ display: 'flex' }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Card */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>

        {/* Sidebar Menu */}
        <ul className="sidebar-menu">
          <li>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('overview');
                setMobileOpen(false);
              }}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('billing');
                setMobileOpen(false);
              }}
            >
              <Receipt size={18} />
              <span>Billing Generator</span>
            </button>
          </li>
        </ul>

        {/* Sidebar Footer / Logout */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="menu-item-btn"
            style={{ color: 'var(--danger)' }}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar no-print">
          <button 
            type="button"
            className="menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            title="Toggle mobile menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="navbar-title">
            {activeTab === 'overview' ? 'Analytics Dashboard' : 'Billing Generator'}
          </h1>
          <div className="navbar-right">
            <span className="navbar-welcome no-print">
              Welcome back, <strong>{user?.name}</strong>
            </span>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className={`user-profile-btn ${userDropdownOpen ? 'open' : ''}`}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="user-profile-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-profile-name">{user?.name || 'User'}</span>
                <ChevronDown size={16} className="user-profile-chevron" />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">{user?.name || 'User'}</div>
                    <div className="user-dropdown-email">{user?.email || 'No email'}</div>
                    <div className="user-dropdown-role">Administrator</div>
                  </div>
                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={() => { setActiveTab('overview'); setUserDropdownOpen(false); }}
                  >
                    <LayoutDashboard size={16} />
                    Overview
                  </button>
                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={() => { setActiveTab('billing'); setUserDropdownOpen(false); }}
                  >
                    <Receipt size={16} />
                    Billing Generator
                  </button>
                  <button
                    type="button"
                    className="user-dropdown-item danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Dashboard Screen Body */}
        <div className="content-body">
          {activeTab === 'overview' ? (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              
              {/* Stats Grid */}
              <div className="overview-grid">
                <div className="stat-card glass">
                  <div className="stat-info">
                    <h3>Total Revenue</h3>
                    <div className="stat-value">{formatCurrency(totalBilled)}</div>
                  </div>
                  <div className="stat-icon-wrapper indigo">
                    <DollarSign size={22} />
                  </div>
                </div>

                <div className="stat-card glass">
                  <div className="stat-info">
                    <h3>Invoices Billed</h3>
                    <div className="stat-value">{invoiceCount}</div>
                  </div>
                  <div className="stat-icon-wrapper purple">
                    <CreditCard size={22} />
                  </div>
                </div>

                <div className="stat-card glass">
                  <div className="stat-info">
                    <h3>Avg. Invoice Value</h3>
                    <div className="stat-value">{formatCurrency(averageBill)}</div>
                  </div>
                  <div className="stat-icon-wrapper cyan">
                    <Activity size={22} />
                  </div>
                </div>

                <div className="stat-card glass">
                  <div className="stat-info">
                    <h3>Active Clients</h3>
                    <div className="stat-value">{uniqueClients}</div>
                  </div>
                  <div className="stat-icon-wrapper success">
                    <Users size={22} />
                  </div>
                </div>
              </div>

              {/* Main Dash Body: Recent Invoices & Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                
                {/* Recent Billing Records Card */}
                <div className="billing-card glass">
                  <h2>
                    <Receipt size={18} className="text-gradient-indigo-purple" />
                    <span>Recent Invoices</span>
                  </h2>

                  {loadingInvoices ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Loading invoices...
                    </div>
                  ) : invoices.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <p>You haven't generated any invoices yet.</p>
                      <button 
                        type="button"
                        className="btn btn-primary" 
                        style={{ marginTop: '16px' }}
                        onClick={() => setActiveTab('billing')}
                      >
                        Create Your First Bill
                      </button>
                    </div>
                  ) : (
                    <div className="custom-table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Invoice No.</th>
                            <th>Client Name</th>
                            <th>Date</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                           {(invoices || []).slice(0, 5).map((inv) => (
                            <tr key={inv?.id || Math.random().toString()}>
                              <td style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>{inv?.invoiceNumber || 'N/A'}</td>
                              <td>{inv?.clientName || 'N/A'}</td>
                              <td>{inv?.invoiceDate || 'N/A'}</td>
                              <td style={{ textAlign: 'right', fontWeight: '700' }}>{formatCurrency(inv?.grandTotal || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Dashboard Quick Actions Card */}
                <div className="billing-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2>
                    <LayoutDashboard size={18} className="text-gradient-purple-cyan" />
                    <span>Quick Controls</span>
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Access billing controls instantly to update clients, view finances, and issue itemized statements.
                  </p>
                  
                  <button 
                    type="button"
                    className="btn btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setActiveTab('billing')}
                  >
                    <Plus size={18} /> New Manual Bill
                  </button>

                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleLogout}
                  >
                    <LogOut size={18} /> Sign Out Session
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <BillingScreen user={user} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
