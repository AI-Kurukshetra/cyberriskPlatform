export interface ClientRecord {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  tags: string[];
  status: "lead" | "active" | "inactive";
  created_at: string;
  updated_at?: string;
  archived_at?: string | null;
}

export interface ClientDealSummary {
  id: string;
  title: string;
  value: number;
  currency: string;
  close_date: string | null;
  probability: number;
  status: "open" | "won" | "lost";
}

export interface ClientTaskSummary {
  id: string;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "inprogress" | "done";
  due_date: string | null;
  assigned_to?: string | null;
  deal_id?: string | null;
}

export interface ClientActivityRecord {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  summary: string;
  created_at: string;
}
