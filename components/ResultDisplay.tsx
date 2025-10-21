import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { BuildGuide, NghichThienCaiMenh, CongPhap, TamPhap, PhapBao, GioiThieu, HuongDanNangCao, TienThienKhiVan, KhiLinh } from '../types';

const ReactMarkdown = (window as any).ReactMarkdown;
const remarkGfm = (window as any).remarkGfm;

// --- Icon Components ---
const IconBook: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" /></svg>;
const IconGalaxy: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.198.835 7.126 2.25C21.054 6.675 22.5 8.687 22.5 11c0 2.313-1.446 4.325-3.374 5.75C17.198 19.165 14.755 20 12 20c-2.755 0-5.198-.835-7.126-2.25C2.946 16.325 1.5 14.313 1.5 12c0-2.313 1.446-4.325 3.374-5.75C6.802 4.835 9.245 4 12 4" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 4.625-3.75 8.375-8.375 8.375" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c0-4.625 3.75-8.375 8.375-8.375" /></svg>;
const IconSparkles: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846-.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.4-1.4l-1.188-.648 1.188-.648a2.25 2.25 0 011.4-1.4l.648-1.188.648 1.188a2.25 2.25 0 011.4 1.4l1.188.648-1.188.648a2.25 2.25 0 01-1.4 1.4z" /></svg>;
const IconScroll: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const IconHeart: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
const IconGem: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9.75l-9-5.25m9 5.25v9.75" /></svg>;
const IconSpirit: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-4.142-3.358-7.5-7.5-7.5s-7.5 3.358-7.5 7.5c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5h.01M15 10.5h.01M9.75 14.25c.5-1 1.5-1.5 2.25-1.5s1.75.5 2.25 1.5" /></svg>;
const IconBulb: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a15.045 15.045 0 01-4.5 0M3.75 11.25a9 9 0 0116.5 0c0 3.82-2.32 7.16-5.438 8.648M3.75 11.25a9 9 0 00-1.527-.472M20.25 11.25a9 9 0 01-1.527-.472" /></svg>;
const IconChevronDown: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);
const IconChevronsUp: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 8.25l7.5-7.5 7.5 7.5" /></svg>;

const IconPlusCircle: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconLink: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const IconClipboardList: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const IconExclamation: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const IconBolt: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const IconBookmark: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const IconWrench: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconShieldCheck: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 2.083 9-2.083c0-3.181-.768-6.21-2.182-8.877z" /></svg>;
const IconBeaker: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l-2.387-.477-1.022.547m16.5 0a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l2.387-.477L19.428 15.428z" /></svg>;
const IconChartPie: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const IconChatBubbleLeftRight: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 0 1-1.59 0l-3.72-3.72a2.122 2.122 0 0 1-1.98-2.193v-4.286c0-.97.616-1.813 1.5-2.097m6.562 3.106a2.125 2.125 0 0 1 2.122 1.323l.718 2.153a2.125 2.125 0 0 1-2.122 2.796l-1.52.217a2.125 2.125 0 0 1-1.98-2.193v-4.286c0-.434.192-.839.5-1.128a2.125 2.125 0 0 1 2.122-1.323l.718 2.153a2.125 2.125 0 0 1-2.122 2.796l-1.52.217m-6.562-3.106a2.125 2.125 0 0 0-2.122 1.323l-.718 2.153a2.125 2.125 0 0 0 2.122 2.796l1.52.217a2.125 2.125 0 0 0 1.98-2.193v-4.286c0-.434-.192-.839-.5-1.128a2.125 2.125 0 0 0-2.122-1.323l-.718 2.153a2.125 2.125 0 0 0 2.122 2.796l1.52.217" /></svg>;

const IconThumbUp: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-1.9 3.23A1 1 0 006 10v9H4a2 2 0 01-2-2V7a2 2 0 012-2h2.5" /></svg>;
const IconThumbDown: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085a2 2 0 001.736-.97l1.9-3.23A1 1 0 0018 14V5h2a2 2 0 012 2v7a2 2 0 01-2 2h-2.5" /></svg>;
const IconStrategy: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0118.657 17.657c-1.566 1.567-2.343 3-4.657 1C12 16.5 9 16 10 14c2-1 2.657 1.657 2.657 1.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.343 12.343A6 6 0 0112.343 9.343" /></svg>;
const IconTrendingUp: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;

