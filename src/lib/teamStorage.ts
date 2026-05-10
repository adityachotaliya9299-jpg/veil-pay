// Team member storage
export type TeamMember = {
  id: string;
  label: string;
  address: string;
  department?: string;
  addedAt: string;
};

export type StoredPayrollRun = {
  id: string;
  date: string;
  token: string;
  recipients: Array<{
    id: string;
    label: string;
    address: string;
    amount: string;
    status: string;
    txSig?: string;
  }>;
  totalAmount: number;
  status: string;
};

const TEAM_KEY = "veilpay:team";
const HISTORY_KEY = "veilpay:payroll_history";

export const teamStorage = {
  getAll: (): TeamMember[] => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(TEAM_KEY) || "[]"); }
    catch { return []; }
  },
  save: (member: Omit<TeamMember, "id" | "addedAt">): TeamMember => {
    const all = teamStorage.getAll();
    const entry: TeamMember = { ...member, id: Date.now().toString(), addedAt: new Date().toISOString() };
    localStorage.setItem(TEAM_KEY, JSON.stringify([...all, entry]));
    return entry;
  },
  remove: (id: string) => {
    const all = teamStorage.getAll().filter(m => m.id !== id);
    localStorage.setItem(TEAM_KEY, JSON.stringify(all));
  },
  update: (id: string, data: Partial<TeamMember>) => {
    const all = teamStorage.getAll().map(m => m.id === id ? { ...m, ...data } : m);
    localStorage.setItem(TEAM_KEY, JSON.stringify(all));
  },
};

export const historyStorage = {
  getAll: (): StoredPayrollRun[] => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
    catch { return []; }
  },
  add: (run: StoredPayrollRun) => {
    const all = historyStorage.getAll();
    localStorage.setItem(HISTORY_KEY, JSON.stringify([run, ...all].slice(0, 50)));
  },
  clear: () => localStorage.removeItem(HISTORY_KEY),
};