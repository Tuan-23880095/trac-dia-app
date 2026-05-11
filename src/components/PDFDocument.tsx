import React, { forwardRef } from "react";

// Định nghĩa kiểu dữ liệu truyền vào component
interface PDFDocumentProps {
  user: {
    mssv: string;
    hoten: string;
    lop: string;
  };
  session: {
    id: string;
    title: string;
  };
  data: Record<string, any>; // Chứa dữ liệu linh hoạt của từng buổi (ví dụ: { cT: "1500", cG: "1450" })
  submitTime: string;
}

// Sử dụng forwardRef để component cha có thể "chụp" phần tử này xuất ra PDF
const PDFDocument = forwardRef<HTMLDivElement, PDFDocumentProps>(
  ({ user, session, data, submitTime }, ref) => {
    return (
      // Khung giấy A4 chuẩn: rộng 210mm, nền trắng, chữ đen, font Serif học thuật
      <div
        ref={ref}
        className="bg-white text-black p-10 mx-auto box-border"
        style={{
          width: "210mm",
          minHeight: "297mm",
          fontFamily: '"Times New Roman", Times, serif', // Ép font chuẩn báo cáo đại học
        }}
      >
        {/* Tiêu đề Quốc hiệu & Trường */}
        <div className="flex justify-between items-start mb-8 text-sm">
          <div className="text-center font-bold leading-tight">
            <p>TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN</p>
            <p>KHOA ĐỊA CHẤT</p>
            <div className="w-1/2 h-px bg-black mx-auto mt-1"></div>
          </div>
          <div className="text-center font-bold leading-tight">
            <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p>Độc lập - Tự do - Hạnh phúc</p>
            <div className="w-1/2 h-px bg-black mx-auto mt-1"></div>
          </div>
        </div>

        {/* Tên phiếu */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold uppercase mb-2">
            PHIẾU KẾT QUẢ THỰC TẬP TRẮC ĐỊA
          </h1>
          <h2 className="text-lg font-bold">BUỔI {session.id}: {session.title}</h2>
        </div>

        {/* Phần I: Thông tin chung */}
        <div className="mb-6">
          <h3 className="font-bold border-b-2 border-black mb-3 pb-1 text-base">
            I. THÔNG TIN CHUNG
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="font-bold">Họ và tên sinh viên:</span> {user.hoten}</p>
            <p><span className="font-bold">Mã số sinh viên:</span> {user.mssv}</p>
            <p><span className="font-bold">Lớp:</span> {user.lop}</p>
            <p><span className="font-bold">Giảng viên hướng dẫn:</span> ThS. Đỗ Ngọc Thanh</p>
            <p className="col-span-2"><span className="font-bold">Thời gian chốt số liệu:</span> {submitTime}</p>
          </div>
        </div>

        {/* Phần II: Kết quả đo đạc (Tự động lặp qua các dữ liệu sinh viên đã nhập) */}
        <div className="mb-6">
          <h3 className="font-bold border-b-2 border-black mb-3 pb-1 text-base">
            II. BẢNG SỐ LIỆU ĐO ĐẠC & TÍNH TOÁN
          </h3>
          <table className="w-full border-collapse border border-black text-sm text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 w-1/2">Đại lượng đo / Cấu kiện</th>
                <th className="border border-black p-2 w-1/2">Trị số thực địa</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(data).length > 0 ? (
                Object.entries(data).map(([key, value], index) => (
                  <tr key={index}>
                    <td className="border border-black p-2 font-medium">{key}</td>
                    <td className="border border-black p-2">{value}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="border border-black p-4 text-gray-500 italic">
                    Chưa có dữ liệu đo đạc được ghi nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phần III: Tự đánh giá và Xác nhận */}
        <div className="mb-12">
          <h3 className="font-bold border-b-2 border-black mb-3 pb-1 text-base">
            III. XÁC NHẬN CỦA SINH VIÊN
          </h3>
          <p className="text-sm italic mb-4">
            Tôi cam đoan các số liệu trên được đo đạc và tính toán trung thực tại hiện trường, không sao chép từ cá nhân/nhóm khác. Nếu sai phạm tôi xin chịu điểm 0 cho toàn bộ học phần.
          </p>
        </div>

        {/* Chữ ký */}
        <div className="flex justify-between mt-8 text-sm">
          <div className="text-center w-1/2">
            <p className="font-bold mb-16">NHẬN XÉT CỦA GIẢNG VIÊN</p>
            <p className="italic text-gray-400">(Ký và ghi rõ họ tên)</p>
          </div>
          <div className="text-center w-1/2">
            <p className="italic mb-1">TP. Hồ Chí Minh, ngày ... tháng ... năm 20...</p>
            <p className="font-bold mb-16">SINH VIÊN THỰC HIỆN</p>
            <p className="font-bold">{user.hoten}</p>
          </div>
        </div>

        {/* Footer in mã tự động chống gian lận */}
        <div className="mt-16 pt-2 border-t border-dashed border-gray-400 text-xs text-gray-500 text-right">
          Mã xác thực hệ thống: {user.mssv}-{Date.now().toString().slice(-6)}
        </div>
      </div>
    );
  }
);

PDFDocument.displayName = "PDFDocument";
export default PDFDocument;
