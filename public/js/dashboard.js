const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/';
}


const ordersTable =
    document.getElementById('ordersTable');

const messageElement =
    document.getElementById('message');


async function loadOrders() {

    ordersTable.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                Loading orders...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            '/api/orders',
            {
                method: 'GET',

                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            if (response.status === 401 ||
                response.status === 403) {

                logout();
                return;
            }

            throw new Error(
                data.message ||
                'Failed to load orders'
            );
        }


        renderOrders(data);


    } catch (error) {

        ordersTable.innerHTML = `
            <tr>
                <td colspan="8" class="error">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;

    }

}


function renderOrders(orders) {

    if (!Array.isArray(orders)) {

        ordersTable.innerHTML = `
            <tr>
                <td colspan="8" class="error">
                    Invalid server response
                </td>
            </tr>
        `;

        return;
    }


    updateStatistics(orders);


    if (orders.length === 0) {

        ordersTable.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    No orders found
                </td>
            </tr>
        `;

        return;
    }


    const firstOrder = orders[0];

    if (firstOrder.RestaurantName) {

        document.getElementById(
            'restaurantName'
        ).textContent =
            firstOrder.RestaurantName;

    }


    ordersTable.innerHTML =
        orders.map(order => {

            const status =
                order.OrderStatus || 'Pending';


            const statusClass =
                status.toLowerCase();


            const date =
                order.CreatedAt
                    ? new Date(
                        order.CreatedAt
                    ).toLocaleString()
                    : '-';


            let actions = '';


            if (status === 'Pending') {

                actions += `
                    <button
                        class="action confirm"
                        onclick="updateOrderStatus(
                            ${order.OrderID},
                            'Confirmed'
                        )">
                        Confirm
                    </button>
                `;

            }


            if (
                status === 'Pending' ||
                status === 'Confirmed'
            ) {

                actions += `
                    <button
                        class="action cancel"
                        onclick="updateOrderStatus(
                            ${order.OrderID},
                            'Cancelled'
                        )">
                        Cancel
                    </button>
                `;

            }


            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(
                                order.OrderNumber
                            )}
                        </strong>
                    </td>


                    <td>
                        ${escapeHtml(
                            order.CustomerName ||
                            '-'
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            order.CustomerPhone ||
                            '-'
                        )}
                    </td>


                    <td>
                        <strong>
                            ${formatMoney(
                                order.TotalAmount
                            )}
                        </strong>
                    </td>


                    <td>

                        <span
                            class="status ${statusClass}">
                            ${escapeHtml(status)}
                        </span>

                    </td>


                    <td>
                        ${escapeHtml(
                            order.CustomerNotes ||
                            '-'
                        )}
                    </td>


                    <td>
                        ${date}
                    </td>


                    <td>

                        <div class="actions">

                            ${actions}

                            <button
                                class="action view"
                                onclick="viewOrder(
                                    ${order.OrderID}
                                )">
                                View
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join('');

}


function updateStatistics(orders) {

    const total =
        orders.length;


    const pending =
        orders.filter(
            order =>
                order.OrderStatus === 'Pending'
        ).length;


    const confirmed =
        orders.filter(
            order =>
                order.OrderStatus === 'Confirmed'
        ).length;


    const cancelled =
        orders.filter(
            order =>
                order.OrderStatus === 'Cancelled'
        ).length;


    document.getElementById(
        'totalOrders'
    ).textContent = total;


    document.getElementById(
        'pendingOrders'
    ).textContent = pending;


    document.getElementById(
        'confirmedOrders'
    ).textContent = confirmed;


    document.getElementById(
        'cancelledOrders'
    ).textContent = cancelled;

}


async function updateOrderStatus(
    orderId,
    status
) {

    const confirmation =
        confirm(
            `Are you sure you want to change this order to "${status}"?`
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/orders/${orderId}`,
                {
                    method: 'PUT',

                    headers: {
                        'Authorization':
                            `Bearer ${token}`,

                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        OrderStatus: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                'Failed to update order'
            );

        }


        showMessage(
            `Order updated successfully`,
            'success'
        );


        await loadOrders();


    } catch (error) {

        showMessage(
            error.message,
            'error'
        );

    }

}


async function viewOrder(orderId) {

    try {

        const response =
            await fetch(
                `/api/orders/${orderId}`,
                {
                    method: 'GET',

                    headers: {
                        'Authorization':
                            `Bearer ${token}`
                    }
                }
            );


        const order =
            await response.json();


        if (!response.ok) {

            throw new Error(
                order.message ||
                'Unable to load order'
            );

        }


        alert(
            `Order: ${order.OrderNumber}\n\n` +

            `Customer: ${
                order.CustomerName || '-'
            }\n` +

            `Phone: ${
                order.CustomerPhone || '-'
            }\n` +

            `Restaurant: ${
                order.RestaurantName || '-'
            }\n\n` +

            `Status: ${
                order.OrderStatus
            }\n` +

            `Subtotal: ${
                formatMoney(order.SubTotal)
            }\n` +

            `Delivery Fee: ${
                formatMoney(order.DeliveryFee)
            }\n` +

            `Total: ${
                formatMoney(order.TotalAmount)
            }\n\n` +

            `Notes: ${
                order.CustomerNotes || '-'
            }`
        );


    } catch (error) {

        showMessage(
            error.message,
            'error'
        );

    }

}


function formatMoney(amount) {

    return new Intl.NumberFormat(
        'en-RW',
        {
            style: 'currency',
            currency: 'RWF',
            maximumFractionDigits: 0
        }
    ).format(
        Number(amount || 0)
    );

}


function showMessage(
    message,
    type
) {

    messageElement.textContent =
        message;

    messageElement.className =
        type;

    setTimeout(
        () => {
            messageElement.textContent = '';
            messageElement.className = '';
        },
        3000
    );

}


function escapeHtml(value) {

    const div =
        document.createElement('div');

    div.textContent =
        value == null
            ? ''
            : String(value);

    return div.innerHTML;

}


function logout() {

    localStorage.removeItem(
        'token'
    );

    window.location.href = '/';

}


loadOrders();