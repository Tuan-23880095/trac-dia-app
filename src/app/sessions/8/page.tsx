"use client";

import { useState, useRef, useEffect } from "react";
import Formula from "@/components/Formula";
import PDFDocument from "@/components/PDFDocument";
import html2pdf from "html2pdf.js";
import { fetchGAS } from "@/lib/api";

export default function Session8Page() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({
    base_elevation: "10.000", // Cao độ gốc giả định ban đầu (m)
    
    // Chênh cao đo được ở Buổi 7 (mm)
    h_do_1: "", h_do_2: "", h_do_3: "",
    
    // Số hiệu chỉnh do sinh viên tự phân bổ (mm)
    v_1: "", v_2: "", v_3: "",
    
    // Các giá trị hệ thống tự tính
    fh_total: 0,
    v_total: 0,
    hc_1: 0, hc_2: 0, hc_3: 0,
    H_1: 0, H_2: 0, H_final: 0,
    
    // Trạng thái kiểm duyệt
    is_v_valid: false,
    is_h_valid: false,
    has_input: false
  });
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Thuật toán Bình sai lưới tuyến kín
  useEffect(() => {
    const h1 = parseFloat(data.h_do_1) || 0;
    const h2 = parseFloat(data.h_do_2) || 0;
    const h3 = parseFloat(data.h_do_3) || 0;
    
    const v1 = parseFloat(data.v_1) || 0;
    const v2 = parseFloat(data.v_2) || 0;
    const v3 = parseFloat(data.v_3) || 0;

    const H_base = parseFloat(data.base_elevation) || 10.000;

    const fh = h1 + h2 + h3;
    const sum_v = v1 + v2 + v3;

    // Tính chênh cao sau bình sai (h_hc = h_do + v)
    const hc1 = h1 + v1;
    const hc2 = h2 + v2;
    const hc3 = h3 + v3;

    // Tính cao độ truyền chuyền (H_i = H_i-1 + h_hc / 1000)
    // Lưu ý: h_hc đơn vị mm, H đơn vị mét nên phải chia 1000
    const H1 = H_base + (hc1 / 1000);
    const H2 = H1 + (hc2 / 1000);
    const H_final = H2 + (hc3 / 1000);

    // KIỂM TRA ĐIỀU KIỆN QC (ANTI-CHEAT)
    // 1. Tổng v phải bằng ngược dấu với fh
    const v_valid = (fh !== 0) && (sum_v === -fh);
    // 2. Cao độ cuối cùng phải khép đúng về cao độ gốc ban đầu
    const h_valid = Math.abs(H_final - H_base) < 0.001; // Sai số làm tròn cho phép

    setData(prev => ({
      ...prev,
      fh_total: Number(fh.toFixed(2)),
      v_total: Number(sum_v.toFixed(2)),
      hc_1: Number(hc1.toFixed(2)),
      hc_2: Number(hc2.toFixed(2)),
      hc_3: Number(hc3.toFixed(2)),
      H_1: Number(H1.toFixed(3)),
      H_2: Number(H2.toFixed(3)),
      H_final: Number(H_final.toFixed(3)),
      is_v_valid: v_valid,
      is_h_valid: h_valid,
      has_input: h1 !== 0 || h2 !== 0 || h3 !== 0
    }));
  }, [data.h_do_1, data.h_do_2, data.h_do_3, data.v_1, data.v_2, data.v_3, data.base_elevation]);

  const handleInputChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const exportPDF = () => {
    const opt = {
      margin: 10, filename: `Buoi8_BinhSai_${user?.mssv}.pdf`,
      html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  const handleSubmit = async () => {
    if (!data.is_v_valid || !data.is_h_valid) {
      alert("LỖI BÌNH SAI: Tổng số hiệu chỉnh V chưa triệt tiêu hết sai số khép fh, HOẶC cao độ khép về không khớp với mốc gốc. Vui lòng kiểm tra lại phép tính!");
      return;
    }
    const res = await fetchGAS("SUBMIT_FORM", { mssv: user.mssv, buoiHoc: 8, dataJson: data });
    if (res.status === "success") alert("Hoàn thành nội nghiệp! Kết quả bình sai đã được lưu trữ an toàn.");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
      <header className="border-b-4 border-indigo-600 pb-4">
        <h1 className="text-3xl font-black text-gray-900 uppercase">Buổi 8: Bình sai lưới thủy chuẩn</h1>
        <p className="text-gray-500 font-medium">Nội nghiệp phân bổ sai số khép $f_h$ và tính toán cao độ cuối cùng của tuyến đo.</p>
      </header>

      {/* Box Lý thuyết & Công thức */}
      <section className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h2 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <span className="bg-indigo-100 p-1 rounded">💻</span> Nguyên lý Bình sai gần đúng
          </h2>
          <p className="text-indigo-900 text-sm leading-relaxed text-justify mb-4">
            Bình sai là quá trình "chia đều" phần sai số khép ($f_h$) của tuyến đo ngược lại cho các trạm đo. Tại Buổi 8, bạn dùng số liệu thực địa ở Buổi 7 để phân bổ.
          </p>
          <div className="bg-white p-3 rounded-xl border border-indigo-200">
            <p className="text-xs font-bold text-red-600 uppercase mb-1">Quy tắc vàng bắt buộc:</p>
            <Formula tex="\sum V_{hi} = -f_h" block />
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-indigo-200 text-center flex flex-col justify-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Chênh cao bình sai (mm)</p>
            <Formula tex="h_{hc} = h_{đo} + v_{i}" block />
          </div>
          <div className="bg-white p-4 rounded-xl border border-indigo-200 text-center flex flex-col justify-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Truyền Cao độ (m)</p>
            <Formula tex="H_{i} = H_{i-1} + \frac{h_{hc}}{1000}" block />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* BẢNG BÌNH SAI CỐT LÕI */}
        <div className="xl:col-span-3 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
            <span className="font-bold tracking-widest uppercase text-sm">Bảng tính Bình sai Tuyến kín</span>
            <div className="flex items-center gap-2 text-sm bg-gray-800 px-3 py-1 rounded-lg">
              <span>Cao độ gốc {"$H_A$"}:</span>
              <input name="base_elevation" value={data.base_elevation} onChange={handleInputChange} className="w-20 bg-transparent text-yellow-400 font-bold outline-none text-right border-b border-gray-600" />
              <span>m</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead className="bg-gray-100 text-gray-600 text-[11px] uppercase font-bold">
                <tr>
                  <th className="p-4 w-1/6">Trạm đo</th>
                  <th className="p-4 w-1/6 border-l">Chênh cao đo $h$ (mm)</th>
                  <th className="p-4 w-1/6 border-l bg-indigo-50 text-indigo-700">Hiệu chỉnh $v$ (mm)</th>
                  <th className="p-4 w-1/6 border-l">Chênh cao BS {"$h_{hc}$"} (mm)</th>
                  <th className="p-4 w-1/6 border-l">Tên mốc</th>
                  <th className="p-4 w-1/6 border-l bg-green-50 text-green-700">Cao độ $H$ (m)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Dòng Mốc gốc */}
                <tr className="border-b">
                  <td colSpan={4} className="p-3 bg-gray-50"></td>
                  <td className="p-3 font-bold border-l">Mốc A</td>
                  <td className="p-3 font-mono font-bold text-green-600 border-l bg-green-50/30">{Number(data.base_elevation).toFixed(3)}</td>
                </tr>
                
                {/* Trạm 1 */}
                <tr className="border-b">
                  <td className="p-3 font-bold text-gray-500">Trạm 1</td>
                  <td className="p-3 border-l"><input name="h_do_1" type="number" onChange={handleInputChange} className="w-full text-center outline-none bg-transparent" placeholder="Nhập h1" /></td>
                  <td className="p-3 border-l bg-indigo-50/50"><input name="v_1" type="number" onChange={handleInputChange} className="w-full text-center outline-none bg-transparent font-bold text-indigo-600" placeholder="Nhập v1" /></td>
                  <td className="p-3 border-l font-mono font-bold">{data.hc_1 !== 0 ? data.hc_1 : "-"}</td>
                  <td className="p-3 border-l text-gray-400">Mốc 1</td>
                  <td className="p-3 font-mono font-bold text-green-600 border-l bg-green-50/30">{data.H_1 !== 0 ? data.H_1 : "-"}</td>
                </tr>

                {/* Trạm 2 */}
                <tr className="border-b">
                  <td className="p-3 font-bold text-gray-500">Trạm 2</td>
                  <td className="p-3 border-l"><input name="h_do_2" type="number" onChange={handleInputChange} className="w-full text-center outline-none bg-transparent" placeholder="Nhập h2" /></td>
                  <td className="p-3 border-l bg-indigo-50/50"><input name="v_2" type="number" onChange={handleInputChange} className="w-full text-center outline-none bg-transparent font-bold text-indigo-600" placeholder="Nhập v2" /></td>
                  <td className="p-3 border-l font-mono font-bold">{data.hc_2 !== 0 ? data.hc_2 : "-"}</td>
                  <td className="p-3 border-l text-gray-400">Mốc 2</td>
                  <td className="p-3 font-mono font-bold text-green-600 border-l bg-green-50/30">{data.H_2 !== 0 ? data.H_2 : "-"}</td>
                </tr>

                {/* Trạm 3 */}
                <tr className="border-b border-black">
                  <td className="p-3 font-bold text-gray-500">Trạm 3</td>
                  <td className="p-3 border-l"><input name="h_do_3" type="number" onChange={handleInputChange} className="w-full text-center outline-none bg-transparent" placeholder="Nhập h3" /></td>
                  <td className="p-3 border-l bg-indigo-50/50"><input name="v_3" type="number" onChange={handleInputChange} className="w-full text-center outline-none bg-transparent font-bold text-indigo-600" placeholder="Nhập v3" /></td>
                  <td className="p-3 border-l font-mono font-bold">{data.hc_3 !== 0 ? data.hc_3 : "-"}</td>
                  <td className="p-3 font-bold border-l">Mốc A (Khép)</td>
                  <td className={`p-3 font-mono font-black border-l bg-green-50/30 ${data.is_h_valid ? 'text-green-600' : 'text-red-500'}`}>{data.H_final !== 0 ? data.H_final : "-"}</td>
                </tr>

                {/* Dòng Tổng cộng */}
                <tr className="bg-gray-100 font-bold">
                  <td className="p-4 text-gray-700 uppercase text-xs">Tổng cộng {"$\sum$"}</td>
                  <td className={`p-4 border-l font-mono ${data.fh_total !== 0 ? 'text-gray-900' : 'text-gray-400'}`}>$f_h$ = {data.fh_total}</td>
                  <td className={`p-4 border-l font-mono ${data.is_v_valid ? 'text-indigo-600' : 'text-red-500'}`}>$\sum V$ = {data.v_total}</td>
                  <td className="p-4 border-l font-mono">0</td>
                  <td colSpan={2} className="p-4 border-l"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* BẢNG ĐIỀU KHIỂN QC (Anti-Cheat) */}
        <div className="space-y-4">
          <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-2xl space-y-6">
            <h3 className="text-indigo-400 text-xs font-black uppercase tracking-widest border-b border-gray-700 pb-3">
              Trạng thái Bình sai
            </h3>
            
            {/* Rule 1: Tổng V = -fh */}
            <div className={`p-4 rounded-xl border-2 ${data.has_input && data.is_v_valid ? 'bg-green-900/50 border-green-500/50' : data.has_input && !data.is_v_valid ? 'bg-red-900/50 border-red-500' : 'bg-gray-800 border-gray-700'}`}>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex justify-between">
                <span>Điều kiện 1: Triệt tiêu $f_h$</span>
                {data.has_input && (data.is_v_valid ? <span className="text-green-400">ĐẠT</span> : <span className="text-red-400 animate-pulse">LỖI</span>)}
              </p>
              <div className="font-mono text-sm">
                <p>Sai số khép $f_h$ = {data.fh_total}</p>
                <p>Tổng hiệu chỉnh = {data.v_total}</p>
              </div>
            </div>

            {/* Rule 2: Cao độ khép */}
            <div className={`p-4 rounded-xl border-2 ${data.has_input && data.is_h_valid ? 'bg-green-900/50 border-green-500/50' : data.has_input && !data.is_h_valid ? 'bg-red-900/50 border-red-500' : 'bg-gray-800 border-gray-700'}`}>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex justify-between">
                <span>Điều kiện 2: Khép cao độ</span>
                {data.has_input && (data.is_h_valid ? <span className="text-green-400">ĐẠT</span> : <span className="text-red-400 animate-pulse">LỖI</span>)}
              </p>
              <div className="font-mono text-sm">
                <p>{"$H_{gốc}$"} = {Number(data.base_elevation).toFixed(3)}</p>
                <p>{"$H_{cuối}$"} = {data.H_final.toFixed(3)}</p>
              </div>
            </div>
          </div>

          <button onClick={exportPDF} className="w-full py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm text-gray-700">
            XUẤT BẢNG BÌNH SAI (PDF)
          </button>
          
          <button 
            onClick={handleSubmit} 
            disabled={!data.is_v_valid || !data.is_h_valid}
            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all text-sm uppercase tracking-wider ${data.is_v_valid && data.is_h_valid ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {data.is_v_valid && data.is_h_valid ? "Nộp kết quả Nội nghiệp" : "Chưa đạt điều kiện QC"}
          </button>
        </div>
      </div>

      <div className="hidden">
        <PDFDocument ref={pdfRef} user={user} session={{id: "8", title: "Bình sai lưới thủy chuẩn (Nội nghiệp)"}} data={data} submitTime={new Date().toLocaleString()} />
      </div>
    </div>
  );
}
