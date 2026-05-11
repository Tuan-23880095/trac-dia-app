"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Kiểm tra xem sinh viên đã có phiên đăng nhập trên trình duyệt chưa
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/dashboard"); // Đã đăng nhập -> Vào thẳng bảng điều khiển
    } else {
      setIsChecking(false); // Chưa đăng nhập -> Hiển thị trang chào mừng
    }
  }, [router]);

  // Hiển thị vòng tròn xoay (Loading) mượt mà trong tích tắc kiểm tra trạng thái
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-10 bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 text-center">
        
        {/* Phần Header Giới thiệu */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase">
            Trường Đại học Khoa học Tự nhiên - ĐHQG HCM
          </h2>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Hệ Thống Thực Hành <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Trắc Địa</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base text-gray-500 leading-relaxed">
            Nền tảng số hóa quy trình đo đạc hiện trường. Hỗ trợ sinh viên Khoa Địa chất nạp số liệu, kiểm tra sai số tự động (QC) và xuất hồ sơ minh chứng PDF chuyên nghiệp chuẩn doanh nghiệp.
          </p>
        </div>

        {/* Các tính năng nổi bật (Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100 text-left">
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
            <div className="text-blue-600 text-2xl mb-2">⏱️</div>
            <div className="text-gray-900 font-bold mb-1">Thời gian thực</div>
            <div className="text-sm text-gray-600">Nhập liệu và kiểm tra sai số khép ngay tại trạm đo ngoài công trường.</div>
          </div>
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow">
            <div className="text-emerald-600 text-2xl mb-2">📊</div>
            <div className="text-gray-900 font-bold mb-1">Tự động hóa toán học</div>
            <div className="text-sm text-gray-600">Tự động tính sai số 2C, MO, góc đứng, chênh cao lượng giác.</div>
          </div>
          <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 hover:shadow-md transition-shadow">
            <div className="text-purple-600 text-2xl mb-2">📄</div>
            <div className="text-gray-900 font-bold mb-1">Báo cáo chuẩn A4</div>
            <div className="text-sm text-gray-600">Xuất phiếu thực tập phiên bản in ấn sắc nét chỉ với một cú click chuột.</div>
          </div>
        </div>

        {/* Cụm nút điều hướng (Call to Action) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link
            href="/login"
            className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Đăng nhập hệ thống
          </Link>
          <Link
            href="/register"
            className="inline-flex justify-center items-center px-8 py-3.5 border-2 border-gray-200 text-base font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Đăng ký tài khoản
          </Link>
        </div>

      </div>
      
      {/* Footer */}
      <div className="mt-10 text-center text-sm font-medium text-gray-400">
        &copy; 2026 Khoa Địa chất - HCMUS. Phát triển phục vụ học phần Trắc địa đại cương.
      </div>
    </div>
  );
}
