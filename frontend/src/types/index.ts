/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  ticket_id: string;
  title: string;
  description: string;
  status: "Assigned" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  due_date: string;
  assigner_id: number;
  assignee_id: number;
  created_at: string;
  assigner_name: string;
  assignee_name: string;
}

export interface FilterValues {
  search: string;
  status: string;
  priority: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
}

export interface DecodedToken {
  id: number;
  exp: number;
}