const IconArrowDownTray: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const IconArrowUpTray: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>;


const SECTION_DETAILS = {
  gioiThieu: { title: 'Giới Thiệu Tổng Quan', icon: <IconBook /> },
  tienThienKhiVan: { title: 'Tiên Thiên Khí Vận', icon: <IconGalaxy /> },
  nghichThienCaiMenh: { title: 'Nghịch Thiên Cải Mệnh', icon: <IconSparkles /> },
  congPhap: { title: 'Công Pháp & Thân Pháp', icon: <IconScroll /> },
  tamPhap: { title: 'Tâm Pháp', icon: <IconHeart /> },
  phapBao: { title: 'Pháp Bảo', icon: <IconGem /> },
  khiLinh: { title: 'Khí Linh', icon: <IconSpirit /> },
  luuY: { title: 'Hướng Dẫn Nâng Cao', icon: <IconBulb /> },
  loiKhuyenNangCap: { title: 'Lời Khuyên Nâng Cấp', icon: <IconChevronsUp /> },
};
const PROSE_CLASSES = "prose prose-invert text-brand-text leading-relaxed prose-p:my-2 prose-headings:text-brand-secondary prose-strong:text-brand-primary prose-a:text-brand-secondary hover:prose-a:text-brand-primary max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:my-1";

const InfoBlock: React.FC<{ icon: React.ReactNode; title: string; borderColor: string; textColor: string; children: React.ReactNode }> = ({ icon, title, borderColor, textColor, children }) => (
    <div className={`pl-4 border-l-2 ${borderColor}`}>
        <div className={`flex items-center gap-2 font-semibold text-sm mb-1 ${textColor}`}>
            {icon}
            <span>{title}</span>
        </div>
        <div className={`text-brand-text/90 text-base ${PROSE_CLASSES}`}>
            {children}
        </div>
    </div>
);


// --- Section-specific renderers ---

const renderGioiThieu = (data: GioiThieu) => (
    <div className="space-y-6">
        <InfoBlock icon={<IconThumbUp />} title="Điểm Mạnh" borderColor="border-green-500/50" textColor="text-green-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.diemManh}</ReactMarkdown>
        </InfoBlock>
        <InfoBlock icon={<IconThumbDown />} title="Điểm Yếu & Cách Khắc Phục" borderColor="border-red-500/50" textColor="text-red-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.diemYeu}</ReactMarkdown>
        </InfoBlock>
        <InfoBlock icon={<IconStrategy />} title="Lối Chơi Tổng Quan" borderColor="border-blue-500/50" textColor="text-blue-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.loiChoiTongQuan}</ReactMarkdown>
        </InfoBlock>
        <InfoBlock icon={<IconTrendingUp />} title="Giai Đoạn Mạnh Nhất" borderColor="border-yellow-500/50" textColor="text-yellow-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.giaiDoanManh}</ReactMarkdown>
        </InfoBlock>
    </div>
);

const renderTienThienKhiVan = (data: TienThienKhiVan[]) => (
    <div className="space-y-6">
        {data.map((item, index) => (
            <div key={index} className="bg-brand-bg/50 p-4 rounded-lg border border-gray-700 space-y-4">
                <h4 className="font-bold text-lg text-brand-primary">{item.ten}</h4>
                <InfoBlock icon={<IconPlusCircle />} title="Lợi Ích" borderColor="border-green-500/50" textColor="text-green-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.loiIch}</ReactMarkdown>
                </InfoBlock>
                <InfoBlock icon={<IconBulb />} title="Lý Do Chọn" borderColor="border-cyan-500/50" textColor="text-cyan-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.lyDoChon}</ReactMarkdown>
                </InfoBlock>
            </div>
        ))}
    </div>
);

