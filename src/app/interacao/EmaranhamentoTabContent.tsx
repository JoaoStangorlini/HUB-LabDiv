'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProfileById, fetchRecentEntanglements } from '@/app/actions/submissions';
import { searchUsersByName } from '@/app/actions/profiles';
import { createEntangledGroup, fetchMyGroups, fetchGroupMessages, sendGroupMessage } from '@/app/actions/groups';
import { ParticleEntanglement } from '@/components/engagement/ParticleEntanglement';
import { User, Loader2, Search, X, Users, Plus, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export function EmaranhamentoTabContent() {
    const searchParams = useSearchParams();
    const userIdUrl = searchParams.get('userId') || searchParams.get('userID');
    const groupIdUrl = searchParams.get('groupId');

    const [targetProfile, setTargetProfile] = useState<any>(null);
    const [recentConversations, setRecentConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecentLoading, setIsRecentLoading] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Group state
    const [myGroups, setMyGroups] = useState<any[]>([]);
    const [isGroupsLoading, setIsGroupsLoading] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
    const [isMemberSearching, setIsMemberSearching] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

    // Active group chat
    const [activeGroup, setActiveGroup] = useState<any>(null);
    const [groupMessages, setGroupMessages] = useState<any[]>([]);
    const [groupMessage, setGroupMessage] = useState('');
    const [isSendingGroupMsg, setIsSendingGroupMsg] = useState(false);
    const [isLoadingGroupChat, setIsLoadingGroupChat] = useState(false);
    const groupChatRef = useRef<HTMLDivElement>(null);

    // Load initial data
    useEffect(() => {
        if (userIdUrl) {
            setIsLoading(true);
            setActiveGroup(null);
            getProfileById(userIdUrl).then(setTargetProfile).finally(() => setIsLoading(false));
        } else if (groupIdUrl) {
           // Handled in group effect
        } else {
            setTargetProfile(null);
            setActiveGroup(null);
            setIsRecentLoading(true);
            fetchRecentEntanglements().then(setRecentConversations).finally(() => setIsRecentLoading(false));
        }
    }, [userIdUrl, groupIdUrl]);

    // Load groups
    useEffect(() => {
        setIsGroupsLoading(true);
        fetchMyGroups().then(res => {
            if (res.data) {
                setMyGroups(res.data);
                if (groupIdUrl) {
                    const g = res.data.find((g: any) => g.id === groupIdUrl);
                    if (g) openGroupChat(g);
                }
            }
        }).finally(() => setIsGroupsLoading(false));
    }, [groupIdUrl]);

    // Search users for 1-to-1
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            const res = await searchUsersByName(searchQuery);
            if (res.data) setSearchResults(res.data);
            setIsSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Search members for group
    useEffect(() => {
        if (!memberSearchQuery || memberSearchQuery.trim().length < 2) {
            setMemberSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsMemberSearching(true);
            const res = await searchUsersByName(memberSearchQuery);
            if (res.data) {
                const filtered = res.data.filter((u: any) => !selectedMembers.find(m => m.id === u.id));
                setMemberSearchResults(filtered);
            }
            setIsMemberSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [memberSearchQuery, selectedMembers]);

    const openGroupChat = async (group: any) => {
        setActiveGroup(group);
        setTargetProfile(null);
        setIsLoadingGroupChat(true);
        const msgs = await fetchGroupMessages(group.id);
        setGroupMessages(msgs);
        setIsLoadingGroupChat(false);
    };

    const handleSendGroupMessage = async () => {
        if (!activeGroup || !groupMessage.trim()) return;
        setIsSendingGroupMsg(true);
        const res = await sendGroupMessage(activeGroup.id, groupMessage);
        if (!res.error) setGroupMessage('');
        setIsSendingGroupMsg(false);
        // Re-fetch or rely on realtime if implemented in activeGroup logic
        const msgs = await fetchGroupMessages(activeGroup.id);
        setGroupMessages(msgs);
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || selectedMembers.length < 2) {
            toast.error('Dê um nome e adicione pelo menos 2 membros.');
            return;
        }
        setIsCreatingGroup(true);
        const res = await createEntangledGroup(newGroupName, selectedMembers.map(m => m.id));
        if (!res.error) {
            toast.success('Grupo criado!');
            setShowCreateGroup(false);
            setNewGroupName('');
            setSelectedMembers([]);
            fetchMyGroups().then(r => r.data && setMyGroups(r.data));
        } else {
            toast.error(res.error);
        }
        setIsCreatingGroup(false);
    };

    const getChatView = () => {
        if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

        if (targetProfile) {
            return (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        {targetProfile.avatar ? <img src={targetProfile.avatar} className="size-10 rounded-full object-cover" /> : <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase">{targetProfile.name?.[0]}</div>}
                        <div className="flex flex-col">
                            <h3 className="text-xs font-black uppercase text-white tracking-widest">{targetProfile.name}</h3>
                            <span className="text-[10px] text-brand-blue font-black uppercase">Conexão Ativa</span>
                        </div>
                        <button onClick={() => setTargetProfile(null)} className="ml-auto text-gray-500 hover:text-white transition-colors"><X className="size-4" /></button>
                    </div>
                    <div className="h-[500px] bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
                        <ParticleEntanglement recipientId={targetProfile.id} />
                    </div>
                </div>
            );
        }

        if (activeGroup) {
            return (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="size-10 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow"><Users className="size-5" /></div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-black uppercase text-white tracking-widest truncate">{activeGroup.name}</h3>
                            <span className="text-[10px] text-brand-yellow font-black uppercase">{activeGroup.members?.length || 0} Membros</span>
                        </div>
                        <button onClick={() => setActiveGroup(null)} className="text-gray-500 hover:text-white transition-colors"><X className="size-4" /></button>
                    </div>
                    <div className="h-[500px] flex flex-col bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {groupMessages.map(msg => (
                                <div key={msg.id} className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase text-brand-yellow mb-1">{msg.sender?.full_name || 'Usuário'}</span>
                                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 max-w-[80%] text-xs text-gray-300">
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
                             <input value={groupMessage} onChange={e => setGroupMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendGroupMessage()} placeholder="Mensagem para o grupo..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-brand-yellow/50" />
                             <button onClick={handleSendGroupMessage} className="size-9 bg-brand-yellow text-gray-900 rounded-lg flex items-center justify-center hover:opacity-90 transition-all"><Send className="size-4" /></button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-12">
                {/* Search & Intro */}
                <div className="flex flex-col items-center text-center max-w-lg mx-auto">
                    <div className="size-16 rounded-full bg-brand-blue/10 flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-brand-blue">hub</span>
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Interface de Emaranhamento</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest leading-relaxed">Inicie conexões neurais com outros usuários ou retome uma de suas **Conversas Ativas**.</p>
                    
                    <div className="w-full mt-8 relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                         <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="BUSCAR USUÁRIO..." className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue/50 transition-all" />
                         {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 animate-spin text-brand-blue" />}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="w-full mt-4 space-y-2 max-h-[200px] overflow-y-auto">
                            {searchResults.map(user => (
                                <button key={user.id} onClick={() => setTargetProfile({ id: user.id, name: user.full_name, avatar: user.avatar_url })} className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-brand-blue/20 rounded-xl border border-white/5 transition-all group text-left">
                                    <div className="size-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase text-[10px]">{user.full_name?.[0]}</div>
                                    <span className="text-[10px] font-black uppercase text-white group-hover:text-brand-blue">{user.full_name}</span>
                                    <span className="ml-auto text-brand-blue/40 text-xs">→</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section: Partículas Emaranhadas (Conversas Ativas) */}
                <div className="grid md:grid-cols-2 gap-8">
                     {/* Groups */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow flex items-center gap-2">
                                <Users className="size-4" /> Grupos Emaranhados
                            </h3>
                            <button onClick={() => setShowCreateGroup(true)} className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow rounded-lg text-[9px] font-black uppercase hover:bg-brand-yellow/20 transition-all">+ Criar</button>
                        </div>
                        {isGroupsLoading ? <Loader2 className="animate-spin text-brand-yellow size-4 mx-auto" /> : myGroups.length > 0 ? (
                            <div className="space-y-2">
                                {myGroups.map(g => (
                                    <button key={g.id} onClick={() => openGroupChat(g)} className="w-full p-4 bg-white/5 hover:bg-brand-yellow/10 border border-white/5 rounded-2xl transition-all flex items-center gap-3 text-left">
                                        <div className="size-9 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow"><Users className="size-4" /></div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[10px] font-black uppercase text-white truncate">{g.name}</div>
                                            <div className="text-[8px] text-gray-500 font-bold uppercase truncate">{g.members?.length || 0} Membros</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : <p className="text-[9px] uppercase font-bold text-gray-600 italic">Nenhum grupo ativo.</p>}
                     </div>

                     {/* 1-to-1 Conversations */}
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">hub</span> Partículas Emaranhadas
                        </h3>
                        {isRecentLoading ? <Loader2 className="animate-spin text-brand-blue size-4 mx-auto" /> : recentConversations.length > 0 ? (
                            <div className="space-y-2">
                                {recentConversations.map(conv => (
                                    <button key={conv.id} onClick={() => setTargetProfile({ id: conv.id, name: conv.name, avatar: conv.avatar })} className="w-full p-4 bg-white/5 hover:bg-brand-blue/10 border border-white/5 rounded-2xl transition-all flex items-center gap-3 text-left">
                                        {conv.avatar ? <img src={conv.avatar} className="size-9 rounded-full object-cover" /> : <div className="size-9 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase text-[10px]">{conv.name[0]}</div>}
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[10px] font-black uppercase text-white truncate">{conv.name}</div>
                                            <div className="text-[8px] text-gray-500 font-bold uppercase truncate">{conv.lastMessage || 'Conexão estável'}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : <p className="text-[9px] uppercase font-bold text-gray-600 italic">Nenhuma partícula ativa.</p>}
                     </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in duration-500">
            {getChatView()}

            {/* Create Group Modal */}
            {showCreateGroup && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                     <div className="bg-[#1E1E1E] border border-white/10 rounded-[32px] w-full max-w-md p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase text-brand-yellow tracking-widest">Criar Grupo</h3>
                            <button onClick={() => setShowCreateGroup(false)} className="text-gray-500 hover:text-white transition-colors"><X className="size-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-500">Nome do Grupo</label>
                                <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Ex: Pesquisa Quântica" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-yellow/50" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-500">Adicionar Membros ({selectedMembers.length})</label>
                                <div className="relative">
                                    <input value={memberSearchQuery} onChange={e => setMemberSearchQuery(e.target.value)} placeholder="Buscar por nome..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-yellow/50" />
                                    {isMemberSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-3 animate-spin text-brand-yellow" />}
                                </div>
                                {memberSearchResults.length > 0 && (
                                    <div className="max-h-[120px] overflow-y-auto mt-2 space-y-1">
                                        {memberSearchResults.map(m => (
                                            <button key={m.id} onClick={() => { setSelectedMembers(prev => [...prev, m]); setMemberSearchQuery(''); setMemberSearchResults([]); }} className="w-full flex items-center gap-2 p-2 bg-white/5 hover:bg-brand-yellow/10 rounded-lg text-left">
                                                <span className="text-[10px] font-bold text-white uppercase">{m.full_name}</span>
                                                <Plus className="size-3 text-brand-yellow ml-auto" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {selectedMembers.map(m => (
                                        <div key={m.id} className="flex items-center gap-1.5 px-2 py-1 bg-brand-yellow/10 text-brand-yellow rounded-full text-[8px] font-black uppercase">
                                            {m.full_name.split(' ')[0]}
                                            <button onClick={() => setSelectedMembers(prev => prev.filter(p => p.id !== m.id))}><X className="size-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleCreateGroup} disabled={isCreatingGroup || !newGroupName.trim() || selectedMembers.length < 2} className="w-full py-4 bg-brand-yellow text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-brand-yellow/20 disabled:opacity-50">
                                {isCreatingGroup ? 'ESTRUTURANDO NÚCLEO...' : 'CRIAR NÚCLEO'}
                            </button>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
}
