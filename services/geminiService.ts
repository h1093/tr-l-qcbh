import { GoogleGenAI, Type, Chat, Part } from "@google/genai";
import { CultivationPath, BuildGuide, LinhCan, TinhAnh, HistoryItem, ChatMessage } from '../types';

export const API_KEY_STORAGE_KEY = 'GEMINI_API_KEY';

const getGeminiClient = (): GoogleGenAI => {
  const storedKey = typeof window !== 'undefined' ? window.localStorage.getItem(API_KEY_STORAGE_KEY) : null;
  const apiKey = storedKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key not found. Please provide one in the settings.");
  }

  return new GoogleGenAI({ apiKey });
};

export const hasApiKey = (): boolean => {
    const storedKey = typeof window !== 'undefined' ? window.localStorage.getItem(API_KEY_STORAGE_KEY) : null;
    const envKey = process.env.API_KEY;
    return !!storedKey || !!envKey;
}

const gioiThieuSchema = {
    type: Type.OBJECT,
    properties: {
        diemManh: { type: Type.STRING, description: 'Phân tích chi tiết các điểm mạnh cốt lõi của build. Sử dụng gạch đầu dòng. Định dạng Markdown.' },
        diemYeu: { type: Type.STRING, description: 'Phân tích chi tiết các điểm yếu cần lưu ý và cách khắc phục. Sử dụng gạch đầu dòng. Định dạng Markdown.' },
        loiChoiTongQuan: { type: Type.STRING, description: 'Mô tả lối chơi tổng quan, cách build vận hành trong thực chiến. Định dạng Markdown.' },
        giaiDoanManh: { type: Type.STRING, description: 'Xác định rõ build này mạnh nhất ở giai đoạn nào của game (đầu, giữa, hay cuối game) và giải thích tại sao. Định dạng Markdown.' },
    },
    required: ['diemManh', 'diemYeu', 'loiChoiTongQuan', 'giaiDoanManh']
};

const tienThienKhiVanSchema = {
    type: Type.OBJECT,
    properties: {
        ten: { type: Type.STRING, description: 'Tên của Tiên Thiên Khí Vận.' },
        loiIch: { type: Type.STRING, description: 'Giải thích chi tiết lợi ích mà nó mang lại. Định dạng Markdown.' },
        lyDoChon: { type: Type.STRING, description: 'Giải thích lý do tại sao nó là lựa chọn tốt cho build này. Định dạng Markdown.' }
    },
    required: ['ten', 'loiIch', 'lyDoChon']
};

const nghichThienCaiMenhSchema = {
    type: Type.OBJECT,
    properties: {
        ten: { type: Type.STRING, description: 'Tên của Nghịch Thiên Cải Mệnh, bao gồm cả tiếng Hán nếu có.' },
        loiIch: { type: Type.STRING, description: 'Giải thích chi tiết lợi ích mà nó mang lại. Định dạng Markdown.' },
        ketHop: { type: Type.STRING, description: 'Phân tích cách nó kết hợp với các kỹ năng và yếu tố khác. Định dạng Markdown.' },
        luuY: { type: Type.STRING, description: 'Lưu ý đặc biệt hoặc mẹo sử dụng (nếu có). Định dạng Markdown.' }
    },
    required: ['ten', 'loiIch', 'ketHop']
};

const congPhapSchema = {
    type: Type.OBJECT,
    properties: {
        loai: { type: Type.STRING, description: "Phân loại công pháp.", enum: ['Võ Kỹ/Linh Kỹ Chính', 'Võ Kỹ/Linh Kỹ Phụ', 'Thân Pháp'] },
        ten: { type: Type.STRING, description: 'Tên gợi ý cho công pháp này.' },
        phanTich: { type: Type.STRING, description: 'Phân tích ngắn gọn tại sao chọn công pháp này. Định dạng Markdown.' },
        tuKhoa: { type: Type.STRING, description: "Phân tích chi tiết các dòng từ khóa (词条) quan trọng. Phải phân loại từ khóa theo nhóm chức năng (ví dụ: Sát thương, Phòng thủ, Hỗ trợ, Khống chế, Hiệu ứng đặc biệt) và giải thích ngắn gọn lợi ích của từng từ khóa. Định dạng Markdown theo mẫu: '- **[Loại từ khóa]**: [Tên từ khóa] - [Giải thích lợi ích].'" },
        comboDeXuat: { type: Type.STRING, description: 'Gợi ý một chuỗi combo hiệu quả kết hợp kỹ năng này với các kỹ năng khác (Võ Kỹ/Linh Kỹ chính, phụ, thân pháp). Định dạng Markdown.'}
    },
    required: ['loai', 'ten', 'phanTich', 'tuKhoa', 'comboDeXuat']
};

const tamPhapSchema = {
    type: Type.OBJECT,
    properties: {
        loai: { type: Type.STRING, description: 'Loại tâm pháp (ví dụ: Tâm Pháp Công Kích, Tâm Pháp Phòng Ngự, Tâm Pháp Thể Lực).' },
        ten: { type: Type.STRING, description: 'Tên bộ tâm pháp cụ thể được gợi ý.' },
        phanTich: { type: Type.STRING, description: 'Phân tích chi tiết tại sao chọn bộ tâm pháp này và nó có sức mạnh tổng hợp với build như thế nào. Định dạng Markdown.' },
        tuKhoaChinh: { type: Type.STRING, description: 'Mô tả dòng từ khóa chính (không thể tẩy luyện) của bộ tâm pháp và lợi ích của nó. Định dạng Markdown.' },
        tuKhoaPhu: { type: Type.STRING, description: 'Liệt kê các dòng từ khóa phụ quan trọng nhất cần tìm (các dòng có thể tẩy luyện - 可洗词条). Định dạng Markdown.' }
    },
    required: ['loai', 'ten', 'phanTich', 'tuKhoaChinh', 'tuKhoaPhu']
};

const phapBaoSchema = {
    type: Type.OBJECT,
    properties: {
        ten: { type: Type.STRING, description: 'Tên của pháp bảo.' },
        vaiTro: { type: Type.STRING, description: 'Vai trò chính của pháp bảo (ví dụ: Sát thương chính, Hỗ trợ khống chế, Sinh tồn). Định dạng Markdown.' },
        sucManhTongHop: { type: Type.STRING, description: 'Luận giải chi tiết về sức mạnh tổng hợp của pháp bảo này với toàn bộ build. Định dạng Markdown.' },
        kyNangDeXuat: { type: Type.STRING, description: 'Liệt kê các kỹ năng hoặc từ khóa cụ thể trên pháp bảo mà người chơi nên tìm kiếm. Định dạng Markdown.' },
        tinhHuongSuDung: { type: Type.STRING, description: 'Gợi ý những tình huống cụ thể nên sử dụng pháp bảo để đạt hiệu quả cao nhất (ví dụ: Mở giao tranh, rút lui, dồn sát thương boss). Định dạng Markdown.' }
    },
    required: ['ten', 'vaiTro', 'sucManhTongHop', 'kyNangDeXuat', 'tinhHuongSuDung']
};

const khiLinhSchema = {
    type: Type.OBJECT,
    properties: {
        ten: { type: Type.STRING, description: 'Tên của Khí Linh (ví dụ: Vân Mộng Y, Lệ Ảnh, Tửu Trần...).' },
        phapBaoDeXuat: { type: Type.STRING, description: 'Gợi ý nên trang bị Khí Linh này cho loại Pháp Bảo nào (ví dụ: Chuông, Cờ, Ngọc...). Định dạng Markdown.' },
        kyNangQuanTrong: { type: Type.STRING, description: 'Liệt kê và giải thích các kỹ năng quan trọng của Khí Linh cần tìm. Định dạng Markdown.' },
        sucManhTongHop: { type: Type.STRING, description: 'Phân tích chi tiết sức mạnh tổng hợp của Khí Linh với Pháp Bảo và toàn bộ build. Định dạng Markdown.' }
    },
    required: ['ten', 'phapBaoDeXuat', 'kyNangQuanTrong', 'sucManhTongHop']
};

