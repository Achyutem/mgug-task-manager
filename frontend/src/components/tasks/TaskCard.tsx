import React from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Task } from "../../types";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate }) => {
  const { user } = useAuth();
  const isAssignee = user && task.assignee_id === user.id;

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(
        `http://localhost:5000/api/tasks/${task.id}/status`,
        { status: newStatus },
        config
      );
      onUpdate();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const priorityClasses: Record<Task["priority"], string> = {
    High: "border-red-500",
    Medium: "border-yellow-500",
    Low: "border-green-500",
  };

  const priorityChipClasses: Record<Task["priority"], string> = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  };

  const statusChipClasses: Record<Task["status"], string> = {
    Completed: "bg-green-100 text-green-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Assigned: "bg-gray-200 text-gray-800",
  };

  return (
    <div
      className={`bg-white rounded-xl border ${
        priorityClasses[task.priority]
      } shadow-sm`}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {task.title}
            </h3>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              priorityChipClasses[task.priority]
            }`}
          >
            {task.priority}
          </span>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
          <div>
            <span className="font-medium text-gray-700">Due:</span>{" "}
            {format(new Date(task.due_date), "MMM dd, yyyy")}
          </div>
          <div>
            <span className="font-medium text-gray-700">Assigned to:</span>{" "}
            {task.assignee_name}
          </div>
          <div>
            <span className="font-medium text-gray-700">Assigned by:</span>{" "}
            {task.assigner_name}
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center pt-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              statusChipClasses[task.status]
            }`}
          >
            {task.status}
          </span>

          {isAssignee && (
            <select
              value={task.status}
              onChange={handleStatusChange}
              className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
