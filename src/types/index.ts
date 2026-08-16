export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

export interface Order {
    id: string;
    userId: string;
    status: string;
    items: Array<{ productId: string; quantity: number }>;
    createdAt: Date;
    updatedAt: Date;
}