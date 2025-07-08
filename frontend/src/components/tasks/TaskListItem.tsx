import React from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { Task } from "../../types";
import { format, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Edit,
  Minus,
  User,
} from "lucide-react";

const RenderDescriptionWithTags = ({
  text,
  onTagClick,
  truncateLength,
}: {
  text: string;
  onTagClick: (tag: string) => void;
  truncateLength?: number;
}) => {
  const truncatedText =
    truncateLength && text.length > truncateLength
      ? text.substring(0, truncateLength) + "..."
      : text;

  const tagRegex = /(#[\w-]+|@[\w-]+)/g;
  const parts = truncatedText.split(tagRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (tagRegex.test(part)) {
          const isMention = part.startsWith("@");
          return (
            <Badge
              key={index}
              variant="secondary"
              className={cn(
                "cursor-pointer hover:font-bold mx-1",
                isMention
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(part);
              }}
            >
              {part}
            </Badge>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};

interface TaskListItemProps {
  task: Task;
  onUpdate: () => void;
  onEdit: (task: Task) => void;
  onTagClick: (tag: string) => void;
}

const priorityConfig = {
  High: {
    icon: ArrowUpRight,
    className: "bg-red-100 text-red-700",
    borderClass: "border-l-4 border-red-500",
  },
  Medium: {
    icon: ArrowDownRight,
    className: "bg-yellow-100 text-yellow-700",
    borderClass: "border-l-4 border-yellow-500",
  },
  Low: {
    icon: Minus,
    className: "bg-green-100 text-green-700",
    borderClass: "border-l-4 border-green-500",
  },
};

const getBadgeColor = (ticketId: number) => {
  const colors = [
    "bg-red-100 text-red-800",
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-yellow-100 text-yellow-800",
  ];
  return colors[ticketId % 4];
};

const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  onUpdate,
  onEdit,
  onTagClick,
}) => {
  const { user } = useAuth();
  const isAssignee = user && task.assignee_id === user.id;
  const isAssigner = user && task.assigner_id === user.id;
  const isDueDatePast =
    isPast(new Date(task.due_date)) && task.status !== "Completed";
  const PriorityIcon = priorityConfig[task.priority].icon;

  const handleStatusChange = async (newStatus: string) => {
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

  return (
    <div
      className={cn(
        "bg-white rounded-md shadow-sm flex flex-col p-4 transition-all duration-300 ease-in-out",
        "hover:shadow-xl hover:-translate-y-1",
        "focus-within:ring-1 focus-within:ring-offset-2 focus-within:ring-indigo-500",
        priorityConfig[task.priority].borderClass
      )}
    >
      <div className="flex flex-col flex-grow justify-between gap-4">
        {/* --- Top Section --- */}
        <div className="flex items-start justify-between w-full gap-4">
          {/* Left side container that can shrink */}
          <div className="flex min-w-0 items-start gap-4">
            <Badge
              className={cn(
                "font-mono text-lg h-fit mt-1",
                getBadgeColor(task.id)
              )}
            >
              #{task.id}
            </Badge>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-semibold text-slate-800">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-slate-500">
                  <RenderDescriptionWithTags
                    text={task.description}
                    onTagClick={onTagClick}
                    truncateLength={50}
                  />
                </p>
              )}
            </div>
          </div>
          {/* Right side container that will not shrink */}
          <div className="flex-shrink-0">
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 py-1",
                priorityConfig[task.priority].className
              )}
            >
              <PriorityIcon size={16} />
              {task.priority}
            </Badge>
          </div>
        </div>

        {/* --- Bottom Section --- */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm w-full border-t pt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div
              className="flex items-center gap-2 text-slate-600"
              title={`From ${task.assigner_name} to ${task.assignee_name}`}
            >
              <User size={16} className="text-indigo-500" />
              <span className="font-medium">From:</span>
              <span>{task.assigner_name}</span>
              <span className="font-medium">To:</span>
              <span>{task.assignee_name}</span>
            </div>

            <div
              title={`Due on ${format(new Date(task.due_date), "PPP")}`}
              className="flex items-center gap-2 text-slate-600"
            >
              <Calendar
                size={16}
                className={cn(
                  isDueDatePast ? "text-red-500" : "text-slate-500"
                )}
              />
              <span
                className={cn(isDueDatePast && "text-red-500 font-semibold")}
              >
                {format(new Date(task.due_date), "MMM dd, yy")}
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2 md:ml-auto mt-2 md:mt-0">
            {isAssignee ? (
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full md:w-[130px] text-xs h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="text-xs font-semibold py-1">
                {task.status}
              </Badge>
            )}
            {isAssigner && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => onEdit(task)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskListItem;
