"use client";

import { useState, useRef, useEffect } from "react";
import Formula from "@/components/Formula";
import PDFDocument from "@/components/PDFDocument";
import html2pdf from "html2pdf.js";
import { fetchGAS } from "@/lib/api";

export default function Session7Page() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({
    route_name: "Tuyến đo khuôn viên Trường",
    total_length_km: "0.5", // Chiều dài tuyến tính bằng km (L)
    
    // Số liệu Trạm 1
    t1_bs: "", t1_fs: "", t1_h: 0,
    // Số liệu Trạm 2
    t2_bs: "", t2_fs: "", t2_h: 0,
    // Số liệu Trạm 3
    t3_bs: "", t3_fs: "", t3_h: 0,
    
    // Kết quả tính toán tuyến
    f_h_calc: 0,      // Sai số khép thực tế
    f_h_allow: 0,     // Sai số khép cho phép
    is_passed: false, // Trạng thái kiểm duyệt
    has_calculated: false
  });
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Hàm tính toán chênh cao từng trạm
  const calcH = (bs: string, fs: string) => {
    const s = parseFloat(bs) || 0;
    const t = parseFloat(fs) || 0;
    return (s !== 0 && t !== 0) ? (s - t) : null; // mm
  };

  // Hệ thống tự động kiểm tra Sai số khép vòng kín
  useEffect(() => {
    const h1 = calcH(data.t1_bs, data.t1_fs);
    const h2 = calcH(data.t2_bs, data.t2_fs);
    const h3 = calcH(data.t3_bs, data.t3_fs);
    const L = parseFloat(data.total_length_km) || 0;

    // Chỉ tính khi nhập đủ số liệu 3 trạm và có tổng chiều dài
    if (h1 !== null && h2 !== null && h3 !== null && L > 0) {
      // Sai số khép thực tế fh = Tổng h đo
      const fh_thuc_te = h1 + h2 + h3;
      
      // Sai số khép cho phép fcp = 50 * sqrt(L) (mm)
      const fh_cho_phep = 50 * Math.sqrt(L);

      setData(prev => ({
        ...prev,
        t1_h: h1, t2_h: h2, t3_h: h3,
        f_h_calc: Number(fh_thuc_te.toFixed(2)),
        f_h_allow: Number(fh_cho_phep.toFixed(2)),
        // Tuyến kín đạt yêu cầu khi |fh_thực tế| <= fh_cho phép
        is_passed: Math.abs(fh_thuc_te) <= fh_cho_phep,
        has_calculated: true
      }));
    } else {
      setData(prev => ({ ...prev, has_calculated: false }));
    }
  }, [data.t1_bs, data.t1_fs, data.t2_bs, data.t2_fs, data.t3_bs, data.t3_fs, data.total_length_km]);

  const handleInputChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const exportPDF = () => {
    const opt = {
      margin: 10, filename: `Buoi7_TuyenKin_${user?.mssv}.pdf`,
      html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  const handleSubmit = async () => {
    if (!data.has_calculated) {
      alert("Vui lòng nhập đầy đủ số đọc mia của cả 3 trạm và chiều dài tuyến để hệ thống kiểm tra sai số!");
      return;
    }
    if (!data.is_passed) {
      alert(`ĐÌNH CHỈ NỘP BÀI! Sai số khép của tuyến là ${data.f_h_calc}mm, đã VƯỢT QUÁ giới hạn cho phép (±${data.f_h_allow}mm). Toàn nhóm phải kiểm tra và đo lại trạm bị sai!`);
      return;
    }
    
    const res = await fetchGAS("SUBMIT_FORM", { mssv: user.mssv, buoiHoc: 7, dataJson: data });
    if (res.status === "success") alert("Chúc mừng! Tuyến đo đạt tiêu chuẩn và đã được khóa sổ trên hệ thống.");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      <header className="border-b-4 border-purple-600 pb-4">
        <h1 className="text-3xl font-black text-gray-900 uppercase">Buổi 7: Dẫn chuyền Cao độ Tuyến kín</h1>
        <p className="text-gray-500 font-medium">Tổ chức đo đạc thực địa theo tuyến vòng khép kín. Kiểm tra sai số khép toàn tuyến.</p>
      </header>

      {/* Thông tin Tuyến & Hướng dẫn Toán học */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-purple-100 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800">1. Thông số thiết kế tuyến</h2>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Tên tuyến đo / Khu vực</label>
            <input name="route_name" value={data.route_name} onChange={handleInputChange} className="w-full mt-1 border-b-2 focus:border-purple-600 outline-none pb-1 font-bold text-purple-900" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Tổng chiều dài tuyến L (km)</label>
            <input name="total_length_km" type="number" step="0.1" value={data.total_length_km} onChange={handleInputChange} className="w-full mt-1 border-b-2 focus:border-purple-600 outline-none pb-1 font-bold text-purple-900" />
            <p className="text-[10px] text-gray-400 mt-1">* Dùng để tính sai số giới hạn. Ví dụ: Tuyến dài 500m thì nhập 0.5</p>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-200">
          <h2 className="font-bold text-purple-800 mb-2">2. Kiểm tra Sai số khép độ cao</h2>
          <div className="space-y-4 text-sm text-purple-900">
            <p>Đối với một tuyến kín (bắt đầu và kết thúc tại cùng 1 điểm), tổng chênh cao lý thuyết phải bằng 0. Sai số khép thực tế:</p>
            <Formula tex="f_h = \sum h_{đo} = h_1 + h_2 + ... + h_n" block />
            <p className="font-bold border-t border-purple-200 pt-2 mt-2">Điều kiện đánh giá đạt yêu cầu:</p>
            <Formula tex="|f_h| \le f_{cp} = 50\sqrt{L} \text{ (mm)}" block />
          </div>
        </div>
      </div>

      {/* Bảng nhập liệu đo đạc (Tuyến 3 trạm) */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-900 text-white font-bold tracking-widest uppercase text-sm text-center">
          Sổ đo hiện trường (Đại diện Nhóm nhập)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 w-1/5">Trạm máy</th>
                <th className="p-4 w-1/4 border-l">Mia Sau (S) - mm</th>
                <th className="p-4 w-1/4 border-l">Mia Trước (T) - mm</th>
                <th className="p-4 w-1/4 border-l bg-purple-50 text-purple-800">Chênh cao (h)</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b">
                  <td className="p-4 font-bold text-gray-500 bg-gray-50">Trạm {i}</td>
                  <td className="p-4 border-l"><input name={`t${i}_bs`} type="number" onChange={handleInputChange} className="w-full text-center outline-none bg-transparent py-2" placeholder="0" /></td>
                  <td className="p-4 border-l"><input name={`t${i}_fs`} type="number" onChange={handleInputChange} className="w-full text-center outline-none bg-transparent py-2" placeholder="0" /></td>
                  <td className={`p-4 border-l font-black bg-purple-50/30 ${(data as any)[`t${i}_h`] > 0 ? 'text-green-600' : (data as any)[`t${i}_h`] < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {(data as any)[`t${i}_h`] !== 0 ? (data as any)[`t${i}_h`] : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Khu vực Đánh giá chất lượng toàn tuyến (QC) */}
      {data.has_calculated && (
        <div className={`p-8 rounded-3xl shadow-2xl transition-all border-4 ${data.is_passed ? 'bg-gray-900 border-green-500' : 'bg-red-50 border-red-500'} text-white`}>
          <div className="flex justify-between items-start mb-6">
            <h3 className={`text-xs font-black uppercase tracking-widest ${data.is_passed ? 'text-purple-400' : 'text-red-600'}`}>
              Trạng thái chất lượng tuyến đo
            </h3>
            {data.is_passed ? (
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> ĐẠT YÊU CẦU
              </span>
            ) : (
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                KHÔNG ĐẠT (ĐO LẠI)
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl ${data.is_passed ? 'bg-gray-800' : 'bg-white shadow-inner'}`}>
              <p className={`text-[10px] uppercase font-bold mb-2 ${data.is_passed ? 'text-gray-400' : 'text-red-400'}`}>Sai số khép thực tế ($f_h$)</p>
              <p className={`text-4xl font-mono font-black ${data.is_passed ? 'text-white' : 'text-red-600'}`}>
                {data.f_h_calc > 0 ? `+${data.f_h_calc}` : data.f_h_calc} <span className="text-xl font-sans font-normal">mm</span>
              </p>
            </div>
            <div className={`p-6 rounded-2xl ${data.is_passed ? 'bg-gray-800' : 'bg-white shadow-inner'}`}>
              <p className={`text-[10px] uppercase font-bold mb-2 ${data.is_passed ? 'text-gray-400' : 'text-gray-500'}`}>Giới hạn cho phép ($f_{cp}$)</p>
              <p className={`text-4xl font-mono font-black ${data.is_passed ? 'text-green-400' : 'text-gray-900'}`}>
                ±{data.f_h_allow} <span className="text-xl font-sans font-normal">mm</span>
              </p>
            </div>
          </div>

          {!data.is_passed && (
            <p className="mt-6 text-sm font-bold text-red-600 text-center bg-red-100 p-3 rounded-lg border border-red-200">
              Sai số thực tế đã vượt quá mức cho phép. Tuyến này không thể dùng để bình sai. Nhóm tự thảo luận tìm ra trạm nghi ngờ và tiến hành đo lại!
            </p>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={exportPDF} className="py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm text-gray-700">
          XUẤT SỔ ĐO PDF
        </button>
        <button 
          onClick={handleSubmit} 
          className={`py-4 rounded-2xl font-bold shadow-lg transition-all text-sm uppercase tracking-wider ${data.is_passed ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-purple-500/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {data.is_passed ? "Khóa Sổ Hiện Trường" : "Chờ dữ liệu đạt chuẩn..."}
        </button>
      </div>

      <div className="hidden">
        <PDFDocument ref={pdfRef} user={user} session={{id: "7", title: "Dẫn chuyền cao độ Tuyến kín (Thực địa)"}} data={data} submitTime={new Date().toLocaleString()} />
      </div>
    </div>
  );
}