const renderNghichThien = (data: NghichThienCaiMenh[]) => (
    <div className="space-y-6">
        {data.map((item, index) => (
            <div key={index} className="bg-brand-bg/50 p-4 rounded-lg border border-gray-700 space-y-4">
                <h4 className="font-bold text-lg text-brand-primary">{item.ten}</h4>
                <InfoBlock icon={<IconPlusCircle />} title="Lợi Ích" borderColor="border-green-500/50" textColor="text-green-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.loiIch}</ReactMarkdown>
                </InfoBlock>
                <InfoBlock icon={<IconLink />} title="Kết Hợp" borderColor="border-purple-500/50" textColor="text-purple-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.ketHop}</ReactMarkdown>
                </InfoBlock>
                {item.luuY && (
                    <InfoBlock icon={<IconExclamation />} title="Lưu Ý" borderColor="border-yellow-500/50" textColor="text-yellow-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.luuY}</ReactMarkdown>
                    </InfoBlock>
                )}
            </div>
        ))}
    </div>
);

const renderCongPhap = (data: CongPhap[]) => (
     <div className="space-y-6">
        {data.map((item, index) => (
            <div key={index} className="bg-brand-bg/50 p-4 rounded-lg border border-gray-700 space-y-4">
                <h4 className="font-bold text-lg text-brand-primary">{item.loai}: <span className="text-brand-text-secondary font-medium">{item.ten}</span></h4>
                 <InfoBlock icon={<IconBulb />} title="Phân Tích" borderColor="border-cyan-500/50" textColor="text-cyan-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.phanTich}</ReactMarkdown>
                </InfoBlock>
                <InfoBlock icon={<IconClipboardList />} title="Từ Khóa Quan Trọng" borderColor="border-pink-500/50" textColor="text-pink-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.tuKhoa}</ReactMarkdown>
                </InfoBlock>
                 {item.comboDeXuat && (
                    <InfoBlock icon={<IconBolt />} title="Combo Đề Xuất" borderColor="border-orange-500/50" textColor="text-orange-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.comboDeXuat}</ReactMarkdown>
                    </InfoBlock>
                )}
            </div>
        ))}
    </div>
);

const renderTamPhap = (data: TamPhap[]) => (
     <div className="space-y-6">
        {data.map((item, index) => (
            <div key={index} className="bg-brand-bg/50 p-4 rounded-lg border border-gray-700 space-y-4">
                <h4 className="font-bold text-lg text-brand-primary">{item.loai}: <span className="text-brand-text-secondary font-medium">{item.ten}</span></h4>
                <InfoBlock icon={<IconBulb />} title="Phân Tích & Sức Mạnh Tổng Hợp" borderColor="border-cyan-500/50" textColor="text-cyan-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.phanTich}</ReactMarkdown>
                </InfoBlock>
                <InfoBlock icon={<IconBookmark />} title="Từ Khóa Chính (Cố định)" borderColor="border-yellow-500/50" textColor="text-yellow-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.tuKhoaChinh}</ReactMarkdown>
                </InfoBlock>
                <InfoBlock icon={<IconWrench />} title="Từ Khóa Phụ (Ưu tiên Tẩy luyện)" borderColor="border-pink-500/50" textColor="text-pink-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.tuKhoaPhu}</ReactMarkdown>
                </InfoBlock>
            </div>
        ))}
    </div>
);

const renderPhapBao = (data: PhapBao[]) => (
     <div className="space-y-6">
        {data.map((item, index) => (
            <div key={index} className="bg-brand-bg/50 p-4 rounded-lg border border-gray-700 space-y-4">
                <h4 className="font-bold text-lg text-brand-primary">{item.ten}</h4>
                <InfoBlock icon={<IconChartPie />} title="Vai Trò" borderColor="border-blue-500/50" textColor="text-blue-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.vaiTro}</ReactMarkdown>
                </InfoBlock>
                <InfoBlock icon={<IconLink />} title="Sức Mạnh Tổng Hợp" borderColor="border-purple-500/50" textColor="text-purple-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.sucManhTongHop}</ReactMarkdown>
                </InfoBlock>
                <InfoBlock icon={<IconClipboardList />} title="Kỹ Năng Đề Xuất" borderColor="border-pink-500/50" textColor="text-pink-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.kyNangDeXuat}</ReactMarkdown>
                </InfoBlock>
                <InfoBlock icon={<IconStrategy />} title="Tình Huống Sử Dụng" borderColor="border-orange-500/50" textColor="text-orange-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.tinhHuongSuDung}</ReactMarkdown>
                </InfoBlock>
            </div>
        ))}
    </div>
);

