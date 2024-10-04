'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { LTWxQRCodeResponse, LTQueryOrderResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { sign } from 'crypto';
import { m } from 'framer-motion';
import { wxPaySign } from '@/lib/utils/ltpaysign';

export default function RechargePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // 生成充值订单号的函数
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const uuid = uuidv4().replace(/-/g, '');
    return `CZ${timestamp}${randomPart}${uuid}`.slice(0, 32);
  };

  //获取支付二维码
  const fetchQRCode = async () => {
    setIsLoading(true);
    const supabase = createClient();
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

      if (data.code !== 0) {
        throw new Error('生成二维码失败');
      }

      // 插入订单记录
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('获取用户信息失败:', userError);
        return;
      }

      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.user.id,
          order_type: 0,
          amount: total_fee,
          payment_status: 0,
          processing_status: 0
        });

      if (insertError) {
        console.error('插入订单记录失败:', insertError);
      } else {
        //插入订单成功
        //展示微信支付二维码图片
        const qrcodeString = data.data.QRcode_url;
        setQrCodeUrl(qrcodeString);

        //开启定时器查询订单状态
        startOrderStatusCheck(orderNumber);
      }
    } catch (error) {
      console.error('获取二维码失败 或 订单处理失败', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleRecharge = () => {
    window.location.href = 'https://ifdian.net/order/create?plan_id=07231514759b11ef83a95254001e7c00&product_type=0&remark=';
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">账户充值</h1>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-6">
        <p className="mb-2 dark:text-gray-300">尊敬的用户，我们现在使用爱发电平台进行充值。</p>
        <p className="mb-2 dark:text-gray-300">充值步骤：</p>
        <ol className="list-decimal list-inside mb-2 dark:text-gray-300">
          <li>点击下方的"前往爱发电充值"按钮</li>
          <li>在爱发电页面选择您想要的充值金额</li>
          <li>完成支付流程</li>
          <li>充值完成后，您的账户余额将自动更新</li>
        </ol>
        <p className="dark:text-gray-300">感谢您的支持！</p>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={fetchQRCode}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-4"
          disabled={isLoading}
        >
          {isLoading ? '加载中...' : '获取微信支付二维码'}
        </button>
        <button
          onClick={handleRecharge}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          前往爱发电充值
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        <h2 className="font-bold mb-2 dark:text-gray-300">充值说明：</h2>
        <ul className="list-disc list-inside">
          <li>充值金额将在支付完成后即时到账</li>
          <li>如有任何疑问，请联系我们的客服</li>
          <li>我们承诺为您提供安全、可靠的充值服务</li>
          <li>充值完成后可前往 <a href="/dashboard/overview" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">账户总览</a> 查看账户余额</li>
          <li>10 考拉币🐨 = 1 元</li>
          <li><strong>微信号：koalababy2024</strong></li>
        </ul>
      </div>

      {qrCodeUrl && (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">扫描二维码支付</h2>
          <Image
            src={qrCodeUrl}
            alt="微信支付二维码"
            width={200}
            height={200}
          />
        </div>
      )}

    </div>
  );
}