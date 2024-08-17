"use client"
import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { FaDownload, FaTimes, FaEye } from 'react-icons/fa';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

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
}

interface Tag {
  id: string;
  name: string;
}

export default function ToolCard({ id, title, description, tagIds, content, price, icon_url, views = 0, test_url, downloads = 0, content_image_url }: ToolCardProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();
  //const [favorites, setFavorites] = useState(0);

  const [userBalance, setUserBalance] = useState(0);
  const { user } = useUser();
  const router = useRouter();

  const [localViews, setLocalViews] = useState(views); // 本地保存的浏览次数
  const [localDownloads, setLocalDownloads] = useState(downloads); // 本地保存的浏���次数

  useEffect(() => {
    async function fetchTags() {
      if (tagIds && tagIds.length > 0) {
        const { data, error } = await supabase
          .from('tags')
          .select('id, name')
          .in('id', tagIds);

        if (error) {
          console.error('Error fetching tags:', error);
        } else if (data) {
          setTags(data);
        }
      }
    }

    async function fetchUserBalance() {
      if (user) {
        const { data, error } = await supabase
          .from('accounts')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setUserBalance(data.balance);
        } else if (error) {
          console.error('Error fetching user balance:', error);
        }
      }
    }
    // async function fetchFavorites() {
    //   const { count, error } = await supabase
    //     .from('purchases')
    //     .select('*', { count: 'exact', head: true })
    //     .eq('workflow_id', id);

    //   if (error) {
    //     //console.error('Error fetching favorites:', error);
    //   } else {
    //     setFavorites(count || 0);
    //   }
    // }

    // fetchFavorites();

    fetchTags();
    fetchUserBalance();
  }, [tagIds, user, supabase]);

  const handleViewInChat = () => {
    if (test_url) {
      router.push(`/chat?workflow=${id}`);
    } else {
      alert('该工作流没有提供测试 URL');
    }
  };

  const renderTags = () => {
    if (tags.length === 0) return null;

    return tags.map((tag) => (
      <span key={tag.id} className="mr-2 text-xs text-blue-500">
        #{tag.name}
      </span>
    ));
  };

  const renderPrice = () => {
    return (
      <span className="text-green-600 font-semibold">
        🐨{typeof price === 'number' ? price.toFixed(2) : '0.00'}
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

    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('workflow_id', id)
      .single();

    if (purchaseError && purchaseError.code !== 'PGRST116') {
      console.error('Error checking purchase:', purchaseError);
      alert('��查购买记录时出错，请重试');
      return;
    }

    if (purchaseData) {
      // 用户已经购买过，直接下载
      downloadWorkflow();
      return;
    }

    if (!price || price <= 0) {
      // 如果工作流是免费的，直接下载
      const { data, error } = await supabase.rpc('purchase_workflow', {
        workflow_id: id,
        workflow_price: 0
      });
      if (error) {
        console.error('Purchase failed:', error);
        alert('下载失败，请重试');
      } else {
        downloadWorkflow();
        setLocalDownloads(prevDownloads => prevDownloads + 1);
      }
      return;
    }
    if (userBalance < price) {
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
      if (error) {
        console.error('Purchase failed:', error);
        alert('购买失败，请重试');
      } else {
        setUserBalance(prevBalance => prevBalance - price);
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



  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl hover:scale-105 transition duration-300 ease-in-out flex flex-col h-full cursor-pointer" onClick={handleOpenModal}>
        <div className="flex items-start mb-3">
          {icon_url && (
            <div className="w-20 h-20 flex-shrink-0 relative overflow-hidden rounded-lg mr-3">
              <Image 
                src={icon_url} 
                alt={title} 
                layout="fill" 
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          )}
          <div className="flex-grow">
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <div className="flex items-center text-gray-500 text-sm">
              {renderPrice()}
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {renderTags()}
        </div>
        <div className="mt-auto flex justify-between items-center text-gray-500 text-sm">
          <span className="flex items-center cursor-pointer">
            <FaEye className="mr-1" /> {localViews}
          </span>
          <span className="flex items-center cursor-pointer">
            <FaDownload className="mr-1" /> {localDownloads}
          </span>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col relative"> {/* 增加宽度和高度 */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            <div className="p-6 flex-grow overflow-y-auto"> {/* 增加内边距 */}
              <h2 className="text-2xl font-bold mb-3">{title}</h2> {/* 增加标题大小 */}
              {renderPrice()}
              <div className="mt-4 mb-4 prose prose-sm max-w-none"> {/* 增加间距 */}
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
              {content_image_url && (
                <div className="mb-4">
                  <img src={content_image_url} alt="Content image" className="w-full h-auto rounded-lg" />
                </div>
              )}
              <div className="mb-4 flex flex-wrap">{renderTags()}</div> {/* 增加间距 */}
            </div>
            <div className="p-6 border-t"> {/* 增加底部内边距 */}
              <div className="flex justify-end space-x-4"> {/* 增加按钮间距 */}
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