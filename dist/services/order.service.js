"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const database_1 = require("../config/database");
class OrderService {
    createOrder(orderData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { CustomerID, RestaurantID, AddressID, OrderNumber, CustomerNotes, SubTotal = 0, DeliveryFee = 0, DiscountAmount = 0, TaxAmount = 0, TotalAmount = 0 } = orderData;
            const [result] = yield database_1.database.query(`
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
            `, {
                replacements: {
                    OrderNumber: OrderNumber ||
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
            });
            return result[0];
        });
    }
    /*
     * Get orders according to logged-in user's role
     */
    getOrdersForUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = user.role;
            let whereClause = '';
            const replacements = {};
            if (role === 'restaurant') {
                const [restaurants] = yield database_1.database.query(`
                    SELECT RestaurantID
                    FROM UserRestaurants
                    WHERE UserID = :UserID
                    `, {
                    replacements: {
                        UserID: Number(user.id)
                    }
                });
                if (restaurants.length === 0) {
                    return [];
                }
                const restaurantIds = restaurants.map((r) => Number(r.RestaurantID));
                whereClause =
                    `WHERE o.RestaurantID IN (${restaurantIds.join(',')})`;
            }
            else if (role === 'customer') {
                if (!user.customerId) {
                    return [];
                }
                whereClause =
                    `WHERE o.CustomerID = :CustomerID`;
                replacements.CustomerID =
                    Number(user.customerId);
            }
            else if (role === 'driver') {
                whereClause = `
                INNER JOIN Deliveries d
                    ON d.OrderID = o.OrderID
                WHERE d.DriverID = :DriverID
            `;
                replacements.DriverID =
                    Number(user.driverId || user.id);
            }
            else if (role === 'admin') {
                whereClause = '';
            }
            else {
                return [];
            }
            const [orders] = yield database_1.database.query(`
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
            `, {
                replacements
            });
            return orders;
        });
    }
    /*
     * Get one order according to user's permissions
     */
    getOrderByIdForUser(orderId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = yield this.getOrdersForUser(user);
            const order = orders.find((item) => Number(item.OrderID) === Number(orderId));
            return order || null;
        });
    }
    /*
     * Update order according to user's permissions
     */
    updateOrderForUser(orderId, updateData, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingOrder = yield this.getOrderByIdForUser(orderId, user);
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
            const fields = [];
            const replacements = {
                OrderID: orderId
            };
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    fields.push(`${field} = :${field}`);
                    replacements[field] =
                        updateData[field];
                }
            }
            if (fields.length === 0) {
                return existingOrder;
            }
            const [result] = yield database_1.database.query(`
                UPDATE Orders
                SET ${fields.join(', ')}
                OUTPUT INSERTED.*
                WHERE OrderID = :OrderID
                `, {
                replacements
            });
            return result.length > 0
                ? result[0]
                : null;
        });
    }
    /*
     * Delete order according to user's permissions
     */
    deleteOrderForUser(orderId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingOrder = yield this.getOrderByIdForUser(orderId, user);
            if (!existingOrder) {
                return false;
            }
            const [result] = yield database_1.database.query(`
                DELETE FROM Orders
                WHERE OrderID = :OrderID
                `, {
                replacements: {
                    OrderID: orderId
                }
            });
            return result[1] > 0;
        });
    }
}
exports.OrderService = OrderService;
