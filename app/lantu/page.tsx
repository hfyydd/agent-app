'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { LTQueryOrderResponse, LTWxQRCodeResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { wxPaySign } from '@/lib/utils/ltpaysign';

export default function LantuPage() {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);


    // 生成充值订单号的函数
    const generateOrderNumber = () => {
        const timestamp = Date.now().toString();
        const randomPart = Math.random().toString(36).substring(2, 15);
        const uuid = uuidv4().replace(/-/g, '');
        return `CZ${timestamp}${randomPart}${uuid}`.slice(0, 32);
    };

    const handleGetQRCode = async () => {
        try {
            const orderNumber = generateOrderNumber(); // 订单号
            const total_fee = '0.01'; // 充值金额
            const body = '平台用户充值'; // 订单描述

            const response = await fetch('/api/lantu/get_wx_qrcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    out_trade_no: orderNumber,
                    total_fee: total_fee,
                    body: body,
                }),
            });

            if (!response.ok) {
                throw new Error('生成二维码失败');
            }

            const data: LTWxQRCodeResponse = await response.json();
            console.log('data:',data)

            if (data.code !== 0) {
                throw new Error('生成二维码失败');
            }

            //展示微信支付二维码图片
            const qrcodeString = data.data.QRcode_url;
            setQrCodeUrl(qrcodeString);

            //同时开启一个定时器，根据订单号定时检查用户的支付状态
            startOrderStatusCheck(orderNumber);


            // // 插入订单记录
            // const { data: user, error: userError } = await supabase.auth.getUser();
            // if (userError) {
            //   console.error('获取用户信息失败:', userError);
            //   return;
            // }

            // const { error: insertError } = await supabase
            //   .from('orders')
            //   .insert({
            //     order_number: orderNumber,
            //     user_id: user.user.id,
            //     order_type: 0,
            //     amount: total_fee,
            //     payment_status: 0,
            //     processing_status: 0
            //   });

            // if (insertError) {
            //   console.error('插入订单记录失败:', insertError);
            // } else {
            //   //开启定时器查询订单状态
            //   // startOrderStatusCheck(orderNumber);
            // }
        } catch (error) {
            console.error('获取二维码失败:', error);
        } finally {
        }
    };

    //开启定时器，检查订单状态，是否已支付。
    const startOrderStatusCheck = (orderNumber: string) => {
        // 清除之前的定时器（如果存在）
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
        }

        intervalIdRef.current = setInterval(async () => {
            // 这里是定时器执行的方法
            console.log("----定时器开始执行----");

            try {
                const response = await fetch('/api/lantu/get_pay_order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        out_trade_no: orderNumber
                    }),
                });

                if (!response.ok) {
                    console.error('检查支付状态失败');
                    return;
                }

                const result: LTQueryOrderResponse = await response.json();

                if (result.code == 0) {
                    if (result.data.pay_status == 1) {
                        //订单支付成功
                        //停止定时器
                        if (intervalIdRef.current) {
                            clearInterval(intervalIdRef.current);
                            intervalIdRef.current = null;
                        }
                        console.log('支付成功');
                        // TODO: 更新用户界面，显示支付成功信息
                        // 使用window.alert提醒用户支付成功
                        window.alert('支付成功！');
                    }
                }
            } catch (error) {
                console.error('查询订单状态失败:', error);
            } finally {
            }
        }, 6000);
    };

    useEffect(() => {
        // 组件卸载时清除定时器
        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        };
    }, []);


    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-4xl font-bold mb-8">微信支付</h1>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleGetQRCode}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        获取微信支付二维码
                    </button>
                    <button
                        onClick={() => startOrderStatusCheck('CZ1727751726618sbvkh7w7bpr7ddd45')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        测试定时器
                    </button>
                    {qrCodeUrl && (
                        <div className="border-2 border-gray-200 rounded p-2">
                            <Image
                                src={qrCodeUrl}
                                alt="微信支付二维码"
                                width={200}
                                height={200}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
