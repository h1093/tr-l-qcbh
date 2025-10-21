// SỬA LỖI: Đã xóa việc tự nhập khẩu 'GioiThieu' gây ra xung đột.
export enum CultivationPath {
  Sword = "Kiếm Tu",
  Blade = "Đao Tu",
  Fist = "Quyền Tu",
  Spear = "Thương Tu",
  Finger = "Chỉ Tu",
  Palm = "Chưởng Tu",
  Fire = "Hỏa Tu",
  Water = "Thủy Tu",
  Lightning = "Lôi Tu",
  Wind = "Phong Tu",
  Earth = "Thổ Tu",
  Wood = "Mộc Tu",
}

export enum Playstyle {
  Attack = "Tấn công dồn dập",
  Balanced = "Cân bằng công thủ",
  Tank = "Phòng thủ vững chắc",
  Control = "Khống chế",
  Custom = "Tùy chỉnh",
}

export enum LinhCan {
  None = "Không Yêu Cầu",
  Metal = "Kim Linh Căn",
  Wood = "Mộc Linh Căn",
  Water = "Thủy Linh Căn",
  Fire = "Hỏa Linh Căn",
  Earth = "Thổ Linh Căn",
  Wind = "Phong Linh Căn",
  Lightning = "Lôi Linh Căn",
}

export enum TinhAnh {
  None = "Không Yêu Cầu",
  Attack = "Tấn Công",
  Defense = "Phòng Thủ",
  Agility = "Nhanh Nhẹn",
  Flexibility = "Linh Hoạt",
}

export interface TienThienKhiVan {
  ten: string;
  loiIch: string;
  lyDoChon: string;
}

export interface KhiLinh {
  ten: string;
  phapBaoDeXuat: string;
  kyNangQuanTrong: string;
  sucManhTongHop: string;
}

export interface NghichThienCaiMenh {
  ten: string;
  loiIch: string;
  ketHop: string;
  luuY?: string;
}

export interface CongPhap {
  loai: 'Võ Kỹ/Linh Kỹ Chính' | 'Võ Kỹ/Linh Kỹ Phụ' | 'Thân Pháp';
  ten: string;
  phanTich: string;
  tuKhoa: string;
  comboDeXuat: string;
}

export interface TamPhap {
  loai: string;
  ten: string;
  phanTich: string;
  tuKhoaChinh: string;
  tuKhoaPhu: string;
}

export interface PhapBao {
    ten: string;
    vaiTro: string;
    sucManhTongHop: string;
    kyNangDeXuat: string;
    tinhHuongSuDung: string;
}

export interface GioiThieu {
  diemManh: string;
  diemYeu: string;
  loiChoiTongQuan: string;
  giaiDoanManh: string;
}

export interface HuongDanNangCao {
  uuTienNangCap: string;
  chienLuocGiaoTranh: string;
  ketHopVoiVatPham: string;
  khacPhucNhuocDiem: string;
}

export interface BuildGuide {
  gioiThieu: GioiThieu | string; // Cho phép chuỗi để tương thích ngược với lịch sử cũ
  tienThienKhiVan?: TienThienKhiVan[];
  nghichThienCaiMenh: NghichThienCaiMenh[];
  congPhap: CongPhap[];
  tamPhap: TamPhap[];
  phapBao: PhapBao[];
  khiLinh?: KhiLinh[];
  luuY: HuongDanNangCao | string; // Cho phép chuỗi để tương thích ngược
  loiKhuyenNangCap?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  paths: CultivationPath[];
  linhCan: LinhCan;
  tinhAnh: TinhAnh;
  playstyle: string;
  build: BuildGuide;
  chatHistory?: ChatMessage[];
}