import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, FileText, ShoppingCart, Percent, Eye, FileSpreadsheet, Save } from 'lucide-react';
import { getUserInvoices, saveInvoice, deleteInvoice } from '../utils/auth';

export default function BillingScreen({ user }) {
  // Invoices list state
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Current billing meta information
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  // Current active items in the builder
  const [activeItems, setActiveItems] = useState([]);

  // Form input fields for adding items
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState('');

  // Global settings
  const [taxRate, setTaxRate] = useState(10); // default 10% GST/VAT
  const [discountRate, setDiscountRate] = useState(0); // default 0% discount

  // Selected invoice for preview modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Load user invoices history on mount
  useEffect(() => {
    const loadInvoices = async () => {
      if (!user) return;
      setLoadingInvoices(true);
      try {
        const data = await getUserInvoices(user.id);
        setInvoices(data);
      } catch (err) {
        console.error('Failed to load invoices:', err);
      } finally {
        setLoadingInvoices(false);
      }
    };

    loadInvoices();
    generateNewInvoiceNumber();
  }, [user]);

  const generateNewInvoiceNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setInvoiceNumber(`INV-2026-${randomNum}`);
  };

  // Calculations
  const getSubtotal = () => {
    return activeItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
  };

  const getDiscountAmount = () => {
    const subtotal = getSubtotal();
    return (subtotal * (discountRate / 100));
  };

  const getTaxAmount = () => {
    const taxableAmount = getSubtotal() - getDiscountAmount();
    return (taxableAmount * (taxRate / 100));
  };

  const getGrandTotal = () => {
    return getSubtotal() - getDiscountAmount() + getTaxAmount();
  };

  // Add Item to Builder
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      alert('Please enter an item name.');
      return;
    }
    const qty = parseInt(itemQty);
    const price = parseFloat(itemPrice);

    if (isNaN(qty) || qty <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }
    if (isNaN(price) || price < 0) {
      alert('Price must be greater than or equal to 0.');
      return;
    }

    const newItem = {
      id: 'item_' + Math.random().toString(36).substr(2, 9),
      name: itemName.trim(),
      qty,
      price
    };

    setActiveItems([...activeItems, newItem]);
    
    // Reset Form
    setItemName('');
    setItemQty(1);
    setItemPrice('');
  };

  // Delete Item from Builder
  const handleDeleteItem = (itemId) => {
    setActiveItems(activeItems.filter(item => item.id !== itemId));
  };

  // Qty Increment/Decrement UI
  const adjustQty = (amount) => {
    const newQty = parseInt(itemQty) + amount;
    if (newQty >= 1) {
      setItemQty(newQty);
    }
  };

  // Save the complete invoice
  const handleSaveInvoice = async () => {
    if (!clientName.trim()) {
      alert('Please enter a client name.');
      return;
    }
    if (activeItems.length === 0) {
      alert('Please add at least one item to the invoice.');
      return;
    }

    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    const tax = getTaxAmount();
    const grandTotal = getGrandTotal();

    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim(),
      items: activeItems,
      subtotal,
      discountRate,
      discountAmount: discount,
      taxRate,
      taxAmount: tax,
      grandTotal
    };

    setSaving(true);
    try {
      const saved = await saveInvoice(user.id, invoiceData);
      const updated = await getUserInvoices(user.id);
      setInvoices(updated);
      
      // Open modal view for saved invoice
      setSelectedInvoice(saved);

      // Reset Builder
      setActiveItems([]);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientAddress('');
      setDiscountRate(0);
      generateNewInvoiceNumber();
    } catch (err) {
      alert(err.message || 'Failed to save invoice.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Invoice from History
  const handleDeleteHistoryInvoice = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(user.id, id);
        const updated = await getUserInvoices(user.id);
        setInvoices(updated);
      } catch (err) {
        alert(err.message || 'Failed to delete invoice.');
      }
    }
  };

  // Format Currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Print Invoice Action
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="billing-grid">
        
        {/* Left Side - Invoice Builder */}
        <div>
          {/* Card 1: Add manual item form */}
          <div className="billing-card glass">
            <h2>
              <Plus size={20} className="text-gradient-indigo-purple" />
              <span>Add Bill Item</span>
            </h2>
            
            <form onSubmit={handleAddItem}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="billing-item-name">Item Name</label>
                  <input
                    id="billing-item-name"
                    type="text"
                    className="form-input"
                    placeholder="Enter item name (e.g. Design Services)"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="billing-item-qty">Quantity</label>
                  <div className="qty-control">
                    <button type="button" className="qty-btn" onClick={() => adjustQty(-1)}>-</button>
                    <input
                      id="billing-item-qty"
                      type="number"
                      className="qty-input"
                      value={itemQty}
                      onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <button type="button" className="qty-btn" onClick={() => adjustQty(1)}>+</button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="billing-item-price">Unit Price ($)</label>
                  <input
                    id="billing-item-price"
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-secondary">
                  <Plus size={16} /> Add to Bill
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Active Billing Table */}
          <div className="billing-card glass" style={{ overflow: 'hidden' }}>
            <h2>
              <ShoppingCart size={20} className="text-gradient-purple-cyan" />
              <span>Active Invoice Items</span>
            </h2>

            {activeItems.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No items added to the bill yet. Add an item above to get started.
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>
                          {formatCurrency(item.qty * item.price)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="action-icon-btn delete"
                            onClick={() => handleDeleteItem(item.id)}
                            title="Delete item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Invoice Meta, Summaries & History */}
        <div>
          {/* Card 3: Customer details, billing meta & automatic calculations */}
          <div className="billing-card glass">
            <h2>
              <FileText size={20} className="text-gradient-indigo-purple" />
              <span>Customer & Invoice Details</span>
            </h2>

            <div className="customer-details-section">
              <h3 className="section-label">Customer Details</h3>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" htmlFor="billing-client-name">Client / Company Name *</label>
                <input
                  id="billing-client-name"
                  type="text"
                  className="form-input"
                  placeholder="Enter client or company name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="billing-client-email">Email</label>
                  <input
                    id="billing-client-email"
                    type="email"
                    className="form-input"
                    placeholder="client@email.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="billing-client-phone">Phone</label>
                  <input
                    id="billing-client-phone"
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="billing-client-address">Address</label>
                <textarea
                  id="billing-client-address"
                  className="form-input form-textarea"
                  placeholder="Street, city, state, zip code"
                  rows={2}
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="billing-invoice-number">Invoice No.</label>
                <input
                  id="billing-invoice-number"
                  type="text"
                  className="form-input"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="billing-invoice-date">Billing Date</label>
                <input
                  id="billing-invoice-date"
                  type="date"
                  className="form-input"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
            </div>

            <div className="totals-panel">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{formatCurrency(getSubtotal())}</span>
              </div>

              <div className="totals-tax-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Percent size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Discount</span>
                </div>
                <div className="tax-input-wrapper">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="tax-inline-input"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>%</span>
                </div>
              </div>

              {discountRate > 0 && (
                <div className="totals-row" style={{ color: 'var(--danger)', fontSize: '14px' }}>
                  <span>Discount savings</span>
                  <span>-{formatCurrency(getDiscountAmount())}</span>
                </div>
              )}

              <div className="totals-tax-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Percent size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Tax (GST/VAT)</span>
                </div>
                <div className="tax-input-wrapper">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="tax-inline-input"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>%</span>
                </div>
              </div>

              <div className="totals-row">
                <span>Tax Amount</span>
                <span>{formatCurrency(getTaxAmount())}</span>
              </div>

              <div className="totals-row grand-total">
                <span>Net Total</span>
                <span className="text-gradient-purple-cyan">{formatCurrency(getGrandTotal())}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '24px' }}
              disabled={activeItems.length === 0 || saving}
              onClick={handleSaveInvoice}
            >
              <Save size={16} /> {saving ? 'Saving to Database...' : 'Save & Generate Bill'}
            </button>
          </div>

          {/* Card 4: Billing History list */}
          <div className="billing-card glass">
            <h2>
              <FileSpreadsheet size={20} className="text-gradient-purple-cyan" />
              <span>Bill History</span>
            </h2>

            {loadingInvoices ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                Loading bill history...
              </div>
            ) : invoices.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                No previously saved bills.
              </div>
            ) : (
              <div className="history-list">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="history-item glass"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <div className="history-meta">
                      <h4>{inv.clientName}</h4>
                      <p>{inv.invoiceNumber} • {inv.invoiceDate}</p>
                    </div>
                    <div className="history-amt">
                      <span className="history-price">{formatCurrency(inv.grandTotal)}</span>
                      <div className="history-actions">
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="View Invoice"
                          onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); }}
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn delete"
                          title="Delete Invoice"
                          onClick={(e) => handleDeleteHistoryInvoice(inv.id, e)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <div className="modal-overlay no-print" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>
                Close Preview
              </button>
              <button className="btn btn-primary" onClick={handlePrint}>
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>

            {/* Printable Area */}
            <div className="invoice-print-card">
              <div className="invoice-header">
                <div>
                  <div className="invoice-logo">⚡ BILLCRAFT</div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Automated Billing Solutions</p>
                </div>
                <div className="invoice-meta">
                  <h2>INVOICE</h2>
                  <p><strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}</p>
                  <p><strong>Date:</strong> {selectedInvoice.invoiceDate}</p>
                </div>
              </div>

              <div className="invoice-bill-to">
                <h3>Billed To:</h3>
                <p><strong>{selectedInvoice.clientName}</strong></p>
                {selectedInvoice.clientEmail && (
                  <p>{selectedInvoice.clientEmail}</p>
                )}
                {selectedInvoice.clientPhone && (
                  <p>{selectedInvoice.clientPhone}</p>
                )}
                {selectedInvoice.clientAddress && (
                  <p style={{ whiteSpace: 'pre-line' }}>{selectedInvoice.clientAddress}</p>
                )}
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Item Description</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>Qty</th>
                    <th style={{ textAlign: 'right', width: '120px' }}>Unit Price</th>
                    <th style={{ textAlign: 'right', width: '120px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '500' }}>{item.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        {formatCurrency(item.qty * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals">
                <div className="invoice-totals-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                
                {selectedInvoice.discountAmount > 0 && (
                  <div className="invoice-totals-row" style={{ color: '#ef4444' }}>
                    <span>Discount ({selectedInvoice.discountRate}%)</span>
                    <span>-{formatCurrency(selectedInvoice.discountAmount)}</span>
                  </div>
                )}

                <div className="invoice-totals-row">
                  <span>Tax ({selectedInvoice.taxRate}%)</span>
                  <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                </div>

                <div className="invoice-totals-row grand">
                  <span>Total Due</span>
                  <span>{formatCurrency(selectedInvoice.grandTotal)}</span>
                </div>
              </div>

              <div className="invoice-footer">
                <p>Thank you for your business!</p>
                <p style={{ marginTop: '4px' }}>If you have any questions about this invoice, please contact support@billcraft.com</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Hidden printable invoice for window.print() (Ensures print view shows preview cleanly) */}
      {selectedInvoice && (
        <div className="print-only" style={{ display: 'none' }}>
          <div className="invoice-print-card" style={{ padding: '0px', boxShadow: 'none' }}>
            <div className="invoice-header">
              <div>
                <div className="invoice-logo">⚡ BILLCRAFT</div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Automated Billing Solutions</p>
              </div>
              <div className="invoice-meta">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}</p>
                <p><strong>Date:</strong> {selectedInvoice.invoiceDate}</p>
              </div>
            </div>

            <div className="invoice-bill-to">
              <h3>Billed To:</h3>
              <p><strong>{selectedInvoice.clientName}</strong></p>
              {selectedInvoice.clientEmail && (
                <p>{selectedInvoice.clientEmail}</p>
              )}
              {selectedInvoice.clientPhone && (
                <p>{selectedInvoice.clientPhone}</p>
              )}
              {selectedInvoice.clientAddress && (
                <p style={{ whiteSpace: 'pre-line' }}>{selectedInvoice.clientAddress}</p>
              )}
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Item Description</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>Qty</th>
                  <th style={{ textAlign: 'right', width: '120px' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', width: '120px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '500' }}>{item.name}</td>
                    <td style={{ textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(item.qty * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-totals">
              <div className="invoice-totals-row">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              
              {selectedInvoice.discountAmount > 0 && (
                <div className="invoice-totals-row" style={{ color: '#ef4444' }}>
                  <span>Discount ({selectedInvoice.discountRate}%)</span>
                  <span>-{formatCurrency(selectedInvoice.discountAmount)}</span>
                </div>
              )}

              <div className="invoice-totals-row">
                <span>Tax ({selectedInvoice.taxRate}%)</span>
                <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
              </div>

              <div className="invoice-totals-row grand">
                <span>Total Due</span>
                <span>{formatCurrency(selectedInvoice.grandTotal)}</span>
              </div>
            </div>

            <div className="invoice-footer">
              <p>Thank you for your business!</p>
              <p style={{ marginTop: '4px' }}>If you have any questions about this invoice, please contact support@billcraft.com</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