const huongDanNangCaoSchema = {
    type: Type.OBJECT,
    properties: {
        uuTienNangCap: { type: Type.STRING, description: 'Vạch ra lộ trình nâng cấp tối ưu: nên ưu tiên nâng cấp công pháp, tâm pháp, lĩnh vực hay yếu tố nào khác trước. Định dạng Markdown.' },
        chienLuocGiaoTranh: { type: Type.STRING, description: 'Phân tích sâu về chiến lược chiến đấu: cách định vị, combo kỹ năng, cách đối phó với các loại kẻ địch khác nhau (boss đơn mục tiêu, đám đông...). Định dạng Markdown.' },
        ketHopVoiVatPham: { type: Type.STRING, description: 'Gợi ý các loại vật phẩm tiêu hao (đan dược, linh quả) nên sử dụng để tối đa hóa sức mạnh của build. Định dạng Markdown.' },
        khacPhucNhuocDiem: { type: Type.STRING, description: 'Đưa ra các chiến thuật cụ thể trong thực chiến để khắc phục những điểm yếu đã nêu ở phần giới thiệu. Định dạng Markdown.' }
    },
    required: ['uuTienNangCap', 'chienLuocGiaoTranh', 'ketHopVoiVatPham', 'khacPhucNhuocDiem']
};

const buildGuideSchema = {
  type: Type.OBJECT,
  properties: {
    gioiThieu: gioiThieuSchema,
    tienThienKhiVan: {
        type: Type.ARRAY,
        description: "Danh sách 3 Tiên Thiên Khí Vận tối ưu nhất cho việc khởi đầu game với build này.",
        items: tienThienKhiVanSchema
    },
     nghichThienCaiMenh: { 
        type: Type.ARRAY, 
        description: 'Danh sách các lựa chọn Nghịch Thiên Cải Mệnh theo thứ tự ưu tiên. Cung cấp ít nhất 3-4 lựa chọn.',
        items: nghichThienCaiMenhSchema 
    },
    congPhap: { 
        type: Type.ARRAY, 
        description: 'Danh sách các lựa chọn Công Pháp, bao gồm 1 Võ Kỹ/Linh Kỹ chính, 1 Võ Kỹ/Linh Kỹ phụ và 1 Thân Pháp.',
        items: congPhapSchema 
    },
    tamPhap: { 
        type: Type.ARRAY, 
        description: 'Danh sách các lựa chọn Tâm Pháp quan trọng. Cung cấp ít nhất 3-4 lựa chọn.',
        items: tamPhapSchema 
    },
    phapBao: { 
        type: Type.ARRAY, 
        description: 'Danh sách 2-3 Pháp Bảo phù hợp nhất với build.',
        items: phapBaoSchema 
    },
    khiLinh: {
        type: Type.ARRAY,
        description: "Danh sách 1-2 Khí Linh phù hợp nhất với build.",
        items: khiLinhSchema
    },
    luuY: huongDanNangCaoSchema
  },
  required: ['gioiThieu', 'nghichThienCaiMenh', 'congPhap', 'tamPhap', 'phapBao', 'luuY']
};

