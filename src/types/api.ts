export type SocialAlert = { id: string; phrase: string; source: 'Twitter'|'Telegram'; account: string; tier: 'A'|'B'|'C'; date: string; url?: string; likes5?: number; likes10?: number; likes15?: number; };
export type FiltersQuery = { timeMin: number; timeMax: number; volMin: number; volMax: number; mcapMin: number; mcapMax: number; liqMin: number; liqMax: number; adsDEX?: boolean; globalFee?: number; whales1hMin?: number; socialMin?: number; };
export type ListingRow = { name: string; contract: string; dev?: string; site?: string; when: number; aiNote?: string; mint?: string };
