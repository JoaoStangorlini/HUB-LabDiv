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
        <nav className="w-full -mt-10 mb-4">
            <div className="flex items-center justify-center gap-2 py-2">
                {tools.map((tool) => {
                    const active = isActive(tool.href, tool.exact);
                    return (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider
                                transition-all duration-150 whitespace-nowrap border
                                ${active
                                    ? 'bg-brand-blue/15 text-brand-blue border-brand-blue/30'
                                    : 'bg-white/5 text-gray-500 border-white/10 hover:text-gray-300 hover:bg-white/10 hover:border-white/20'
                                }
                            `}
                        >
                            <tool.icon className="w-4 h-4" />
                            {tool.name}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