const renderKhiLinh = (data: KhiLinh[]) => (
     <div className="space-y-6">
        {data.map((item, index) => (
            <div key={index} className="bg-brand-bg/50 p-4 rounded-lg border border-gray-700 space-y-4">
                <h4 className="font-bold text-lg text-brand-primary">{item.ten}</h4>
                <InfoBlock icon={<IconGem />} title="Pháp Bảo Đề Xuất" borderColor="border-blue-500/50" textColor="text-blue-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.phapBaoDeXuat}</ReactMarkdown>
                </InfoBlock>
                <InfoBlock icon={<IconClipboardList />} title="Kỹ Năng Quan Trọng" borderColor="border-pink-500/50" textColor="text-pink-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.kyNangQuanTrong}</ReactMarkdown>
                </InfoBlock>
                 <InfoBlock icon={<IconLink />} title="Sức Mạnh Tổng Hợp" borderColor="border-purple-500/50" textColor="text-purple-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.sucManhTongHop}</ReactMarkdown>
                </InfoBlock>
            </div>
        ))}
    </div>
);


const renderHuongDanNangCao = (data: HuongDanNangCao) => (
    <div className="space-y-6">
        <InfoBlock icon={<IconTrendingUp />} title="Ưu Tiên Nâng Cấp" borderColor="border-green-500/50" textColor="text-green-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.uuTienNangCap}</ReactMarkdown>
        </InfoBlock>
        <InfoBlock icon={<IconStrategy />} title="Chiến Lược Giao Tranh" borderColor="border-blue-500/50" textColor="text-blue-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.chienLuocGiaoTranh}</ReactMarkdown>
        </InfoBlock>
        <InfoBlock icon={<IconBeaker />} title="Kết Hợp Với Vật Phẩm" borderColor="border-purple-500/50" textColor="text-purple-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.ketHopVoiVatPham}</ReactMarkdown>
        </InfoBlock>
        <InfoBlock icon={<IconShieldCheck />} title="Khắc Phục Nhược Điểm" borderColor="border-yellow-500/50" textColor="text-yellow-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.khacPhucNhuocDiem}</ReactMarkdown>
        </InfoBlock>
    </div>
);

const renderMarkdownSection = (content: string) => (
    <article className={PROSE_CLASSES}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
);


