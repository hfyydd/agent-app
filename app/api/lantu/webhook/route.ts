import { NextResponse } from 'next/server'
import { LTPaymentCallback } from '@/types'
import { createClient } from '@/utils/supabase/client';
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
        const supabase = createClient();
        const { data, error } = await supabase
            .from('orders')
            .select('processing_status')
            .eq('order_number', orderId);

        if (error) {
            console.error('查询订单状态失败:', error);
        // 将 data 中的 processing_status 赋值给 processingStatus
        processingStatus = data?.[0]?.processing_status;

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
            // 支付失败，根据订单号更新订单表，支付状态失败
            try {
                const supabase = createClient();
                const { error } = await supabase
                    .from('orders')
                    .update({
                        payment_status: 2, // 将支付状态更新为支付失败
                        processing_status: 1, // 将处理状态更新为已处理
                        updated_at: new Date().toISOString() // 更新时间戳
                    })
                    .eq('order_number', orderId);

                if (error) {
                    console.error('更新订单状态失败:', error);
                    throw error;
                }

                console.log('订单状态已更新为支付失败:', orderId);
            } catch (error) {
                console.error('处理支付失败时发生错误:', error);
                return new Response('处理失败', { status: 500 });
            }
        } else if (payResult.code === '0') {
            //支付成功，根据订单号更新订单表，支付状态成功

            // UPDATE orders
            // SET
            // payment_status = 1, --将支付状态更新为 已支付
            // processing_status = 1, --将处理状态更新为已处理
            // updated_at = CURRENT_TIMESTAMP-- 更新时间戳
            // WHERE
            // order_number = 'ORDER123'
            const supabase = createClient();
            const { error } = await supabase
                .from('orders')
                .update({
                    payment_status: 1, // 将支付状态更新为已支付
                    processing_status: 1, // 将处理状态更新为已处理
                    updated_at: new Date().toISOString() // 更新时间戳
                })
                .eq('order_number', orderId);

            //获取支付金额
            const payAmount = payResult.total_fee;

            if (productType === 0) {
                // 账户充值
                // 更新用户余额
                try {
                    // 首先获取订单信息以获取用户ID
                    const { data: orderData, error: orderError } = await supabase
                        .from('orders')
                        .select('user_id')
                        .eq('order_number', orderId)
                        .single();

                    if (orderError) {
                        console.error('获取订单信息失败:', orderError);
                        throw orderError;
                    }

                    if (!orderData) {
                        throw new Error('未找到对应的订单');
                    }

                    const userId = orderData.user_id;

                    // 使用 RPC 调用 recharge_account 函数
                    const { data, error } = await supabase.rpc('recharge_account', {
                        p_user_id: userId,
                        p_amount: payAmount,
                        p_admin_id: null // 这里是自动充值，没有管理员操作，所以传 null
                    });

                    if (error) {
                        console.error('充值失败:', error);
                        throw error;
                    }

                    console.log('用户余额已更新:', userId, '增加金额:', payAmount);
                } catch (error) {
                    console.error('处理充值时发生错误:', error);
                    return new Response('处理失败', { status: 500 });
                }
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
                // 更新订阅表
                // 首先获取订单信息以获取用户ID
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('user_id')
                    .eq('order_number', orderId)
                    .single();

                    if (orderError) {
                        console.error('获取订单信息失败:', orderError);
                        throw orderError;
                    }

                    if (!orderData) {
                        throw new Error('未找到对应的订单');
                    }

                    const userId = orderData.user_id;
                const { data: subscriptionData, error: subscriptionError } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: userId,
                        order_number: orderId,
                        product_type: productType,
                        start_date: new Date().toISOString(),
                        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
                    });

                    if (subscriptionError) {
                        console.error('更新订阅表失败:', subscriptionError);
                        throw subscriptionError;
                    }

                    console.log('订阅表已更新:', subscriptionData);
                }
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
