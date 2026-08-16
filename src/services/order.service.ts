import { database } from '../config/database';

export interface Order {
    OrderID: number;
    OrderNumber: string;
    CustomerID: number;
    RestaurantID: number;
    AddressID: number;
    OrderStatus: string;
    SubTotal: number;
    DeliveryFee: number;
    DiscountAmount: number;
    TaxAmount: number;
    TotalAmount: number;
    CustomerNotes?: string;
    CreatedAt?: Date;
    ConfirmedAt?: Date;
    CompletedAt?: Date;
    CancelledAt?: Date;
}

export class OrderService {

    public async createOrder(orderData: any): Promise<any> {

        const {
            CustomerID,
            RestaurantID,
            AddressID,
            OrderNumber,
            CustomerNotes,
            SubTotal = 0,
            DeliveryFee = 0,
            DiscountAmount = 0,
            TaxAmount = 0,
            TotalAmount = 0
        } = orderData;

        const [result]: any = await database.query(
            `
            INSERT INTO Orders
            (
                OrderNumber,
                CustomerID,
                RestaurantID,
                AddressID,
                OrderStatus,
                SubTotal,
                DeliveryFee,
                DiscountAmount,
                TaxAmount,
                TotalAmount,
                CustomerNotes
            )
            OUTPUT INSERTED.*
            VALUES
            (
                :OrderNumber,
                :CustomerID,
                :RestaurantID,
                :AddressID,
                'Pending',
                :SubTotal,
                :DeliveryFee,
                :DiscountAmount,
                :TaxAmount,
                :TotalAmount,
                :CustomerNotes
            )
            `,
            {
                replacements: {
                    OrderNumber:
                        OrderNumber ||
                        `ORD-${Date.now()}`,

                    CustomerID,
                    RestaurantID,
                    AddressID,
                    SubTotal,
                    DeliveryFee,
                    DiscountAmount,
                    TaxAmount,
                    TotalAmount,
                    CustomerNotes
                }
            }
        );

        return result[0];
    }


    /*
     * Get orders according to logged-in user's role
     */
    public async getOrdersForUser(user: any): Promise<any[]> {

        const role = user.role;

        let whereClause = '';
        const replacements: any = {};

        if (role === 'restaurant') {

            const [restaurants]: any =
                await database.query(
                    `
                    SELECT RestaurantID
                    FROM UserRestaurants
                    WHERE UserID = :UserID
                    `,
                    {
                        replacements: {
                            UserID: Number(user.id)
                        }
                    }
                );

            if (restaurants.length === 0) {
                return [];
            }

            const restaurantIds =
                restaurants.map(
                    (r: any) => Number(r.RestaurantID)
                );

            whereClause =
                `WHERE o.RestaurantID IN (${restaurantIds.join(',')})`;

        } else if (role === 'customer') {

            if (!user.customerId) {
                return [];
            }

            whereClause =
                `WHERE o.CustomerID = :CustomerID`;

            replacements.CustomerID =
                Number(user.customerId);

        } else if (role === 'driver') {

            whereClause = `
                INNER JOIN Deliveries d
                    ON d.OrderID = o.OrderID
                WHERE d.DriverID = :DriverID
            `;

            replacements.DriverID =
                Number(user.driverId || user.id);

        } else if (role === 'admin') {

            whereClause = '';

        } else {

            return [];
        }

        const [orders]: any = await database.query(
            `
            SELECT
                o.*,
                c.FullName AS CustomerName,
                c.Phone AS CustomerPhone,
                r.RestaurantName
            FROM Orders o

            INNER JOIN Customers c
                ON o.CustomerID = c.CustomerID

            INNER JOIN Restaurants r
                ON o.RestaurantID = r.RestaurantID

            ${whereClause}

            ORDER BY o.CreatedAt DESC
            `,
            {
                replacements
            }
        );

        return orders;
    }


    /*
     * Get one order according to user's permissions
     */
    public async getOrderByIdForUser(
        orderId: number,
        user: any
    ): Promise<any | null> {

        const orders =
            await this.getOrdersForUser(user);

        const order =
            orders.find(
                (item: any) =>
                    Number(item.OrderID) === Number(orderId)
            );

        return order || null;
    }


    /*
     * Update order according to user's permissions
     */
    public async updateOrderForUser(
        orderId: number,
        updateData: any,
        user: any
    ): Promise<any | null> {

        const existingOrder =
            await this.getOrderByIdForUser(
                orderId,
                user
            );

        if (!existingOrder) {
            return null;
        }

        const allowedFields = [
            'OrderStatus',
            'CustomerNotes',
            'SubTotal',
            'DeliveryFee',
            'DiscountAmount',
            'TaxAmount',
            'TotalAmount'
        ];

        const fields: string[] = [];

        const replacements: any = {
            OrderID: orderId
        };

        for (const field of allowedFields) {

            if (updateData[field] !== undefined) {

                fields.push(
                    `${field} = :${field}`
                );

                replacements[field] =
                    updateData[field];
            }
        }

        if (fields.length === 0) {
            return existingOrder;
        }

        const [result]: any =
            await database.query(
                `
                UPDATE Orders
                SET ${fields.join(', ')}
                OUTPUT INSERTED.*
                WHERE OrderID = :OrderID
                `,
                {
                    replacements
                }
            );

        return result.length > 0
            ? result[0]
            : null;
    }


    /*
     * Delete order according to user's permissions
     */
    public async deleteOrderForUser(
        orderId: number,
        user: any
    ): Promise<boolean> {

        const existingOrder =
            await this.getOrderByIdForUser(
                orderId,
                user
            );

        if (!existingOrder) {
            return false;
        }

        const [result]: any =
            await database.query(
                `
                DELETE FROM Orders
                WHERE OrderID = :OrderID
                `,
                {
                    replacements: {
                        OrderID: orderId
                    }
                }
            );

        return result[1] > 0;
    }
}