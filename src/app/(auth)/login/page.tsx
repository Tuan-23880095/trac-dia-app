"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchGAS } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const [mssv, setMssv] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await fetchGAS("LOGIN", { mssv, password, device: navigator.userAgent });
      if (result.status === "success") {
        localStorage.setItem("user", JSON.stringify(result.user));
        router.push("/dashboard");
      } else {
        setError(result.message || "Sai mã số sinh viên hoặc mật khẩu.");
      }
    } catch (err) {
      setError("Không thể kết nối với hệ thống. Vui lòng kiểm tra internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* BÊN TRÁI: Hình minh họa & Thông tin (Chỉ hiện trên Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Lớp Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-slate-900 z-10"></div>
        
        {/* Hình nền mô phỏng Trắc địa (Ví dụ: Lưới tọa độ/Bản đồ) */}
        <div className="absolute inset-0 opacity-20 z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

        <div className="relative z-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <span className="text-2xl">🛰️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">GEOSURVEY SYSTEM</h1>
              <p className="text-blue-400 text-xs font-semibold tracking-[0.2em]">KHOA ĐỊA CHẤT - HCMUS</p>
            </div>
          </div>
          
          <div className="space-y-6 mt-20">
            <h2 className="text-4xl font-extrabold leading-tight">
              Quản lý Thực hành <br />
              <span className="text-blue-400">Trắc địa Hiện đại</span>
            </h2>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Hệ thống tích hợp xử lý số liệu đo đạc, quản lý thiết bị và xuất báo cáo chuẩn A4 dành cho sinh viên và giảng viên.
            </p>
          </div>
        </div>

        <div className="relative z-20 flex gap-8 text-sm text-slate-500">
          <span>© 2026 GeoSurvey Team</span>
          <Link href="#" className="hover:text-white transition-colors">Tài liệu hướng dẫn</Link>
          <Link href="#" className="hover:text-white transition-colors">Hỗ trợ</Link>
        </div>
      </div>

      {/* BÊN PHẢI: Form đăng nhập */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-20 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-10">
             <h1 className="text-2xl font-bold text-blue-600">GEOSURVEY</h1>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Đăng nhập</h3>
              <p className="text-slate-500 text-sm mt-1">Sử dụng mã số sinh viên để truy cập hệ thống.</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mã số sinh viên</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">👤</span>
                  <input
                    type="text"
                    required
                    value={mssv}
                    onChange={(e) => setMssv(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition-all text-sm"
                    placeholder="Ví dụ: 2427..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mật khẩu</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">🔒</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label className="ml-2 block text-xs text-slate-600 font-medium">Ghi nhớ đăng nhập</label>
                </div>
                <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">Quên mật khẩu?</Link>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "ĐANG KIỂM TRA..." : "ĐĂNG NHẬP HỆ THỐNG"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="text-blue-600 font-bold hover:underline">Đăng ký ngay</Link>
              </p>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            Hệ thống quản lý thực hành v1.0 • Khoa Địa chất HCMUS
          </p>
        </div>
      </div>
    </div>
  );
}
