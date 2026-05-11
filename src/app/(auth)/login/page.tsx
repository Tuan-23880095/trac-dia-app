"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchGAS } from "@/lib/api";

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
      // Gọi API đến Google Apps Script
      const result = await fetchGAS("LOGIN", {
        mssv,
        password,
        device: navigator.userAgent,
      });

      if (result.status === "success") {
        // Lưu thông tin user vào localStorage (hoặc dùng Zustand/Context sau này)
        localStorage.setItem("user", JSON.stringify(result.user));
        
        // Chuyển hướng sang trang Dashboard
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-sm font-bold text-blue-600 tracking-widest uppercase">
            HCMUS - KHOA ĐỊA CHẤT
          </h1>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Đăng nhập hệ thống
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Dành cho sinh viên Thực hành Trắc địa
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="mssv" className="block text-sm font-medium text-gray-700">
                Mã số sinh viên (MSSV)
              </label>
              <input
                id="mssv"
                name="mssv"
                type="text"
                required
                value={mssv}
                onChange={(e) => setMsv(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Ví dụ: 2388..."
              />
            </div>
            <div>
              <label htmlFor="pass" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="pass"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang kiểm tra...
                </span>
              ) : (
                "ĐĂNG NHẬP"
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            Hệ thống quản lý minh chứng học tập trực tuyến v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
