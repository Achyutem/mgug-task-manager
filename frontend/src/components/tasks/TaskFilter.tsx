import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { FilterValues } from "@/types";

interface TaskFilterBarProps {
  onFilterChange: (filters: FilterValues) => void;
  initialSearchTerm?: string;
}

const TaskFilterBar = ({
  onFilterChange,
  initialSearchTerm = "",
}: TaskFilterBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  // Effect to notify of any filter changes
  useEffect(() => {
    onFilterChange({
      search: searchTerm,
      status: statusFilter,
      priority: priorityFilter,
    });
  }, [searchTerm, statusFilter, priorityFilter, onFilterChange]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  return (
    <div className="p-4 bg-card rounded-lg border flex flex-col md:flex-row items-center gap-3">
      <div className="relative w-full flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by title or #ticket-id..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Assigned">Assigned</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filter by Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" onClick={clearFilters}>
        <X className="h-4 w-4 mr-2" />
        Clear
      </Button>
    </div>
  );
};

export default TaskFilterBar;
