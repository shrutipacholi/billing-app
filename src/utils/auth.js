// Mock Authentication and Billing storage helpers using LocalStorage

const USERS_KEY = 'billing_app_users';
const SESSION_KEY = 'billing_app_current_user';
const INVOICES_KEY = 'billing_app_invoices';

export const getUsers = () => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    const parsed = users ? JSON.parse(users) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse users:', e);
    return [];
  }
};

export const registerUser = (name, email, password) => {
  const users = getUsers();
  const exists = users.find(u => u && u.email && u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    throw new Error('An account with this email already exists.');
  }
  
  const newUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password, // Store as plaintext for simple mockup authentication
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Log the user in automatically upon registration
  const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return sessionUser;
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u && u.email && u.email.toLowerCase() === email.trim().toLowerCase());
  
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  const sessionUser = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const getSessionUser = () => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (e) {
    console.error('Failed to parse session:', e);
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Billing Invoice Helpers
export const getUserInvoices = (userId) => {
  try {
    const invoices = localStorage.getItem(INVOICES_KEY);
    const allInvoices = invoices ? JSON.parse(invoices) : [];
    if (!Array.isArray(allInvoices)) return [];
    return allInvoices.filter(inv => inv && inv.userId === userId);
  } catch (e) {
    console.error('Failed to parse invoices:', e);
    return [];
  }
};

export const saveInvoice = (userId, invoiceData) => {
  const invoices = localStorage.getItem(INVOICES_KEY);
  let allInvoices = [];
  try {
    const parsed = invoices ? JSON.parse(invoices) : [];
    allInvoices = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    allInvoices = [];
  }
  
  const newInvoice = {
    ...invoiceData,
    id: 'inv_' + Math.random().toString(36).substr(2, 9),
    userId,
    createdAt: new Date().toISOString()
  };

  allInvoices.unshift(newInvoice); // Add to the top of list
  localStorage.setItem(INVOICES_KEY, JSON.stringify(allInvoices));
  return newInvoice;
};

export const deleteInvoice = (userId, invoiceId) => {
  const invoices = localStorage.getItem(INVOICES_KEY);
  if (!invoices) return;

  let allInvoices = [];
  try {
    const parsed = JSON.parse(invoices);
    allInvoices = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return;
  }

  allInvoices = allInvoices.filter(inv => inv && !(inv.userId === userId && inv.id === invoiceId));
  localStorage.setItem(INVOICES_KEY, JSON.stringify(allInvoices));
};
