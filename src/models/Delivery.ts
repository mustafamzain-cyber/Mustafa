import { DataTypes, Model } from 'sequelize';
import { database } from '../config/database';
import { IDelivery, DeliveryStatus, ILocation } from '../types';
import Order from './Order';
import User from './User';

class Delivery extends Model<IDelivery> implements IDelivery {
    public id!: string;
    public orderId!: string;
    public driverId?: string;
    public pickupLocation!: ILocation;
    public deliveryLocation!: ILocation;
    public status!: DeliveryStatus;
    public estimatedTime?: number;
    public actualTime?: number;
    public distance?: number;
    public currentLocation?: ILocation;
    public startTime?: Date;
    public completionTime?: Date;
    public rating?: number;
    public feedback?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Delivery.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Order,
                key: 'id',
            },
        },
        driverId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: User,
                key: 'id',
            },
        },
        pickupLocation: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        deliveryLocation: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(DeliveryStatus)),
            defaultValue: DeliveryStatus.ASSIGNED,
            allowNull: false,
        },
        estimatedTime: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        actualTime: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        distance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        currentLocation: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        completionTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        feedback: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize: database,
        tableName: 'deliveries',
        timestamps: true,
        indexes: [
            {
                fields: ['orderId'],
            },
            {
                fields: ['driverId'],
            },
            {
                fields: ['status'],
            },
        ],
    },
);

// Associations
Delivery.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Delivery.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });
Order.hasOne(Delivery, { foreignKey: 'orderId', as: 'delivery' });
User.hasMany(Delivery, { foreignKey: 'driverId', as: 'deliveries' });

export default Delivery;
