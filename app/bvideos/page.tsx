'use client'
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from 'react';
import Head from 'next/head';

interface Video {
  id: string;
  url: string;
  title: string;
  sort_order: number;
}

export default function VideoPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching videos:', error);
      } else {
        setVideos(data || []);
      }
    };

    fetchVideos();
  }, []);

  return (
    <>
      <Head>
        <title>Videos</title>
        <meta name="description" content="Dify related videos from Bilibili" />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <img src="/images/dify.png" alt="Dify Logo" className="w-12 h-12" />
          <h1 className="text-4xl font-bold">Dify</h1>
        </div>

        {/* <p className="text-lg mb-8">
          Dify is an open-source LLM app development platform. Orchestrate LLM apps from agents to complex AI workflows, with an RAG engine.
        </p> */}

        {/* <div className="flex space-x-4 mb-12">
          <a href="#" className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300">
            Official Website
          </a>
          <a href="#" className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900 transition duration-300">
            GitHub Repository
          </a>
        </div> */}

        <h2 className="text-2xl font-semibold mb-6">视频教程</h2>
        <div className="grid grid-cols-3 gap-8">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden w-full">
              <h3 className="text-lg font-semibold p-4">{video.title}</h3>
              <div className="aspect-w-16 aspect-h-9">
                <div className="w-full h-0 pb-[56.25%] relative">
                  <div
                    className="absolute inset-0"
                    dangerouslySetInnerHTML={{
                      __html: video.url.replace(
                        /<iframe/,
                        '<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="autoplay; encrypted-media" allowfullscreen'
                      ).replace(
                        /src="(.*?)"/,
                        'src="$1&autoplay=0"'
                      )
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="w-full border-t border-t-foreground/10 p-4 text-center">
          <p className="text-xs">
            Powered by{" "}
            <a
              href=""
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              找自己
            </a>
          </p>
        </footer>
    </>
  );
}