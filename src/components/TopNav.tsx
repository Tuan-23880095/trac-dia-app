"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function TopNav() {
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại để render nút "Quay lại"

  useEffect(() => {
    setIsMounted(true); // Tránh lỗi hydration của Next.js khi render ở client
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Không hiển thị TopNav ở trang chủ, trang đăng nhập và trang đăng ký
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  // Khắc phục lỗi giao diện chớp nháy trước khi check xong localStorage
  if (!isMounted) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Cụm Logo & Nút Quay lại Dashboard */}
          <div className="flex items-center gap-4">
            {pathname.includes("/sessions") && (
              <Link 
                href="/dashboard"
                className="text-gray-400 hover:text-blue-600 transition-colors hidden sm:flex items-center gap-1 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Trở về
              </Link>
            )}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                GEO
              </div>
              <span className="text-blue-600 font-bold text-lg tracking-tighter hidden sm:block">
                TRẮC ĐỊA HCMUS
              </span>
            </Link>
          </div>

          {/* Cụm Thông tin User & Đăng xuất */}
          {user ? (
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 leading-tight">{user.hoten}</p>
                <p className="text-xs text-gray-500 font-medium">
                  MSSV: {user.mssv} <span className="hidden sm:inline">| Lớp: {user.lop}</span>
                </p>
              </div>
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              <button 
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-lg transition-all"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-800 font-bold"
            >
              Đăng nhập
            </Link>
          )}
          
        </div>
      </div>
    </nav>
  );
}
