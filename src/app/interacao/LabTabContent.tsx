'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchUserSubmissions } from '@/app/actions/submissions';
import { PostDTO } from '@/dtos/media';
import { parseMediaUrl, getYoutubeThumbnail, getOptimizedUrl } from '@/lib/media-utils';
import { User, Grid, Medal, Star, Image as ImageIcon, PlayCircle, FileText, Heart, MessageSquare, Info, Camera, Share2, Play, GraduationCap, ShieldCheck, Linkedin, Github, Youtube, Instagram, Globe } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { RadiationBadge } from '@/components/gamification/RadiationBadge';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { RadiationTab } from '@/components/gamification/RadiationTab';
import { ArtesHobbiesTab } from '@/components/profile/ArtesHobbiesTab';
import { Profile } from '@/types';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { toast } from 'react-hot-toast';

export function LabTabContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
    const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [submissions, setSubmissions] = useState<{ post: PostDTO }[]>([]);
    const [savedPosts, setSavedPosts] = useState<PostDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState('publicacoes');
    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
    const [academicData, setAcademicData] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                setCurrentUser(session.user);

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                setCurrentUserProfile(profileData);
                setViewedProfile(profileData);

                const userSubs = await fetchUserSubmissions(session.user.id);
                setSubmissions(userSubs || []);

                // Fetch academic data
                if (profileData?.user_category === 'aluno_usp') {
                    const { fetchUserAcademicdata } = await import('@/app/actions/disciplines');
                    const academicRes = await fetchUserAcademicdata(session.user.id);
                    if (academicRes.success) {
                        setAcademicData(academicRes.data);
                    }
                }
            } catch (error) {
                console.error("Error loading lab data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Minimal Profile Header */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-6">
                <Avatar
                    src={viewedProfile?.avatar_url}
                    name={viewedProfile?.full_name || 'Usuário'}
                    size="lg"
                    xp={viewedProfile?.xp}
                    level={viewedProfile?.level}
                />
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center justify-center md:justify-start gap-3">
                        {viewedProfile?.full_name}
                        {viewedProfile && <RadiationBadge xp={viewedProfile.xp || 0} level={viewedProfile.level || 1} size="sm" />}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{viewedProfile?.bio || 'Membro da comunidade Lab-Div.'}</p>
                    <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                        {viewedProfile?.course && <span className="px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow text-[10px] font-bold rounded uppercase">{viewedProfile.course}</span>}
                        {viewedProfile?.institute && <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded uppercase">{viewedProfile.institute}</span>}
                    </div>
                </div>
                <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Editar Perfil
                </button>
            </div>

            {/* Content Tabs */}
            <div className="flex justify-center border-b border-gray-200 dark:border-gray-800 mb-6">
                {[
                    { id: 'publicacoes', label: 'PUBLICAÇÕES', icon: <Grid className="w-4 h-4" /> },
                    { id: 'radiacao', label: 'RADIAÇÃO', icon: <span className="text-sm">☢️</span> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black tracking-widest transition-all ${activeSubTab === tab.id
                            ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:text-white -mb-[1px]'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeSubTab === 'publicacoes' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {submissions.length > 0 ? (
                        submissions.map(sub => {
                            const urls = parseMediaUrl(sub.post.mediaUrl);
                            const firstMedia = urls[0] || '';
                            const thumbUrl = sub.post.mediaType === 'image' 
                                ? getOptimizedUrl(firstMedia, 400, 70, sub.post.category, 'image')
                                : getYoutubeThumbnail(firstMedia);

                            return (
                                <a key={sub.post.id} href={`/arquivo/${sub.post.id}`} className="group relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-brand-blue/30 transition-all">
                                    {thumbUrl ? (
                                        <img src={thumbUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                            <FileText className="w-8 h-8 text-white/20 mb-2" />
                                            <span className="text-[8px] font-black uppercase text-center opacity-40">{sub.post.title}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <div className="flex items-center gap-1 text-white text-xs font-bold">
                                            <Heart className="size-4 fill-current" /> {sub.post.likeCount}
                                        </div>
                                    </div>
                                </a>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center opacity-50">
                            <span className="material-symbols-outlined text-4xl mb-2">add_a_photo</span>
                            <p className="text-xs uppercase font-black tracking-widest">Nada publicado ainda.</p>
                        </div>
                    )}
                </div>
            )}

            {activeSubTab === 'radiacao' && viewedProfile && (
                <RadiationTab profile={{ id: viewedProfile.id, xp: viewedProfile.xp || 0, level: viewedProfile.level || 1 }} />
            )}

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
}
