"use client";

import { useState, useRef, useEffect } from "react";
import Formula from "@/components/Formula";
import PDFDocument from "@/components/PDFDocument";
import html2pdf from "html2pdf.js";
import { fetchGAS } from "@/lib/api";

export default function Session3Page() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({
    target_A: "Điểm A",
    target_B: "Điểm B",
    // Số liệu điểm A
    a_T: "", a_P: "", a_2C: 0, a_TB: 0,
    // Số liệu điểm B
    b_T: "", b_P: "", b_2C: 0, b_TB: 0,
    // Kết quả góc kẹp
    beta: 0
  });
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Logic tính toán sai số 2C và góc trung bình
  useEffect(() => {
    const calculatePoint = (T: string, P: string) => {
      const valT = parseFloat(T) || 0;
      const valP = parseFloat(P) || 0;
      if (!valT || !valP) return { c2: 0, tb: 0 };

      // Công thức 2C = T - (P +/- 180)
      let pCorr = valP > 180 ? valP - 180 : valP + 180;
      let c2 = valT - pCorr;
      
      // Góc trung bình = (T + (P +/- 180)) / 2
      let tb = (valT + pCorr) / 2;
      
      return { c2: Number(c2.toFixed(4)), tb: Number(tb.toFixed(4)) };
    };

    const resA = calculatePoint(data.a_T, data.a_P);
    const resB = calculatePoint(data.b_T, data.b_P);
    
    setData(prev => ({
      ...prev,
      a_2C: resA.c2, a_TB: resA.tb,
      b_2C: resB.c2, b_TB: resB.tb,
      beta: Number((resB.tb - resA.tb).toFixed(4))
    }));
  }, [data.a_T, data.a_P, data.b_T, data.b_P]);

  const handleInputChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const exportPDF = () => {
    const opt = {
      margin: 10,
      filename: `Buoi3_GocBang_${user?.mssv}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  const handleSubmit = async () => {
    const res = await fetchGAS("SUBMIT_FORM", {
      mssv: user.mssv,
      buoiHoc: 3,
      dataJson: data
    });
    if (res.status === "success") alert("Nộp bài Buổi 3 thành công!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="border-b pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Buổi 3: Đo góc bằng trên máy Kinh vĩ</h1>
          <p className="text-gray-500">Thực hành phương pháp đo đơn giản (Đo cung).</p>
        </div>
        <div className="text-right text-xs font-mono text-gray-400">
          SESSION_ID: 03_GOC_BANG
        </div>
      </header>

      {/* Khu vực Hướng dẫn & Công thức */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-blue-50 p-5 rounded-2xl border border-blue-100">
          <h2 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
            <span>📚 Nguyên lý tính toán</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p className="font-medium">1. Sai số 2C:</p>
              <Formula tex="2C = T - (P \pm 180^\circ)" block />
            </div>
            <div>
              <p className="font-medium">2. Góc trị trung bình:</p>
              <Formula tex="\beta_{tb} = \frac{T + (P \pm 180^\circ)}{2}" block />
            </div>
          </div>
        </div>
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex flex-col justify-center">
          <h3 className="font-bold text-amber-800 text-sm uppercase mb-1">⚠️ Yêu cầu kỹ thuật</h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            Sai số <Formula tex="2C" /> giữa các lần đo không được vượt quá <Formula tex="\pm 1'" /> (đối với máy điện tử) hoặc tiêu chuẩn của Giảng viên.
          </p>
        </div>
      </section>

      {/* Bảng nhập số liệu thực địa */}
      <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-900 text-white text-sm">
            <tr>
              <th className="p-4">Trạm máy</th>
              <th className="p-4">Mục tiêu</th>
              <th className="p-4">Thuận kính (T)</th>
              <th className="p-4">Đảo kính (P)</th>
              <th className="p-4 bg-gray-800 text-blue-400 text-center">Sai số 2C</th>
              <th className="p-4 bg-gray-800 text-green-400 text-center">Trị TB</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {/* Hàng cho Điểm A */}
            <tr className="border-b">
              <td rowSpan={2} className="p-4 font-bold border-r bg-gray-50 text-center">O</td>
              <td className="p-4"><input name="target_A" value={data.target_A} onChange={handleInputChange} className="w-full font-bold outline-none" /></td>
              <td className="p-4"><input name="a_T" type="number" placeholder="0.0000" onChange={handleInputChange} className="w-full border-b focus:border-blue-500 outline-none" /></td>
              <td className="p-4"><input name="a_P" type="number" placeholder="180.0000" onChange={handleInputChange} className="w-full border-b focus:border-blue-500 outline-none" /></td>
              <td className="p-4 bg-gray-50 text-center font-mono font-bold text-blue-600">{data.a_2C}</td>
              <td className="p-4 bg-gray-50 text-center font-mono font-bold text-green-600">{data.a_TB}</td>
            </tr>
            {/* Hàng cho Điểm B */}
            <tr className="border-b">
              <td className="p-4"><input name="target_B" value={data.target_B} onChange={handleInputChange} className="w-full font-bold outline-none" /></td>
              <td className="p-4"><input name="b_T" type="number" placeholder="0.0000" onChange={handleInputChange} className="w-full border-b focus:border-blue-500 outline-none" /></td>
              <td className="p-4"><input name="b_P" type="number" placeholder="180.0000" onChange={handleInputChange} className="w-full border-b focus:border-blue-500 outline-none" /></td>
              <td className="p-4 bg-gray-50 text-center font-mono font-bold text-blue-600">{data.b_2C}</td>
              <td className="p-4 bg-gray-50 text-center font-mono font-bold text-green-600">{data.b_TB}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Kết quả cuối cùng */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-900 p-8 rounded-3xl text-white shadow-2xl">
        <div>
          <h3 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-1">Góc kẹp tại trạm O</h3>
          <p className="text-3xl font-black italic">
            <Formula tex="\beta = L_B - L_A =" /> <span className="text-yellow-400 ml-2">{data.beta}°</span>
          </p>
        </div>
        <div className="flex gap-4 mt-6 sm:mt-0 w-full sm:w-auto">
          <button onClick={exportPDF} className="flex-1 sm:flex-none px-8 py-4 bg-gray-800 border border-gray-700 rounded-2xl font-bold hover:bg-gray-700 transition-all">
            XUẤT MINH CHỨNG
          </button>
          <button onClick={handleSubmit} className="flex-1 sm:flex-none px-8 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all">
            NỘP BÀI HỆ THỐNG
          </button>
        </div>
      </div>

      {/* Thành phần PDF ẩn */}
      <div className="hidden">
        <PDFDocument 
          ref={pdfRef} 
          user={user} 
          session={{id: "3", title: "Đo góc bằng (Phương pháp đo cung)"}} 
          data={data} 
          submitTime={new Date().toLocaleString()} 
        />
      </div>
    </div>
  );
}