const TIEN_THIEN_KHI_VAN_LIST = `
**Đỏ**
- Thiên đố anh tài: Ngộ tính +30, Tốc độ tu luyện +20%, Thọ mệnh -20, Thể lực tối đa -20
- Vũ pháp linh đồng: Tư chất công pháp +18, Công kích +5
- Vũ khí đại sư: Tư chất kiếm, đao, thương +20. Tốc độ thành thạo kỹ năng các hệ kiếm, đao, thương pháp tăng +30%
- Khai sơn song tuyệt: Tư chất quyền, chưởng +30, Phòng ngự +5
- Bạch hồng quán nhật: Tư chất thương, chỉ +30, Hội tâm +20
- Kiếm si: Tư chất kiếm pháp +30, Tốc độ thành thạo kỹ năng hệ kiếm +50%
- Thiên tam tài: Linh căn các hệ phong, hỏa, lôi +25, Công kích +3
- Địa tam tài: Linh căn các hệ thổ, mộc, thủy +25, Phòng ngự +3
- Lục căn bất tịnh: Tư chất linh căn +20, Niệm lực -80, Tinh lực tối đa -20, Công kích +3
- Lục căn thanh tịnh: Tư chất linh căn -10, Tư chất công pháp +10, Niệm lực +200, Tinh lực tối đa +10
- Nguyên tố chi lực: Tư chất linh căn +20, Tư chất công pháp -5
- Sỏa tử: Ngộ tính khóa chặt ở 20, Thọ mệnh +30, May mắn +30, Xuất hiện công pháp người ngốc mới có thể tu luyện
- Nhạc thiên nhất phái: May mắn +30, Mị lực +200, Cước lực +100, Tâm tình khôi phục đặc biệt nhanh
- Ma phách chi tôn: Công kích +5, Ngộ tính +15, Ma đạo +300, Khi bắt đầu trò chơi, mang theo một bản tâm pháp trúc cơ màu cam
- Anh hùng truyền thừa: Phòng ngự +5, Ngộ tính +15, Chính đạo trị +300, Khi bắt đầu trò chơi, mang theo một bản tâm pháp trúc cơ màu cam
- Quỷ cốc ngoại môn: Công kích+10, Ngộ tính +30, Danh vọng +150, Mị lực +100
- Chơi bùn đạt đồ: Khi bắt đầu trò chơi, mang theo một pháp bảo màu tím
- Tuyệt thế kỳ ngộ: Khi bắt đầu trò chơi, mang theo một tài liệu đột phá Nguyên Anh Cảnh
- Thiên mệnh chi tử: May mắn +50, Cước lực +100, Mị lực +200
- Võ thánh chuyển thế: Công kích +10, Phòng ngự +3, Ngộ tính +20, Danh vọng +100
- Nhân tộc thánh thể: Công kích+8, Ngộ tính +10, May mắn +10, Sinh lực tối đa +100, Mị lực +100
- Sát thần khí đồ: Công kích +8, Tư chất công pháp +15, Ngộ tính -10, Ma đạo +100
- Lục đạo tu ma giả: Công kích +5, Tư chất công pháp +6, Tư chất linh căn +6, Ngộ tính +10, Danh vọng +50, Ma đạo +100
- Cản thi đạo đồng: Phòng ngự +5, Tư chất quyền, chưởng, chỉ +20, Mị lực -100, Danh vọng +100, Ma đạo +80
- Hoàng triều di cô: May mắn +20, Mị lực +100, Khi bắt đầu trò chơi, mang theo một tâm pháp trúc cơ màu lam và 1000 linh thạch
- Bắc vực ma anh: Công kích +5, Tư chất quyền, chưởng, chỉ +10, Phong linh căn +20, Danh vọng +100
- Long môn cẩm lý: May mắn +40, Mị lực +50, Danh vọng +500, Phòng ngự +10, Chính đạo +50, Khi bắt đầu trò chơi, bị một tông môn ngẫu nhiên truy sát
- Hồng hộc sĩ tộc: Công kích +5, Tư chất công pháp +10, Tinh lực tối đa +10
- Thần tượng môn đồ: Tư chất luyện khí +35, Khi bắt đầu trò chơi, mang theo một pháp bảo có kèm khí linh ngẫu nhiên
- Đại năng chuyển thế: Ngộ tính +15, Khi bắt đầu trò chơi, mang theo một tài liệu đột phá Nguyên Anh Cảnh
- Tử cực thực lôi thể: Phòng ngự +5, Lôi linh căn +35, Tư chất linh căn hệ khác -10
- Minh âm ất hỏa thể: Phòng ngự +5, Hỏa linh căn +35, Tư chất linh căn hệ khác -10
- U tứ nhược thủy thể: Phòng ngự +5, Thủy linh căn +35, Tư chất linh căn hệ khác -10
- Thu nguyên bi phong thể: Phòng ngự +5, Phong linh căn +35, Tư chất linh căn hệ khác -10
- Địch trần linh thổ thể: Phòng ngự +5, Thổ linh căn +35, Tư chất linh căn hệ khác -10
- Cổ đằng bách mộc thể: Phòng ngự +5, Mộc linh căn +35, Tư chất linh căn hệ khác -10
- Ngu công di sơn: Sinh lực +80, Tinh lực tối đa +10, Niệm lực tối đa +50
- Hậu nghệ xạ nhật: Công kích +5, Cự ly công kích +20, Hội tâm +20
- Tinh vệ lấp hải: Thổ linh căn +20, Thủy linh căn +5, Di tốc +20
- Toản mộc thủ hỏa: Hỏa linh căn +20, Mộc linh căn +5, Phòng ngự +5
- Khoa phụ truy nhật: Niệm lực tối đa +50, Cước lực +150, Ngộ tính +10
- Hình thiên vũ cán thích: Công kích +10, Phòng ngự -3, Sinh lực tối đa +100
- Tứ diện thụ địch: Mị lực -300, Công kích +10, May mắn +10, Sinh lực tối đa +50
- Tam hoa bất diệt: Tư chất linh căn hệ hỏa, thổ lôi +20, Công kích +6, Chính đạo +100
- Kiến mộc linh thai: Mộc linh căn +25, Linh lực tối đa +50, Mị lực +150, Phòng ngự +5
- Quỷ cốc nội môn: Công kích +12, Ngộ tính +30, Khi bắt đầu trò chơi, mang theo một thân pháp màu cam ngẫu nhiên
- Khuynh quốc khuynh thành: Mị lực khóa chặt ở 900
- Nhất nặc thiên kim: Khi bắt đầu trò chơi, mang theo một đạo lữ với ngoại tính trung trinh
- Long tổ linh tức: Công kích +5, Di tốc +10, Tư chất thương pháp +5, Khi bắt đầu trò chơi, khởi tạo tông môn đặc thù – Ngự Long Sơn Trang

**Cam**
- Thiên sát cô tinh: Công kích +8, Hội tâm+20, Mị lực -300
- Thiên sinh ma thai: Công kích +6, Hội tâm+20, Ma đạo +100
- Thiên sinh đạo tử: Phòng ngự +6, May mắn +10, Mị lực +100, Chính đạo +100
- Lãnh huyết: Công kích +6, Hội tâm+20, Mị lực -100
- Ngự vật như thần: Tư chất các hệ đao, thương, kiếm +15, Công kích +3, Chính đạo +100
- Nhục thể ma thai: Tư chất các hệ quyền, chưởng, chỉ +15, Phòng ngự +3, Ma đạo +100
- Tà ma khí tử: Tư chất công pháp +10, Mị lực +100, Chính đạo +100
- Chính phái dư nghiệt: Tư chất công pháp +10, Mị lực +100, Ma đạo +100
- Phong lôi đạo thai: Phong linh căn +25, Lôi linh căn +25, Chính đạo +100, Công kích +3
- Thổ mộc đạo thai: Thổ linh căn +25, Mộc linh căn +25, Chính đạo +100, Công kích +3
- Phong hỏa ma thai: Phong linh căn +25, Hỏa linh căn +25, Ma đạo +100, Công kích +3
- Thổ thủy ma thai: Thổ linh căn +25, Thủy linh căn +25, Ma đạo +100, Công kích +3
- Dược linh thể: Tư chất luyện đan +30
- Tuyệt thế thông tuệ: Ngộ tính khóa chặt ở 150, Tâm tình tối đa -30, Mị lực -100
- Khẩu hàm ngọc hồ: Có bất thế kỳ duyên cùng cửu vĩ yêu hồ tộc
- Biến thể lân phiến: Có bất thế kỳ duyên cùng hiên viên tộc
- Thủ chưởng kỳ hậu: Có bất thế kỳ duyên cùng hữu hùng thị
- Gia truyền pháp bảo: Khi bắt đầu trò chơi, mang theo một pháp bảo màu lam
- Khoáng thế kỳ ngộ: Khi bắt đầu trò chơi, mang theo một vật liệu đột phá nhất phẩm Kim Đan Cảnh
- Đan tâm linh đồng: Tư chất luyện đan +20, Ngộ tính +10, Danh vọng +100, Chính đạo +50
- Linh bảo thượng đồ: Tư chất luyện khí +20, Ngộ tính +10, Danh vọng +100, Chính đạo +50
- Thần phù họa thủ: Ngộ tính +10, Họa phù +60, Danh vọng +100, Thọ mệnh -10
- Vọng khí nhân: Ngộ tính +10, Phong thủy +50, May mắn -10, Danh vọng +100
- Tam thanh đạo đồng: Ngộ tính +40, Thọ mệnh +10, Chính đạo +50, Tâm tình tối đa +20
- Thiên mệnh chi tôn: May mắn +30, Mị lực +200
- Truy phong kiếm giả: Công kích +5, Tư chất kiếm pháp +15, Phong linh căn +15
- Hàng long vũ giả: Công kích +5, Tư chất thương pháp +15, Lôi linh căn +15
- Ma đao nan dân: Công kích +5, Tư chất đao pháp +15, Hỏa linh căn +15
- Bất động minh vương: Phòng ngự +5, Tư chất các hệ quyền, chưởng, chỉ +14
- Vẫn tinh hàng thế: Tư chất luyện khí +30, May mắn +20, Thọ mệnh -20
- Trung năng chuyển thế: Ngộ tính +10, Khi bắt đầu trò chơi, mang theo một viên linh châu.
- Xuyên việt giả: Ngộ tính +20, Thọ mệnh +10, May mắn +10, Danh vọng +100
- Cổ thụ linh khu: Phòng ngự +4, Hộ tâm +10, Mộc linh căn +10, Thọ mệnh +5, Mị lực -100
- Long chi huyết mạch: Công kích +6, May mắn +10, Thọ mệnh +10
- Phượng chi huyết mạch: Công kích +6, May mắn +10, Mị lực +100
- Hổ chi huyết mạch: Công kích +6, Hội tâm+20
- Tượng chi huyết mạch: Phòng ngự +5, Sinh lực +100, May mắn +10
- Phượng hoàng linh thể: Tư chất kiếm pháp +14, Hỏa linh căn +14, Mị lực +150
- Đả hổ vũ giả: Phòng ngự +5, Hỏa linh căn +15, Tư chất quyền pháp +15
- Ngạo cốt tranh tranh: Phòng ngự +5, Sinh lực +130
- Tật phong tấn lôi: Di tốc +20, Cước lực +100, Tốc độ thành thục thân pháp +50%
- Lão gian cự hoạt: Giá cả khi mua đồ trong phường thị -20%, Mị lực -100
- Bạch hạc nhập mộng: Khi bắt đầu trò chơi, có 1 vị đại năng làm sư phụ.

**Tím**
- Trấn tĩnh như sơn: Tâm tình bất dung bất dịch, khó sản sinh cự đại biến hóa
- Thọ tinh hậu đại: Thọ mệnh +50
- Cuồng vọng tự đại: Công kích +6, Phòng ngự -2, Mị lực -100
- Kiếm ma chuyển thế: Tư chất kiếm pháp +25, Công kích +1, Ma đạo +50
- Đao ma chuyển thế: Tư chất đao pháp +25, Công kích +1, Ma đạo +50
- Thương ma chuyển thế: Tư chất thương pháp +25, Công kích +1, Ma đạo +50
- Quyền ma chuyển thế: Tư chất quyền pháp +25, Công kích +1, Ma đạo +50
- Chỉ ma chuyển thế: Tư chất chỉ pháp +25, Công kích +1, Ma đạo +50
- Chưởng ma chuyển thế: Tư chất chưởng pháp +25, Công kích +1, Ma đạo +50
- Kiếm tiên chuyển thế: Tư chất kiếm pháp +25, Công kích +1, Chính đạo +50
- Đao tiên chuyển thế: Tư chất đao pháp +25, Công kích +1, Chính đạo +50
- Thương tiên chuyển thế: Tư chất thương pháp +25, Công kích +1, Chính đạo +50
- Quyền tiên chuyển thế: Tư chất quyền pháp +25, Công kích +1, Chính đạo +50
- Chỉ tiên chuyển thế: Tư chất chỉ pháp +25, Công kích +1, Chính đạo +50
- Chưởng tiên chuyển thế: Tư chất chưởng pháp +25, Công kích +1, Chính đạo +50
- Lôi linh thể: Lôi linh căn +25
- Thổ linh thể: Thổ linh căn +25
- Hỏa linh thể: Hỏa linh căn +25
- Thủy linh thể: Thủy linh căn +25
- Phong linh thể: Phong linh căn +25
- Mộc linh thể: Mộc linh căn +25
- Luyện đan cuồng ma: Tư chất luyện đan +25, Ma đạo +50
- Đan tiên chuyển thế: Tư chất luyện đan +25, Chính đạo +100
- Phá thiên cơ: Tư chất phong thủy +40, Thể chất -20
- Thông minh tạ đỉnh: Ngộ tính +50, Mị lực -300
- Đại trí nhược ngu: Ngộ tính +50, Mỗi tháng mất 0.5% tổng lượng linh thạch đang có
- Tinh lực vượng thịnh: Tinh lực tối đa +20, Tốc độ tiêu hao tinh lực -30%
- Nhị tuyền ánh nguyệt: Ngộ tính +20, Thọ mệnh -20
- Thần tiên đệ tử: Khi trò chơi bắt đầu, mang theo một bí tịch thân pháp màu tím
- Động trung kỳ ngộ: Khi trò chơi bắt đầu, mang theo 3000 linh thạch
- Tiên tử sở tặng: Khi trò chơi bắt đầu, mang theo một nhẫn trữ vật màu tím
- Phú khả nhị đại: Khi trò chơi bắt đầu, mang theo 2000 linh thạch và một tọa kỵ - Phi kiếm
- Trường phát cập yêu: Phòng ngự +5, May mắn +5, Mị lực +100
- Tiểu năng chuyển thế: Ngộ tính +5, Khi trò chơi bắt đầu, mang theo một viên linh khí
- Cửu thiên lôi kiếp thể: Công kích +5, Lôi linh căn +20, Tư chất linh căn hệ khác -10
- Nguyên dương hỏa phần thể: Công kích +5, Hỏa linh căn +20, Tư chất linh căn hệ khác -10
- Hãn lưu thủy linh thể: Công kích +5, Thủy linh căn +20, Tư chất linh căn hệ khác -10
- Bắc vực phong thần thể: Công kích +5, Phong linh căn +20, Tư chất linh căn hệ khác -10
- Hậu hoàng thổ nguyên thể: Công kích +5, Thổ linh căn +20, Tư chất linh căn hệ khác -10
- Sâm la mộc tuyệt thể: Công kích +5, Mộc linh căn +20, Tư chất linh căn hệ khác -10
- Trường sinh thể: Thủy linh căn +15, Mộc linh căn +15, Thọ mệnh +10
- Lạc vũ thể: Thủy linh căn +15, Phong linh căn +15, Danh vọng +100
- Phần diễm thể: Công kích +5, Hỏa linh căn +10, Phong linh căn +10, Thọ mệnh -10
- Bạo viêm thể: Công kích +5, Hỏa linh căn +10, Lôi linh căn +10, Mị lực -100
- Minh vương thể: Công kích -1, Phòng ngự +5, Thổ linh căn +10, Mộc linh căn +10
- Môn phái khí đồ: Ma đạo +20, Ngộ tính +20, Thọ mệnh +50, Khi trò chơi bắt đầu, tu luyện sẵn một bộ tâm pháp và bị tông môn đó truy sát
- Ái thư như mệnh: Khi trò chơi bắt đầu, mang theo một bộ tâm pháp màu lam, Ngộ tính +30, Thọ mệnh -30
- Long thần hộ thể: Phòng ngự +5, Tư chất thương pháp +5, Mị lực +50
- Thương nghiệp kỳ tài: Giá trị hàng hóa tại thành trấn -10%

**Lam**
- Ngã hành ngã tố: Ma đạo +50, Tâm tình dễ dàng nâng cao
- Đao kiếm hiệp khách: Tư chất đao pháp cùng kiếm pháp +15
- Trạc nhất chỉ: Tư chất thương pháp cùng chỉ pháp +15
- Quyền chưởng liễu đắc: Tư chất quyền pháp cùng chưởng pháp +15
- Thường sơn nhân: Tư chất thương pháp +10, Chính đạo +10
- Lang hài: Công kích +5, Tư chất quyền pháp +10, Mị lực -100
- Kiếm thần chi tử: Công kích +2, Tư chất kiếm pháp +5, Ngộ tính +10
- Đao thần chi tử: Công kích +2, Tư chất đao pháp +5, Ngộ tính +10
- Thương thần chi tử: Công kích +2, Tư chất thương pháp +5, Ngộ tính +10
- Lôi kích bất tử: Lôi linh căn +20
- Thiêu thán giả: Hỏa linh căn +20
- Lãng lý bạch điều: Thủy linh căn +20
- Đôi thổ thành sơn: Thổ linh căn +20
- Thực thụ thành lâm: Mộc linh căn +20
- Thảo thượng phi: Phong linh căn +20
- Luyện đan cuồng nhân: Tư chất luyện đan +20, Ma đạo +20
- Đa tài đa nghệ: Tư chất luyện đan cùng luyện khí +15
- Thiên sinh tuệ căn: Tư chất linh căn +5, Ngộ tính +10
- Thiên tư căn cốt: Tư chất công pháp +5, Ngộ tính +10
- Cật khổ nại lao: Ngộ tính -5, Tốc độ tiêu hao tâm tình cùng tinh lực -30%
- Gia truyện vũ kỹ: Khi bắt đầu trò chơi, học sẵn một võ kỹ màu lam
- Gia đạo phú dụ: Khi bắt đầu trò chơi, mang theo 1000 linh thạch
- Hôn ước tại thân: Khi bắt đầu trò chơi, mang theo một nhẫn trữ vật màu lam
- Phiên phiên lương nhân: Phòng ngự +2, Mị lực +50, Danh vọng +50
- Y mệ phiêu phiêu: Phong linh căn +5, Mị lực +100, Danh vọng +50
- Thiên sinh linh thể: Linh lực +100
- Ưng nhãn: Hội tâm +30

**Lục**
- Chiến đấu cuồng nhân: Công kích +2, Ma đạo +50, Mị lực -100
- Sát trư giả: Công kích +2, Hội tâm+10
- Thủ sao bản lật: Tư chất chưởng pháp +15, Tư chất chỉ pháp -10
- Pha thiện đạn cung: Tư chất chỉ pháp +10
- Hảo đả sa bao: Tư chất quyền pháp +10
- Hảo sử biển đam: Tư chất thương pháp +10
- Phách sài hảo thủ: Tư chất đao pháp +10
- Hảo ngoạn oa sạn: Tư chất kiếm pháp +10
- Thủy hương hài tử: Thủy linh căn +10, Mị lực +50
- Sâm lâm hài tử: Mộc linh căn +10, Mị lực +50
- Chích viêm hài tử: Hỏa linh căn +10, Mị lực +50
- Sơn khâu hài tử: Thổ linh căn +10, Mị lực +50
- Truy phong hài tử: Phong linh căn +10, Mị lực +50
- Lôi đình hài tử: Lôi linh căn +10, Mị lực +50
- Tiểu đan đồng: Tư chất luyện đan +12
- Khám dư sư: Tư chất phong thủy +25
- Thiết tượng nhi tử: Tư chất luyện khí +15, Mị lực -50
- Trường thọ khu: Thọ mệnh +20, Thể chất +10, Mị lực +100, Chính đạo +100
- Đan thân quý tộc: Mị lực +100, Danh vọng +150
- Hống thanh như lôi: Công kích +5, Mị lực -50, Danh vọng +50
- Vân du thiên hạ: Mị lực +150, Danh vọng +100
- Hạo nhiên chính khí: Danh vọng +100, Mị lực +100, Chính đạo +100
- Tà khí ngoại lộ: Danh vọng +100, Mị lực +100, Ma đạo +100
- Tiếu diện nhân: Mị lực +100, Chính đạo +100

**Xám**
- Hồi hương đậu: May mắn +20, Thọ mệnh -10
- Trư đột: Công kích +6, Phòng ngự -4
- Mộc tượng: Công kích -1, Ngộ tính +20
- Vi nhân chính phái: Chính đạo +50, Mị lực +100
- Vô cụ lôi giả: Lôi linh căn +5
- Ấu niên ngoạn hỏa: Hỏa linh căn +5
- Thiện thủy chi nhân: Thủy linh căn +5
- Cổn thổ ngoan đồng: Thổ linh căn +5
- Hỉ hảo mộc thực: Mộc linh căn +5
- Ái phóng phong tranh: Phong linh căn +5
- Quỷ họa phù: Tư chất phong thủy +10, Tinh lực +10
- Thiển thức quái tượng: Tư chất phong thủy +10, May mắn +10
- Hàm nhân: Ngộ tính -10, Mị lực +200
- Nạo tử: Ngộ tính -10, Tâm tình khôi phục rất nhanh
- Trí kế quá nhân: Ngộ tính +10, May mắn -10, Mị lực +100
- Vũ văn lộng mặc: Tư chất công pháp -5, Ngộ tính +25
- Thư hương môn đệ: Tư chất công pháp -3, Ngộ tính +20
- Vũ đao lộng thương: Tư chất công pháp +3, Ngộ tính -5
- Võ đạo thế gia: Tư chất công pháp +3, Ngộ tính -5
- Tả phiết tử: Ngộ tính +15, Danh vọng -50
- Thiên mệnh giả tằng tôn: May mắn -5, Mị lực +150
`;

