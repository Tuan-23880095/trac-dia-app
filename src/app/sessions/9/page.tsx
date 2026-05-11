"use client";

import { useState, useRef, useEffect } from "react";
import Formula from "@/components/Formula";
import PDFDocument from "@/components/PDFDocument";
import html2pdf from "html2pdf.js";
import { fetchGAS } from "@/lib/api";

// Cấu hình thời gian làm bài thi (Ví dụ: 15 phút = 900 giây)
const EXAM_DURATION = 900; 

export default function Session9Page() {
  const [user, setUser] = useState<any>(null);
  
  // Trạng thái phòng thi
  const [examState, setExamState] = useState<'idle' | 'running' | 'submitted'>('idle');
  const [examId, setExamId] = useState<number>(0); // 1: Đo góc, 2: Đo dài, 3: Đo cao
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  
  // Dữ liệu linh hoạt theo đề thi
  const [data, setData] = useState<any>({
    // Đề 1: Đo Góc
    d1_T: "", d1_P: "", d1_2C: 0, d1_TB: 0,
    // Đề 2: Đo Dài
    d2_cT: "", d2_cD: "", d2_V: "", d2_S: 0,
    // Đề 3: Đo Cao
    d3_S: "", d3_T: "", d3_h: 0,
    // Thông tin chung
    selfie_url: "",
    is_valid: false
  });
  
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Logic Đồng hồ đếm ngược
  useEffect(() => {
    let timer: any;
    if (examState === 'running' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examState === 'running') {
      alert("ĐÃ HẾT THỜI GIAN LÀM BÀI! Vui lòng nộp số liệu hiện tại ngay lập tức.");
    }
    return () => clearInterval(timer);
  }, [examState, timeLeft]);

  // Logic bốc đề ngẫu nhiên
  const startExam = () => {
    const confirmStart = window.confirm("Bạn đã sẵn sàng? Thời gian sẽ bắt đầu đếm ngược ngay khi bốc đề.");
    if (confirmStart) {
      const randomId = Math.floor(Math.random() * 3) + 1;
      setExamId(randomId);
      setExamState('running');
    }
  };

  // Thuật toán chấm điểm tự động (Anti-Cheat) tùy theo Đề
  useEffect(() => {
    let valid = false;
    
    if (examId === 1) {
      // Logic Đề 1 (Đo góc): Sai số 2C không vượt quá 1 phút (60 giây)
      const T = parseFloat(data.d1_T) || 0;
      const P = parseFloat(data.d1_P) || 0;
      let pCorr = P > 180 ? P - 180 : P + 180;
      let c2 = Math.abs(T - pCorr);
      setData((prev: any) => ({ ...prev, d1_2C: Number(c2.toFixed(4)), d1_TB: Number(((T + pCorr)/2).toFixed(4)) }));
      valid = c2 <= 0.0167; // 1 phút = 1/60 độ
    } 
    else if (examId === 2) {
      // Logic Đề 2 (Đo dài quang học)
      const cT = parseFloat(data.d2_cT) || 0;
      const cD = parseFloat(data.d2_cD) || 0;
      const V = parseFloat(data.d2_V) || 0;
      const S = ((cT - cD)/1000) * 100 * Math.pow(Math.cos(V * Math.PI / 180), 2);
      setData((prev: any) => ({ ...prev, d2_S: Number(S.toFixed(3)) }));
      valid = S > 0 && S < 500; // Khoảng cách hợp lý
    } 
    else if (examId === 3) {
      // Logic Đề 3 (Đo chênh cao)
      const S = parseFloat(data.d3_S) || 0;
      const T = parseFloat(data.d3_T) || 0;
      setData((prev: any) => ({ ...prev, d3_h: S - T }));
      valid = S > 0 && T > 0;
    }

    setData((prev: any) => ({ ...prev, is_valid: valid }));
  }, [data.d1_T, data.d1_P, data.d2_cT, data.d2_cD, data.d2_V, data.d3_S, data.d3_T, examId]);

  const handleInputChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const exportPDF = () => {
    const opt = {
      margin: 10, filename: `PhieuThi_${user?.mssv}.pdf`,
      html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  const handleSubmit = async () => {
    const res = await fetchGAS("SUBMIT_FORM", {
      mssv: user.mssv,
      buoiHoc: `THI_DE_${examId}`,
      dataJson: { ...data, thoi_gian_con_lai: timeLeft }
    });
    if (res.status === "success") {
      setExamState('submitted');
      alert("Nộp bài thi thành công! Vui lòng thu dọn thiết bị và rời khỏi sân đo.");
    }
  };

  // Format hiển thị thời gian
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      {/* HEADER KỲ THI */}
      <header className="bg-orange-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 7.5l-10-5v10.5l10 5 10-5V4.5l-10 5z"/></svg>
        </div>
        <div className="relative z-10">
          <span className="bg-orange-900/50 text-orange-200 text-xs font-bold px-3 py-1 rounded-full tracking-widest">BUỔI 9 - SÁT HẠCH CUỐI KỲ</span>
          <h1 className="text-3xl font-black uppercase mt-4 mb-2">Thi Thực Hành Tổng Hợp</h1>
          <p className="text-orange-100">Đánh giá kỹ năng thiết lập trạm máy, thao tác đo đạc và nội nghiệp.</p>
        </div>
      </header>

      {/* MÀN HÌNH CHỜ BỐC ĐỀ */}
      {examState === 'idle' && (
        <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm text-center space-y-6">
          <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">🎲</div>
          <h2 className="text-2xl font-bold text-gray-900">Quy chế thi sát hạch</h2>
          <ul className="text-left max-w-md mx-auto space-y-3 text-gray-600 text-sm">
            <li><strong className="text-gray-900">1.</strong> Hệ thống sẽ bốc ngẫu nhiên 1 trong 3 đề: Đo Góc, Đo Dài hoặc Đo Chênh Cao.</li>
            <li><strong className="text-gray-900">2.</strong> Thời gian làm bài là <strong>15 phút</strong>.</li>
            <li><strong className="text-gray-900">3.</strong> Không tải lại (reload) trang trong quá trình thi.</li>
          </ul>
          <button 
            onClick={startExam}
            className="mt-8 px-10 py-4 bg-orange-600 text-white text-lg font-black rounded-2xl shadow-lg hover:bg-orange-700 hover:shadow-orange-500/30 transition-all uppercase tracking-wider"
          >
            Bốc đề & Bắt đầu tính giờ
          </button>
        </div>
      )}

      {/* MÀN HÌNH LÀM BÀI */}
      {examState === 'running' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* THANH ĐỒNG HỒ DÍNH (STICKY TIMER) */}
          <div className="sticky top-20 z-40 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center border border-gray-800">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className={`${timeLeft <= 300 ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${timeLeft <= 300 ? 'bg-red-500' : 'bg-green-500'}`}></span>
              </span>
              <span className="font-bold text-sm text-gray-300 uppercase tracking-widest">Thời gian còn lại</span>
            </div>
            <div className={`text-4xl font-black font-mono ${timeLeft <= 300 ? 'text-red-500' : 'text-orange-400'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-orange-200 shadow-xl">
            <h3 className="text-xl font-bold text-orange-800 border-b border-orange-100 pb-4 mb-6">
              NỘI DUNG ĐỀ THI: {examId === 1 ? "ĐO GÓC BẰNG" : examId === 2 ? "ĐO DÀI QUANG HỌC" : "ĐO CHÊNH CAO THỦY BÌNH"}
            </h3>

            {/* RENDER ĐỀ 1 */}
            {examId === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 italic">Yêu cầu: Thiết lập máy kinh vĩ, đo góc ngang theo 2 vị trí bàn độ Thuận/Đảo.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Thuận kính (T) - Độ thập phân</label>
                    <input name="d1_T" type="number" onChange={handleInputChange} className="w-full mt-1 p-3 border rounded-xl" placeholder="VD: 15.2500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Đảo kính (P) - Độ thập phân</label>
                    <input name="d1_P" type="number" onChange={handleInputChange} className="w-full mt-1 p-3 border rounded-xl" placeholder="VD: 195.2510" />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border">
                  <span className="font-bold text-gray-700">Sai số 2C:</span>
                  <span className={`font-mono font-bold text-lg ${data.is_valid ? 'text-green-600' : 'text-red-600'}`}>{data.d1_2C}°</span>
                </div>
              </div>
            )}

            {/* RENDER ĐỀ 2 */}
            {examId === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 italic">Yêu cầu: Dùng máy kinh vĩ, đọc chỉ lượng cự và góc đứng để tính khoảng cách ngang.</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Chỉ trên (mm)</label>
                    <input name="d2_cT" type="number" onChange={handleInputChange} className="w-full mt-1 p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Chỉ dưới (mm)</label>
                    <input name="d2_cD" type="number" onChange={handleInputChange} className="w-full mt-1 p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Góc đứng V (độ)</label>
                    <input name="d2_V" type="number" onChange={handleInputChange} className="w-full mt-1 p-3 border rounded-xl" />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border">
                  <span className="font-bold text-gray-700">K/c Quang học S:</span>
                  <span className="font-mono font-bold text-lg text-blue-600">{data.d2_S} m</span>
                </div>
              </div>
            )}

            {/* RENDER ĐỀ 3 */}
            {examId === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 italic">Yêu cầu: Cân máy thủy bình, xác định chênh cao giữa 2 điểm bằng phương pháp đo từ giữa.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Mia Sau (S) - mm</label>
                    <input name="d3_S" type="number" onChange={handleInputChange} className="w-full mt-1 p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Mia Trước (T) - mm</label>
                    <input name="d3_T" type="number" onChange={handleInputChange} className="w-full mt-1 p-3 border rounded-xl" />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border">
                  <span className="font-bold text-gray-700">Chênh cao h:</span>
                  <span className="font-mono font-bold text-lg text-green-600">{data.d3_h} mm</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={exportPDF} className="flex-1 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50 text-gray-700">
              IN BÀI THI TẠM TÍNH
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={timeLeft === 0}
              className={`flex-1 py-4 rounded-2xl font-black shadow-lg text-white transition-all uppercase ${timeLeft > 0 ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400'}`}
            >
              NỘP BÀI SÁT HẠCH
            </button>
          </div>
        </div>
      )}

      {/* MÀN HÌNH HOÀN THÀNH */}
      {examState === 'submitted' && (
        <div className="bg-green-50 border border-green-200 p-10 rounded-3xl text-center space-y-4">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto text-3xl mb-6">✓</div>
          <h2 className="text-2xl font-bold text-green-900">Bài thi đã được khóa sổ!</h2>
          <p className="text-green-700">Kết quả của bạn đã được niêm phong trên máy chủ của Giảng viên. Vui lòng thu dọn máy móc vào hộp đúng quy cách trước khi rời đi.</p>
        </div>
      )}

      {/* Component PDF Ẩn để Render */}
      <div className="hidden">
        <PDFDocument ref={pdfRef} user={user} session={{id: "9", title: `Đề thi số ${examId}`}} data={data} submitTime={new Date().toLocaleString()} />
      </div>
    </div>
  );
}
