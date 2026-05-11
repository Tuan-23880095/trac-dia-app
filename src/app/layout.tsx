import 'katex/dist/katex.min.css'; // Thêm dòng này để nạp CSS toán học
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Lưu ý: Đảm bảo bạn đã có file globals.css trong cùng thư mục app hoặc src
// File này chứa các chỉ thị của Tailwind (@tailwind base; @tailwind components; @tailwind utilities;)
import "../styles/globals.css"; // Tùy vào cấu trúc thư mục, có thể đổi thành "./globals.css"
import TopNav from "@/components/TopNav"; // <-- THÊM DÒNG NÀY

// Sử dụng font Inter hiện đại, hỗ trợ tốt tiếng Việt
const inter = Inter({ subsets: ["latin", "vietnamese"] });

// Cấu hình Metadata hiển thị trên thẻ Tab của trình duyệt và hỗ trợ SEO
export const metadata: Metadata = {
  title: "Hệ thống Thực hành Trắc địa | Khoa Địa chất HCMUS",
  description: "Ứng dụng web nộp minh chứng, xử lý số liệu đo đạc và quản lý hồ sơ thực hành Trắc địa đại cương dành cho sinh viên.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* - inter.className: Áp dụng font chữ toàn cục
        - antialiased: Làm mịn font chữ trên màn hình độ phân giải cao
        - bg-gray-50: Đặt màu nền mặc định cho toàn bộ ứng dụng
      */}
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {/* Nơi Next.js sẽ nhúng (render) các trang page.tsx con vào */}
        {children}
      </body>
    </html>
  );
}