const NGHICH_THIEN_CAI_MENH_LIST = `
Nghịch thiên cải mệnh chuyên dụng của đan tu
700205 - Linh đan diệu dược – (Trúc Cơ) Hiệu quả của đan dược hồi phục sinh lực cùng linh lực tăng 100%.
700206 - Đan tinh dược tủy – (Trúc Cơ) Thời gian hiệu lực của các loại đan dược tăng 50%.
700208 - Ngọc dịch quy nguyên – (Trúc Cơ) Mỗi khi sử dụng tuyệt kỹ, thời gian hồi chiêu của đan dược -5s. Cách mỗi 8s mới có thể phát động hiệu quả một lần

Nghịch thiên cải mệnh cho phép bỏ điều kiện thần thông
700034 - Đồ thủ chuyên tinh – (Kết Tinh) Sử dụng thần thông của các hệ Quyền / Chưởng / Chỉ không cần đạt đủ điều kiện.
700035 - Binh nhận chuyên tinh – (Kết Tinh) Sử dụng thần thông của các hệ Đao / Kiếm / Thương không cần đạt đủ điều kiện.
700036 - Phong lôi kình thiên – (Kết Tinh) Sử dụng thần thông của các hệ Phong / Lôi không cần đạt đủ điều kiện.
700037 - Địa hỏa minh di – (Kết Tinh) Sử dụng thần thông của các hệ Thổ / Hỏa không cần đạt đủ điều kiện.
700038 - Thủy mộc trường sinh – (Kết Tinh) Sử dụng thần thông của các hệ Thủy / Mộc không cần đạt đủ điều kiện.

Nghịch thiên cải mệnh có cơ chế chuỗi
Yêu Thuật
700001 - Yêu Thuật Nhập Môn - (Trúc Cơ) Công kích đi kèm yêu pháp, mỗi khi gây ra sát thương, có tỷ lệ 10% có thể biến mục tiêu thành một con tiểu kê vô hại, duy trì 10s. Có thể thăng cấp.
700002 - Yêu Thuật Tiến Giai – (Kết tinh) Công kích đi kèm yêu thuật mạnh mẽ, mỗi khi gây ra sát thương, có tỷ lệ 10% có thể biến mục tiêu thành tiểu kê cuồng bạo, duy trì 10s. Có thể thăng cấp.
700003 - Yêu Thuật Tinh Thông - (Cụ Linh) Công kích đi kèm yêu thuật chi lực cực kỳ đáng sợ, Mỗi khi gây ra sát thương, có tỷ lệ 10% có thể biến mục tiêu cùng đối tượng xung quanh thành tiểu kê cuồng bạo, duy trì 10s.

Cúc Hoa
700004 - Cúc Hoa Năng - (Trúc Cơ) Tăng 15% tốc độ di chuyển trong trận. Tăng 10% sát thương tới từ mặt sau. Có thể thăng cấp.
700005 - Cúc Hoa Hồng – (Kết Tinh) Tăng 20% tốc độ di chuyển trong trận. Tăng 10% sát thương tới từ mặt sau. Ngoài ra có 10% thả ra một đoàn liệt diễm phục thù vào kẻ gây ra sát thương cho ngươi. Có thể thăng cấp.
700006 - Cúc Hoa Tàn – (Kim Đan) Tăng 20% tốc độ di chuyển trong trận. Giảm 50% sát thương tới từ mặt sau. Ngoài ra có 10% thả ra một đoàn liệt diễm phục thù vào kẻ gây ra sát thương cho ngươi.

Cân Thí Trùng
700007 – Tiểu Cân Thí Trùng - (Trúc Cơ) Ngươi thu được một con sâu kỳ quái. Có thể thăng cấp.
700008 - Trung Cân Thí Trùng – (Kết Tinh) Con sâu có vẻ to hơn. Có thể thăng cấp.
700009 - Đại Cân Thí Trùng – (Kim Đan) Con sâu có vẻ lại to ra nữa. Có thể thăng cấp.
700126 - Tiểu Cùng Thí Long – (Cụ Linh) Trong chiến đấu, nó sẽ giúp ngươi công kích địch nhân. Nếu như ngươi đột nhiên thay đổi vị trí do sử dụng kỹ năng đột tiến hoặc dịch chuyển, cân thí trùng sẽ trở nên cuồng bạo do không bắt kịp ngươi. Tăng mạnh tần suất công kích và sát thương, duy trì 3.5s.
700188 - Tiềm Long Thức Tỉnh – (Nguyên Anh) Có thể hóa hình.
700189 – Kháng Long Hóa Sinh – (Nguyên Anh) Hóa thành nhân hình (Đực), có thể hợp thể.
700190 - Nhu Long Tụ Hợp – (Nguyên Anh) Hóa thành nhân hình (Cái), có thể hợp thể.

Bảo Đích Thuẫn
700010 - Tiểu Bảo Đích Thuẫn - (Trúc Cơ) Linh lực ngưng kết thành một tấm thuẫn, có thể ngăn cản công kích dạng đường đạn. Khi có địch nhân sử dụng kỹ năng, tấm thuẫn có thể phát xạ một đạo hỏa diễm. Có thể thăng cấp.
700011 - Trung Bảo Đích Thuẫn – (Kết Tinh) Thuẫn mỗi khi ngăn cản 5 lần công kích, sẽ phát ra một đợt rung chấn, gây sát thương và làm chậm. Tấn công thêm 3 địch nhân. Có thể thăng cấp.
700012 - Đại Bảo Đích Thuẫn – (Kim Đan) Thuẫn sẽ phát ra một đợt chấn động lớn, đẩy lui địch nhân, giảm 25% sát thương của đối thủ.

Phi kiếm
700013 - Tiểu Lý Phi Kiếm - (Trúc Cơ) Linh lực ngưng kết thành một thanh phi kiếm. Khi ngươi phát động công kích, phi kiếm sẽ tự động công kích đối phương. Có thể thăng cấp.
700014 - Trung Lý Phi Kiếm – (Kết Tinh) Phi kiếm khi gây sát thương sẽ ngẫu nhiên phát động một trong những hiệu ứng: Trúng độc, Vựng huyễn, Giảm tốc... Có thể thăng cấp.
700015 - Đại Lý Phi Kiếm – (Kim Đan) Mỗi khi phi kiếm công kích 10 lần, sẽ phóng thích một lần Vạn Kiếm Xuất Sào, bắn ra đại lượng phi kiếm.

Quỷ tu
700022 - Quỷ Tu Nhập Môn – (Kết Tinh) Khi tiêu diệt địch nhân, có 10% chuyển hóa thành Thi Khôi. Tối đa 2. Có thể thăng cấp.
700023 - Quỷ Tu Tiến Giai – (Kim Đan) Tối đa 4 Thi Khôi. Có thể thăng cấp.
700024 - Quỷ Tu Tinh Thông – (Cụ Linh) Tối đa 6 Thi Khôi.

Huyết ma, sát, yểm
700028 - Huyết Ma Đại Pháp - (Trúc Cơ) Mỗi khi gây ra sát thương cho địch nhân trong phạm vi 300, chuyển hóa 7% thành sinh lực. Có thể thăng cấp.
700055 - Huyết Sát Đại Pháp – (Kết Tinh) Phạm vi 350, chuyển hóa 14% thành sinh lực. Có thể thăng cấp.
700056 - Huyết Yểm Đại Pháp – (Cụ Linh) Phạm vi 400, chuyển hóa 21% thành sinh lực.

Song, tam, tứ linh
700050 - Song Linh Cộng Sinh – (Kết Tinh) Lúc phóng ra tuyệt kỹ và thần thông, có 25% phát ra một lần nữa, gây 30% sát thương. Có thể thăng cấp.
700060 - Tam Linh Cộng Sinh – (Cụ Linh) 25% phát ra hai lần nữa. Có thể thăng cấp.
700061 - Tứ Linh Cộng Sinh – (Hóa Thần) 25% phát ra ba lần nữa.

Ma linh
700053 - Ma Linh Tiên Lực – (Trúc Cơ) Sắp chết sẽ hóa thành dược linh, hồi phục 30% sinh lực. Có thể thăng cấp.
700054 - Ma Linh Thần Lực – (Kết Tinh) Mỗi 10-20 giây sẽ đẻ ra một cây nấm nhỏ để ăn. Sắp chết hồi 50% sinh lực.

Hồng trần
700039 - Hồng Trần Kiếm Hạp – (Kết Tinh) Mỗi khi gây ra 200 lần sát thương, khi sử dụng thần thông sẽ triệu hoán 6 kiếm ảnh. Có thể thăng cấp.
700057 - Hồng Trần Kiếm Hồn – (Kim Đan) Mỗi khi gây ra 400 lần sát thương, triệu hoán 12 kiếm ảnh.

Thuẫn linh
700080 - Thuẫn Linh Nhập Môn - (Trúc Cơ) Sắp chết nhận được hộ thuẫn 30% sinh lực tối đa. Có thể thăng cấp.
700081 - Thuẫn Linh Tiến Giai – (Kết Tinh) Hộ thuẫn 50% sinh lực tối đa, trong 10s phản 200% sát thương. Có thể thăng cấp.
700082 - Thuẫn Linh Tinh Thông – (Kim Đan) Hộ thuẫn vỡ sẽ phát nổ.

Kim thiền
700086 - Kim Thiền Vô Ảnh - (Trúc Cơ) Sắp chết sẽ độn thổ, mỗi giây hồi 5% sinh mệnh, kéo dài 5s. Có thể thăng cấp.
700087 - Kim Thiền Giả Ảnh – (Kết Tinh) Hồi 10% sinh mệnh, tạo ra huyễn ảnh. Có thể thăng cấp.
700088 - Kim Thiền Huyết Ảnh – (Kim Đan) Huyễn ảnh chết sẽ tự bạo.

Linh pháp
700111 - Linh Pháp Nhập Môn - (Trúc Cơ) Tầm bắn linh kỹ tăng 10%. Có thể thăng cấp.
700112 – Linh Pháp Tiến Giai – (Kết Tinh) Tầm bắn linh kỹ tăng 20%. Có thể thăng cấp.
700113 - Linh Pháp Tinh Thông – (Kim Đan) Tầm bắn linh kỹ tăng 30%.

Vũ pháp
700114 - Vũ Pháp Nhập Môn - (Trúc Cơ) Thời gian hồi chiêu của võ kỹ -15%. Có thể thăng cấp.
700115 - Vũ Pháp Tiến Giai – (Kết Tinh) Thời gian hồi chiêu của võ kỹ -25%. Có thể thăng cấp.
700116 - Vũ Pháp Tinh Thông – (Kim Đan) Thời gian hồi chiêu của võ kỹ -40%.

Tiềm năng
700083 - Tiềm Năng Nhập Môn - (Trúc Cơ) Sắp chết, hồi 30% sinh lực, tăng 25% tốc độ di chuyển. Có thể thăng cấp.
700084 - Tiềm Năng Tiến Giai – (Kết Tinh) Hồi 50% sinh lực, tăng 25% tốc độ di chuyển, +15% công kích. Có thể thăng cấp.
700085 - Tiềm Năng Tinh Thông – (Kim Đan) Hồi 80% sinh lực, tăng 25% tốc độ di chuyển, +15% công kích, thời gian hồi chiêu -20%.

Huyết linh
700092 - Huyết Linh Nhập Môn - (Trúc Cơ) Khi không đủ linh lực, tiêu hao sinh lực để phát động kỹ năng (tỷ lệ 5:1). Có thể thăng cấp.
700093 - Huyết Linh Tiến Giai – (Kết Tinh) Tỷ lệ 4:1, tăng 20% sát thương. Có thể thăng cấp.
700094 - Huyết Linh Tinh Thông – (Kim Đan) Tỷ lệ 3:1, tăng 25% sát thương, hồi chiêu -20%.

Kiếm linh
700101 - Kiếm Linh Nhập Môn - (Trúc Cơ) Thao túng ma kiếm, công kích địch nhân. Có thể thăng cấp.
700102 - Kiếm Linh Tiến Giai – (Kết Tinh) Mỗi khi tiêu hao linh lực, ma kiếm tăng sát thương. Có thể thăng cấp.
700103 - Kiếm Linh Tinh Thông – (Kim Đan) Ma kiếm hấp thụ 5% linh lực của đối phương.

Huyết tế
700104 - Huyết Tế Nhập Môn - (Trúc Cơ) Tiêu hao sinh mệnh ngưng tụ huyết trảo, gây sát thương và tăng sinh lực tối đa. Có thể thăng cấp.
700105 - Huyết Tế Tiến Giai – (Kết Tinh) Huyết trảo để lại huyết trận gây sát thương. Có thể thăng cấp.
700106 - Huyết Tế Tinh Thông – (Kim Đan) Huyết trận hồi phục sinh lực.

Thị linh
700107 - Thị Linh - (Trúc Cơ) Tiêu diệt địch có 15% rơi linh phách, hồi 1% linh lực. Có thể thăng cấp.
700108 - Liệp Linh – (Kết Tinh) 20% rơi linh phách, hồi 1% linh lực, -1s hồi chiêu tuyệt kỹ.

Thị tinh
700109 - Thị Tinh - (Trúc Cơ) Tiêu diệt địch có 15% rơi linh phách, hồi 1% sinh lực. Có thể thăng cấp.
700110 - Liệp Tinh – (Kết Tinh) 15% rơi linh phách, hồi 1% sinh lực, tăng 30% tốc độ di chuyển.

Luyện khí
700134 - Luyện Khí Học Đồ - (Trúc Cơ) Tư chất luyện khí +20, niệm lực +500. Có thể thăng cấp.
700135 – Luyện Khí Tượng Nhân – (Kết Tinh) Tư chất luyện khí +50, niệm lực +2000. Có thể thăng cấp.
700136 - Luyện Khí Tông Sư – (Kim Đan) Tư chất luyện khí +100, niệm lực +5000.

Huyễn Linh Oa
700130 - Huyễn Linh Oa - (Trúc Cơ) Tăng xác suất luyện đan, tốc độ di chuyển -15%, tổn thương từ mặt sau -15%. Úp nồi cho đồng minh. Có thể thăng cấp.
700204 - Thiên Cấp Huyễn Linh Oa – (Kim Đan) Giảm 30% sát thương nhận vào từ sau lưng. Số lượng đan dược mang theo +10. Thời gian hồi chiêu đan dược +30%.

Linh năng
700089 - Linh Năng Chi Vũ - (Trúc Cơ) Linh lực < 20%, hồi 60% linh lực. Có thể thăng cấp.
700090 - Linh Măng Chi Tuyền – (Kết Tinh) Hồi 80% linh lực và làm mới hồi chiêu. Có thể thăng cấp.
700091 - Linh Năng Chi Triều – (Kim Đan) Hồi 100% linh lực, làm mới hồi chiêu. Trong 10s, hồi chiêu -50%.

Quy nhất
700040 - Quy Nhất Quyết – (Kết Tinh) Nhận sát thương 50 lần, thi triển thần thông tạo vòng bảo hộ chặn 80% sát thương. Có thể thăng cấp.
700058 - Quy nhất chân quyết – (Kim Đan) Nhận sát thương 100 lần, vòng bảo hộ chặn 90% sát thương.

Tinh diệu
700041 - Tinh Diệu Tần Hoàn – (Kết Tinh) Tiêu diệt 25 kẻ địch, thi triển thần thông sinh ra Tinh Diệu Chi Quang, đâm mù và gây sát thương. Có thể thăng cấp.
700059 - Tinh Diệu Cửu Tiêu – (Kim Đan) Tiêu diệt 50 kẻ địch, hiệu quả mạnh hơn.

Nghịch thiên cải mệnh tông & lẻ
700140 - Thiên đồng chi nhận: Công kích gây sát thương thấp nhất là xxx.
700144 - Đạp tuyết vô ngân: Tốc độ di chuyển +20%. Mỗi 10 giây, miễn nhiễm sát thương một lần.
700152 - Xuyên vân điện thiểm: Mỗi 30 điểm tốc độ di chuyển, tăng 1% sát thương. Tối đa 30%.
700153 - Tái vật vô cương: Mỗi 15 giây, hấp thu sát thương trong 3 giây rồi bạo phát ra xung quanh.
700154 - Liệt hỏa liệu nguyên: Uy lực thần thông tăng 50%, tiêu hao thêm 10% sinh lực tối đa.
700155 - Hổ phách long hồn: Mỗi khi tuyệt kỹ trúng địch nhân, có 40% phát ra hiệu ứng Hổ phách hoặc Long hồn.
700156 - Ngưng nguyên tịch diệt: Khi nhận sát thương > 15% sinh lực tối đa sẽ chuyển hóa thành sinh lực tối đa, đóng băng địch.
700157 - Bài sơn đảo hải: Sau 100 lần gây sát thương, 5 giây tiếp theo nhất định sẽ bạo kích.
700158 - Sát tâm sậu khởi: Sau 50 lần gây sát thương, 5s tiếp theo bạo kích, bạo kích bội suất +100%.
700159 - Lô hỏa thuần thanh: Tổn thương võ kỹ / linh kỹ đề thăng 25%.
700160 - Thiên ngoại hữu thiên: Mỗi lần kích hoạt thần thông nhận một tầng. Sát thương +15%, giảm 10% tổn thương. Tối đa 2 tầng.
700162 - Nhiếp thần hàn quang: Mỗi lần thi triển thần thông, toàn bộ địch nhân bị mê muội 5 giây.
700182 - Thiên nhân hợp nhất: Mỗi lần dùng võ kỹ tích lũy 1 tầng Thiên Nhân Ấn, tăng sát thương tuyệt kỹ. Tối đa 50 tầng.
700183 - Thiên cương bộ pháp: Sau khi sử dụng thân pháp, 5 giây tiếp theo, tổn thương nhận vào -50%.
700184 - Chấn thiên nộ khiếu: Mỗi khi nhận 10% sát thương sinh lực, phát ra tiếng thét khiến địch sợ hãi, giảm sát thương.
700185 - Tụ lôi tiêm kích: Mỗi 2 giây nhận 1 tầng tụ lôi. Khi bị thương, tiêu hao 1 tầng, phát ra lôi điện.
700186 - Túc mệnh chi dẫn: Mỗi 30 giây, kết nối với kẻ địch nhiều máu nhất, miễn giảm 50% tổn thương và truyền cho mục tiêu.
700137 - Thiên địa đồng thọ: Sắp chết, vô địch 2 giây, gây sát thương chuẩn bằng 15% sinh lực tối đa của địch.
700016 - Hỏa lực tứ xạ - (Trúc Cơ): Công kích 15% ném ra hỏa cầu.
700017 - Thủy lực tứ xạ - (Trúc Cơ): Công kích 10% ném ra cột nước.
700119 - Lôi lực tứ xạ - (Trúc Cơ): Tuyệt kỹ 50% phát ra 6 lôi cầu xoay quanh.
700121 - Phong lực tứ xạ - (Trúc Cơ): Tuyệt kỹ 30% tạo ra vòng hút.
700123 - Mộc lực tứ xạ - (Trúc Cơ): Mỗi 12 giây triệu hoán tiểu hoa yêu.
700018 - Hàm trư thủ – (Kết Tinh): Ăn trộm chắc chắn thành công nhưng bị phát hiện.
700019 - Mị cốt - (Trúc Cơ): Dễ thân mật với người khác.
700020 - Cước để mạt du – (Kim Đan): Chạy trốn 100% thành công.
700021 - Bào đắc ngận soái - (Trúc Cơ): Chạy trốn thành công, đối phương có hảo cảm.
700025 - Hoàng cân thiên sư - (Trúc Cơ): Lần đầu dùng thần thông triệu hoán Hoàng Cân Thiên Sư.
700026 - Võ thần tàn quyết – (Kim Đan): Vào trận, sinh lực còn 10, còn lại chuyển thành Hộ thuẫn.
700027 - Thanh đế di lục – (Kim Đan): Sắp chết, huyễn hóa thành 12 tiểu hoa yêu. Nếu còn sống, người chơi hồi sinh.
700030 - Nhục bác chi giao - (Trúc Cơ): Luận bàn thắng, tăng hảo cảm.
700031 - Sát khí - (Trúc Cơ): Tỷ lệ bị ghét, giảm bị phục kích.
700032 - Song tu đại pháp - (Trúc Cơ): Song tu thêm 30% kinh nghiệm, được tặng đồ.
700033 - Tiên thụ hậu công – (Kết Tinh): Mỗi 6% sinh lực bị tổn thương, tăng 1% sát thương. Tối đa 100%.
700042 - Đố hỏa trung thiêu - (Trúc Cơ): Sát thương +30% với người có đạo lữ.
700043 - Linh quả quỹ tặng - (Trúc Cơ): Hàng năm được tặng 1 linh quả.
700044 - Lão nhi di kiên - (Trúc Cơ): Mỗi 1 tuổi tăng 1 phòng ngự.
700045 - Vật tận kỳ dụng - (Trúc Cơ): Tiêu hao linh thạch, hấp thu linh khí.
700046 - Tật tốc đại tạ - (Trúc Cơ): Dùng đan dược, 60% ị ra viên đó để dùng lại.
700047 - Thông thiên chi nhãn – (Cụ Linh): 20% học kỹ năng của đối phương.
700049 - Thiên địa tinh hoa - (Trúc Cơ): Tu luyện trên bản đồ lớn hồi phục.
700062 - Tốc độc bí pháp - (Trúc Cơ): Học bí tịch -10 ngày.
700063 - Toản nghiên bí thuật - (Trúc Cơ): Học bí tịch -80% linh thạch.
700064 - Khổ trung tầm nhạc - (Trúc Cơ): Học bí tịch -80% tâm tình.
700065 - Linh quang nhất thiểm - (Trúc Cơ): Học bí tịch +100% kinh nghiệm.
700075 - Khai tâm quả - (Trúc Cơ): Tâm tình tối đa +50.
700077 - Sinh long hoạt hổ - (Trúc Cơ): Tinh lực tối đa +50.
700078 - Cơ linh quỷ - (Trúc Cơ): Ngộ tính +50.
700095 - Linh lực chi chủng - (Trúc Cơ): Linh lực tối đa +10%.
700096 - Linh lực chi nha – (Kết Tinh): Linh lực tối đa +20%.
700097 - Linh lực chi thụ – (Kim Đan): Linh lực tối đa +30%.
700098 - Thể lực chi chủng - (Trúc Cơ): Sinh lực tối đa +10%.
700099 - Thể lực chi nha – (Kết Tinh): Sinh lực tối đa +20%.
700100 - Thể lực chi thụ – (Kim Đan): Sinh lực tối đa +30%.
700117 - Lý tứ lai dã – (Kết Tinh): Sinh lực < 30%, Lý Tứ có thể xuất hiện.
700118 - Kê trung bá vương – (Kết Tinh): Sinh lực < 30%, Kê Vương có thể xuất hiện.
700131 - Chấn phấn cổ vũ – (Kim Đan): Mỗi 10 giây, xuất hiện chiến cổ gây sát thương và giảm sát thương địch.
700132 - Hóa vật – (Kết Tinh): Mỗi pháp bảo trang bị, sinh lực tối đa +7%.
700133 - Tùy tâm nhi ngự – (Kim Đan): Dùng kỹ năng bản mệnh của khí linh không cần điều kiện.
700194 - Địa yểm quỷ trảm – (Vũ Hóa): Dùng võ kỹ 5% phát ra khí nhận khổng lồ.
700195 - Thiên vũ phong sát – (Vũ Hóa): Dùng thần thông sinh ra 12 gió lốc.
700196 - Vi nhân vi kỷ – (Vũ Hóa): Vật triệu hồi bị tấn công, 30% phản sát thương.
700197 - Bắc minh phi sương – (Vũ Hóa): Dùng tuyệt kỹ 5 lần, rơi băng sương gây sát thương và đóng băng.
700198 - Yên la huyễn chướng – (Vũ Hóa): Vật triệu hồi gây sát thương sẽ trúng độc, 30 tầng sẽ nổ.
700199 - Thần hỏa thiên tinh – (Vũ Hóa): Khi thi pháp, bắn ra hỏa cầu.
700200 - Thần tiêu tịnh trần – (Vũ Hóa): Dùng thần thông, triệu hoán 12 đạo sấm sét.
700201 - Hào viêm chước nhật – (Vũ Hóa): 50 lần tổn thương, dẫn bạo ấn ký và để lại liệt diễm.
700202 - Chưởng nội càn khôn – (Vũ Hóa): Dùng lĩnh vực, -90% đạo lực tiêu hao.
700212 - Hoa uẩn lưu đan: Trên trận ngẫu nhiên xuất hiện đan dược.
700210 - Tiêu Dao Du: Cước lực +500. Không gia nhập tông môn, tu luyện có tỉ lệ nhận linh quả.

Nghịch thiên cải mệnh về đạo điểm
700066 - Nhược hữu đạo tâm - (Trúc Cơ) +30 đạo điểm.
700067 - Tự hữu đạo tâm – (Kết Tinh) +50 đạo điểm.
700068 - Lược hữu đạo tâm – (Kim Đan) +80 đạo điểm.
700069 - Tiểu hữu đạo tâm – (Cụ Linh) +140 đạo điểm.
700070 - Cảm thụ đạo tâm – (Nguyên Anh) +200 đạo điểm.
700071 - Lĩnh ngộ đạo tâm – (Hóa Thần) +300 đạo điểm.
700072 - Thông hiểu đạo tâm – (Ngộ Đạo) +450 đạo điểm.
700073 - Tâm hữu đạo tâm – (Vũ Hóa) +700 đạo điểm.
700074 – Truyện thừa đạo tâm – (Đăng Tiên) +1000 đạo điểm.

Nghịch thiên cải mệnh theo đạo tâm
700181 - Phong khởi linh động – Bất Tức, Vô Định: Đồng đội bị đánh bại, có thể cứu thương.
700168 - Thấu thể hóa kình – Tể Ngự, Trường Hằng: Đồng đội sinh lực < 30%, tiêu hao sinh lực, debuff địch.
700176 - Viêm hỏa cương liệp – Vạn Tượng, Phúc Sinh: Triệu hoán ổ heo.
700169 - Kim châm thứ huyệt – Tuần Thiên, Bách Hiểu: Sát thương bản thân -50%, sát thương đồng minh +15%.
700167 - Quy kình phân nguyên – Thượng Thiện: Hi sinh sinh lực, tạo hộ thuẫn cho đồng đội.
700178 - Phù sinh phao ảnh – Hóa Ngại: Sinh ra bong bóng, nhốt địch.
700180 - Thiên lôi cuồn cuộn – Kế Minh: Tạo mưa, giảm tốc địch, sét đánh ngẫu nhiên.
700174 - Hậu đức tái vật – Khô Nhiên: Sát thương nhận vào -60%, gánh 30% tổn thương cho đồng đội.
700177 - Thanh khâu chi chủ - Tu Tỉnh: Triệu hoán hồ yêu, biến địch thành ếch.
700164 - Đại mạc cuồng đao – Vô Cữu: Tạo bão cát, gây sát thương theo % máu.
700175 - Huyền hồ tế thế - Quy Tàng: Sát thương -50%, dùng đan hồi phục, đồng đội cũng được.
700179 - Truy ảnh kỳ hoàn – Chỉ Du: Di chuyển đặt trứng nổ.

Nghịch thiên cải mệnh Thiên Cơ – Quy Nhất
700191 - Thất tinh kiếm bộc: Dùng tuyệt kỹ, triệu hồi 7 phi kiếm.
700193 - Minh hà chi chủ: Dùng thần thông, hiến tế triệu hoán vật để gọi Ngọc Ngư Vương.

Nghịch thiên cải mệnh quest con bé đa nhân cách
700212 - Hoa uẩn lưu đan: Trong chiến đấu, trên trận ngẫu nhiên sẽ xuất hiện một vài viên đan dược.
Bích nhị hàm linh: Mỗi 35 giây có một đóa hoa sen. Tương tác để phát động kỹ năng bản mệnh của khí linh.

Nghịch thiên cải mệnh cho Luyện Yêu Hồ
700209 - Huyền hồ ngự yêu – (Nguyên Anh): Hồi chiêu Luyện Yêu Hồ -50%. Hồ yêu chưa huyễn hóa, mỗi giây hồi 1% sinh lực.
`;

