import { api } from './api';

const SESSION_KEY = 'billing_app_current_user';

export const registerUser = async (name, email, password) => {
  const user = await api.register(name, email, password);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
};

export const loginUser = async (email, password) => {
  const user = await api.login(email, password);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
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

export const getUserInvoices = async (userId) => {
  return api.getBills(userId);
};

export const saveInvoice = async (userId, invoiceData) => {
  return api.saveBill(userId, invoiceData);
};

export const deleteInvoice = async (userId, invoiceId) => {
  return api.deleteBill(userId, invoiceId);
};
