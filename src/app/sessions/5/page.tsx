"use client";

import { useState, useRef, useEffect } from "react";
import Formula from "@/components/Formula";
import PDFDocument from "@/components/PDFDocument";
 
import { fetchGAS } from "@/lib/api";

export default function Session5Page() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({
    target_name: "Cọc tiêu B",
    // Số đọc chỉ mia (mm)
    cT: "", cG: "", cD: "",
    // Góc đứng (đã tính từ buổi 4)
    v_angle: "", 
    // Khoảng cách đo bằng thước dây (m)
    tape_distance: "",
    // Kết quả tính toán tự động
    n_stadia: 0,
    optical_distance: 0,
    error_delta: 0,
    is_valid: true
  });
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Logic tự động tính toán và kiểm tra sai số (QC)
  useEffect(() => {
    const cT = parseFloat(data.cT) || 0;
    const cD = parseFloat(data.cD) || 0;
    const V = parseFloat(data.v_angle) || 0;
    const S_thiet_bi = parseFloat(data.tape_distance) || 0;

    if (cT && cD) {
      // 1. Tính khoảng chênh n (mm)
      const n = cT - cD;
      
      // 2. Tính khoảng cách quang học (m)
      // Công thức: S = 100 * (n/1000) * cos^2(V)
      const vRad = (V * Math.PI) / 180;
      const S_quang_hoc = (n / 1000) * 100 * Math.pow(Math.cos(vRad), 2);
      
      // 3. Tính sai lệch delta S
      const delta = Math.abs(S_quang_hoc - S_thiet_bi);
      
      setData(prev => ({
        ...prev,
        n_stadia: n,
        optical_distance: Number(S_quang_hoc.toFixed(3)),
        error_delta: Number(delta.toFixed(3)),
        // Sai số cho phép thường là 0.15m (15cm) cho khoảng cách ngắn
        is_valid: S_thiet_bi > 0 ? delta <= 0.15 : true
      }));
    }
  }, [data.cT, data.cD, data.v_angle, data.tape_distance]);

  const handleInputChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

const exportPDF = async () => {     // Tải thư viện động chỉ khi người dùng bấm nút     
    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin: 10,
      filename: `Buoi5_DoDaiQuangHoc_${user?.mssv}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  const handleSubmit = async () => {
    if (!data.is_valid) {
      alert("Sai số giữa đo quang học và thước dây quá lớn (>15cm). Vui lòng kiểm tra lại số đọc mia!");
      return;
    }
    const res = await fetchGAS("SUBMIT_FORM", {
      mssv: user.mssv,
      buoiHoc: 5,
      dataJson: data
    });
    if (res.status === "success") alert("Nộp bài Buổi 5 thành công!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      <header className="border-b-4 border-emerald-600 pb-4">
        <h1 className="text-3xl font-black text-gray-900 uppercase">Buổi 5: Đo dài bằng chỉ lượng cự</h1>
        <p className="text-gray-500 font-medium">Sử dụng hệ thống màng dây chữ thập để xác định khoảng cách gián tiếp.</p>
      </header>

      {/* Hướng dẫn công thức LaTeX */}
      <section className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100 shadow-sm">
        <h2 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
          <span className="bg-emerald-100 p-1 rounded">📏</span> Nguyên lý đo dài quang học
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-emerald-900">
          <div className="space-y-4">
            <p className="text-sm">Khoảng cách nằm ngang từ máy đến điểm dựng mia được tính theo công thức:</p>
            <Formula tex="S_{AB} = 100 \cdot n \cdot \cos^2 V" block />
            <p className="text-xs italic">* Trong đó: n = (c_T - c_D) tính bằng mét.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl text-xs space-y-2 border border-emerald-200">
            <p className="font-bold text-emerald-700 uppercase">Yêu cầu kiểm tra (QC):</p>
            <p>Sau khi tính được <Formula tex="S_{quang hoc}" />, sinh viên dùng thước dây đo trực tiếp để đối chứng. Sai số cho phép:</p>
            <Formula tex="\Delta S = |S_{qh} - S_{thước}| \le 0.15m" block />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form nhập số liệu */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h3 className="font-bold text-lg mb-6 text-gray-800">Số liệu thực địa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Chỉ trên cT (mm)</label>
                  <input name="cT" type="number" onChange={handleInputChange} className="w-full text-xl font-mono border-b-2 focus:border-emerald-600 outline-none pb-2" placeholder="VD: 1650" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Chỉ dưới cD (mm)</label>
                  <input name="cD" type="number" onChange={handleInputChange} className="w-full text-xl font-mono border-b-2 focus:border-emerald-600 outline-none pb-2" placeholder="VD: 1450" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Góc đứng V (độ)</label>
                  <input name="v_angle" type="number" onChange={handleInputChange} className="w-full text-xl font-mono border-b-2 focus:border-emerald-600 outline-none pb-2" placeholder="VD: 2.5" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Đo bằng thước dây (m)</label>
                  <input name="tape_distance" type="number" onChange={handleInputChange} className="w-full text-xl font-mono border-b-2 focus:border-emerald-600 outline-none pb-2" placeholder="VD: 19.95" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bảng kết quả so sánh */}
        <div className="space-y-4">
          <div className={`p-8 rounded-3xl shadow-2xl transition-colors ${data.is_valid ? 'bg-gray-900' : 'bg-red-900'} text-white`}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-emerald-400 text-xs font-black uppercase tracking-widest">Đối chiếu kết quả</h3>
              {!data.is_valid && <span className="bg-white text-red-600 text-[10px] font-bold px-2 py-1 rounded">SAI SỐ CAO!</span>}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold">Khoảng chênh n</p>
                <p className="text-2xl font-mono">{data.n_stadia} mm</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold">K/c Quang học (S_qh)</p>
                <p className="text-3xl font-mono font-black text-emerald-400">{data.optical_distance} m</p>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-bold">Sai lệch (ΔS)</p>
                <p className={`text-3xl font-mono font-black ${data.is_valid ? 'text-white' : 'text-red-400 animate-pulse'}`}>
                  {data.error_delta} m
                </p>
              </div>
            </div>
          </div>

          <button onClick={exportPDF} className="w-full py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm">XUẤT PHIẾU PDF</button>
          <button 
            onClick={handleSubmit} 
            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all text-sm ${data.is_valid ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
          >
            NỘP BÀI THỰC HÀNH
          </button>
        </div>
      </div>

      <div className="hidden">
        <PDFDocument ref={pdfRef} user={user} session={{id: "5", title: "Đo dài bằng chỉ lượng cự"}} data={data} submitTime={new Date().toLocaleString()} />
      </div>
    </div>
  );
}
