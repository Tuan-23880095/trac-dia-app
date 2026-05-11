"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Danh sách 9 buổi học theo đề cương của bạn
const SESSIONS = [
  { id: 1, name: "Buổi 1: Giới thiệu máy Kinh vĩ & Thủy bình", description: "Làm quen cấu tạo và ngắm mục tiêu." },
  { id: 2, name: "Buổi 2: Cân bằng máy & Định tâm", description: "Quy trình 7 bước cân bằng máy chuyên nghiệp." },
  { id: 3, name: "Buổi 3: Đo góc bằng trên máy Kinh vĩ", description: "Phương pháp đo thuận/đảo kính và sai số 2C." },
  { id: 4, name: "Buổi 4: Đo góc đứng & Đo cao lượng giác", description: "Kỹ năng đọc mia và tính toán chênh cao." },
  { id: 5, name: "Buổi 5: Đo dài bằng chỉ lượng cự", description: "Triệt tiêu thị sai và đo khoảng cách quang học." },
  { id: 6, name: "Buổi 6: Đo chênh cao bằng máy Thủy bình", description: "Kiểm nghiệm sai số góc i và đọc vạch chữ E." },
  { id: 7, name: "Buổi 7: Dẫn chuyền cao độ tuyến kín", description: "Đo đạc hiện trường lưới thủy chuẩn 3 trạm." },
  { id: 8, name: "Buổi 8: Bình sai lưới thủy chuẩn", description: "Tính toán nội nghiệp và phân bổ số hiệu chỉnh." },
  { id: 9, name: "Buổi 9: Thi Thực hành Tổng hợp", description: "Sát hạch kỹ năng cuối kỳ (Đề ngẫu nhiên).", isExam: true },
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Lấy thông tin user đã lưu từ trang Login
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div className="p-8">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-blue-600 font-bold text-lg tracking-tighter">TRẮC ĐỊA HCMUS</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user.hoten}</p>
                <p className="text-xs text-gray-500">MSSV: {user.mssv} | Lớp: {user.lop}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Lộ trình Thực hành Trắc địa</h1>
          <p className="mt-1 text-sm text-gray-500">Chọn buổi học để nạp số liệu và xuất minh chứng PDF.</p>
        </div>

        {/* Grid danh sách các buổi học */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SESSIONS.map((session) => (
            <Link 
              key={session.id} 
              href={`/sessions/${session.id}`}
              className="group relative bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center justify-center p-2 rounded-lg ${session.isExam ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                  {session.isExam ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  ) : (
                    <span className="font-bold text-sm">B{session.id}</span>
                  )}
                </span>
                <span className="text-xs font-medium text-gray-400 group-hover:text-blue-500 transition-colors">CHI TIẾT →</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {session.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {session.description}
              </p>
              
              <div className="mt-6 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-200 w-full"></div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chưa nộp</span>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-16 text-center border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400">
            Hệ thống quản lý minh chứng thực hành điện tử - Khoa Địa chất, ĐH Khoa học Tự nhiên
          </p>
        </footer>
      </main>
    </div>
  );
}
