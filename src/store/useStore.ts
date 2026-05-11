import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Định nghĩa cấu trúc dữ liệu cho Store
interface AppState {
  // Nơi chứa dữ liệu nháp của tất cả các buổi học
  savedSessions: Record<string, any>;
  
  // Hàm lưu dữ liệu nháp
  saveSessionData: (sessionId: string, data: any) => void;
  
  // Hàm xóa dữ liệu nháp (dùng sau khi nộp bài thành công)
  clearSessionData: (sessionId: string) => void;
}

// Khởi tạo Zustand Store kết hợp Persist (Tự động lưu vào LocalStorage)
export const useStore = create<AppState>()(
  persist(
    (set) => ({
      savedSessions: {},
      
      // Hành động: Cập nhật dữ liệu của một buổi học cụ thể
      saveSessionData: (sessionId, data) => 
        set((state) => ({
          savedSessions: {
            ...state.savedSessions,
            [sessionId]: data,
          },
        })),
        
      // Hành động: Xóa dữ liệu của buổi học sau khi submit lên Google Sheets
      clearSessionData: (sessionId) =>
        set((state) => {
          const newSessions = { ...state.savedSessions };
          delete newSessions[sessionId];
          return { savedSessions: newSessions };
        }),
    }),
    {
      // Tên key sẽ được lưu ngầm trong trình duyệt của sinh viên
      name: 'trac-dia-autosave', 
    }
  )
);
