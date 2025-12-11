import { HttpStatus, Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '../../generated/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto';
import { firstValueFrom } from 'rxjs';
import { PRODUCT_SERVICE } from 'src/config';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy
  ){
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async create(createOrderDto: CreateOrderDto) {
    

    try {
      //confirmar id de productos
      const productIds = createOrderDto.items.map(item => item.productId);


      const products : any[] = await firstValueFrom(
      this.productsClient.send({cmd: 'validate_products'},  productIds ),
    );
    //calculos de los valores totales
    const totalAmount = createOrderDto.items.reduce((acc, orderItem)=> {
      const price = products.find(product => product.id === orderItem.productId,
      ).price;
      return price * orderItem.quantity;
    },0);

    const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
      return acc + orderItem.quantity;
    },0);

    //crear una transaccion de base de datos
    const order = await this.order.create({
      data:{
      totalAmount: totalAmount,
      totalItems: totalItems,
      orderItems:{
        createMany: {
          data: createOrderDto.items.map( (orderItem) => ({
            price: products.find(product => product.id === orderItem.productId).price,
            productId: orderItem.productId,
            quantity: orderItem.quantity,
          }))
          }
      
        }
      },
      include:{
        //orderItems: true, //regresa todos los valores de order items
        orderItems:{
          select:{
          price: true,
          quantity: true,
          productId: true
        }
        }
      }
    });
    return{
      ...order,
      orderItems: order.orderItems.map( (orderItem) => ({
        ...orderItem,
        name: products.find(product => product.id === orderItem.productId).name,
      }))
    } 

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'One or more products are invalid',
      })
    }
    

  }

  async findAll(orderPaginationDto: OrderPaginationDto) {

    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status,
      }
    });

    const currentPage = orderPaginationDto.page || 1;
    const perPage = orderPaginationDto.limit || 10;

    return{
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status,
        }
      }),
      meta: {
        totalPages: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage)
      }
    }
  }

  async findOne(id: string) {

    const order = await this.order.findFirst({
      where: { id },
    })

    if (!order){
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with ID ${id} not found`,
      })
    }
    return order;
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {

    const {id, status} = changeOrderStatusDto

    const order = await this.findOne(id);
    if (order.status === status){
      return order;
    }

    return this.order.update({
      where: { id },
      data: { 
        status: status
      }
    });


  }

  
}
