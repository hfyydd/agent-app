'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from 'zustand';
import { useUserStore } from '@/store/userStore';
import { createClient } from '@/utils/supabase/client';

const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'yearly'>('free');
  const router = useRouter();
  const { user } = useStore(useUserStore, (state) => ({ user: state.user }));
  const [userToken, setUserToken] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserToken(session.access_token);
      }
    };

    getSession();
  }, []);

  const handlePlanChange = (plan: 'free' | 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
  };

  const openE2MUIApp = () => {
    if (user && userToken) {
      // 用户已登录，打开应用
      window.location.href = `e2mui://open?token=${userToken}`;
    } else {
      // 用户未登录，跳转到登录页面
      router.push('/login');
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
            <li>✓ 基础功能 解析 URL、HTML、DOCX、EPUB</li>
            <li>✓ 社区支持</li>
          </ul>
        </div>

        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 cursor-pointer transition duration-300 ${selectedPlan === 'monthly' ? 'border-2 border-blue-500' : 'hover:border-2 hover:border-blue-300'}`}
          onClick={() => handlePlanChange('monthly')}
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
            <li>✓ PDF、PPT、语音解析</li>
            <li>✓ 每月自动续费</li>
            <li>✓ 随时取消</li>
            <li>✓ 优先电子邮件支持</li>
          </ul>
        </div>

        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 cursor-pointer transition duration-300 ${selectedPlan === 'yearly' ? 'border-2 border-blue-500' : 'hover:border-2 hover:border-blue-300'}`}
          onClick={() => handlePlanChange('yearly')}
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
            <li>✓ PDF、PPT、语音解析</li>
            <li>✓ 每年自动续费</li>
            <li>✓ 随时取消</li>
            <li>✓ 优先电子邮件支持</li>
            <li>✓ 立减20元</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-block bg-gray-200 text-gray-700 px-8 py-3 rounded-md">
          {selectedPlan === 'free' ? '免费版即将推出' : `${selectedPlan === 'monthly' ? '���度' : '年度'}订阅即将开放`}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          我们正在努力完善这项功能,敬请期待!
        </p>
        <button
          onClick={openE2MUIApp}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {user ? '打开 E2MUI 应用' : '登录以打开 E2MUI 应用'}
        </button>
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
