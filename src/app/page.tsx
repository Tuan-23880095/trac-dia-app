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

  // Hiển thị vòng tròn xoay (Loading) mượt mà, căn giữa hoàn hảo
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-12 h-12 rounded-full bg-blue-400 opacity-20"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    // Bố cục tràn màn hình, chống cuộn ngang, nền Slate sang trọng
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center relative overflow-hidden px-4 sm:px-6 lg:px-8">
      
      {/* BACKGROUND DECORATIONS (Hiệu ứng ánh sáng Phong Thủy) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* KHUNG NỘI DUNG CHÍNH (Glassmorphism) */}
      <div className="max-w-5xl w-full relative z-10 space-y-12 bg-white/80 backdrop-blur-xl p-8 sm:p-16 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white">
        
        {/* Phần Header Giới thiệu */}
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <h2 className="text-xs font-bold text-slate-600 tracking-widest uppercase">
              Khoa Địa Chất - ĐH Khoa học Tự nhiên
            </h2>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Hệ Thống Thực Hành <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500">
              Trắc Địa Kỹ Thuật
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-500 font-medium leading-relaxed">
            Nền tảng số hóa quy trình đo đạc hiện trường. Hỗ trợ sinh viên nạp số liệu, kiểm định sai số tự động (QC) và trích xuất hồ sơ minh chứng PDF chuẩn doanh nghiệp.
          </p>
        </div>

        {/* Các tính năng nổi bật (Cards) - Phối màu tương sinh */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-100/50 text-left">
          {/* Card 1: Hành Kim - Tốc độ & Thời gian */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">⏱️</div>
            <div className="text-slate-900 font-bold mb-2">Đồng bộ hiện trường</div>
            <div className="text-sm text-slate-500 leading-relaxed">Nhập liệu và kiểm tra sai số khép tuyến ngay lập tức tại trạm đo ngoài công trường.</div>
          </div>
          
          {/* Card 2: Hành Thủy - Luồng dữ liệu & Tính toán */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            <div className="text-slate-900 font-bold mb-2">Tính toán tự động</div>
            <div className="text-sm text-slate-500 leading-relaxed">Thuật toán xử lý sai số 2C, góc MO, chênh cao lượng giác và bình sai lưới thủy chuẩn.</div>
          </div>
          
          {/* Card 3: Hành Mộc/Thổ - Kết quả lưu trữ */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📄</div>
            <div className="text-slate-900 font-bold mb-2">Báo cáo chuẩn A4</div>
            <div className="text-sm text-slate-500 leading-relaxed">Kết xuất phiếu thực tập định dạng PDF sắc nét, niêm phong mã chống gian lận.</div>
          </div>
        </div>

        {/* Cụm nút điều hướng (Call to Action) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link
            href="/login"
            className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-sm font-black tracking-wide rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-600/50 hover:-translate-y-1"
          >
            ĐĂNG NHẬP HỆ THỐNG
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
          <Link
            href="/register"
            className="inline-flex justify-center items-center px-8 py-4 border-2 border-slate-200 text-sm font-bold rounded-2xl text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all"
          >
            Đăng ký tài khoản
          </Link>
        </div>

      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center text-xs font-semibold text-slate-400 relative z-10 tracking-wide">
        &copy; {new Date().getFullYear()} KHOA ĐỊA CHẤT - HCMUS.<br className="sm:hidden" /> PHÁT TRIỂN DÀNH CHO HỌC PHẦN TRẮC ĐỊA ĐẠI CƯƠNG.
      </div>
    </div>
  );
}
