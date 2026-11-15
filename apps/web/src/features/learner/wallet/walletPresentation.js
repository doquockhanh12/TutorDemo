import { walletStatuses } from '../../../data/walletDemo.js';
export const formatWalletMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
export const formatWalletTime = (value) => new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
export const walletStatus = (status) => walletStatuses[status] || { label: 'Chưa xác định', tone: 'neutral' };
