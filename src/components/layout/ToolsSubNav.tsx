'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Route, UserSearch } from 'lucide-react';

const tools = [
    { name: 'Grade Horária', href: '/ferramentas', icon: Calendar, exact: true },
    { name: 'Trilhas', href: '/ferramentas/trilhas', icon: Route, exact: false },
    { name: 'Match Acadêmico', href: '/ferramentas/match', icon: UserSearch, exact: true },
];

export function ToolsSubNav() {
    const pathname = usePathname();

    const isActive = (href: string, exact: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <nav className="sticky top-14 z-40 w-full border-b border-white/5 bg-zinc-900/60 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-1 h-12 overflow-x-auto hidden-scrollbar">
                    {tools.map((tool) => {
                        const active = isActive(tool.href, tool.exact);
                        return (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className={`
                                    relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider
                                    transition-all duration-150 whitespace-nowrap
                                    ${active
                                        ? 'text-brand-blue'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }
                                `}
                            >
                                <tool.icon className="w-4 h-4" />
                                {tool.name}
                                {active && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-blue rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
