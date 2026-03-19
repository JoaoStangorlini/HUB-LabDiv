'use client';

import React, { useState, useEffect } from 'react';
import { fetchUserAcademicdata } from '@/app/actions/disciplines';
import { Loader2, Calendar, Plus, GraduationCap, Info, MessageSquareCode, Trash2, Share2, FileText, CalendarDays, Table } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Draggable } from '@fullcalendar/interaction';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { X, Eye, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import * as CalendarActions from '@/app/actions/calendar';
import { FerramentasFeedbackCard } from './FerramentasFeedbackCard';

interface CalendarEvent {
    id: string;
    title: string;
    start: any;
    end: any;
    color?: string;
    extendedProps?: any;
}

const DISCIPLINE_COLORS = [
    { bg: '#3B82F6', border: '#2563EB', name: 'blue' },
    { bg: '#EF4444', border: '#DC2626', name: 'red' },
    { bg: '#EAB308', border: '#CA8A04', name: 'yellow' },
];

const getStableColor = (id: string, title?: string) => {
    // Standardize seed: Always use the most unique ID available.
    // For academic: trial_id or code. For custom: block_id.
    const seed = id || title || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const colorIndex = Math.abs(hash) % DISCIPLINE_COLORS.length;
    return DISCIPLINE_COLORS[colorIndex];
};

const fixEncoding = (text: string) => {
    if (!text) return '';
    try {
        // If the text looks like Mojibake (contains specific corrupted patterns)
        // we convert it back to bytes and decode as UTF-8
        if (text.includes('Ã')) {
            const bytes = new Uint8Array(text.split('').map(c => c.charCodeAt(0)));
            return new TextDecoder('utf-8').decode(bytes);
        }
        return text;
    } catch (e) {
        return text;
    }
};

export default function FerramentasClient({ profile }: { profile: any }) {
    const [academicData, setAcademicData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [customBlocks, setCustomBlocks] = useState<{id: string, title: string, duration: number}[]>([]);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newBlockName, setNewBlockName] = useState('');
    const [newBlockDuration, setNewBlockDuration] = useState(2);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('edit');
    const [isMobile, setIsMobile] = useState(false);
    const [selectedBlockToAdd, setSelectedBlockToAdd] = useState<any>(null);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const draggableRef = React.useRef<any>(null);
    const calendarRef = React.useRef<any>(null);
    const enrollmentListRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleCursando = async (e: React.MouseEvent, trailId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (isUpdating) return;
        setIsUpdating(trailId);

        try {
            const { error } = await supabase.rpc('toggle_trail_status', {
                p_trail_id: trailId,
                p_status: 'cursando'
            });

            if (error) throw error;

            toast('Removida do radar atual', { icon: '📡' });
            
            // Update local state
            setAcademicData((prev: any) => ({
                ...prev,
                inProgress: prev.inProgress.filter((p: any) => p.trail_id !== trailId)
            }));
            
        } catch (err) {
            console.error(err);
            toast.error('Erro ao atualizar radar');
        } finally {
            setIsUpdating(null);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const [academicRes, calendarRes, blocksRes] = await Promise.all([
                fetchUserAcademicdata(),
                CalendarActions.getCalendarEvents(),
                CalendarActions.getCustomBlocks()
            ]);

            if (academicRes.success) {
                setAcademicData(academicRes.data);
            }
            if (calendarRes.success) {
                const verifiedEvents = (calendarRes.data as any[]).map(e => ({
                    ...e,
                    color: getStableColor(e.extendedProps?.sourceId || e.id, e.title).bg
                }));
                setEvents(verifiedEvents);
            }
            if (blocksRes.success) {
                setCustomBlocks(blocksRes.data as any);
            }
            setIsLoading(false);
        };

        init();
    }, []);

    // Setup Draggable for enrollment items
    useEffect(() => {
        const draggableEl = document.getElementById('enrollment-list');
        if (draggableEl && !draggableRef.current) {
            draggableRef.current = new Draggable(draggableEl, {
                itemSelector: '.draggable-item',
                eventData: function(eventEl: any) {
                    const title = eventEl.getAttribute('data-title');
                    const code = eventEl.getAttribute('data-code');
                    const id = eventEl.getAttribute('data-id');
                    const type = eventEl.getAttribute('data-type') || 'aula';
                    const durationVal = eventEl.getAttribute('data-duration') || '02:00';
                    
                    // CRITICAL: The seed must match the menu's seed exactly
                    const seed = id || code || 'fallback';
                    const colorData = getStableColor(seed, title);
                    
                    // Convert float duration to HH:mm:ss for FullCalendar
                    let formattedDuration = durationVal;
                    if (!durationVal.includes(':')) {
                        const numericDuration = parseFloat(durationVal);
                        const hours = Math.floor(numericDuration);
                        const minutes = Math.round((numericDuration - hours) * 60);
                        formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
                    }
                    
                    return {
                        title: type === 'custom' ? title : `${type === 'estudo' ? '📚 Estudo' : '🎓 Aula'}: ${title}`,
                        duration: formattedDuration,
                        color: colorData.bg,
                        extendedProps: { code, type, sourceId: seed, trail_id: type !== 'custom' ? id : null, duration: durationVal }
                    };
                }
            });
        }
    }, [isLoading, academicData, customBlocks]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 print:space-y-0 print:animate-none">
            <style jsx global>{`
                .fc { --fc-border-color: rgba(var(--brand-blue-rgb), 0.1); }
                .dark .fc { --fc-border-color: rgba(255, 255, 255, 0.03); }
                
                .fc-theme-standard td, .fc-theme-standard th, .fc-scrollgrid { 
                    border: 0 !important; 
                }
                .fc-toolbar-chunk .fc-button {
                    border-radius: 9999px !important;
                    text-transform: lowercase !important;
                    font-weight: 800 !important;
                    padding: 8px 20px !important;
                    background-color: rgba(59, 130, 246, 0.1) !important;
                    border: 1px solid rgba(59, 130, 246, 0.2) !important;
                    color: #3b82f6 !important;
                    margin: 0 6px !important;
                    transition: all 0.2s;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                .fc-toolbar-chunk .fc-button:hover, .fc-button-active {
                    background-color: #3b82f6 !important;
                    color: white !important;
                }
                .fc-toolbar-title {
                    margin: 0 32px !important;
                    font-weight: 900 !important;
                    font-size: 1.25rem !important;
                }
                
                /* Canva-style resizing handles */
                .fc-event-resizer {
                    width: 14px !important;
                    height: 14px !important;
                    border-radius: 9999px !important;
                    background-color: white !important;
                    border: 3px solid #3b82f6 !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
                    right: -7px !important;
                    bottom: -7px !important;
                    opacity: 0;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 50 !important;
                    cursor: ns-resize !important;
                }
                
                .fc-event-resizer-y-top {
                    top: -7px !important;
                    bottom: auto !important;
                }

                .fc-event:hover .fc-event-resizer, 
                .fc-event-dragging .fc-event-resizer,
                .fc-event-resizing .fc-event-resizer {
                    opacity: 1 !important;
                    transform: scale(1.1);
                }

                @media (max-width: 768px) {
                    .fc-event-resizer {
                        width: 18px !important;
                        height: 18px !important;
                        opacity: 1 !important;
                        right: -9px !important;
                        bottom: -9px !important;
                        border-width: 4px !important;
                    }
                    .fc-event-resizer-y-top {
                        top: -9px !important;
                    }
                }
                
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                .fc .fc-timegrid-slot { height: 3.5em !important; border-bottom: 0 !important; }
                
                .fc-v-event { 
                    border: 0 !important; 
                    border-radius: 12px !important; 
                    padding: 4px !important; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                    background-image: linear-gradient(135deg, rgba(255,255,255,0.2), transparent) !important;
                }
                .dark .fc-v-event {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
                    background-image: linear-gradient(135deg, rgba(255,255,255,0.1), transparent) !important;
                }

                .fc-v-event .fc-event-main { 
                    color: white !important; 
                    font-weight: 800 !important; 
                    font-size: 10px !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }
                
                .fc-timegrid-axis-cushion, .fc-timegrid-slot-label-cushion { 
                    color: rgba(0, 0, 0, 0.4) !important; 
                    font-weight: 900 !important; 
                    font-size: 9px !important; 
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em;
                }
                .dark .fc-timegrid-axis-cushion, .dark .fc-timegrid-slot-label-cushion {
                    color: rgba(255, 255, 255, 0.2) !important;
                }

                .fc-col-header-cell, .fc-timegrid-axis, .fc-scrollgrid, .fc-theme-standard th {
                    background-color: transparent !important;
                    background: transparent !important;
                    border: 0 !important;
                }
                .dark .fc-col-header-cell, .dark .fc-timegrid-axis, .dark .fc-scrollgrid, .dark .fc-theme-standard th {
                    background-color: transparent !important;
                    background: transparent !important;
                    border: 0 !important;
                }

                .fc-col-header-cell-cushion { 
                    font-weight: 900 !important; 
                    font-size: 11px !important; 
                    text-transform: uppercase !important; 
                    letter-spacing: 0.1em !important; 
                    padding: 16px 0 !important; 
                    text-decoration: none !important;
                }
                
                .fc-day-sun .fc-col-header-cell-cushion { color: #888 !important; }
                .fc-day-mon .fc-col-header-cell-cushion, .fc-day-thu .fc-col-header-cell-cushion { color: #3b82f6 !important; }
                .fc-day-tue .fc-col-header-cell-cushion, .fc-day-fri .fc-col-header-cell-cushion { color: #ef4444 !important; }
                .fc-day-wed .fc-col-header-cell-cushion, .fc-day-sat .fc-col-header-cell-cushion { color: #eab308 !important; }

                .fc-timegrid-col.fc-day-sun, .fc-timegrid-col.fc-day-mon, .fc-timegrid-col.fc-day-thu { background-color: rgba(59, 130, 246, 0.25) !important; }
                .fc-timegrid-col.fc-day-tue, .fc-timegrid-col.fc-day-fri { background-color: rgba(239, 68, 68, 0.25) !important; }
                .fc-timegrid-col.fc-day-wed, .fc-timegrid-col.fc-day-sat { background-color: rgba(234, 179, 8, 0.25) !important; }

                .dark .fc-timegrid-col.fc-day-sun, .dark .fc-timegrid-col.fc-day-mon, .dark .fc-timegrid-col.fc-day-thu { background-color: rgba(59, 130, 246, 0.1) !important; }
                .dark .fc-timegrid-col.fc-day-tue, .dark .fc-timegrid-col.fc-day-fri { background-color: rgba(239, 68, 68, 0.1) !important; }
                .dark .fc-timegrid-col.fc-day-wed, .dark .fc-timegrid-col.fc-day-sat { background-color: rgba(234, 179, 8, 0.1) !important; }

                .fc-timegrid-now-indicator-line { border-color: #3b82f6 !important; border-width: 2px !important; opacity: 0.5; }
                .fc-timegrid-now-indicator-arrow { border-left-color: #3b82f6 !important; border-right-color: #3b82f6 !important; }
                .fc-scrollgrid { border: 0 !important; }
                .fc-timegrid-col.fc-day-today { background: rgba(59, 130, 246, 0.05) !important; }

                @media print {
                    nav, aside, footer, header, .print\:hidden, .fc-header-toolbar, 
                    .bg-gradient-to-br, .enrollment-section, #enrollment-list-container,
                    .glass-card > div > div:first-child {
                        display: none !important;
                    }
                    body { background: white !important; color: black !important; }
                    .glass-card { background: white !important; border: 0 !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
                    .fc { background: white !important; }
                    .fc-v-event { background-color: #f3f4f6 !important; color: black !important; box-shadow: none !important; border: 1px solid #ddd !important; }
                    .fc-event-main { color: black !important; text-shadow: none !important; }
                    .fc-col-header-cell-cushion, .fc-timegrid-axis-cushion, .fc-timegrid-slot-label-cushion { color: #333 !important; }
                    .main-content-layout { padding: 0 !important; margin: 0 !important; }
                    .calendar-container { width: 100vw !important; height: 100vh !important; }
                }
            `}</style>

            <header className="flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Grade <span className="text-brand-blue">Horária</span>
                    </h1>
                    <p className="text-gray-400 font-medium italic">Seu cockpit de navegação pelo IFUSP.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsHelpModalOpen(true)}
                        className="flex items-center justify-center p-3 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue hover:bg-brand-blue/20 transition-colors"
                        title="Como usar o cronograma?"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <FerramentasFeedbackCard className="block lg:hidden" />


            <div className="bg-transparent min-h-[600px] rounded-[40px] overflow-hidden">
                <div className="p-8 h-full flex flex-col gap-12">
                    <div className={`space-y-6 enrollment-section print:hidden transition-all duration-500 overflow-hidden ${viewMode === 'view' ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[2000px] opacity-100'}`}>
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black uppercase text-brand-blue tracking-widest flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                Suas Matrículas
                            </h4>
                            <div className="flex items-center gap-4">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hidden sm:block">
                                    Arraste os blocos abaixo para o cronograma
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest sm:hidden">
                                    {selectedBlockToAdd ? 'Toque no calendário para alocar' : 'Toque num bloco para selecioná-lo'}
                                </p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shrink-0"
                                >
                                    <Plus className="w-3 h-3" />
                                    Criar Bloco
                                </button>
                            </div>
                        </div>
                        
                        <div className="relative group/scroll">
                            <button
                                onClick={() => enrollmentListRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 p-2 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg border border-gray-200 dark:border-gray-800 text-brand-blue transition-opacity flex"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => enrollmentListRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 p-2 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg border border-gray-200 dark:border-gray-800 text-brand-blue transition-opacity flex"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <div id="enrollment-list" ref={enrollmentListRef} className="flex flex-row overflow-x-auto snap-x gap-4 pb-4 scrollbar-hide scroll-smooth relative px-8 sm:px-0">
                                {customBlocks.map((block) => {
                                    const colorData = getStableColor(block.id, block.title);
                                    return (
                                        <div key={block.id} className="space-y-2 snap-start">
                                            <div 
                                                onClick={() => {
                                                    if (isMobile) {
                                                        if (selectedBlockToAdd?.id === block.id) {
                                                            setSelectedBlockToAdd(null);
                                                        } else {
                                                            const colorData = getStableColor(block.id, block.title);
                                                            setSelectedBlockToAdd({
                                                                id: Math.random().toString(),
                                                                title: block.title,
                                                                type: 'custom',
                                                                color: colorData.bg,
                                                                extendedProps: { code: null, type: 'custom', sourceId: block.id, trail_id: null, duration: block.duration.toString() }
                                                            });
                                                        }
                                                    }
                                                }}
                                                data-title={block.title}
                                                data-type="custom"
                                                data-id={block.id}
                                                data-color={colorData.bg}
                                                data-duration={block.duration.toString()}
                                                className={`group draggable-item p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing shadow-lg relative print:hidden sm:min-w-0 min-w-[240px] ${selectedBlockToAdd?.extendedProps?.sourceId === block.id ? 'ring-2 ring-offset-2 ring-offset-black ring-white' : ''}`}
                                                style={{ 
                                                    borderLeft: `6px solid ${colorData.bg}`,
                                                    backgroundColor: `${colorData.bg}40`,
                                                    borderColor: `${colorData.bg}30`
                                                }}
                                            >
                                                <div className="text-[10px] font-black uppercase mb-1" style={{ color: colorData.bg }}>Customizado</div>
                                                <div className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1">{fixEncoding(block.title)}</div>
                                                <div className="mt-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                    Duração: {block.duration}h
                                                </div>

                                                {viewMode === 'edit' && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            const res = await CalendarActions.deleteCustomBlock(block.id);
                                                            if (res.success) {
                                                                setCustomBlocks(prev => prev.filter(b => b.id !== block.id));
                                                                toast.success('Bloco removido');
                                                            } else {
                                                                toast.error('Erro ao remover bloco');
                                                            }
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {academicData?.inProgress?.length > 0 ? (
                                    academicData.inProgress.map((p: any) => {
                                        const seed = p.trail_id || p.course_code || p.id;
                                        const colorData = getStableColor(seed, p.learning_trails?.title);
                                        return (
                                            <div key={p.id} className="space-y-2 snap-start">
                                                <div 
                                                    onClick={() => {
                                                        if (isMobile) {
                                                            if (selectedBlockToAdd?.extendedProps?.sourceId === seed && selectedBlockToAdd?.extendedProps?.type === 'aula') {
                                                                setSelectedBlockToAdd(null);
                                                            } else {
                                                                setSelectedBlockToAdd({
                                                                    id: Math.random().toString(),
                                                                    title: `🎓 Aula: ${p.learning_trails?.title}`,
                                                                    type: 'aula',
                                                                    color: colorData.bg,
                                                                    extendedProps: { code: p.course_code, type: 'aula', sourceId: seed, trail_id: seed, duration: "02:00" }
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    data-title={p.learning_trails?.title}
                                                    data-code={p.course_code}
                                                    data-type="aula"
                                                    data-id={seed}
                                                    data-duration="02:00"
                                                    className={`group draggable-item p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing shadow-sm relative overflow-hidden print:hidden sm:min-w-0 min-w-[240px] ${selectedBlockToAdd?.extendedProps?.sourceId === seed && selectedBlockToAdd?.extendedProps?.type === 'aula' ? 'ring-2 ring-offset-2 ring-offset-black ring-white' : ''}`}
                                                    style={{ 
                                                        borderLeft: `6px solid ${colorData.bg}`,
                                                        backgroundColor: `${colorData.bg}40`,
                                                        borderColor: `${colorData.bg}30`
                                                    }}
                                                >
                                                    <div className="text-[10px] font-black uppercase mb-1" style={{ color: colorData.bg }}>{p.course_code || 'IFUSP'}</div>
                                                    <div className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1 group-hover:text-brand-blue transition-colors">
                                                        {fixEncoding(p.learning_trails?.title) || 'Disciplina'}
                                                    </div>
                                                    <div className="mt-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                        Bloco: Aula
                                                    </div>

                                                    <button
                                                        onClick={(e) => toggleCursando(e, p.trail_id)}
                                                        disabled={isUpdating === p.trail_id}
                                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                        title="Remover matrícula"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                                <div 
                                                    onClick={() => {
                                                        if (isMobile) {
                                                            if (selectedBlockToAdd?.extendedProps?.sourceId === seed && selectedBlockToAdd?.extendedProps?.type === 'estudo') {
                                                                setSelectedBlockToAdd(null);
                                                            } else {
                                                                setSelectedBlockToAdd({
                                                                    id: Math.random().toString(),
                                                                    title: `📚 Estudo: ${p.learning_trails?.title}`,
                                                                    type: 'estudo',
                                                                    color: colorData.bg,
                                                                    extendedProps: { code: p.course_code, type: 'estudo', sourceId: seed, trail_id: seed, duration: "02:00" }
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    data-title={p.learning_trails?.title}
                                                    data-code={p.course_code}
                                                    data-type="estudo"
                                                    data-id={seed}
                                                    data-duration="02:00"
                                                    className={`draggable-item p-3 bg-gray-200 dark:bg-white/5 rounded-2xl border border-gray-300 dark:border-white/10 group hover:border-gray-400 dark:hover:border-white/30 transition-all cursor-grab active:cursor-grabbing shadow-sm print:hidden ${selectedBlockToAdd?.extendedProps?.sourceId === seed && selectedBlockToAdd?.extendedProps?.type === 'estudo' ? 'ring-2 ring-offset-2 ring-offset-black ring-white' : ''}`}
                                                >
                                                    <div className="text-[9px] font-bold text-gray-700 dark:text-gray-400 uppercase">
                                                        Bloco: Estudo
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex items-center justify-center p-12 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">Nenhuma matrícula identificada</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Cronograma Semanal</h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setViewMode(prev => prev === 'view' ? 'edit' : 'view')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all border ${
                                        viewMode === 'view' 
                                            ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20' 
                                            : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {viewMode === 'view' ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {isMobile ? 'Ver / Editar' : (viewMode === 'view' ? 'Editar Cronograma' : 'Ver Cronograma')}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setIsExportModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-white/10"
                                    title="Exportar Calendário"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Exportar</span>
                                </button>
                                <div 
                                    id="calendar-trash"
                                    onClick={async () => {
                                        if (selectedEventId) {
                                            setEvents(prev => prev.filter(e => e.id !== selectedEventId));
                                            await CalendarActions.deleteCalendarEvent(selectedEventId);
                                            toast.success('Evento removido');
                                            setSelectedEventId(null);
                                        } else if (isMobile) {
                                            toast.error('Selecione um bloco no calendário primeiro');
                                        }
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl transition-all hover:bg-red-500 hover:text-white cursor-pointer ${viewMode === 'view' ? 'hidden' : ''}`}
                                    title="Arraste aqui para excluir, ou clique após selecionar o bloco"
                                >
                                    <Trash2 className="w-4 h-4 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Excluir</span>
                                </div>
                            </div>
                        </div>
                
                        <div className={`bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden transition-all ${viewMode === 'view' ? 'bg-gray-50/50 dark:bg-[#121212] border-brand-blue/10' : ''}`}>
                            {viewMode === 'view' ? (
                                <div className="relative group/view-scroll">
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById('view-calendar-scroll');
                                            el?.scrollBy({ left: -300, behavior: 'smooth' });
                                        }}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 p-2 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg border border-gray-200 dark:border-gray-800 text-brand-blue transition-opacity flex"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById('view-calendar-scroll');
                                            el?.scrollBy({ left: 300, behavior: 'smooth' });
                                        }}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 p-2 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg border border-gray-200 dark:border-gray-800 text-brand-blue transition-opacity flex"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                    <div id="view-calendar-scroll" className="flex flex-row gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x px-8 sm:px-0">
                                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, dayIdx) => {
                                            const dayEvents = events.filter(e => new Date(e.start).getDay() === dayIdx).sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                                            const dayColor = dayIdx === 0 ? '#888' : (dayIdx % 3 === 1 ? '#3b82f6' : (dayIdx % 3 === 2 ? '#ef4444' : '#eab308'));
                                            
                                            return (
                                                <div key={dayName} className="flex flex-col gap-4 min-w-[280px] bg-gray-50/80 dark:bg-white/[0.03] rounded-[32px] p-5 border border-transparent dark:border-white/[0.05] snap-start">
                                                    <div className="flex items-center justify-between px-2">
                                                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: dayColor }}>
                                                            {dayName}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 dark:text-white/20">
                                                            {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        {dayEvents.length > 0 ? dayEvents.map(e => (
                                                            <div 
                                                                key={e.id} 
                                                                className="p-4 rounded-[22px] border border-black/5 dark:border-white/10 shadow-lg flex flex-col gap-2 transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.05] relative overflow-hidden"
                                                                style={{ 
                                                                    borderLeft: `4px solid ${e.color}`,
                                                                    backgroundColor: `${e.color}40`,
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-black bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full text-gray-700 dark:text-white/70">
                                                                        {new Date(e.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs font-bold leading-tight text-gray-900 dark:text-white mb-1">
                                                                    {e.title}
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <div className="h-32 flex items-center justify-center border-2 border-dashed border-black/[0.1] dark:border-white/[0.02] rounded-[28px]">
                                                                <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-white/5 tracking-widest">Livre</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <FullCalendar
                                    key={`${viewMode}-${isMobile ? 'mobile' : 'desktop'}`}
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
                                    headerToolbar={isMobile ? {
                                        left: 'prev,next',
                                        center: 'title',
                                        right: 'timeGridDay,timeGridWeek'
                                    } : false}
                                    dayHeaderFormat={{ weekday: 'long' }}
                                    slotMinTime="06:00:00"
                                    slotMaxTime="24:00:00"
                                    allDaySlot={false}
                                    height="auto"
                                    events={events}
                                    themeSystem="standard"
                                    locale="pt-br"
                                    editable={true}
                                    droppable={true}
                                    selectable={true}
                                    selectMirror={true}
                                    dayMaxEvents={true}
                                    nowIndicator={true}
                                    dateClick={async (info) => {
                                        if (isMobile && selectedBlockToAdd) {
                                            const durationStr = selectedBlockToAdd.extendedProps.duration;
                                            let durationHours = 2;
                                            
                                            if (durationStr.includes(':')) {
                                                const parts = durationStr.split(':');
                                                durationHours = parseInt(parts[0]) + (parseInt(parts[1])/60);
                                            } else {
                                                durationHours = parseFloat(durationStr);
                                            }

                                            const tempId = Math.random().toString();
                                            const newEvent: CalendarEvent = {
                                                id: tempId,
                                                title: selectedBlockToAdd.title,
                                                start: info.dateStr,
                                                end: new Date(new Date(info.dateStr).getTime() + durationHours * 60 * 60 * 1000).toISOString(),
                                                color: selectedBlockToAdd.color,
                                                extendedProps: selectedBlockToAdd.extendedProps
                                            };
                                            
                                            setEvents((prev) => [...prev, newEvent]);
                                            setSelectedBlockToAdd(null);
                                            toast.success('Bloco adicionado!');

                                            const res = await CalendarActions.upsertCalendarEvent(newEvent);
                                            if (res.success && res.data) {
                                                setEvents(prev => prev.map(e => e.id === tempId ? { ...e, id: res.data.id } : e));
                                            } else {
                                                toast.error('Erro ao salvar no banco');
                                                setEvents(prev => prev.filter(e => e.id !== tempId));
                                            }
                                        } else if (selectedEventId) {
                                            const eventToMove = events.find(e => e.id === selectedEventId);
                                            if (eventToMove) {
                                                const durationMs = new Date(eventToMove.end).getTime() - new Date(eventToMove.start).getTime();
                                                const newStart = info.dateStr;
                                                const newEnd = new Date(new Date(newStart).getTime() + durationMs).toISOString();
                                                
                                                const updatedEvent = { ...eventToMove, start: newStart, end: newEnd };
                                                setEvents(prev => prev.map(e => e.id === selectedEventId ? updatedEvent : e));
                                                setSelectedEventId(null);
                                                toast.success('Horário Atualizado!');
                                                
                                                await CalendarActions.upsertCalendarEvent(updatedEvent);
                                            }
                                        }
                                    }}
                                    eventClick={(info) => {
                                        if (selectedEventId === info.event.id) {
                                            setSelectedEventId(null);
                                        } else {
                                            setSelectedEventId(info.event.id);
                                            if (isMobile) {
                                                toast('Bloco Selecionado! Toque na lixeira para excluir ou em outro horário para mover.', { icon: '👆', duration: 3000 });
                                            }
                                        }
                                    }}
                                    eventClassNames={(arg) => {
                                        if (arg.event.id === selectedEventId) {
                                            return ['ring-4', 'ring-white', 'ring-offset-2', 'ring-offset-black'];
                                        }
                                        return [];
                                    }}
                                    eventReceive={async (info: any) => {
                                        const tempId = Math.random().toString();
                                        const newEvent: CalendarEvent = {
                                            id: tempId,
                                            title: info.event.title,
                                            start: info.event.start,
                                            end: info.event.end,
                                            color: info.event.backgroundColor,
                                            extendedProps: info.event.extendedProps
                                        };
                                        
                                        setEvents((prev) => [...prev, newEvent]);
                                        info.event.remove();

                                        const res = await CalendarActions.upsertCalendarEvent(newEvent);
                                        if (res.success && res.data) {
                                            setEvents(prev => prev.map(e => e.id === tempId ? { ...e, id: res.data.id } : e));
                                        } else {
                                            toast.error('Erro ao salvar no banco');
                                            setEvents(prev => prev.filter(e => e.id !== tempId));
                                        }
                                    }}
                                    eventDrop={async (info: any) => {
                                        const updatedEvent = {
                                            id: info.event.id,
                                            title: info.event.title,
                                            start: info.event.start,
                                            end: info.event.end,
                                            color: info.event.backgroundColor,
                                            extendedProps: info.event.extendedProps
                                        };
                                        setEvents((prev) => prev.map((e) => e.id === info.event.id ? updatedEvent : e));
                                        const res = await CalendarActions.upsertCalendarEvent(updatedEvent);
                                    }}
                                    eventResize={async (info: any) => {
                                        const updatedEvent = {
                                            id: info.event.id,
                                            title: info.event.title,
                                            start: info.event.start,
                                            end: info.event.end,
                                            color: info.event.backgroundColor,
                                            extendedProps: info.event.extendedProps
                                        };
                                        setEvents((prev) => prev.map((e) => e.id === info.event.id ? updatedEvent : e));
                                        const res = await CalendarActions.upsertCalendarEvent(updatedEvent);
                                    }}
                                    eventDragStop={async (info: any) => {
                                        const trashEl = document.getElementById('calendar-trash');
                                        if (trashEl) {
                                            const rect = trashEl.getBoundingClientRect();
                                            const x = info.jsEvent.clientX;
                                            const y = info.jsEvent.clientY;
                                            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                                                const eventId = info.event.id;
                                                info.event.remove();
                                                setEvents(prev => prev.filter(e => e.id !== eventId));
                                                await CalendarActions.deleteCalendarEvent(eventId);
                                                toast.success('Evento removido');
                                            }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="relative bg-[#1e1e1e] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-6">Novo Bloco</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Nome do Bloco</label>
                                <input 
                                    type="text" 
                                    value={newBlockName}
                                    onChange={(e) => setNewBlockName(e.target.value)}
                                    placeholder="Ex: Almoço, Estudo Individual..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Duração (Horas)</label>
                                <input 
                                    type="number" 
                                    value={newBlockDuration}
                                    onChange={(e) => setNewBlockDuration(Number(e.target.value))}
                                    min="0.5"
                                    max="8"
                                    step="0.5"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-bold text-xs uppercase text-gray-400">Cancelar</button>
                                <button 
                                    onClick={async () => {
                                        if (newBlockName) {
                                            const res = await CalendarActions.addCustomBlock(newBlockName, newBlockDuration);
                                            if (res.success && res.data) {
                                                setCustomBlocks(prev => [res.data, ...prev]);
                                                setNewBlockName('');
                                                setIsCreateModalOpen(false);
                                                toast.success('Bloco criado!');
                                            } else {
                                                toast.error('Erro ao salvar bloco.');
                                            }
                                        }
                                    }}
                                    className="flex-1 py-3 bg-brand-blue rounded-2xl font-bold text-xs uppercase text-white shadow-lg shadow-brand-blue/20"
                                >
                                    Criar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isExportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)} />
                    <div className="relative bg-[#1e1e1e] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">Exportar</h3>
                        <p className="text-gray-400 text-xs mb-8">Escolha o formato para salvar seu cronograma.</p>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={() => window.print()} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group text-left">
                                <div className="size-10 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red"><FileText className="w-5 h-5" /></div>
                                <div><div className="text-sm font-bold text-white uppercase tracking-tight">Salvar como PDF</div><div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ideal para imprimir</div></div>
                            </button>
                            <button 
                                onClick={() => {
                                    const icsContent = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//IFUSP//Hub LabDiv//PT',...events.map(e => ['BEGIN:VEVENT',`SUMMARY:${e.title}`,`DTSTART:${new Date(e.start).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,`DTEND:${new Date(e.end || new Date(e.start).getTime() + 7200000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,'END:VEVENT'].join('\n')),'END:VCALENDAR'].join('\n');
                                    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'cronograma.ics');
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group text-left"
                            >
                                <div className="size-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue"><CalendarDays className="w-5 h-5" /></div>
                                <div><div className="text-sm font-bold text-white uppercase tracking-tight">Calendário (.ics)</div><div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Google Agenda / Outlook</div></div>
                            </button>
                            <button 
                                onClick={() => {
                                    const csvHeader = 'Titulo,Inicio,Fim\n';
                                    const csvRows = events.map(e => `"${e.title}","${e.start}","${e.end || ''}"`).join('\n');
                                    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8' });
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'cronograma.csv');
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group text-left"
                            >
                                <div className="size-10 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow"><Table className="w-5 h-5" /></div>
                                <div><div className="text-sm font-bold text-white uppercase tracking-tight">Arquivo CSV (.csv)</div><div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Exportar para Excel</div></div>
                            </button>
                        </div>
                        <button onClick={() => setIsExportModalOpen(false)} className="mt-6 w-full py-4 bg-white/5 rounded-2xl font-bold text-xs uppercase text-gray-500 hover:text-white transition-colors">Fechar</button>
                    </div>
                </div>
            )}

            {isHelpModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsHelpModalOpen(false)} />
                    <div className="relative bg-[#1e1e1e] border border-white/10 rounded-[40px] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                                <Info className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">Como utilizar?</h3>
                        </div>

                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="mt-1 size-6 rounded-full bg-brand-blue/20 text-brand-blue font-black flex items-center justify-center text-xs shrink-0 border border-brand-blue/30">1</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm mb-1">Adicionando Materiais</h4>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">Suas disciplinas cursadas nas <span className="text-white">Trilhas</span> já aparecem nos blocos superiores. Arraste-as (Desktop) ou clique e depois selecione o horário (Celular) no calendário.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 size-6 rounded-full bg-brand-yellow/20 text-brand-yellow font-black flex items-center justify-center text-xs shrink-0 border border-brand-yellow/30">2</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm mb-1">Crie seus próprios Blocos</h4>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">Você pode criar blocos personalizados (Ex: "Pesquisa na Biblioteca", "Almoço") pelo botão "Criar Bloco" para completar sua grade.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 size-6 rounded-full bg-brand-red/20 text-brand-red font-black flex items-center justify-center text-xs shrink-0 border border-brand-red/30">3</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm mb-1">Edição Rápida</h4>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">Para mover o horário de um bloco no celular, clique nele e em seguida clique no horário de destino. Para remover, clique no bloco e depois no ícone da lixeira vermelha.</p>
                                </div>
                            </li>
                        </ul>

                        <button onClick={() => setIsHelpModalOpen(false)} className="mt-10 w-full py-4 bg-white/5 rounded-2xl font-bold text-xs uppercase text-white hover:bg-brand-blue hover:text-white transition-colors border border-white/10">
                            Entendi!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
