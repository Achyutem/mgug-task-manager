export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
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
