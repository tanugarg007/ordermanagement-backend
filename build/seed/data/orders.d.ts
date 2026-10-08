export interface OrderSeed {
    name: string;
    email: string;
    items: string[];
    quantity: number[];
    totalAmount: number;
    status: string;
    paymentMethod?: "cash";
    deliveryAddress: {
        name: string;
        state: string;
        city: string;
        phoneNumber: string;
        pincode: string;
        address: string;
        houseNumber: string;
    };
}
export declare const orders: OrderSeed[];
//# sourceMappingURL=orders.d.ts.map