import { DataTypes, Model } from 'sequelize';
import { database } from '../config/database';
import { IOrder, OrderStatus, IOrderItem } from '../types';
import User from './User';

class Order extends Model<IOrder> implements IOrder {
    public id!: string;
    public customerId!: string;
    public items!: IOrderItem[];
    public totalAmount!: number;
    public status!: OrderStatus;
    public paymentMethod!: 'cash' | 'card' | 'wallet';
    public paymentStatus!: 'pending' | 'completed' | 'failed';
    public notes?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Order.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        customerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        items: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(OrderStatus)),
            defaultValue: OrderStatus.PENDING,
            allowNull: false,
        },
        paymentMethod: {
            type: DataTypes.ENUM('cash', 'card', 'wallet'),
            allowNull: false,
        },
        paymentStatus: {
            type: DataTypes.ENUM('pending', 'completed', 'failed'),
            defaultValue: 'pending',
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize: database,
        tableName: 'orders',
        timestamps: true,
        indexes: [
            {
                fields: ['customerId'],
            },
            {
                fields: ['status'],
            },
            {
                fields: ['createdAt'],
            },
        ],
    },
);

// Associations
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
User.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });

export default Order;