export const generateBuildGuide = async (paths: CultivationPath[], linhCan: LinhCan, tinhAnh: TinhAnh, playstyle: string): Promise<BuildGuide> => {
    const ai = getGeminiClient();
    const prompt = `
    Bạn là một chuyên gia về game Quỷ Cốc Bát Hoang (Tale of Immortal).
    Nhiệm vụ của bạn là tạo một hướng dẫn build nhân vật chi tiết dựa trên các lựa chọn của người dùng.
    Bạn PHẢI tuân thủ các quy tắc sau:
    1.  **Tiên Thiên Khí Vận**: Chỉ được chọn đúng 3 Tiên Thiên Khí Vận từ danh sách được cung cấp. Phải ghi đúng tên như trong danh sách.
    2.  **Nghịch Thiên Cải Mệnh**: Chỉ được chọn các Nghịch Thiên Cải Mệnh từ danh sách được cung cấp. Phải ghi đúng tên như trong danh sách.
    3.  **Định dạng**: Luôn trả về kết quả dưới dạng JSON hợp lệ theo schema đã cho. Không thêm bất kỳ văn bản nào ngoài JSON.
    4.  **Chi tiết**: Cung cấp phân tích sâu sắc, logic và tối ưu hóa cho lối chơi đã chọn. Giải thích lý do tại sao các lựa chọn lại có sức mạnh tổng hợp với nhau.
    5.  **Từ Khóa (词条)**: Phân tích từ khóa cho Công Pháp và Tâm Pháp phải thật chi tiết, phân loại chúng và giải thích lợi ích.

    **Yêu cầu của người dùng:**
    - Lộ tuyến tu luyện: ${paths.join(' + ')}
    - ${linhCan !== LinhCan.None ? `Ưu tiên Thiên Đạo Linh Căn: ${linhCan}` : ''}
    - ${tinhAnh !== TinhAnh.None ? `Ưu tiên chỉ số tinh anh: ${tinhAnh}` : ''}
    - Phong cách chơi: ${playstyle}

    ---
    **DANH SÁCH TIÊN THIÊN KHÍ VẬN (Bắt buộc chọn từ đây, bản dịch Dâm Đồ Diệt Tu Tiên):**
    ${TIEN_THIEN_KHI_VAN_LIST}
    ---
    **DANH SÁCH NGHỊCH THIÊN CẢI MỆNH (Bắt buộc chọn từ đây, bản dịch Dâm Đồ Diệt Tu Tiên):**
    ${NGHICH_THIEN_CAI_MENH_LIST}
    ---

    Dựa vào các thông tin trên, hãy tạo một hướng dẫn build hoàn chỉnh theo schema JSON.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: buildGuideSchema,
            temperature: 0.8,
            topP: 0.95,
        }
    });

    try {
        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);
        return parsed as BuildGuide;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON", e);
        console.log("Raw response:", response.text);
        throw new Error("AI đã trả về một định dạng không hợp lệ. Vui lòng thử lại.");
    }
};

export const compareBuildGuides = async (build1: HistoryItem, build2: HistoryItem): Promise<string> => {
    const ai = getGeminiClient();
    const prompt = `
    So sánh hai hướng dẫn build cho game Quỷ Cốc Bát Hoang.
    Phân tích chi tiết điểm mạnh, điểm yếu, lối chơi, và sức mạnh tổng hợp của mỗi build.
    Đưa ra kết luận build nào phù hợp hơn cho các tình huống/phong cách chơi cụ thể.
    Định dạng câu trả lời bằng Markdown. Sử dụng bảng để so sánh các khía cạnh chính.

    **Build 1:**
    - Lộ tuyến: ${build1.paths.join(' + ')}
    - Phong cách: ${build1.playstyle}
    - Giới thiệu: ${typeof build1.build.gioiThieu === 'string' ? build1.build.gioiThieu : build1.build.gioiThieu.loiChoiTongQuan}
    - Nghịch Thiên Cải Mệnh chính: ${build1.build.nghichThienCaiMenh.map(nt => nt.ten).join(', ')}

    **Build 2:**
    - Lộ tuyến: ${build2.paths.join(' + ')}
    - Phong cách: ${build2.playstyle}
    - Giới thiệu: ${typeof build2.build.gioiThieu === 'string' ? build2.build.gioiThieu : build2.build.gioiThieu.loiChoiTongQuan}
    - Nghịch Thiên Cải Mệnh chính: ${build2.build.nghichThienCaiMenh.map(nt => nt.ten).join(', ')}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            temperature: 0.7,
        }
    });

    return response.text;
};

