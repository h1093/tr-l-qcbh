import React from 'react';
import { CULTIVATION_PATHS, PLAYSTYLES, LINH_CAN_OPTIONS, TINH_ANH_OPTIONS } from '../constants';
import { CultivationPath, Playstyle, LinhCan, TinhAnh } from '../types';

interface BuildFormProps {
  selectedPaths: CultivationPath[];
  onPathChange: (value: CultivationPath) => void;
  selectedLinhCan: LinhCan;
  onLinhCanChange: (value: LinhCan) => void;
  selectedTinhAnh: TinhAnh;
  onTinhAnhChange: (value: TinhAnh) => void;
  playstyle: Playstyle;
  onPlaystyleChange: (value: Playstyle) => void;
  customPlaystyle: string;
  onCustomPlaystyleChange: (value: string) => void;
  onSubmit: () => void;
  onFeelingLucky: () => void;
  isLoading: boolean;
}

const selectStyles = "w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-brand-text focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition duration-200";
const inputStyles = "w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-brand-text focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition duration-200";

const IconSword: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 3l-9 9-4.5-4.5L3 12.008v6.482L9.48 21h6.51l2.05-2.05L21 16.5V3zM12 12l9-9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5l-3 3" />
    </svg>
);

const IconTarget: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3" />
    </svg>
);

const IconYinYang: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,0,1,0-176c24.21,0,46.3,10.3,62.23,26.23S216,103.79,216,128a88,88,0,0,1-176,0c0-24.21,10.3-46.3,26.23-62.23S103.79,40,128,40ZM112,128a16,16,0,1,1,16,16A16,16,0,0,1,112,128Zm32-48a16,16,0,1,0-16-16A16,16,0,0,0,128,80Z"></path>
    </svg>
);

const IconStar: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.418a.562.562 0 01.321.988l-4.204 3.06a.563.563 0 00-.182.557l1.528 5.418a.562.562 0 01-.81.62l-4.204-3.06a.563.563 0 00-.65 0l-4.204 3.06a.562.562 0 01-.81-.62l1.528-5.418a.563.563 0 00-.182-.557l-4.204-3.06a.562.562 0 01.321-.988h5.418a.563.563 0 00.475.31l2.125-5.111z" />
    </svg>
);

const IconQuestionMarkCircle: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconSparkles: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);


export const BuildForm: React.FC<BuildFormProps> = ({
  selectedPaths,
  onPathChange,
  selectedLinhCan,
  onLinhCanChange,
  selectedTinhAnh,
  onTinhAnhChange,
  playstyle,
  onPlaystyleChange,
  customPlaystyle,
  onCustomPlaystyleChange,
  onSubmit,
  onFeelingLucky,
  isLoading,
}) => {
  const isCustomPlaystyle = playstyle === Playstyle.Custom;
  const isSubmitDisabled = isLoading || selectedPaths.length === 0 || (isCustomPlaystyle && !customPlaystyle.trim());

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-brand-text-secondary mb-3">
            <IconSword className="w-5 h-5 mr-2 text-brand-primary/80" />
            Tu Luyện Lộ Tuyến (Tối đa 2)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CULTIVATION_PATHS.map((path) => {
            const isSelected = selectedPaths.includes(path.value);
            const isSelectionFull = selectedPaths.length >= 2 && !isSelected;
            const isLastAndOnlySelected = isSelected && selectedPaths.length === 1;

            return (
              <button
                key={path.value}
                type="button"
                onClick={() => onPathChange(path.value)}
                disabled={isLoading || isLastAndOnlySelected || isSelectionFull}
                className={`text-center px-3 py-2.5 rounded-md border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary disabled:opacity-50
                  ${isSelected
                    ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                    : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/70 hover:border-gray-500'
                  }
                `}
                 title={isSelectionFull ? "Chỉ có thể chọn tối đa 2 lộ tuyến" : ""}
              >
                {path.label}
              </button>
            )
          })}
        </div>
         <p className="text-xs text-brand-text-secondary mt-2">Chọn một hoặc hai lộ tuyến. Không thể bỏ chọn nếu chỉ còn một.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor="linh-can" className="flex items-center text-sm font-medium text-brand-text-secondary mb-2">
            <IconYinYang className="w-5 h-5 mr-2 text-brand-primary/80" />
            Thiên Đạo Linh Căn
             <div className="relative group ml-1.5">
                <IconQuestionMarkCircle className="w-4 h-4 text-gray-400 cursor-pointer" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900 border border-gray-600 rounded-lg shadow-xl text-xs text-brand-text-secondary hidden group-hover:block z-10 animate-fade-in">
                  <h4 className="font-bold text-brand-text mb-1">Thiên Đạo Linh Căn là gì?</h4>
                  <p>Đây là phiên bản Linh Căn cấp cao nhất trong game. Việc chọn một Thiên Đạo Linh Căn sẽ giúp AI tập trung gợi ý các công pháp, tâm pháp và nghịch thiên cải mệnh có sức mạnh tổng hợp tốt nhất với hệ đó, mở khóa những tiềm năng ẩn giấu của nhân vật.</p>
                </div>
              </div>
          </label>
          <select
            id="linh-can"
            value={selectedLinhCan}
            onChange={(e) => onLinhCanChange(e.target.value as LinhCan)}
            className={selectStyles}
            disabled={isLoading}
          >
            {LINH_CAN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tinh-anh" className="flex items-center text-sm font-medium text-brand-text-secondary mb-2">
            <IconStar className="w-5 h-5 mr-2 text-brand-primary/80" />
            Chỉ Số Tinh Anh
          </label>
          <select
            id="tinh-anh"
            value={selectedTinhAnh}
            onChange={(e) => onTinhAnhChange(e.target.value as TinhAnh)}
            className={selectStyles}
            disabled={isLoading}
          >
            {TINH_ANH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="playstyle" className="flex items-center text-sm font-medium text-brand-text-secondary mb-2">
            <IconTarget className="w-5 h-5 mr-2 text-brand-primary/80" />
            Phong Cách Chơi
          </label>
          <select
            id="playstyle"
            value={playstyle}
            onChange={(e) => onPlaystyleChange(e.target.value as Playstyle)}
            className={selectStyles}
            disabled={isLoading}
          >
            {PLAYSTYLES.map((style) => (
              <option key={style.value} value={style.value}>{style.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isCustomPlaystyle && (
        <div className="mb-6 animate-fade-in">
          <label htmlFor="custom-playstyle" className="block text-sm font-medium text-brand-text-secondary mb-2">
            Mô tả phong cách chơi của bạn
          </label>
          <input
            type="text"
            id="custom-playstyle"
            value={customPlaystyle}
            onChange={(e) => onCustomPlaystyleChange(e.target.value)}
            className={inputStyles}
            placeholder="Ví dụ: 'Đánh và chạy', 'Cấu rỉa tầm xa', ..."
            disabled={isLoading}
            autoFocus
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={onFeelingLucky}
          disabled={isLoading}
          className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gray-700/80 text-brand-text-secondary font-semibold rounded-lg shadow-lg hover:bg-gray-600/80 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconSparkles className="w-5 h-5 mr-2"/>
           Thử Vận May
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-glow-primary transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tìm Thiên Mệnh...
            </>
          ) : (
            'Tạo Build Gợi Ý'
          )}
        </button>
      </div>
    </form>
  );
};
