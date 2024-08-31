'use client';

import React, { useState } from 'react';
import { signOut } from "@/app/actions/auth";

export default function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setLogoutSuccess(true);
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelLogout = () => {
    setShowConfirm(false);
    setLogoutSuccess(false);
  };

  return (
    <>
      <button
        onClick={handleLogoutClick}
        className="py-2 px-4 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 shadow-sm flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        登出
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            {logoutSuccess ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-gray-800">登出成功</h2>
                <p className="mb-6 text-gray-600">您已成功退出登录。</p>
                <div className="flex justify-end">
                  <button
                    onClick={handleCancelLogout}
                    className="py-2 px-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                  >
                    关闭
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-gray-800">确认登出</h2>
                <p className="mb-6 text-gray-600">您确定要退出登录吗？</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancelLogout}
                    className="py-2 px-4 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                    disabled={isLoading}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmLogout}
                    className="py-2 px-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 text-sm font-medium flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        正在登出...
                      </>
                    ) : (
                      '确认登出'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}