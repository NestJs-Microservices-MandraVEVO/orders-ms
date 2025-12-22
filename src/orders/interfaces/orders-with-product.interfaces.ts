import { OrderStatus } from "generated/prisma";

export interface OrderWithProduct {
    
    orderItems: {
        name: any;
        productId: number;
        quantity: number;
        price: number;
    }[];
    id: string;
    totalAmount: number;
    totalItems: number;
    status: OrderStatus;
    paid: boolean;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

}