interface ResultDisplayProps {
  isLoading: boolean;
  error: string | null;
  buildResult: BuildGuide | null;
  onLoadBuild: (jsonString: string) => void;
  onStartChat: () => void;
  canChat: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, buildResult, onLoadBuild, onStartChat, canChat }) => {
  const [openSectionKey, setOpenSectionKey] = useState<keyof typeof SECTION_DETAILS | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sections = buildResult 
    ? (Object.keys(SECTION_DETAILS) as Array<keyof typeof SECTION_DETAILS>)
        .map(key => {
            const content = buildResult[key as keyof BuildGuide];
            let hasContent = false;
             if (key === 'gioiThieu' || key === 'luuY') {
                hasContent = (typeof content === 'string' && content.trim() !== '') || (typeof content === 'object' && content !== null && Object.keys(content).length > 0);
            } else {
                hasContent = Array.isArray(content) ? content.length > 0 : (content && String(content).trim() !== '');
            }
            
            return {
              key,
              hasContent: hasContent,
              content: content,
              details: SECTION_DETAILS[key]
            }
        })
        .filter(item => item.hasContent && item.details)
    : [];

  useEffect(() => {
    if (sections.length > 0) {
      setOpenSectionKey(sections[0].key);
    } else {
      setOpenSectionKey(null);
    }
  }, [buildResult]);

  const handleDownload = useCallback(() => {
    if (!buildResult) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(buildResult, null, 2));
    const filename = `QCPH_Build_${new Date().toISOString()}.json`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [buildResult]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onLoadBuild(text);
      }
    };
    reader.readAsText(file);
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getSectionContent = (key: keyof BuildGuide, content: any) => {
    switch (key) {
        case 'gioiThieu':
            if (typeof content === 'string') return renderMarkdownSection(content);
            return renderGioiThieu(content);
        case 'tienThienKhiVan': return renderTienThienKhiVan(content);
        case 'nghichThienCaiMenh': return renderNghichThien(content);
        case 'congPhap': return renderCongPhap(content);
        case 'tamPhap': return renderTamPhap(content);
        case 'phapBao': return renderPhapBao(content);
        case 'khiLinh': return renderKhiLinh(content);
        case 'luuY': 
             if (typeof content === 'string') return renderMarkdownSection(content);
            return renderHuongDanNangCao(content);
        case 'loiKhuyenNangCap':
            return renderMarkdownSection(content);
        default: return null;
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-brand-surface rounded-lg border border-gray-700/50 min-h-[300px]">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-brand-text-secondary">AI đang luận bàn thiên cơ, xin đạo hữu chờ chút...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-900/20 border border-red-500/50 rounded-lg min-h-[300px] flex flex-col justify-center items-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
        <p className="text-red-400 font-semibold text-xl">Tẩu Hỏa Nhập Ma!</p>
        <p className="text-red-300 mt-2">{error}</p>
      </div>
    );
  }

  if (!buildResult) {
    return (
      <div className="text-center p-8 bg-brand-surface rounded-lg border border-dashed border-gray-600 min-h-[300px] flex flex-col justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3 className="text-xl font-semibold text-brand-text">Chờ đợi Thiên Mệnh của bạn</h3>
        <p className="mt-2 text-brand-text-secondary">Hãy chọn lộ tuyến và phong cách chơi, sau đó bấm nút để AI tạo build.</p>
        <div className="mt-6">
            <button
                type="button"
                onClick={handleUploadClick}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-700/50 text-brand-text-secondary font-medium rounded-lg shadow-sm hover:bg-gray-600/50 transform transition-all duration-200"
              >
                <IconArrowUpTray className="w-5 h-5"/>
                Hoặc tải lên một build đã lưu
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
        </div>
      </div>
    );
  }
  
  if (sections.length === 0) {
      return null;
  }

  return (
    <div className="bg-brand-surface border border-gray-700/50 rounded-lg overflow-hidden animate-fade-in">
       <div className="p-4 bg-brand-bg/50 border-b border-gray-700/50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onStartChat}
            disabled={!canChat}
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-blue-600/80 text-white font-medium rounded-md shadow-sm hover:bg-blue-600 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canChat ? "Chỉ có thể trò chuyện về build mới tạo hoặc từ lịch sử." : "Trò chuyện về build này"}
          >
            <IconChatBubbleLeftRight className="w-4 h-4"/>
            Trò chuyện về build này
          </button>
          <div className="flex items-center gap-3">
             <button
              type="button"
              onClick={handleUploadClick}
              className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-gray-700/50 text-brand-text-secondary font-medium rounded-md shadow-sm hover:bg-gray-600/50 transform transition-all duration-200"
            >
              <IconArrowUpTray className="w-4 h-4"/>
              Tải Lên
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-brand-primary/80 text-white font-medium rounded-md shadow-sm hover:bg-brand-primary transform transition-all duration-200"
            >
              <IconArrowDownTray className="w-4 h-4"/>
              Tải Về
            </button>
          </div>
      </div>

      {sections.map((section, index) => {
        const isOpen = openSectionKey === section.key;
        return (
          <div key={section.key} className={`border-gray-700/50 ${index > 0 ? 'border-t' : ''}`}>
            <button
              onClick={() => setOpenSectionKey(isOpen ? null : section.key)}
              className="w-full flex justify-between items-center p-5 text-left transition-colors duration-200 hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
              aria-expanded={isOpen}
              aria-controls={`section-content-${index}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-brand-primary">{section.details!.icon}</span>
                <h2 className="text-lg md:text-xl font-bold text-brand-secondary">{section.details!.title}</h2>
              </div>
              <IconChevronDown className={`w-6 h-6 text-brand-text-secondary transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              id={`section-content-${index}`}
              className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : ''}`}
            >
              <div className="overflow-hidden">
                <div className="p-6 pt-2">
                  {getSectionContent(section.key as keyof BuildGuide, section.content)}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
};