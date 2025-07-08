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
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg md:col-span-2">
          <Inbox className="mx-auto h-12 w-12 text-indigo-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">
            No Tasks Found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
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
      <div className="min-h-screen w-full bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="flex justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Welcome Back, {user?.name || "User"}!
              </h1>
              <p className="mt-1 text-md sm:text-lg text-slate-600">
                Here's a focused look at all your tasks.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="default"
                onClick={handleCreateClick}
                className="bg-indigo-500 text-white hover:bg-indigo-600"
              >
                <PlusCircle className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Create Task</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={handleLogout}
                className="border-indigo-300 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <LogOut className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>

          <main>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <TabsList className="inline-grid w-auto grid-cols-2 items-center justify-center gap-2 rounded-lg bg-slate-100 p-1.5">
                  <TabsTrigger
                    value="assigned"
                    className="w-full rounded-md px-6 py-2 text-sm font-semibold transition-colors 
                      data-[state=active]:bg-indigo-500 data-[state=active]:text-white 
                      data-[state=inactive]:hover:bg-slate-200 data-[state=inactive]:hover:text-slate-800"
                  >
                    Assigned to Me
                  </TabsTrigger>
                  <TabsTrigger
                    value="created"
                    className="w-full rounded-md px-6 py-2 text-sm font-semibold transition-colors 
                      data-[state=active]:bg-indigo-500 data-[state=active]:text-white 
                      data-[state=inactive]:hover:bg-slate-200 data-[state=inactive]:hover:text-slate-800"
                  >
                    Created by Me
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4 bg-white rounded-lg shadow-sm border flex flex-col md:flex-row items-center gap-3">
                <div className="relative w-full flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 peer-focus:text-indigo-500 transition-colors" />
                  <Input
                    placeholder="Search by title, #tag, or #ticket-id..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 peer focus-visible:border-indigo-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] hover:border-indigo-500 focus:border-indigo-500 focus:ring-0 focus:ring-offset-0">
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
                  <SelectTrigger className="w-full md:w-[180px] hover:border-indigo-500 focus:border-indigo-500 focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Filter by Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="w-full md:w-auto border border-transparent hover:border-indigo-500 focus-visible:border-indigo-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
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
