'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Position,
    ReactFlowProvider,
    Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { fetchAllDisciplines, fetchUserAcademicdata } from '@/app/actions/disciplines';
import { Loader2, Zap, GraduationCap, Calendar, Info, Plus } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const nodeWidth = 180;
const nodeHeight = 60;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        // We are shifting the dagre node position (which is center) to top left
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
};

const CustomNode = ({ data }: any) => {
    return (
        <div className={`px-4 py-2 shadow-lg rounded-xl border text-[10px] font-bold uppercase tracking-tight transition-all duration-300 flex flex-col items-center justify-center min-w-[150px]
            ${data.status === 'completed' 
                ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' 
                : data.status === 'current'
                ? 'bg-brand-yellow/10 border-brand-yellow text-brand-yellow'
                : 'bg-white/5 border-white/10 text-white/40'}`}>
            <Handle type="target" position={Position.Left} className="!bg-brand-blue !border-none !w-1 !h-4 !rounded-none" />
            <div className="text-center truncate w-full">{data.label}</div>
            <div className="opacity-50 text-[8px] mt-0.5">{data.code}</div>
            <Handle type="source" position={Position.Right} className="!bg-brand-blue !border-none !w-1 !h-4 !rounded-none" />
        </div>
    );
};

const nodeTypes = {
    course: CustomNode,
};

export default function FerramentasClient({ profile }: { profile: any }) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [academicData, setAcademicData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tree');

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const [disciplinesRes, academicRes] = await Promise.all([
                fetchAllDisciplines(),
                fetchUserAcademicdata()
            ]);

            if (disciplinesRes.success && disciplinesRes.data) {
                const disciplines = disciplinesRes.data;
                const progressData = academicRes.success ? academicRes.data : { inProgress: [], completed: [] };
                setAcademicData(progressData);

                const completedIds = new Set(progressData.completed.map((c: any) => c.trail_id));
                const inProgressIds = new Set(progressData.inProgress.map((p: any) => p.trail_id));

                const initialNodes: Node[] = disciplines.map((d: any) => ({
                    id: d.course_code,
                    type: 'course',
                    data: { 
                        label: d.title, 
                        code: d.course_code,
                        status: completedIds.has(d.id) ? 'completed' : inProgressIds.has(d.id) ? 'current' : 'locked'
                    },
                    position: { x: 0, y: 0 },
                }));
                // ... (rest of the logic remains same for edges)
                const initialEdges: Edge[] = [];
                disciplines.forEach((d: any) => {
                    if (d.prerequisites && Array.isArray(d.prerequisites)) {
                        d.prerequisites.forEach((pre: string) => {
                            if (disciplines.find((x: any) => x.course_code === pre)) {
                                initialEdges.push({
                                    id: `e-${pre}-${d.course_code}`,
                                    source: pre,
                                    target: d.course_code,
                                    animated: true,
                                    style: { 
                                        stroke: completedIds.has(d.id) ? '#4F46E5' : '#333', 
                                        strokeWidth: 1, 
                                        opacity: completedIds.has(d.id) ? 0.8 : 0.3 
                                    },
                                });
                            }
                        });
                    }
                });

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    initialNodes,
                    initialEdges
                );

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
            }
            setIsLoading(false);
        };

        if (activeTab === 'tree') init();
    }, [activeTab, setNodes, setEdges]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter">
                        Ferramentas <span className="text-brand-blue">Acadêmicas</span>
                    </h1>
                    <p className="text-gray-400 font-medium italic">Seu cockpit de navegação pelo IFUSP.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button 
                        onClick={() => setActiveTab('tree')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'tree' ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Zap className="w-3 h-3" />
                        Árvore do Curso
                    </button>
                    <button 
                        onClick={() => setActiveTab('calendar')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'calendar' ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Calendar className="w-3 h-3" />
                        Grade Horária
                    </button>
                </div>
            </header>

            <div className="glass-card min-h-[600px] rounded-[40px] border border-white/5 overflow-hidden relative">
                {activeTab === 'tree' ? (
                    <div className="w-full h-[700px] relative">
                         {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#121212]/50 backdrop-blur-sm z-10">
                                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                            </div>
                        ) : (
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                nodeTypes={nodeTypes}
                                fitView
                                className="bg-[#121212]"
                            >
                                <Background color="#333" gap={20} />
                                <Controls className="fill-white" />
                            </ReactFlow>
                        )}
                        <div className="absolute bottom-6 left-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 z-10 space-y-2">
                            <h4 className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3 text-brand-blue" />
                                Legenda de Fluxo
                            </h4>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-brand-blue" />
                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Concluída</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-brand-yellow" />
                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Em Curso</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-white/20 border border-white/10" />
                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Não Cursada</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 h-full flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-display font-bold text-white uppercase tracking-tighter">Sincronizador Horário</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Alocar disciplinas semanais</p>
                                </div>
                            </div>
                            
                            <div className="dark bg-white/5 p-6 rounded-3xl border border-white/5 overflow-hidden">
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="timeGridWeek"
                                    headerToolbar={false}
                                    dayHeaderFormat={{ weekday: 'short' }}
                                    slotMinTime="07:00:00"
                                    slotMaxTime="23:00:00"
                                    allDaySlot={false}
                                    height="600px"
                                    events={[]} 
                                    themeSystem="standard"
                                    locale="pt-br"
                                    editable={true}
                                    selectable={true}
                                    selectMirror={true}
                                    dayMaxEvents={true}
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-80 space-y-6">
                            <div className="p-6 bg-brand-blue/10 rounded-3xl border border-brand-blue/20">
                                <h4 className="text-sm font-black uppercase text-brand-blue tracking-widest flex items-center gap-2 mb-4">
                                    <GraduationCap className="w-4 h-4" />
                                    Suas Matrículas
                                </h4>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {academicData?.inProgress?.length > 0 ? (
                                        academicData.inProgress.map((p: any) => (
                                            <div key={p.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-brand-blue/50 transition-all cursor-pointer">
                                                <div className="text-[10px] font-black text-brand-blue uppercase mb-1">{p.course_code || 'MAT0111'}</div>
                                                <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-brand-blue transition-colors">
                                                    {p.learning_trails?.title || 'Cálculo I'}
                                                </div>
                                                <button className="mt-3 flex items-center gap-1.5 text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                                                    <Plus className="w-3 h-3" />
                                                    Alocar Horário
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase italic">Nenhuma matrícula ativa</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                <h4 className="text-xs font-black uppercase text-white tracking-widest mb-2">Dica de Produtividade</h4>
                                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                    "O planejamento é o síncrotron da mente: acelera suas conquistas e foca suas energias no que realmente importa."
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
