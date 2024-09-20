'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LTWxQRCodeResponse, LTQueryOrderResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/client';
import { QRCodeSVG } from 'qrcode.react';

export default function RechargePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    //生成充值平台订单号
    const orderNumber = generateOrderNumber();

    // 请求接口，展示支付二维码
    const fetchQRCode = async () => {
      const supabase = createClient();
      try {
        const response = await fetch('https://api.ltzf.cn/api/wxpay/native', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mch_id: '1630848488',
            out_trade_no: orderNumber, // 生成订单号
            total_fee: 20, // 金额
            body: '平台用户充值', // 商品描述
            timeStamp: Math.floor(Date.now() / 1000), // 获取秒级时间戳
            notify_url: 'todo', // 支付回调地址
            attach: '{"product_type":0}', // 支付的产品类型，0是充值，1是e2m app，其他未定
          }),
        });
        if (!response.ok) {
          //生成二维码失败
          //TODO 整个页面直接不显示
          return;
        }

        const data: LTWxQRCodeResponse = await response.json();

        if (data.code !== 0) {
          //生成二维码失败
          //TODO 整个页面直接不显示
          return;
        }

        const qrcodeString = data.data.code_url;
        setQrCodeUrl(qrcodeString);

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
            amount: 20,
            payment_status: 0,
            processing_status: 0
          });

        if (insertError) {
          console.error('插入订单记录失败:', insertError);
        }

        //TODO使用qrcodeString展示二维码
        
        //在订单表中插入一条记录，状态是初始状态，未支付，产品类型是平台充值 TODO
        //获取用户id
        // INSERT INTO orders (
        //   order_number, 
        //   user_id, 
        //   order_type, 
        //   amount, 
        //   payment_status, 
        //   processing_status
        // ) VALUES (
        //   'ORD-20240920-001',  -- 订单号
        //   1001,                -- 用户ID
        //   0,                   -- 订单类型 (1 表示 e2m app订阅)
        //   99,               -- 订单金额
        //   0,                   -- 支付状态 (0 表示未支付)
        //   0                    -- 处理状态 (0 表示初始状态)
        // );
        
      // 开启定时器检查支付状态
      const checkPaymentStatus = setInterval(async () => {
        
          const response = await fetch('https://api.ltzf.cn/api/wxpay/get_pay_order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mch_id: '1630848488',
              out_trade_no: orderNumber, // 生成订单号
              timeStamp: Math.floor(Date.now() / 1000), // 获取秒级时间戳
              sign: 'xxxx',
            }),
          });

          if (!response.ok) {
            console.error('检查支付状态失败');
            return;
          }

          const result: LTQueryOrderResponse = await response.json();

          if (result.code == 0) {
            if (result.data.pay_status == 1) {
              //停止定时器
              clearInterval(checkPaymentStatus);
              console.log('支付成功');
              // TODO: 更新用户界面，显示支付成功信息
            }
  
          }
    
      }, 3000);

      // 组件卸载时清除定时器
      return () => {
        console.log('清除支付状态检查定时器');
        clearInterval(checkPaymentStatus);
      };
  
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchQRCode();
  }, []);

  // 生成充值订单号的函数
  const generateOrderNumber = () => {
    const uuid = uuidv4();
    return `CZ${uuid.replace(/-/g, '')}`;
  };

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

      <div className="text-center">
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
          <QRCodeSVG value={qrCodeUrl} size={200} />
        </div>
      )}

    </div>
  );
}