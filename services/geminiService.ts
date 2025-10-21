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
        description: 'Danh sách 3 công pháp được gợi ý: 1 Võ Kỹ/Linh Kỹ Chính, 1 Võ Kỹ/Linh Kỹ Phụ, và 1 Thân Pháp.',
        items: congPhapSchema 
    },
    tamPhap: { 
        type: Type.ARRAY,
        description: 'Danh sách các tâm pháp được gợi ý cho các loại chính.',
        items: tamPhapSchema
    },
    phapBao: { 
        type: Type.ARRAY, 
        description: 'Danh sách 2-3 pháp bảo được gợi ý, phân tích cực kỳ chi tiết.',
        items: phapBaoSchema 
    },
     khiLinh: {
        type: Type.ARRAY,
        description: 'Danh sách 1-2 Khí Linh phù hợp nhất với build, phân tích chi tiết.',
        items: khiLinhSchema
    },
    luuY: huongDanNangCaoSchema,
    loiKhuyenNangCap: {
        type: Type.STRING,
        description: 'Đưa ra các lời khuyên cụ thể về việc nâng cấp trang bị, kỹ năng, hoặc chỉ số theo thứ tự ưu tiên. Gợi ý các mục tiêu ngắn hạn (ví dụ: tìm tâm pháp X, nâng cấp kỹ năng Y lên cấp Z) và dài hạn (ví dụ: hoàn thiện bộ pháp bảo Z). Phân tích dưới dạng gạch đầu dòng Markdown.'
    },
  },
  required: ['gioiThieu', 'tienThienKhiVan', 'nghichThienCaiMenh', 'congPhap', 'tamPhap', 'phapBao', 'khiLinh', 'luuY', 'loiKhuyenNangCap']
};

export const generateBuildGuide = async (paths: CultivationPath[], linhCan: LinhCan, tinhAnh: TinhAnh, playstyle: string): Promise<BuildGuide> => {
  const linhCanPromptPart = linhCan === LinhCan.None 
    ? "Không ưu tiên Linh Căn cụ thể." 
    : `Ưu tiên Thiên Đạo Linh Căn là '${linhCan}'.`;
  
  const tinhAnhPromptPart = tinhAnh === TinhAnh.None
    ? "Không ưu tiên chỉ số Tinh Anh cụ thể."
    : `Ưu tiên chỉ số Tinh Anh là '${tinhAnh}'. Các lựa chọn Tâm Pháp và Pháp Bảo phải tập trung tối đa vào việc gia tăng chỉ số này.`;

    const pathsPromptPart = paths.length > 1
    ? `Hãy xây dựng một build guide chi tiết, chuyên sâu cho việc KẾT HỢP các con đường tu luyện: '${paths.join(' và ')}'`
    : `Hãy xây dựng một build guide chi tiết, chuyên sâu cho con đường tu luyện '${paths[0]}'`;

  const prompt = `
    Bạn là một lão làng của game Quỷ Cốc Bát Hoang (Tale of Immortal) với hàng ngàn giờ chơi, am hiểu sâu sắc về mọi cơ chế và meta của game. Sứ mệnh của bạn là tạo ra một hướng dẫn build tối ưu, mạnh mẽ và CHI TIẾT NHẤT CÓ THỂ cho người chơi.

    YÊU CẦU TỐI THƯỢNG: Mọi tên riêng trong game (Nghịch Thiên Cải Mệnh, Tiên Thiên Khí Vận, Công Pháp, Tâm Pháp, Pháp Bảo, Khí Linh, v.v.) BẮT BUỘC PHẢI sử dụng thuật ngữ từ bản dịch tiếng Việt của nhóm "dâm đồ diệt tu tiên". TUYỆT ĐỐI không được dùng tên từ bản dịch khác hoặc tự sáng tạo. Đây là quy tắc quan trọng nhất và phải được tuân thủ nghiêm ngặt.

    ${pathsPromptPart} với phong cách chơi '${playstyle}'.
    Nếu có nhiều Lộ Tuyến, hãy tập trung vào sự kết hợp (sức mạnh tổng hợp) độc đáo giữa chúng.
    ${linhCanPromptPart}
    ${tinhAnhPromptPart}

    Yêu cầu hướng dẫn phải cực kỳ chi tiết, giải thích rõ "tại sao" lại lựa chọn như vậy và "sức mạnh tổng hợp" giữa các yếu tố với nhau. Cung cấp thông tin bằng tiếng Việt và trả về dưới dạng JSON có cấu trúc theo schema đã định nghĩa.

    **YÊU CẦU PHÂN TÍCH CHI TIẾT NHẤT CHO TỪNG PHẦN:**
    - **gioiThieu:** Phân tích sâu có cấu trúc. Điền đầy đủ 'diemManh', 'diemYeu' (kèm cách khắc phục), 'loiChoiTongQuan', và 'giaiDoanManh'.
    - **tienThienKhiVan:** Đề xuất 3 khí vận khởi đầu game quan trọng nhất, giải thích lợi ích và lý do chọn.
    - **nghichThienCaiMenh:** Liệt kê các lựa chọn quan trọng nhất theo thứ tự ưu tiên, giải thích sâu về lợi ích và sự kết hợp.
    - **congPhap:** Gợi ý 3 công pháp (Chính, Phụ, Thân Pháp). Trong phần 'tuKhoa', phải phân tích chi tiết bằng cách phân loại từ khóa theo nhóm chức năng (Sát thương, Phòng thủ, Hỗ trợ, v.v.), giải thích lợi ích của từng từ khóa, và định dạng Markdown theo mẫu '- **[Loại]**: [Tên] - [Giải thích]'.
    - **tamPhap:** Liệt kê các tâm pháp cần thiết, phân tích sâu về từ khóa chính (cố định) và từ khóa phụ (ưu tiên tẩy luyện).
    - **phapBao:** Phân tích chi tiết từng pháp bảo, bao gồm 'ten', 'vaiTro' (vai trò), 'sucManhTongHop' (sức mạnh tổng hợp với build), 'kyNangDeXuat' (kỹ năng cần tìm), và 'tinhHuongSuDung' (khi nào nên dùng).
    - **khiLinh:** Gợi ý 1-2 Khí Linh phù hợp, phân tích sâu về sức mạnh tổng hợp, kỹ năng quan trọng và pháp bảo nên trang bị.
    - **luuY (Hướng Dẫn Nâng Cao):** Thay cho 'luuY' chung chung, hãy cung cấp một 'HuongDanNangCao' có cấu trúc. Điền đầy đủ 'uuTienNangCap' (thứ tự ưu tiên nâng cấp), 'chienLuocGiaoTranh' (cách đánh trong combat), 'ketHopVoiVatPham' (vật phẩm bổ trợ), và 'khacPhucNhuocDiem' (cách chơi để khắc phục điểm yếu).
    - **loiKhuyenNangCap (Lời Khuyên Nâng Cấp):** Cung cấp một danh sách các lời khuyên cụ thể và actionable về lộ trình nâng cấp sức mạnh. Phân tích dưới dạng gạch đầu dòng, bao gồm:
        - **Ưu tiên ngắn hạn:** Cần tập trung tìm kiếm, nâng cấp những gì ngay lập tức (ví dụ: tìm tâm pháp X, nâng cấp kỹ năng Y).
        - **Mục tiêu trung hạn:** Các cột mốc sức mạnh tiếp theo (ví dụ: hoàn thiện bộ Nghịch Thiên Cải Mệnh, tìm pháp bảo Z).
        - **Mục tiêu dài hạn:** Build hoàn chỉnh sẽ trông như thế nào, cần những gì để đạt được.
  `;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: buildGuideSchema
      }
    });
    
    const jsonText = response.text.trim();
    const cleanedJson = jsonText.replace(/^```json\s*|\s*```\s*$/g, '');
    return JSON.parse(cleanedJson);

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API hoặc phân tích JSON:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("API key not valid. Please check your API key.");
    }
    throw new Error("Không thể tạo hướng dẫn build từ Gemini API.");
  }
};

