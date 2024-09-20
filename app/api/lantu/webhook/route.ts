import { NextResponse } from 'next/server'
import { LTPaymentCallback } from '@/types'

import { Mutex } from 'async-mutex';

const mutex = new Mutex();

export async function POST(request: Request) {
    return await mutex.runExclusive(async () => {
        const payResult: LTPaymentCallback = await request.json()

        console.log('收到蓝兔支付回调:', payResult)

        //获取订单号
        const orderId = payResult.out_trade_no;

        let processingStatus = 0;

        //1. 查询当前订单是否已经处理
        //         SELECT processing_status
        // FROM orders
        // WHERE order_number = 'ORD12345';

        //如果已经处理，则返回成功响应
        if (processingStatus == 1) {
            return new Response('SUCCESS', {
                status: 200, // 设置HTTP状态码为200
            });
        }

        //如果未处理，则进行处理

        //获取支付是什么产品
        const attach = payResult.attach;
        let productType = 0;//默认是0，账户充值
        if (!attach) {
            const attachObj = JSON.parse(attach!);
            productType = attachObj.product_type;
            console.log('产品类型:', productType);
        }

        if (payResult.code === '1') {
            //支付失败，根据订单号更新订单表，支付状态失败

            // UPDATE orders
            // SET
            // payment_status = 2, --将支付状态更新为支付失败
            // processing_status = 1, --将处理状态更新为已处理
            // updated_at = CURRENT_TIMESTAMP-- 更新时间戳
            // WHERE
            // order_number = 'ORDER123'


        } else if (payResult.code === '0') {
            //支付成功，根据订单号更新订单表，支付状态成功

            // UPDATE orders
            // SET
            // payment_status = 1, --将支付状态更新为 已支付
            // processing_status = 1, --将处理状态更新为已处理
            // updated_at = CURRENT_TIMESTAMP-- 更新时间戳
            // WHERE
            // order_number = 'ORDER123'


            //获取支付金额
            const payAmount = payResult.total_fee;

            if (productType === 0) {
                //账户充值
                //更新用户余额  TODO

            } else if (productType === 1) {
                //e2m app
                //处理e2m app的订阅，更新订阅表

                //                 --插入新的订阅记录
                // INSERT INTO subscriptions(
                //                     id,
                //                     user_id,
                //                     order_number,
                //                     product_type,
                //                     start_date,
                //                     end_date
                //                 ) VALUES(
                //                     nextval('subscriptions_id_seq'), --假设使用序列生成ID
                //   : user_id, --用户ID
                //   : order_number, --关联的订单号
                //   : product_type, --产品类型
                //   CURRENT_DATE, --订阅开始日期（当前日期）
                //                     CURRENT_DATE + INTERVAL '1 year' -- 订阅结束日期（一年后）
                //                 );
            } else {
                //其他产品

            }
        }

        // 返回成功响应
        return new Response('SUCCESS', {
            status: 200, // 设置HTTP状态码为200
        });
    });
}
