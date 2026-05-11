"use client";
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { fetchGAS } from "@/lib/api";

export default function SessionPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState({ cT: "", cG: "", cD: "" });
  const pdfRef = useRef<HTMLDivElement>(null);

  // Tính năng Auto-save nội bộ (Zustand hoặc LocalStorage)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { ...data, [e.target.name]: e.target.value };
    setData(newData);
    localStorage.setItem(`autosave_session_${params.id}`, JSON.stringify(newData));
  };

  const exportPDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin:       10,
      filename:     `Phieu_Thuc_Tap_Buoi_${params.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleSubmit = async () => {
    // Logic validate Toán học (VD: cG = (cT + cD)/2)
    const result = await fetchGAS("SUBMIT_FORM", {
      mssv: "12345678", // Lấy từ User State
      type: "CaNhan",
      buoiHoc: params.id,
      dataJson: data,
    });
    if (result.status === "success") alert("Nộp bài thành công!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-4">
        <button onClick={exportPDF} className="bg-blue-600 text-white px-4 py-2 rounded">Xuất PDF Minh Chứng</button>
        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Nộp Bài Lên Hệ Thống</button>
      </div>

      {/* GIAO DIỆN FORM NHẬP LIỆU */}
      <div className="grid grid-cols-3 gap-4 border p-4 bg-white shadow-sm">
        <input name="cT" placeholder="Chỉ trên (mm)" onChange={handleInputChange} className="border p-2" />
        <input name="cG" placeholder="Chỉ giữa (mm)" onChange={handleInputChange} className="border p-2" />
        <input name="cD" placeholder="Chỉ dưới (mm)" onChange={handleInputChange} className="border p-2" />
      </div>

      {/* TEMPLATE BẢN IN PDF (Thường bị ẩn trên giao diện web, chỉ hiển thị lúc in) */}
      <div className="hidden">
        <div ref={pdfRef} className="p-8 bg-white text-black text-sm">
          <div className="text-center font-bold mb-6">
            <p>TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN - ĐHQG HCM</p>
            <p>KHOA ĐỊA CHẤT - BỘ MÔN ĐCTV & ĐCCT</p>
            <h2 className="text-xl mt-4">PHIẾU KẾT QUẢ THỰC TẬP TRẮC ĐỊA</h2>
            <p>BUỔI {params.id}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-bold border-b border-black mb-2">I. THÔNG TIN CHUNG</h3>
            <p>Họ và tên: Nguyễn Văn A - MSSV: 12345678</p>
            <p>Thời gian nộp bài: {new Date().toLocaleString()}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold border-b border-black mb-2">II. KẾT QUẢ ĐO ĐẠC</h3>
            <table className="w-full border-collapse border border-black text-center mt-2">
              <thead>
                <tr>
                  <th className="border border-black p-1">Chỉ trên (cT)</th>
                  <th className="border border-black p-1">Chỉ giữa (cG)</th>
                  <th className="border border-black p-1">Chỉ dưới (cD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1">{data.cT}</td>
                  <td className="border border-black p-1">{data.cG}</td>
                  <td className="border border-black p-1">{data.cD}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
