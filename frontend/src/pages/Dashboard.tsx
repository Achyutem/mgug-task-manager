import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, LogOut, Search, X, Inbox } from "lucide-react";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskListItem from "@/components/tasks/TaskListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/themeToggle";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [activeTab, setActiveTab] = useState("assigned");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchTerm,
          status: statusFilter,
          priority: priorityFilter,
        },
      };
      const res = await axios.get<Task[]>(
        "http://localhost:5000/api/tasks",
        config
      );
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchTasks]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  const handleCreateClick = () => {
    setTaskToEdit(null);
    setModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setTaskToEdit(null);
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
  };

  const filteredTasks = useMemo(() => {
    if (activeTab === "assigned") {
      return tasks.filter((t) => t.assignee_id === user?.id);
    }
    return tasks.filter((t) => t.assigner_id === user?.id);
  }, [tasks, activeTab, user]);

  const renderTaskList = (list: Task[]) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg md:col-span-2">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No Tasks Found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters, or create a new task.
          </p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            onUpdate={fetchTasks}
            onEdit={handleEditClick}
            onTagClick={handleTagClick}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen w-full bg-background">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="flex justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Welcome Back,{" "}
                <span className="text-primary-foreground bg-primary px-2 rounded-md">
                  {user?.name.toUpperCase() || "USER"}!
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button size="default" onClick={handleCreateClick}>
                <PlusCircle className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Create Task</span>
              </Button>
              <Button variant="outline" size="default" onClick={handleLogout}>
                <LogOut className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              <ModeToggle />
            </div>
          </header>

          <main>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <TabsList>
                  <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
                  <TabsTrigger value="created">Created by Me</TabsTrigger>
                </TabsList>
              </div>

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

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
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

              <TabsContent value="assigned">
                {renderTaskList(filteredTasks)}
              </TabsContent>
              <TabsContent value="created">
                {renderTaskList(filteredTasks)}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <CreateTaskModal
        open={isModalOpen}
        handleClose={handleModalClose}
        onTaskCreated={fetchTasks}
        task={taskToEdit}
      />
    </>
  );
};

export default Dashboard;