const formatChatHistory = (history: ChatMessage[]): { role: string; parts: Part[] }[] => {
    return history.map(msg => {
        const parts: Part[] = [];
        
        if (msg.imageUrl) {
            const match = msg.imageUrl.match(/^data:(image\/.+);base64,(.+)$/);
            if (match) {
                parts.push({
                    inlineData: {
                        mimeType: match[1],
                        data: match[2]
                    }
                });
            }
        }
        if (msg.text) {
            parts.push({ text: msg.text });
        }
        
        return {
            role: msg.role,
            parts: parts
        };
    });
};

export const startChatSession = (build: BuildGuide, history: ChatMessage[] = []): Chat => {
    const ai = getGeminiClient();
    const buildContext = JSON.stringify(build, null, 2);

    const systemInstruction = `
        You are a helpful assistant and an expert on the game Tale of Immortal (鬼谷八荒).
        The user is asking questions about a specific character build. They may also upload screenshots for context.
        Your primary task is to answer questions based on the provided build context and any images uploaded.
        If the question is outside the scope of the build, you can use your general knowledge of the game.
        Always be friendly, clear, and provide detailed explanations in Vietnamese.
        The current build context is:
        \`\`\`json
        ${buildContext}
        \`\`\`
    `;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash-image',
        config: {
            systemInstruction: systemInstruction,
        },
        history: formatChatHistory(history)
    });

    return chat;
};

export const startGeneralChatSession = (): Chat => {
    const ai = getGeminiClient();
    
    const systemInstruction = `
        You are a helpful assistant and an expert on the game Tale of Immortal (鬼谷八荒).
        Your name is Trợ Lý AI Quỷ Cốc.
        Answer the user's questions about any aspect of the game, including quests, items, cultivation, sects, NPCs, combat mechanics, etc. They may upload screenshots for context.
        If you are asked about a specific build, kindly ask the user to use the "Tạo Build" feature and then chat about the generated build for more specific advice.
        Always be friendly, encouraging, and provide clear, well-structured answers in Vietnamese. Use Markdown for formatting.
    `;
    
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash-image',
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return chat;
};