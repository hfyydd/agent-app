'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from 'zustand';
import { useUserStore } from '@/store/userStore';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { LTWxQRCodeResponse, LTQueryOrderResponse } from '@/types';

const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'yearly'>('free');
  const router = useRouter();
  const { user } = useStore(useUserStore, (state) => ({ user: state.user }));
  const [userToken, setUserToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const supabase = createClient();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ isSubscribed: boolean; expiryDate?: string }>({ isSubscribed: false });

  const checkSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('end_date')
        .eq('user_id', user.id)
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (data && new Date(data.end_date) > new Date()) {
        setSubscriptionStatus({ isSubscribed: true, expiryDate: data.end_date });
      } else {
        setSubscriptionStatus({ isSubscribed: false });
      }
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  // 生成充值订单号的函数
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const uuid = uuidv4().replace(/-/g, '');
    return `CZ${timestamp}${randomPart}${uuid}`.slice(0, 32);
  };

  // 修改 fetchQRCode 函数，接受一个金额参数
  const fetchQRCode = async (amount: number, type: string) => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      const orderNumber = generateOrderNumber(); // 订单号
      const total_fee = 0.01//amount; // 使用传入的金额
      const body = type; // 订单描述
      let attach = '{"product_type":1}';
      if(type == "月度订阅"){
        attach = '{"product_type":1}';
      }else if(type == "年度订阅"){
        attach = '{"product_type":2}';
      }

      const response = await fetch('/api/lantu/get_wx_qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          out_trade_no: orderNumber,
          total_fee: total_fee,
          body: body,
          attach: attach,
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
        console.error('��入订单记录失败:', insertError);
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
            // 订单支付成功
            // 停止定时器
            if (intervalIdRef.current) {
              clearInterval(intervalIdRef.current);
              intervalIdRef.current = null;
            }
            console.log('支付成功');

            // 设置支付成功状态
            setPaymentSuccess(true);

            // 清除二维码URL
            setQrCodeUrl(null);

            // 重新检查订阅状态
            await checkSubscription();

            // 使用window.alert提醒用户支付成功
            window.alert('支付成功！您的订阅已更新。');
          }
        }
      } catch (error) {
        console.error('查询订单状态失败:', error);
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

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserToken(session.access_token);
        setRefreshToken(session.refresh_token);
      }
    };

    getSession();
  }, []);

  const handlePlanChange = (plan: 'free' | 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    // 清空二维码
    setQrCodeUrl(null);
    // 如果有正在进行的定时器，清除它
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  const openE2MUIApp = () => {
    console.log('打开应用时的刷新令牌:', refreshToken);
    if (user && userToken && refreshToken) {
      // 用户已登录，打开应用
      const appUrl = `e2mui://open?token=${encodeURIComponent(userToken)}&refreshToken=${encodeURIComponent(refreshToken)}`;
      console.log('应用 URL:', appUrl);
      window.location.href = appUrl;
    } else {
      // 用户未登录，跳转到登录页面
      router.push('/login');
    }
  };

  const handlePlanAction = () => {
    if (subscriptionStatus.isSubscribed) {
      // 如果已订阅，不执行任何操作
      return;
    }
    switch (selectedPlan) {
      case 'monthly':
        // 处理月度订阅操作，传入 10 元
        fetchQRCode(10, "月度订阅");
        break;
      case 'yearly':
        // 处理年度订阅操作，传入 100 元
        fetchQRCode(100, "年度订阅");
        break;
      case 'free':
        // 处理免费版操作
        console.log('选择了免费版');
        break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">E2MUI 定价方案</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 cursor-pointer transition duration-300 ${selectedPlan === 'free' ? 'border-2 border-blue-500' : 'hover:border-2 hover:border-blue-300'}`}
          onClick={() => handlePlanChange('free')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">免费版</h2>
            <div className={`w-6 h-6 rounded-full border-2 ${selectedPlan === 'free' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
              {selectedPlan === 'free' && <div className="w-2 h-2 bg-white rounded-full m-auto mt-1.5"></div>}
            </div>
          </div>
          <div className="text-3xl font-bold mb-4">¥0<span className="text-xl font-normal">/永久</span></div>
          <ul className="mb-8 space-y-2">
            <li>✓ 基础功能 解析 URL、HTML、EPUB</li>
            <li>✓ 社区支持</li>
          </ul>
        </div>

        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 cursor-pointer transition duration-300 ${selectedPlan === 'monthly' ? 'border-2 border-blue-500' : 'hover:border-2 hover:border-blue-300'}`}
          onClick={() => !subscriptionStatus.isSubscribed && handlePlanChange('monthly')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">月度订阅</h2>
            <div className={`w-6 h-6 rounded-full border-2 ${selectedPlan === 'monthly' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
              {selectedPlan === 'monthly' && <div className="w-2 h-2 bg-white rounded-full m-auto mt-1.5"></div>}
            </div>
          </div>
          <div className="text-3xl font-bold mb-4">¥10<span className="text-xl font-normal">/月</span></div>
          <ul className="mb-8 space-y-2">
            <li>✓ 所有基础功能</li>
            <li>✓ PDF、PPT、DOCX</li>
            <li>✓ 优先技术支持</li>
          </ul>
          {subscriptionStatus.isSubscribed && (
            <div className="text-green-500">订阅到期时间：{new Date(subscriptionStatus.expiryDate!).toLocaleDateString()}</div>
          )}
        </div>

        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 cursor-pointer transition duration-300 ${selectedPlan === 'yearly' ? 'border-2 border-blue-500' : 'hover:border-2 hover:border-blue-300'}`}
          onClick={() => !subscriptionStatus.isSubscribed && handlePlanChange('yearly')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">年度订阅</h2>
            <div className={`w-6 h-6 rounded-full border-2 ${selectedPlan === 'yearly' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
              {selectedPlan === 'yearly' && <div className="w-2 h-2 bg-white rounded-full m-auto mt-1.5"></div>}
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">¥100<span className="text-xl font-normal">/年</span></div>
          <div className="text-green-500 mb-4">节省 ¥20</div>
          <ul className="mb-8 space-y-2">
            <li>✓ 所有基础功能</li>
            <li>✓ PDF、PPT、DOCX</li>
            <li>✓ 优先技术支持</li>
            <li>✓ 立减20元</li>
          </ul>
          {subscriptionStatus.isSubscribed && (
            <div className="text-green-500">订阅到期时间：{new Date(subscriptionStatus.expiryDate!).toLocaleDateString()}</div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handlePlanAction}
          className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-md ${subscriptionStatus.isSubscribed ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading || subscriptionStatus.isSubscribed}
        >
          {isLoading ? '处理中...' : subscriptionStatus.isSubscribed ? '已订阅' : selectedPlan === 'free' ? '免费版' : `${selectedPlan === 'monthly' ? '月' : '年'}度订阅`}
        </button>
        {qrCodeUrl && (
          <div className="mt-4">
            <img src={qrCodeUrl} alt="支付二维码" className="mx-auto" />
          </div>
        )}
        <p className="mt-4 text-sm text-gray-600">
          
        </p>
        <button
          onClick={openE2MUIApp}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {user ? '打开 E2MUI 应用' : '登录以打开 E2MUI 应用'}
        </button>

        {/* 新增下载按钮 */}
        <p className="mt-4 text-sm text-gray-600">
          
          </p>
        <a
          href="https://github.com/hfyydd/e2mui/releases/tag/v1.0"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          下载 E2MUI 应用
        </a>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-8 text-center">常见问题</h2>
        {/* 这里可以添加FAQ内容 */}
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p>选择订阅即表示您同意我们的服务条款和隐私政策。</p>
          <div className="mt-4 space-x-4">
            <Link href="/terms" className="text-blue-500 hover:underline">
              服务条款
            </Link>
            <Link href="/privacy" className="text-blue-500 hover:underline">
              隐私声明
            </Link>
            <Link href="/refund" className="text-blue-500 hover:underline">
              退款政策
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;