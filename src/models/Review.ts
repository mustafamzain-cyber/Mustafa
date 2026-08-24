import { DataTypes, Model } from 'sequelize';
import { database } from '../config/database';
import { IReview } from '../types';
import Order from './Order';
import User from './User';

class Review extends Model<IReview> implements IReview {
    public id!: string;
    public orderId!: string;
    public customerId!: string;
    public driverId?: string;
    public rating!: number;
    public comment?: string;
    public images?: string[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Review.init(
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
        customerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
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
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
    },
    {
        sequelize: database,
        tableName: 'reviews',
        timestamps: true,
        indexes: [
            {
                fields: ['orderId'],
            },
            {
                fields: ['customerId'],
            },
            {
                fields: ['driverId'],
            },
        ],
    },
);

// Associations
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Review.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
Review.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });
Order.hasMany(Review, { foreignKey: 'orderId', as: 'reviews' });

export default Review;
