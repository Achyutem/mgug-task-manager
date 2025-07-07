import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { Task } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Info, LogOut } from "lucide-react";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskCard from "../components/tasks/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

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
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const assignedTasks = tasks.filter((t) => t.assignee_id === user?.id);
  const createdTasks = tasks.filter((t) => t.assigner_id === user?.id);

  const renderTaskList = (
    list: Task[],
    emptyText: string,
    emptyDescription: string
  ) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <div className="text-center py-16 rounded-lg bg-gray-50">
          <Info className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {emptyText}
          </h3>
          <p className="mt-2 text-sm text-gray-500">{emptyDescription}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {list.map((task) => (
          <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome Back, {user?.name || "User"}!
            </h1>
            <p className="mt-1 text-lg text-gray-600">
              Here's a focused look at all your tasks.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={() => setModalOpen(true)}
              className="bg-orange-400 hover:bg-orange-500 text-black shadow-sm"
              aria-label="Create New Task"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Task
            </Button>
            <Button variant="outline" size="lg" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main>
          <Tabs defaultValue="assigned" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 gap-2 md:w-[400px]">
              <TabsTrigger
                value="assigned"
                className="data-[state=active]:bg-orange-400 hover:bg-orange-300"
              >
                Assigned to Me
              </TabsTrigger>
              <TabsTrigger
                value="created"
                className="data-[state=active]:bg-orange-400 hover:bg-orange-300"
              >
                Created by Me
              </TabsTrigger>
            </TabsList>
            <TabsContent value="assigned">
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle>Tasks Assigned to You</CardTitle>
                  <CardDescription>
                    These are the tasks that require your attention.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderTaskList(
                    assignedTasks,
                    "No Tasks Assigned",
                    "You currently have no tasks assigned to you."
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="created">
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle>Tasks You've Created</CardTitle>
                  <CardDescription>
                    These are the tasks that you have assigned to others.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderTaskList(
                    createdTasks,
                    "No Tasks Created",
                    "You haven't created any tasks yet."
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <CreateTaskModal
        open={isModalOpen}
        handleClose={() => setModalOpen(false)}
        onTaskCreated={fetchTasks}
      />
    </>
  );
};

export default Dashboard;
