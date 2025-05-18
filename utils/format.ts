/**
 * Format currency in VND format
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Format phone number in Vietnamese format
 * @param phone Số điện thoại cần định dạng
 * @returns Chuỗi đã định dạng
 */
export const formatPhoneNumber = (phone: string): string => {
  // Loại bỏ ký tự không phải số
  const cleaned = phone.replace(/\D/g, '');
  
  // Kiểm tra và định dạng số điện thoại Việt Nam
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  
  // Trả lại số điện thoại gốc nếu không khớp định dạng
  return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string = '', maxLength: number = 100): string => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

/**
 * Format date in Vietnamese format
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format date and time in Vietnamese format
 * @param dateString Chuỗi ngày giờ ISO
 * @returns Ngày giờ đã định dạng dd/MM/yyyy HH:mm
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice: number, discountedPrice: number): number => {
  if (!originalPrice || !discountedPrice || originalPrice <= 0) return 0;
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount);
}; 