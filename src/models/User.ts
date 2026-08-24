import { DataTypes, Model } from 'sequelize';
import { database } from '../config/database';
import { IUser, UserRole, UserStatus } from '../types';
import bcryptjs from 'bcryptjs';

class User extends Model<IUser> implements IUser {
    public id!: string;
    public name!: string;
    public email!: string;
    public password!: string;
    public phone!: string;
    public role!: UserRole;
    public status!: UserStatus;
    public address?: string;
    public city?: string;
    public avatar?: string;
    public rating?: number;
    public totalOrders?: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Instance methods
    public async comparePassword(password: string): Promise<boolean> {
        return bcryptjs.compare(password, this.password);
    }

    public toJSON(): Partial<IUser> {
        const { password, ...rest } = this.get();
        return rest;
    }
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            defaultValue: UserRole.CUSTOMER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(UserStatus)),
            defaultValue: UserStatus.ACTIVE,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        avatar: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 0,
            allowNull: true,
        },
        totalOrders: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
    },
    {
        sequelize: database,
        tableName: 'users',
        timestamps: true,
        indexes: [
            {
                fields: ['email'],
            },
            {
                fields: ['phone'],
            },
            {
                fields: ['role'],
            },
        ],
    },
);

// Hash password before saving
User.beforeCreate(async (user) => {
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(user.password, salt);
});

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(user.password, salt);
    }
});

export default User;
