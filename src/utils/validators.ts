import { IRegisterRequest, ICreateOrderRequest, ILoginRequest, UserRole } from '../types';

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 number
    return password.length >= 8;
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9\-\+\s()]{10,15}$/;
    return phoneRegex.test(phone);
};

export const validateRegisterRequest = (data: IRegisterRequest): void => {
    if (!data.name || data.name.trim() === '') {
        throw new ValidationError('Name is required');
    }

    if (!data.email) {
        throw new ValidationError('Email is required');
    }

    if (!validateEmail(data.email)) {
        throw new ValidationError('Invalid email format');
    }

    if (!data.password) {
        throw new ValidationError('Password is required');
    }

    if (!validatePassword(data.password)) {
        throw new ValidationError('Password must be at least 8 characters');
    }

    if (!data.phone) {
        throw new ValidationError('Phone number is required');
    }

    if (!validatePhone(data.phone)) {
        throw new ValidationError('Invalid phone number format');
    }

    if (!data.role || !Object.values(UserRole).includes(data.role)) {
        throw new ValidationError('Invalid role');
    }
};

export const validateLoginRequest = (data: ILoginRequest): void => {
    if (!data.email) {
        throw new ValidationError('Email is required');
    }

    if (!validateEmail(data.email)) {
        throw new ValidationError('Invalid email format');
    }

    if (!data.password) {
        throw new ValidationError('Password is required');
    }
};

export const validateCreateOrderRequest = (data: ICreateOrderRequest): void => {
    if (!data.items || data.items.length === 0) {
        throw new ValidationError('At least one item is required');
    }

    if (!data.deliveryLocation) {
        throw new ValidationError('Delivery location is required');
    }

    if (!data.deliveryLocation.latitude || !data.deliveryLocation.longitude) {
        throw new ValidationError('Delivery location coordinates are required');
    }

    if (!data.paymentMethod) {
        throw new ValidationError('Payment method is required');
    }

    const validPaymentMethods = ['cash', 'card', 'wallet'];
    if (!validPaymentMethods.includes(data.paymentMethod)) {
        throw new ValidationError('Invalid payment method');
    }

    // Validate each item
    data.items.forEach((item, index) => {
        if (!item.productId || !item.productName) {
            throw new ValidationError(`Item ${index + 1}: Product ID and name are required`);
        }

        if (item.quantity <= 0) {
            throw new ValidationError(`Item ${index + 1}: Quantity must be greater than 0`);
        }

        if (item.price <= 0) {
            throw new ValidationError(`Item ${index + 1}: Price must be greater than 0`);
        }
    });
};
