"use client";

import { useState, useRef, useEffect } from "react";
import Formula from "@/components/Formula";
import PDFDocument from "@/components/PDFDocument";
import html2pdf from "html2pdf.js";
import { fetchGAS } from "@/lib/api";

export default function Session6Page() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({
    station_name: "Trạm K1",
    point_bs: "Mốc A (Sau)",
    point_fs: "Điểm B (Trước)",
    // Số liệu 3 lần đo (đơn vị: mm)
    bs_1: "", fs_1: "", h_1: 0,
    bs_2: "", fs_2: "", h_2: 0,
    bs_3: "", fs_3: "", h_3: 0,
    // Kết quả tổng hợp
    h_avg: 0,
    max_diff: 0,
    is_valid: true
  });
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Thuật toán QC: Tự động tính chênh cao và bẫy lỗi Anti-Cheat
  useEffect(() => {
    const calcH = (bs: string, fs: string) => {
      const s = parseFloat(bs) || 0;
      const t = parseFloat(fs) || 0;
      return (s && t) ? (s - t) : 0;
    };

    const h1 = calcH(data.bs_1, data.fs_1);
    const h2 = calcH(data.bs_2, data.fs_2);
    const h3 = calcH(data.bs_3, data.fs_3);

    // Chỉ kiểm tra lỗi khi đã nhập đủ ít nhất 2 lần đo
    let valid = true;
    let maxDiff = 0;
    let avg = 0;

    const validHeights = [h1, h2, h3].filter(h => h !== 0);
    if (validHeights.length > 0) {
      const maxH = Math.max(...validHeights);
      const minH = Math.min(...validHeights);
      maxDiff = maxH - minH;
      avg = validHeights.reduce((a, b) => a + b, 0) / validHeights.length;
      
      // Sai số cho phép giữa các lần đo chênh cao thường là <= 3mm
      if (validHeights.length >= 2 && maxDiff > 3) {
        valid = false;
      }
    }

    setData(prev => ({
      ...prev,
      h_1: h1, h_2: h2, h_3: h3,
      h_avg: Number(avg.toFixed(2)),
      max_diff: maxDiff,
      is_valid: valid
    }));
  }, [data.bs_1, data.fs_1, data.bs_2, data.fs_2, data.bs_3, data.fs_3]);

  const handleInputChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const exportPDF = () => {
    const opt = {
      margin: 10,
      filename: `Buoi6_ThuyBinh_${user?.mssv}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  const handleSubmit = async () => {
    if (!data.is_valid) {
      alert("CẢNH BÁO: Biên độ sai lệch giữa các lần đo lớn hơn 3mm. Dữ liệu không đạt chuẩn QC. Yêu cầu sinh viên ngắm và đọc lại số mia!");
      return;
    }
    const res = await fetchGAS("SUBMIT_FORM", {
      mssv: user.mssv,
      buoiHoc: 6,
      dataJson: data
    });
    if (res.status === "success") alert("Nộp bài Buổi 6 thành công! Dữ liệu đã được khóa.");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      <header className="border-b-4 border-cyan-600 pb-4">
        <h1 className="text-3xl font-black text-gray-900 uppercase">Buổi 6: Đo chênh cao bằng máy thủy bình</h1>
        <p className="text-gray-500 font-medium">Áp dụng phương pháp đo cao hình học từ giữa để triệt tiêu sai số góc i.</p>
      </header>

      {/* Khu vực Hướng dẫn & Công thức */}
      <section className="bg-cyan-50 p-6 rounded-3xl border-2 border-cyan-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-4">
          <h2 className="font-bold text-cyan-800 flex items-center gap-2">
            <span className="bg-cyan-100 p-1 rounded text-xl">🔭</span> Công thức nội nghiệp
          </h2>
          <p className="text-cyan-900 text-sm leading-relaxed">
            Chênh cao giữa điểm Sau ($A$) và điểm Trước ($B$) được tính bằng hiệu số đọc chỉ giữa của hai mia.
            Để đảm bảo độ chính xác, sinh viên làm lệch bọt thủy và cân lại máy để đo 3 lần độc lập.
          </p>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="bg-white p-4 rounded-2xl border border-cyan-200 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Chênh cao 1 lần đo</p>
            <Formula tex="h = S - T" block />
          </div>
          <div className="bg-white p-4 rounded-2xl border border-cyan-200 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Chênh cao trung bình</p>
            <Formula tex="h_{tb} = \frac{h_1 + h_2 + h_3}{3}" block />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Nhập liệu Bảng (Table format) */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">Sổ đo cao hình học</h3>
            <input name="station_name" value={data.station_name} onChange={handleInputChange} className="text-right bg-transparent font-bold text-cyan-700 outline-none border-b border-cyan-300" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead className="bg-gray-900 text-white text-xs uppercase tracking-widest">
                <tr>
                  <th className="p-4 w-1/4">Lần đo</th>
                  <th className="p-4 border-l border-gray-700 w-1/4">
                    Mia Sau (S)
                    <input name="point_bs" value={data.point_bs} onChange={handleInputChange} className="block w-full bg-transparent text-center mt-1 text-cyan-300 font-normal outline-none" />
                  </th>
                  <th className="p-4 border-l border-gray-700 w-1/4">
                    Mia Trước (T)
                    <input name="point_fs" value={data.point_fs} onChange={handleInputChange} className="block w-full bg-transparent text-center mt-1 text-cyan-300 font-normal outline-none" />
                  </th>
                  <th className="p-4 border-l border-gray-700 bg-cyan-900 w-1/4">Chênh cao (h)</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b hover:bg-cyan-50 transition-colors">
                    <td className="p-4 font-bold text-gray-500">Lần {i}</td>
                    <td className="p-4 border-l"><input name={`bs_${i}`} type="number" onChange={handleInputChange} className="w-full text-center outline-none bg-transparent" placeholder="mm" /></td>
                    <td className="p-4 border-l"><input name={`fs_${i}`} type="number" onChange={handleInputChange} className="w-full text-center outline-none bg-transparent" placeholder="mm" /></td>
                    <td className={`p-4 border-l font-bold ${(data as any)[`h_${i}`] > 0 ? 'text-green-600' : (data as any)[`h_${i}`] < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {(data as any)[`h_${i}`] !== 0 ? (data as any)[`h_${i}`] : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dashboard kết quả & QC */}
        <div className="space-y-4">
          <div className={`p-8 rounded-3xl shadow-2xl transition-colors ${data.is_valid ? 'bg-gray-900' : 'bg-red-900'} text-white`}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-cyan-400 text-xs font-black uppercase tracking-widest">Kiểm định chất lượng</h3>
              {!data.is_valid && <span className="bg-white text-red-600 text-[10px] font-bold px-2 py-1 rounded animate-bounce">LỖI QC!</span>}
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-gray-400 text-[10px] uppercase font-bold flex justify-between">
                  <span>Biên độ sai lệch (Max - Min)</span>
                  <span>Cho phép: ≤ 3mm</span>
                </p>
                <p className={`text-2xl font-mono mt-1 ${data.max_diff > 3 ? 'text-red-400 font-black' : 'text-white'}`}>
                  {data.max_diff} mm
                </p>
              </div>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-[10px] uppercase font-bold">Chênh cao trung bình ($h_{tb}$)</p>
                <p className="text-4xl font-mono font-black text-cyan-400 mt-2">{data.h_avg} <span className="text-lg">mm</span></p>
              </div>
            </div>
          </div>

          <button onClick={exportPDF} className="w-full py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm text-gray-700">
            XUẤT PHIẾU PDF
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!data.is_valid}
            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all text-sm uppercase tracking-wider ${data.is_valid ? 'bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-cyan-500/30' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {data.is_valid ? "Ghi sổ & Nộp bài" : "Vui lòng đo lại"}
          </button>
        </div>
      </div>

      <div className="hidden">
        <PDFDocument ref={pdfRef} user={user} session={{id: "6", title: "Đo chênh cao bằng máy thủy bình"}} data={data} submitTime={new Date().toLocaleString()} />
      </div>
    </div>
  );
}
