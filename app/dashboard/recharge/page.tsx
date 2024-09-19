'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function RechargePage() {
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
    </div>
  );
}