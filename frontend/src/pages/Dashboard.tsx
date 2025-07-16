import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { Task, FilterValues } from "../types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, LogOut, Inbox } from "lucide-react";
import { ModeToggle } from "@/components/themeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskListItem from "@/components/tasks/TaskListItem";
import TaskFilterBar from "@/components/tasks/TaskFilter";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("assigned");

  // State for filters is now a single object
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // fetchTasks now depends on the 'filters' state object
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: filters.search,
          status: filters.status,
          priority: filters.priority,
        },
      };
      const res = await axios.get<Task[]>("/api/tasks", config);
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Dependency is now simpler

  // Debounced effect for fetching tasks remains the same
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchTasks]);

  // Handler for when the TaskFilterBar reports a change
  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
  }, []);

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

  // handleTagClick now updates the filters state object
  const handleTagClick = (tag: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, search: tag }));
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
                  <TabsTrigger
                    value="assigned"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Assigned to Me
                  </TabsTrigger>
                  <TabsTrigger
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    value="created"
                  >
                    Created by Me
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* 👇 The new component is used here */}
              <TaskFilterBar
                onFilterChange={handleFilterChange}
                initialSearchTerm={filters.search}
              />

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
