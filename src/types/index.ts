// User Types
export enum UserRole {
    CUSTOMER = 'customer',
    DRIVER = 'driver',
    ADMIN = 'admin'
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended'
}

export interface IUser {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    address?: string;
    city?: string;
    avatar?: string;
    rating?: number;
    totalOrders?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAuthPayload {
    id: string;
    email: string;
    role: UserRole;
}

// Order Types
export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PROCESSING = 'processing',
    READY_FOR_DELIVERY = 'ready_for_delivery',
    OUT_FOR_DELIVERY = 'out_for_delivery',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    FAILED = 'failed'
}

export interface IOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface IOrder {
    id: string;
    customerId: string;
    items: IOrderItem[];
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: 'cash' | 'card' | 'wallet';
    paymentStatus: 'pending' | 'completed' | 'failed';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    deliveryDetails?: IDelivery;
}

// Delivery Types
export enum DeliveryStatus {
    ASSIGNED = 'assigned',
    PICKED_UP = 'picked_up',
    IN_TRANSIT = 'in_transit',
    ARRIVED = 'arrived',
    DELIVERED = 'delivered',
    FAILED = 'failed'
}

export interface ILocation {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    zipCode?: string;
}

export interface IDelivery {
    id: string;
    orderId: string;
    driverId?: string;
    pickupLocation: ILocation;
    deliveryLocation: ILocation;
    status: DeliveryStatus;
    estimatedTime?: number; // in minutes
    actualTime?: number;
    distance?: number; // in km
    currentLocation?: ILocation;
    startTime?: Date;
    completionTime?: Date;
    rating?: number;
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Review/Rating Types
export interface IReview {
    id: string;
    orderId: string;
    customerId: string;
    driverId?: string;
    rating: number; // 1-5
    comment?: string;
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Dashboard Stats Types
export interface IDashboardStats {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    activeDeliveries: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    averageRating: number;
    topDrivers: Array<{
        id: string;
        name: string;
        deliveries: number;
        rating: number;
    }>;
    ordersToday: number;
    revenueToday: number;
}

// API Response Types
export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    statusCode: number;
}

export interface IPaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Request Types
export interface ILoginRequest {
    email: string;
    password: string;
}

export interface IRegisterRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    address?: string;
    city?: string;
}

export interface ICreateOrderRequest {
    items: IOrderItem[];
    deliveryLocation: ILocation;
    paymentMethod: 'cash' | 'card' | 'wallet';
    notes?: string;
}

export interface IUpdateOrderRequest {
    status?: OrderStatus;
    notes?: string;
    paymentStatus?: 'pending' | 'completed' | 'failed';
}

export interface ICreateDeliveryRequest {
    orderId: string;
    driverId?: string;
    pickupLocation: ILocation;
    deliveryLocation: ILocation;
    estimatedTime?: number;
}

export interface IUpdateDeliveryRequest {
    status?: DeliveryStatus;
    currentLocation?: ILocation;
    rating?: number;
    feedback?: string;
}