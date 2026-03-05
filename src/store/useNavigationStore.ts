'use client';

import { create } from 'zustand';

/**
 * V8.0 Apocalypse Protocol - Navigation Sharding
 * Isolated store for UI state to prevent Ghost Re-renders when UserContext or Feed updates.
 */

interface NavigationState {
    isDrawerOpen: boolean;
    isProfileMenuOpen: boolean;
    isSuggestionsVisible: boolean;
    isReportModalOpen: boolean;
    setDrawerOpen: (open: boolean) => void;
    setProfileMenuOpen: (open: boolean) => void;
    setSuggestionsVisible: (visible: boolean) => void;
    setReportModalOpen: (open: boolean) => void;
    closeAll: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    isDrawerOpen: false,
    isProfileMenuOpen: false,
    isSuggestionsVisible: false,
    isReportModalOpen: false,
    setDrawerOpen: (open) => set({ isDrawerOpen: open }),
    setProfileMenuOpen: (open) => set({ isProfileMenuOpen: open }),
    setSuggestionsVisible: (visible) => set({ isSuggestionsVisible: visible }),
    setReportModalOpen: (open) => set({ isReportModalOpen: open }),
    closeAll: () => set({
        isDrawerOpen: false,
        isProfileMenuOpen: false,
        isSuggestionsVisible: false,
        isReportModalOpen: false
    }),
}));
