"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useState, useEffect, useRef } from 'react';
import { createClient } from "@/utils/supabase/client";

interface Tag {
  id: string;
  name: string;
}

const fetcher = async (url: string): Promise<Tag[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export default function TagNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get('tag'));
  const currentSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [tags, setTags] = useState<Tag[]>([]);

  //const { data:tags, error } = useSWR<Tag[]>('/api/tags', fetcher);
  const supabase = createClient();
  //if (error) console.error('Error fetching tags:', error);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    async function fetchTags() {

      const { data: tags, error } = await supabase
        .from('tags')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching tags:', error);
      } else if (tags) {
        setTags(tags);
      }

    }
    fetchTags();
  }, [currentSearch]);

  const handleTagClick = (tagId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (selectedTag === tagId) {
      setSelectedTag(null);
      newSearchParams.delete('tag');
    } else {
      setSelectedTag(tagId);
      if (tagId) {
        newSearchParams.set('tag', tagId);
      } else {
        newSearchParams.delete('tag');
      }
    }
    router.replace(`/?${newSearchParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newSearchParams.set('search', searchTerm);
    } else {
      newSearchParams.delete('search');
    }
    router.replace(`/?${newSearchParams.toString()}`);
  };

  const [orderedTags, setOrderedTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (tags) {
      setOrderedTags(tags);
    }
  }, [tags]);

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(orderedTags);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedTags(items);
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollTags = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="flex items-center space-x-4 py-2 border-b border-gray-200">
      <div className="flex-1 relative min-w-0">
        <button
          onClick={() => scrollTags('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-1 rounded-full shadow-md z-10"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto whitespace-nowrap px-8 scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleTagClick(null);
            }}
            className={`text-sm mr-4 px-3 py-1.5 rounded-full transition-colors duration-200
              ${!selectedTag
                ? 'bg-blue-100 text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            全部
          </Link>
          {tags && tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              className={`text-sm mr-4 px-3 py-1.5 rounded-full transition-colors duration-200
                ${selectedTag === tag.id
                  ? 'bg-blue-100 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollTags('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-1 rounded-full shadow-md z-10"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSearch} className="flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索 workflow..."
            className="w-64 pl-3 pr-10 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 mt-1.5 mr-2 p-1 rounded-full text-gray-400 hover:text-blue-500 focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>
      </form>
    </nav>
  );
}