export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

export interface PlaceholderMetric {
  label: string;
  value: string;
}

export type WorkspaceRole = "owner" | "member" | "viewer";
