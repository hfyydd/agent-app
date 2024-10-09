"use client"
import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { FaDownload, FaTimes, FaEye, FaShare } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { User } from '@supabase/supabase-js';
import { useStore } from 'zustand'
import { useTagStore } from "@/store/tagStore";

// 在文件顶部添加这个接口
interface ExtendedUser extends User {
  balance?: number;
}

interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  tagIds: string[];
  content: string;
  price?: number;
  icon_url: string;
  views?: number;
  favorites?: number;
  test_url?: string;
  downloads?: number;
  content_image_url?: string;
  user: ExtendedUser | null;
}

interface Tag {
  id: string;
  name: string;
}

export default function ToolCard({ id, title, description, tagIds, content, price, icon_url, views = 0, test_url, downloads = 0, content_image_url, user }: ToolCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const [localViews, setLocalViews] = useState(views); // 本地保存的浏览次
  const [localDownloads, setLocalDownloads] = useState(downloads); // 本地保存的浏次数
  const { tags, loading, fetchTags } = useStore(useTagStore, (state) => ({
    tags: state.tags,
    loading: state.loading,
    fetchTags: state.fetchTags
  }));

  useEffect(() => {
    if (tags.length === 0 && !loading) {
      fetchTags();
    }
  }, [tags, loading, fetchTags]);

  const handleViewInChat = () => {
    if (test_url) {
      router.push(`/chat?workflow=${id}`);
    } else {
      alert('该工作流没有提供测试 URL');
    }
  };

  const renderTags = () => {
    if (tags.length === 0 || tagIds.length === 0) return null;

    return tags
      .filter(tag => tagIds.some(id => String(id).trim() === String(tag.id).trim()))
      .map(tag => (
        <span key={tag.id} className="mr-2 text-xs text-blue-500">
          #{tag.name}
        </span>
      ));
  };

  const renderPrice = () => {
    return (
      <span className="text-green-600 font-semibold">
        🐨{typeof price === 'number' ? price.toFixed(2) : '0.00'}考拉币
      </span>
    );
  };

  const handleOpenModal = async () => {
    setIsModalOpen(true);

    // 增加浏览次数
    const { data, error } = await supabase
      .from('workflows')
      .update({ views: localViews + 1 })
      .eq('id', id);

    if (error) {
      console.error('Error updating views:', error);
    } else {
      setLocalViews(prevViews => prevViews + 1);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      // 首先查询 purchase 表
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_id', id)
        .single();


      if (purchaseError) {
        if (purchaseError.code === 'PGRST116') {
          // 没有找到购买记录,继续处理新购买
          await handleNewPurchase();
        } else {
          // 其他错误
          console.error('查询购买记录时出错:', purchaseError);
          alert('查询购买记录时出错，请重试');
        }
        return;
      }

      if (purchaseData) {
        // 用户已经购买过，直接下载
        downloadWorkflow();
      }
    } catch (error) {
      console.error('查询购买记录时发生异常:', error);
      alert('发生意外错误，请重试');
    }
  };

  const handleNewPurchase = async () => {
    if (!price || price <= 0) {
      // 如果工作流是免费的，直接下载
      try {
        const { data, error } = await supabase.rpc('purchase_workflow', {
          workflow_id: id,
          workflow_price: 0
        });
        console.log(data)
        console.log(error)
        if (error) {
          console.error('购买失败:', error);
          alert('下载失败，请重试');
        } else {
          downloadWorkflow();
          setLocalDownloads(prevDownloads => prevDownloads + 1);
        }
      } catch (e) {
        console.error('发生意外错误:', e);
        alert('下载过程中发生错误，请重试');
      }
      return;
    }
  
    if (user?.balance === undefined || user.balance < price) {
      alert('余额不足，请前往充值页面充值');
      router.push('/dashboard/recharge');
      return;
    }
  
    const isConfirmed = window.confirm(`确认下载吗？将从您的账户中扣除 🐨${price.toFixed(2)}`);

    if (isConfirmed) {
      // 扣除余额并更新数据库
      const { data, error } = await supabase.rpc('purchase_workflow', {
        workflow_id: id,
        workflow_price: price
      });
      console.log(data)
      if (error) {
        console.error('Purchase failed:', error);
        alert('购买失败，请重试');
      } else {
        downloadWorkflow();
        setLocalDownloads(prevDownloads => prevDownloads + 1);
      }
    }
  };

  const downloadWorkflow = () => {
    const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}.yml`; // Set the filename

    // Append to the document, click it, and remove it
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}.yml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the URL object
    URL.revokeObjectURL(url);

  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡,防止触发卡片的点击事件
    const baseUrl = window.location.origin;
    const searchParam = encodeURIComponent(title);
    const shareUrl = `${baseUrl}/store?search=${searchParam}`;
    
    const shareText = `我在 aihouse 发现了一个很棒的工作流：「${title}」\n\n快来看看吧：${shareUrl}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      alert('分享内容已复制到剪贴板，可以直接粘贴到微信聊天框');
    }).catch(err => {
      console.error('复制失败:', err);
      alert('复制链接失败,请手动复制: ' + shareUrl);
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-xl hover:scale-105 transition duration-300 ease-in-out flex flex-col h-full cursor-pointer" onClick={handleOpenModal}>
        <div className="flex items-start mb-3">
          {icon_url && (
            <div className="w-20 h-20 flex-shrink-0 relative overflow-hidden rounded-lg mr-3">
              <Image
                src={icon_url}
                alt={title}
                fill
                className="rounded-lg object-cover"
                sizes="80px"
              />
            </div>
          )}
          <div className="flex-grow">
            <h3 className="font-bold text-lg mb-1 dark:text-white">{title}</h3>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              {renderPrice()}
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">{description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {renderTags()}
        </div>
        <div className="mt-auto flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm">
          <span className="flex items-center cursor-pointer">
            <FaEye className="mr-1" /> {localViews}
          </span>
          <span className="flex items-center cursor-pointer">
            <FaDownload className="mr-1" /> {localDownloads}
          </span>
          <span className="flex items-center cursor-pointer" onClick={handleShare}>
            <FaShare className="mr-1" /> 分享
          </span>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>
            <div className="p-6 flex-grow overflow-y-auto">
              <h2 className="text-2xl font-bold mb-3 dark:text-white">{title}</h2>
              {renderPrice()}
              <div className="mt-4 mb-4 prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
              {content_image_url && (
                <div className="mb-4">
                  <img src={content_image_url} alt="Content image" className="w-full h-auto rounded-lg" />
                </div>
              )}
              <div className="mb-4 flex flex-wrap">{renderTags()}</div>
            </div>
            <div className="p-6 border-t dark:border-gray-700">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleShare}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded transition duration-300 flex items-center text-base"
                >
                  <FaShare className="mr-2" /> 分享
                </button>
                <button
                  onClick={handleViewInChat}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded transition duration-300 flex items-center text-base"
                >
                  <FaEye className="mr-2" /> 测试
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded transition duration-300 flex items-center text-base"
                >
                  <FaDownload className="mr-2" /> 下载
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}