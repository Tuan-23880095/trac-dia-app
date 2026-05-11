"use client";

import { useState, useRef, useEffect } from "react";
import Formula from "@/components/Formula";
import PDFDocument from "@/components/PDFDocument";
import html2pdf from "html2pdf.js";
import { fetchGAS } from "@/lib/api";

export default function Session2Page() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({
    benchmark_point: "",
    steps: [false, false, false, false, false, false, false],
    time_1: "", time_2: "", time_3: "",
    time_avg: 0
  });
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const t1 = parseFloat(data.time_1) || 0;
    const t2 = parseFloat(data.time_2) || 0;
    const t3 = parseFloat(data.time_3) || 0;
    if (t1 && t2 && t3) {
      setData(prev => ({ ...prev, time_avg: Math.round((t1 + t2 + t3) / 3) }));
    }
  }, [data.time_1, data.time_2, data.time_3]);

  const toggleStep = (index: number) => {
    const newSteps = [...data.steps];
    newSteps[index] = !newSteps[index];
    setData({ ...data, steps: newSteps });
  };

  const handleInputChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const exportPDF = () => {
    const opt = { margin: 10, filename: `Buoi2_${user?.mssv}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' } };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  const handleSubmit = async () => {
    const res = await fetchGAS("SUBMIT_FORM", { mssv: user.mssv, buoiHoc: 2, dataJson: data });
    if (res.status === "success") alert("Nộp bài thành công!");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Buổi 2: Cân bằng máy & Định tâm</h1>
        <p className="text-gray-500">Thực hiện quy trình 7 bước và bấm giờ tốc độ thao tác.</p>
      </header>

      <section className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
        <h2 className="font-bold text-emerald-800 mb-2">📋 Quy tắc 7 bước</h2>
        <p className="text-sm text-emerald-700">
          Mục tiêu đạt thời gian trung bình <Formula tex="T_{tb} < 180s" /> và độ lệch định tâm <Formula tex="\Delta \le 2mm" />.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">I. Checklist 7 Bước Cân Bằng</h3>
          {["Kéo chân máy ngang vai", "Đặt máy và vặn ốc kết nối", "Định tâm sơ bộ & giậm chân", "Cân bọt thủy tròn (bằng chân)", "Cân bọt thủy dài (bằng 3 ốc)", "Xê dịch đế máy định tâm chính xác", "Tinh chỉnh lại bọt thủy dài"].map((step, i) => (
            <div key={i} onClick={() => toggleStep(i)} className={`flex items-center p-3 rounded-lg cursor-pointer border transition-all ${data.steps[i] ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
              <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${data.steps[i] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300'}`}>
                {data.steps[i] && '✓'}
              </div>
              <span className={`text-sm ${data.steps[i] ? 'text-emerald-900 font-bold' : 'text-gray-600'}`}>Bước {i+1}: {step}</span>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4">II. Đánh giá tốc độ (3 lần thực hiện)</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400">Mốc định tâm</label>
                <input name="benchmark_point" onChange={handleInputChange} className="w-full border-b p-2 outline-none" placeholder="Ví dụ: Mốc A1" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <label className="text-xs font-bold text-gray-400">Lần {i} (giây)</label>
                    <input name={`time_${i}`} type="number" onChange={handleInputChange} className="w-full border p-2 rounded text-center" />
                  </div>
                ))}
              </div>
              <div className="bg-emerald-600 p-4 rounded-xl text-white flex justify-between items-center shadow-lg">
                <span className="font-bold uppercase text-xs tracking-widest">Thời gian TB:</span>
                <span className="text-2xl font-black">{data.time_avg} giây</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={exportPDF} className="flex-1 bg-white border-2 border-emerald-600 text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50">XUẤT PDF</button>
            <button onClick={handleSubmit} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 shadow-lg transition-all font-mono">SUBMIT DATA</button>
          </div>
        </div>
      </div>

      <div className="hidden">
        <PDFDocument ref={pdfRef} user={user} session={{id: "2", title: "Cân bằng & Định tâm"}} data={data} submitTime={new Date().toLocaleString()} />
      </div>
    </div>
  );
}
