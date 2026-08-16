export interface Order {
    id: number;
    userId: string;
    status: 'pending' | 'in-progress' | 'completed' | 'canceled';
    createdAt: Date;
    updatedAt: Date;
}