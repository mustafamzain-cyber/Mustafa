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

    /*
     * Create a new order
     */
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
            INSERT INTO dbo.Orders
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
    public async getOrdersForUser(
        user: any
    ): Promise<any[]> {

        const role = user.role;

        let whereClause = '';

        const replacements: any = {};

        /*
         * Restaurant
         */
        if (role === 'restaurant') {

            const [restaurants]: any =
                await database.query(
                    `
                    SELECT RestaurantID
                    FROM dbo.UserRestaurants
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
                    (r: any) =>
                        Number(r.RestaurantID)
                );

            whereClause =
                `WHERE o.RestaurantID IN (${restaurantIds.join(',')})`;
        }

        /*
         * Customer
         */
        else if (role === 'customer') {

            if (!user.customerId) {
                return [];
            }

            whereClause =
                `WHERE o.CustomerID = :CustomerID`;

            replacements.CustomerID =
                Number(user.customerId);
        }

        /*
         * Driver
         */
        else if (role === 'driver') {

            whereClause = `
                INNER JOIN dbo.Deliveries d
                    ON d.OrderID = o.OrderID
                WHERE d.DriverID = :DriverID
            `;

            replacements.DriverID =
                Number(
                    user.driverId ||
                    user.id
                );
        }

        /*
         * Admin
         */
        else if (role === 'admin') {

            whereClause = '';
        }

        /*
         * Unknown role
         */
        else {

            return [];
        }

        const [orders]: any =
            await database.query(
                `
                SELECT
                    o.*,
                    c.FullName AS CustomerName,
                    c.Phone AS CustomerPhone,
                    r.RestaurantName

                FROM dbo.Orders o

                INNER JOIN dbo.Customers c
                    ON o.CustomerID = c.CustomerID

                INNER JOIN dbo.Restaurants r
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
     * including customer, restaurant, address and items
     */
    public async getOrderByIdForUser(
        orderId: number,
        user: any
    ): Promise<any | null> {

        /*
         * First check whether the user has
         * permission to access this order.
         */
        const existingOrders =
            await this.getOrdersForUser(user);

        const existingOrder =
            existingOrders.find(
                (item: any) =>
                    Number(item.OrderID) ===
                    Number(orderId)
            );

        if (!existingOrder) {
            return null;
        }


        /*
         * Get complete order information
         */
        const [orderDetails]: any =
            await database.query(
                `
                SELECT
                    o.*,

                    c.FullName AS CustomerName,
                    c.Phone AS CustomerPhone,

                    r.RestaurantName,

                    ca.AddressName,
                    ca.Province,
                    ca.District,
                    ca.Sector,
                    ca.Cell,
                    ca.StreetAddress,
                    ca.Latitude,
                    ca.Longitude

                FROM dbo.Orders o

                INNER JOIN dbo.Customers c
                    ON o.CustomerID = c.CustomerID

                INNER JOIN dbo.Restaurants r
                    ON o.RestaurantID = r.RestaurantID

                INNER JOIN dbo.CustomerAddresses ca
                    ON o.AddressID = ca.AddressID

                WHERE o.OrderID = :OrderID
                `,
                {
                    replacements: {
                        OrderID: orderId
                    }
                }
            );


        if (orderDetails.length === 0) {
            return null;
        }


        const detailedOrder =
            orderDetails[0];


        /*
         * Get order items
         */
        const [items]: any =
            await database.query(
                `
                SELECT
                    oi.OrderItemID,
                    oi.OrderID,
                    oi.MenuItemID,
                    oi.ItemName,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.TotalPrice,
                    oi.SpecialInstructions

                FROM dbo.OrderItems oi

                WHERE oi.OrderID = :OrderID

                ORDER BY oi.OrderItemID
                `,
                {
                    replacements: {
                        OrderID: orderId
                    }
                }
            );


        /*
         * Attach items to order
         */
        detailedOrder.Items = items;


        return detailedOrder;
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

            if (
                updateData[field] !==
                undefined
            ) {

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
                UPDATE dbo.Orders

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
                DELETE FROM dbo.Orders
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