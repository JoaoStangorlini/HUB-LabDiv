export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full animate-pulse">
            <div className="max-w-3xl mb-16">
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                </div>
                <div className="h-16 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                </div>
                <div className="h-16 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-xl mb-8 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                </div>
                <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="rounded-2xl bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div className="w-24 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                            <div className="w-16 h-6 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                        <div className="aspect-square w-full bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"></div>
                        </div>
                        <div className="p-4 flex flex-col gap-3 relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"></div>
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex gap-4">
                                    <div className="w-10 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="w-10 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
                                </div>
                                <div className="w-10 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                            <div className="w-20 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="w-3/4 h-5 rounded bg-gray-200 dark:bg-gray-700 mt-1"></div>
                            <div className="w-full h-4 rounded bg-gray-100 dark:bg-gray-800"></div>
                            <div className="flex gap-2 mt-2">
                                <div className="w-16 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="w-16 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
