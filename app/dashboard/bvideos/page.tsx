'use client'

import { useState } from 'react';
import { createClient } from "@/utils/supabase/client";

export default function VideoPage() {
  const [title, setTitle] = useState('');
  const [iframeText, setIframeText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleUpload = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('videos')
      .insert([
        { 
          title: title, 
          url: iframeText,
          created_at: new Date().toISOString(),
          sort_order: 1
        },
      ]);

    if (error) {
      console.error('上传失败:', error);
    } else {
      console.log('上传成功:', data);
      setTitle('');
      setIframeText('');
      setSuccessMessage('视频上传成功！');
      setTimeout(() => setSuccessMessage(''), 3000); // 3秒后清除提示
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">视频上传</h1>
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">视频标题</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入视频标题"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="iframe" className="block text-sm font-medium text-gray-700 mb-1">iframe 文本</label>
          <textarea
            id="iframe"
            value={iframeText}
            onChange={(e) => setIframeText(e.target.value)}
            placeholder="请输入 iframe 文本"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button 
          onClick={handleUpload}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
        >
          上传
        </button>
      </div>
    </div>
  );
}