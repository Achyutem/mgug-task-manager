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
  Trash,
  User,
} from "lucide-react";
import { useTheme } from "@/context/themeProvider";

// Colors for Light Mode (your original colors)
const priorityConfigLight = {
  High: {
    icon: ArrowUpRight,
    className: "bg-red-100 text-red-700",
    borderClass: "border-l-5 border-red-500",
  },
  Medium: {
    icon: ArrowDownRight,
    className: "bg-yellow-100 text-yellow-700",
    borderClass: "border-l-5 border-yellow-500",
  },
  Low: {
    icon: Minus,
    className: "bg-green-100 text-green-700",
    borderClass: "border-l-5 border-green-500",
  },
};

// New high-contrast colors for Dark Mode
const priorityConfigDark = {
  High: {
    icon: ArrowUpRight,
    className: "bg-red-900/50 text-red-400",
    borderClass: "border-l-4 border-red-600",
  },
  Medium: {
    icon: ArrowDownRight,
    className: "bg-yellow-900/50 text-yellow-400",
    borderClass: "border-l-4 border-yellow-600",
  },
  Low: {
    icon: Minus,
    className: "bg-green-900/50 text-green-400",
    borderClass: "border-l-4 border-green-600",
  },
};

const tagColorsLight = {
  mention: "bg-blue-100 text-blue-800",
  tag: "bg-purple-100 text-purple-800",
};
const tagColorsDark = {
  mention: "bg-blue-900/50 text-blue-400",
  tag: "bg-purple-900/50 text-purple-400",
};

const ticketIdColorsLight = [
  "bg-red-100 text-red-800",
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
];
const ticketIdColorsDark = [
  "bg-red-900/50 text-red-400",
  "bg-blue-900/50 text-blue-400",
  "bg-green-900/50 text-green-400",
  "bg-yellow-900/50 text-yellow-400",
];

const RenderDescriptionWithTags = ({
  text,
  onTagClick,
  truncateLength,
}: {
  text: string;
  onTagClick: (tag: string) => void;
  truncateLength?: number;
}) => {
  const { theme } = useTheme();
  const activeTagColors = theme === "dark" ? tagColorsDark : tagColorsLight;

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
              className={cn(
                "cursor-pointer hover:font-bold mx-1",
                isMention ? activeTagColors.mention : activeTagColors.tag
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

const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  onUpdate,
  onEdit,
  onTagClick,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const activePriorityConfig =
    theme === "dark" ? priorityConfigDark : priorityConfigLight;
  const activeTicketIdColors =
    theme === "dark" ? ticketIdColorsDark : ticketIdColorsLight;
  const ticketIdColor = activeTicketIdColors[task.id % 4];

  const isAssignee = user && task.assignee_id === user.id;
  const isAssigner = user && task.assigner_id === user.id;
  const isDueDatePast =
    isPast(new Date(task.due_date)) && task.status !== "Completed";
  const PriorityIcon = activePriorityConfig[task.priority].icon;

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(
        `/api/tasks/${task.id}/status`,
        { status: newStatus },
        config
      );
      onUpdate();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/tasks/${task.id}`, config);
      onUpdate();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  return (
    <div
      className={cn(
        "bg-card rounded-md border flex flex-col p-4 transition-all duration-300 ease-in-out",
        "hover:shadow-xl hover:-translate-y-1 hover:border-primary",
        activePriorityConfig[task.priority].borderClass
      )}
    >
      <div className="flex flex-col flex-grow justify-between gap-4">
        <div className="flex items-start justify-between w-full gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <Badge
              className={cn("font-mono text-lg h-fit mt-1", ticketIdColor)}
            >
              #{task.id}
            </Badge>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-semibold text-foreground">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground">
                  <RenderDescriptionWithTags
                    text={task.description}
                    onTagClick={onTagClick}
                    truncateLength={50}
                  />
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <Badge
              className={cn(
                "gap-1.5 py-1",
                activePriorityConfig[task.priority].className
              )}
            >
              <PriorityIcon size={16} />
              {task.priority}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm w-full border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div
              className="flex items-center gap-2 text-muted-foreground"
              title={`From ${task.assigner_name} to ${task.assignee_name}`}
            >
              <User size={16} className="text-primary" />
              <span className="font-medium text-foreground">From:</span>
              <span>{task.assigner_name}</span>
              <span className="font-medium text-foreground">To:</span>
              <span>{task.assignee_name}</span>
            </div>

            <div
              title={`Due on ${format(new Date(task.due_date), "PPP")}`}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Calendar
                size={16}
                className={cn(isDueDatePast && "text-red-500")}
              />
              <span
                className={cn(isDueDatePast && "text-red-500 font-semibold")}
              >
                {format(new Date(task.due_date), "MMM dd, yy")}
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2 md:ml-auto mt-2 md:mt-0">
            {isAssignee || isAssigner ? (
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full md:w-[130px] text-xs font-semibold h-8">
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
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 hover:bg-foreground hover:text-background hover:scale-110"
                  onClick={() => onEdit(task)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 hover:scale-110"
                  onClick={handleDelete}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskListItem;
