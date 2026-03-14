export interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "inprogress" | "done";
  client_id: string | null;
  deal_id: string | null;
  assigned_to: string | null;
  clients: {
    name: string;
  } | null;
  deals: {
    title: string;
  } | null;
}

export interface TaskClientOption {
  id: string;
  name: string;
}

export interface TaskDealOption {
  id: string;
  title: string;
}

export interface TaskMemberOption {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
}
