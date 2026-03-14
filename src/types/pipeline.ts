export interface PipelineStageRecord {
  id: string;
  name: string;
  position: number;
  color?: string;
}

export interface DealRecord {
  id: string;
  title: string;
  value: number;
  currency: string;
  probability: number;
  status: "open" | "won" | "lost";
  lost_reason: string | null;
  close_date: string | null;
  client_id: string | null;
  stage_id: string | null;
  assigned_to: string | null;
  position: number;
  clients: {
    name: string;
  } | null;
}

export interface PipelineClientOption {
  id: string;
  name: string;
}

export interface PipelineMemberOption {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
}