export const compareBuildGuides = async (item1: HistoryItem, item2: HistoryItem): Promise<string> => {
    const prompt = `
    Bạn là một chuyên gia phân tích meta game Quỷ Cốc Bát Hoang. Dưới đây là hai bản build nhân vật được định dạng bằng JSON.
    Nhiệm vụ của bạn là so sánh chi tiết hai build này và đưa ra một báo cáo phân tích dưới dạng Markdown.

    YÊU CẦU QUAN TRỌNG: Tất cả tên riêng trong game trong bài phân tích của bạn phải tuân thủ thuật ngữ từ bản dịch của nhóm "dâm đồ diệt tu tiên".

    **Build A: ${item1.paths.join(' + ')} (${item1.playstyle})**
    \`\`\`json
    ${JSON.stringify(item1.build, null, 2)}
    \`\`\`

    **Build B: ${item2.paths.join(' + ')} (${item2.playstyle})**
    \`\`\`json
    ${JSON.stringify(item2.build, null, 2)}
    \`\`\`

    **YÊU CẦU PHÂN TÍCH:**
    1.  **Tổng Quan & Triết Lý Build:** So sánh mục tiêu và lối chơi cốt lõi của mỗi build. Build A tập trung vào điều gì? Build B tập trung vào điều gì?
    2.  **Sát Thương:**
        *   **Khả năng dồn sát thương (Burst Damage):** Build nào có khả năng kết liễu mục tiêu nhanh hơn? Tại sao?
        *   **Sát thương duy trì (Sustained DPS):** Build nào gây sát thương ổn định và tốt hơn trong các trận chiến kéo dài?
        *   **Sát thương diện rộng (AoE):** Build nào dọn dẹp quái vật và giao tranh tổng tốt hơn?
    3.  **Khả Năng Sinh Tồn:** So sánh độ "trâu bò", khả năng hồi phục, và các công cụ phòng thủ (né tránh, giảm sát thương, khống chế) của hai build.
    4.  **Độ Linh Hoạt & Khống Chế:** Build nào cơ động hơn? Build nào có nhiều công cụ khống chế kẻ địch hơn?
    5.  **Sức Mạnh Tổng Hợp (Synergy):** Phân tích độ liên kết giữa các Nghịch Thiên Cải Mệnh, Công Pháp, Tâm Pháp, và Pháp Bảo trong mỗi build. Build nào có sự kết hợp nhuần nhuyễn hơn?
    6.  **Giai Đoạn Sức Mạnh:** So sánh ngưỡng sức mạnh của hai build ở các giai đoạn đầu, giữa và cuối game.
    7.  **Kết Luận & Đề Xuất:**
        *   Tóm tắt điểm mạnh và yếu của mỗi build.
        *   Build A phù hợp với người chơi có phong cách như thế nào?
        *   Build B phù hợp với người chơi có phong cách như thế nào?
        *   Đưa ra nhận định cuối cùng: Trong một kịch bản cụ thể (ví dụ: leo tháp, đánh boss cuối, farm), build nào sẽ có ưu thế hơn?

    Hãy trình bày báo cáo một cách rõ ràng, có cấu trúc và sử dụng định dạng Markdown để dễ đọc.
    `;

    try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more powerful model for deeper analysis
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Lỗi khi gọi Gemini API để so sánh:", error);
        throw new Error("Không thể so sánh các build từ Gemini API.");
    }
};

