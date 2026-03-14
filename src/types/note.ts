export interface NoteRecord {
  id: string;
  content: string;
  is_pinned: boolean;
  client_id: string | null;
  deal_id: string | null;
  created_by: string | null;
  created_at: string;
  author_name?: string | null;
  author_email?: string | null;
  author_avatar_url?: string | null;
}
