'use client'

import React, { useState } from 'react';
import Link from 'next/link';

const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'yearly'>('free');

  const handlePlanChange = (plan: 'free' | 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
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
          {selectedPlan === 'free' ? '免费版即将推出' : `${selectedPlan === 'monthly' ? '月度' : '年度'}订阅即将开放`}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          我们正在努力完善这项功能,敬请期待!
        </p>
      </div>

    </div>
  );
};

export default PricingPage;
