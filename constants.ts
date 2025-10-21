import { CultivationPath, Playstyle, LinhCan, TinhAnh } from './types';

export const CULTIVATION_PATHS = [
  { label: "Kiếm Tu", value: CultivationPath.Sword },
  { label: "Đao Tu", value: CultivationPath.Blade },
  { label: "Quyền Tu", value: CultivationPath.Fist },
  { label: "Thương Tu", value: CultivationPath.Spear },
  { label: "Chỉ Tu", value: CultivationPath.Finger },
  { label: "Chưởng Tu", value: CultivationPath.Palm },
  { label: "Hỏa Tu", value: CultivationPath.Fire },
  { label: "Thủy Tu", value: CultivationPath.Water },
  { label: "Lôi Tu", value: CultivationPath.Lightning },
  { label: "Phong Tu", value: CultivationPath.Wind },
  { label: "Thổ Tu", value: CultivationPath.Earth },
  { label: "Mộc Tu", value: CultivationPath.Wood },
];

export const PLAYSTYLES = [
  { label: "Tấn công dồn dập", value: Playstyle.Attack },
  { label: "Cân bằng công thủ", value: Playstyle.Balanced },
  { label: "Phòng thủ vững chắc", value: Playstyle.Tank },
  { label: "Khống chế", value: Playstyle.Control },
  { label: "Tùy chỉnh...", value: Playstyle.Custom },
];

export const LINH_CAN_OPTIONS = [
  { label: "Không Yêu Cầu", value: LinhCan.None },
  { label: "Kim Linh Căn", value: LinhCan.Metal },
  { label: "Mộc Linh Căn", value: LinhCan.Wood },
  { label: "Thủy Linh Căn", value: LinhCan.Water },
  { label: "Hỏa Linh Căn", value: LinhCan.Fire },
  { label: "Thổ Linh Căn", value: LinhCan.Earth },
  { label: "Phong Linh Căn", value: LinhCan.Wind },
  { label: "Lôi Linh Căn", value: LinhCan.Lightning },
];

export const TINH_ANH_OPTIONS = [
  { label: "Không Yêu Cầu", value: TinhAnh.None },
  { label: "Tấn Công", value: TinhAnh.Attack },
  { label: "Phòng Thủ", value: TinhAnh.Defense },
  { label: "Nhanh Nhẹn", value: TinhAnh.Agility },
  { label: "Linh Hoạt", value: TinhAnh.Flexibility },
];