export const startChatSession = (buildContext: BuildGuide, history: ChatMessage[] = []): Chat => {
    const ai = getGeminiClient();
    const model = 'gemini-2.5-flash';
    const systemInstruction = `Bạn là một chuyên gia về game Quỷ Cốc Bát Hoang. Người chơi đang hỏi bạn về một build cụ thể. YÊU CẦU TỐI THƯỢNG: Mọi tên riêng trong game BẮT BUỘC PHẢI sử dụng thuật ngữ từ bản dịch tiếng Việt của nhóm "dâm đồ diệt tu tiên". TUYỆT ĐỐI không được dùng tên từ bản dịch khác. Nhiệm vụ của bạn là trả lời câu hỏi, đưa ra lời khuyên, và thảo luận về các phương án thay thế, luôn tuân thủ quy tắc về thuật ngữ này.`;
    
    const contextMessage = `Đây là build chúng ta sẽ thảo luận: \n\n\`\`\`json\n${JSON.stringify(buildContext, null, 2)}\n\`\`\`\n\nHãy bắt đầu. Bạn có câu hỏi gì về build này không?`;

    // Map the ChatMessage history (UI format) to the format Gemini API expects.
    // Handle both text and images to provide full context.
    const mappedHistory = history.map(msg => {
        const parts: Part[] = [];
        if (msg.text && msg.text.trim()) {
            parts.push({ text: msg.text });
        }
        if (msg.imageUrl) {
            // SỬA LỖI: Sử dụng regex để phân tích data URL một cách an toàn và mạnh mẽ hơn.
            const match = msg.imageUrl.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                const mimeType = match[1];
                const base64Data = match[2];
                parts.push({
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                });
            }
        }
        return { role: msg.role, parts };
    }).filter(content => content.parts.length > 0);

    const chat = ai.chats.create({
        model,
        config: {
            systemInstruction,
        },
        history: [
            { role: 'user', parts: [{ text: contextMessage }] },
            { role: 'model', parts: [{ text: 'Đã hiểu. Tôi đã xem qua build này và sẵn sàng trả lời bất kỳ câu hỏi nào của bạn. Hãy hỏi tôi bất cứ điều gì nhé!' }] },
            ...mappedHistory
        ],
    });

    return chat;
};

export const startGeneralChatSession = (): Chat => {
    const ai = getGeminiClient();
    const model = 'gemini-2.5-flash';
    const systemInstruction = `Bạn là một chuyên gia hàng đầu về game Quỷ Cốc Bát Hoang (Tale of Immortal). YÊU CẦU TỐI THƯỢNG: Mọi tên riêng trong game (Nghịch Thiên Cải Mệnh, Công Pháp, v.v.) BẮT BUỘC PHẢI sử dụng thuật ngữ từ bản dịch tiếng Việt của nhóm "dâm đồ diệt tu tiên". TUYỆT ĐỐI không được dùng tên từ bản dịch khác. Sứ mệnh của bạn là trở thành người hướng dẫn tận tình, trả lời chính xác và chi tiết. Nếu người dùng cung cấp hình ảnh, hãy dùng nó làm ngữ cảnh để đưa ra câu trả lời phù hợp nhất, nhưng vẫn phải tuân thủ quy tắc về thuật ngữ.`;
    
    const chat = ai.chats.create({
        model,
        config: {
            systemInstruction,
        },
        history: [],
    });

    return chat;
};