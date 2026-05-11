"use client";

import { useState, useRef, useEffect } from "react";
import Formula from "@/components/Formula";
import PDFDocument from "@/components/PDFDocument";
import html2pdf from "html2pdf.js";
import { fetchGAS } from "@/lib/api";

export default function Session1Page() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({
    machine_type: "Máy kinh vĩ điện tử",
    target_desc: "",
    part_1: "", part_2: "", part_3: "", part_4: "", part_5: "",
    val_1: "", val_2: "", val_3: "",
    val_avg: 0
  });
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Tự động tính trung bình khi số liệu thay đổi
  useEffect(() => {
    const v1 = parseFloat(data.val_1) || 0;
    const v2 = parseFloat(data.val_2) || 0;
    const v3 = parseFloat(data.val_3) || 0;
    if (v1 && v2 && v3) {
      setData(prev => ({ ...prev, val_avg: Number(((v1 + v2 + v3) / 3).toFixed(4)) }));
    }
  }, [data.val_1, data.val_2, data.val_3]);

  const handleInputChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const exportPDF = () => {
    const opt = {
      margin: 10, filename: `Buoi1_${user?.mssv}.pdf`,
      html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  const handleSubmit = async () => {
    const res = await fetchGAS("SUBMIT_FORM", { mssv: user.mssv, buoiHoc: 1, dataJson: data });
    if (res.status === "success") alert("Nộp bài thành công!");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Buổi 1: Giới thiệu máy Kinh vĩ & Thủy bình</h1>
        <p className="text-gray-500">Nhận diện cấu tạo và thực hành ngắm bắt mục tiêu 3 lần.</p>
      </header>

      <section className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <h2 className="font-bold text-blue-800 mb-2">💡 Hướng dẫn nhanh</h2>
        <p className="text-sm text-blue-700">
          Thực hiện ngắm mục tiêu 3 lần độc lập. Giá trị trung bình được tính theo:
          <Formula tex="\bar{X} = \frac{x_1 + x_2 + x_3}{3}" block />
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4">I. Nhận diện cấu tạo</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i}>
                  <label className="text-xs font-bold text-gray-400 uppercase">Bộ phận số {i}</label>
                  <input name={`part_${i}`} onChange={handleInputChange} className="w-full border-b focus:border-blue-500 outline-none py-1" placeholder="..." />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4">II. Số liệu ngắm thử nghiệm</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <label className="text-xs font-bold text-gray-400">Lần {i}</label>
                  <input name={`val_${i}`} type="number" onChange={handleInputChange} className="w-full border p-2 rounded" />
                </div>
              ))}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <span className="font-bold text-sm">TRUNG BÌNH:</span>
              <span className="text-blue-600 font-mono font-bold text-lg">{data.val_avg}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={exportPDF} className="flex-1 bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-all">XUẤT PDF</button>
            <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg transition-all">NỘP BÀI</button>
          </div>
        </div>
      </div>

      <div className="hidden">
        <PDFDocument ref={pdfRef} user={user} session={{id: "1", title: "Giới thiệu máy"}} data={data} submitTime={new Date().toLocaleString()} />
      </div>
    </div>
  );
}
