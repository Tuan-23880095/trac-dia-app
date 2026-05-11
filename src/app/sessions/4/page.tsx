"use client";

import { useState, useRef, useEffect } from "react";
import Formula from "@/components/Formula";
import PDFDocument from "@/components/PDFDocument";

import { fetchGAS } from "@/lib/api";

export default function Session4Page() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({
    inst_height_i: "", // Chiều cao máy (mm)
    target_A: "Mốc A",
    target_B: "Điểm đo B",
    // Số đọc mia
    cT: "", cG: "", cD: "",
    // Góc đo
    mo_val: "90", // Mặc định MO thường là 90 hoặc 270 tùy máy
    z_val: "",
    // Kết quả tính toán tự động
    v_angle: 0,
    d_distance: 0,
    h_elevation: 0
  });
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Hệ thống tính toán tự động (Logic xử lý số liệu Trắc địa)
  useEffect(() => {
    const i = parseFloat(data.inst_height_i) / 1000 || 0; // Đổi mm sang m
    const cT = parseFloat(data.cT) / 1000 || 0;
    const cG = parseFloat(data.cG) / 1000 || 0;
    const cD = parseFloat(data.cD) / 1000 || 0;
    const Z = parseFloat(data.z_val) || 0;
    const MO = parseFloat(data.mo_val) || 90;

    if (Z && cT && cD && i) {
      // 1. Tính góc đứng V (độ thập phân)
      const V = MO - Z;
      const vRad = (V * Math.PI) / 180;

      // 2. Tính khoảng cách ngang D
      // D = (cT - cD) * 100 * cos^2(V)
      const D = (cT - cD) * 100 * Math.pow(Math.cos(vRad), 2);

      // 3. Tính chênh cao h
      // h = i + D * tan(V) - cG
      const h = i + D * Math.tan(vRad) - cG;

      setData(prev => ({
        ...prev,
        v_angle: Number(V.toFixed(4)),
        d_distance: Number(D.toFixed(3)),
        h_elevation: Number(h.toFixed(3))
      }));
    }
  }, [data.z_val, data.cT, data.cG, data.cD, data.inst_height_i, data.mo_val]);

  const handleInputChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

const exportPDF = async () => {     // Tải thư viện động chỉ khi người dùng bấm nút     
    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin: 10,
      filename: `Buoi4_DoCaoLuongGiac_${user?.mssv}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  const handleSubmit = async () => {
    const res = await fetchGAS("SUBMIT_FORM", {
      mssv: user.mssv,
      buoiHoc: 4,
      dataJson: data
    });
    if (res.status === "success") alert("Dữ liệu Buổi 4 đã được lưu trữ thành công!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      <header className="border-b-4 border-blue-600 pb-4">
        <h1 className="text-3xl font-black text-gray-900 uppercase">Buổi 4: Đo góc đứng & Cao lượng giác</h1>
        <p className="text-gray-500 font-medium">Xác định chênh cao giữa trạm máy và điểm dựng mia thông qua góc thiên đỉnh.</p>
      </header>

      {/* Section Hướng dẫn & Công thức (KaTeX) */}
      <section className="bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-sm space-y-4">
        <h2 className="font-bold text-blue-700 flex items-center gap-2">
          <span className="bg-blue-100 p-1 rounded">📐</span> Hệ thống công thức tính toán
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-2xl border">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase">1. Góc đứng</p>
            <Formula tex="V = MO - Z" block />
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase">2. Khoảng cách ngang</p>
            <Formula tex="D = (c_T - c_D) \cdot 100 \cdot \cos^2 V" block />
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase">3. Chênh cao</p>
            <Formula tex="h_{AB} = i + D \cdot \tan V - c_G" block />
          </div>
        </div>
      </section>

      {/* Form Nhập liệu thực địa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              Thông số trạm máy & Điểm đo
            </h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Chiều cao máy i (mm)</label>
                <input name="inst_height_i" type="number" onChange={handleInputChange} className="w-full text-xl font-mono border-b-2 focus:border-blue-600 outline-none pb-2" placeholder="VD: 1450" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Góc MO máy (độ)</label>
                <input name="mo_val" type="number" value={data.mo_val} onChange={handleInputChange} className="w-full text-xl font-mono border-b-2 focus:border-blue-600 outline-none pb-2" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Góc Z (độ)</label>
                  <input name="z_val" type="number" onChange={handleInputChange} className="w-full p-3 bg-blue-50 rounded-xl border-2 border-blue-100 text-blue-900 font-bold" placeholder="0.0000" />
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Chỉ trên (mm)</label>
                    <input name="cT" type="number" onChange={handleInputChange} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Chỉ giữa (mm)</label>
                    <input name="cG" type="number" onChange={handleInputChange} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Chỉ dưới (mm)</label>
                    <input name="cD" type="number" onChange={handleInputChange} className="w-full p-3 border rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột hiển thị kết quả Real-time */}
        <div className="space-y-4">
          <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl space-y-6">
            <h3 className="text-blue-400 text-xs font-black uppercase tracking-widest">Kết quả Web tính toán</h3>
            <div>
              <p className="text-gray-500 text-xs uppercase font-bold">Góc đứng V</p>
              <p className="text-3xl font-mono font-black">{data.v_angle}°</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase font-bold">Khoảng cách ngang D</p>
              <p className="text-3xl font-mono font-black text-yellow-400">{data.d_distance} m</p>
            </div>
            <div className="pt-4 border-t border-gray-800">
              <p className="text-gray-500 text-xs uppercase font-bold">Chênh cao h</p>
              <p className="text-4xl font-mono font-black text-green-400">{data.h_elevation} m</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button onClick={exportPDF} className="w-full py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all">XUẤT PHIẾU A4</button>
            <button onClick={handleSubmit} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">NỘP BÀI THỰC HÀNH</button>
          </div>
        </div>
      </div>

      <div className="hidden">
        <PDFDocument ref={pdfRef} user={user} session={{id: "4", title: "Đo cao lượng giác & Góc đứng"}} data={data} submitTime={new Date().toLocaleString()} />
      </div>
    </div>
  );
}
