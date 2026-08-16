import { Sequelize } from 'sequelize';

const database = new Sequelize(
    process.env.DB_NAME || 'DeliverySystemDB',
    process.env.DB_USER || 'sa',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'DESKTOP-ILQNSIE',
        dialect: 'mssql',
        port: Number(process.env.DB_PORT) || 1433,
        logging: false,
        dialectOptions: {
            options: {
                encrypt: false,
                trustServerCertificate: true,
            },
        },
    }
);

const connectDatabase = async (): Promise<void> => {
    try {
        await database.authenticate();

        console.log(
            'Database connection has been established successfully.'
        );
    } catch (error) {
        console.error(
            'Unable to connect to the database:',
            error
        );

        throw error;
    }
};

export { database, connectDatabase };