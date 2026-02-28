/**
 * V8.0 Apocalypse Protocol - Navigation Types
 * Strictly typed interfaces to eliminate 'any' and enforce PII protection.
 */

export enum AppRoutes {
    HOME = '/',
    ENVAR = '/enviar',
    LAB = '/lab',
    COLISOR = '/colisor',
    MAPA = '/mapa',
    ADMIN = '/admin',
    INICIATIVAS = '/iniciativas',
    PERGUNTAS = '/perguntas',
    CRIADORES = '/criadores',
    ARQUIVO_LABDIV = '/arquivo-labdiv',
    WIKI = '/wiki',
}

export interface UserMinimalDTO {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
}

export interface SearchSuggestion {
    id: string;
    title: string;
}

export interface NavItem {
    name: string;
    href: string | AppRoutes;
    icon: string;
    isAction?: boolean;
    isDrawerTrigger?: boolean;
    isPrimary?: boolean;
}
