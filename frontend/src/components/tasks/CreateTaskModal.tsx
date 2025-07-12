import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { User, Task } from "../../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CreateTaskModalProps {
  open: boolean;
  handleClose: () => void;
  onTaskCreated: () => void;
  task?: Task | null;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  handleClose,
  onTaskCreated,
  task,
}) => {
  const isEditMode = Boolean(task);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Medium" | "High" | "Low">("Medium");
  const [dueDate, setDueDate] = useState("");
  const [assignee_id, setAssigneeId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setAssigneeId("");
  };

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem("token");
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const res = await axios.get<User[]>(
            "http://localhost:5000/api/users",
            config
          );
          setUsers(res.data);
        } catch (error) {
          console.error("Failed to fetch users", error);
        }
      };
      fetchUsers();

      if (isEditMode && task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setPriority(task.priority);
        setDueDate(format(new Date(task.due_date), "yyyy-MM-dd"));
        setAssigneeId(String(task.assignee_id));
      } else {
        resetForm();
      }
    }
  }, [task, open, isEditMode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const taskData = {
        title,
        description,
        priority,
        dueDate,
        assignee_id: Number(assignee_id),
      };

      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/tasks/${task!.id}`,
          taskData,
          config
        );
      } else {
        await axios.post("http://localhost:5000/api/tasks", taskData, config);
      }

      onTaskCreated();
      handleClose();
    } catch (error) {
      console.error(
        isEditMode ? "Failed to update task" : "Failed to create task",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* Removed hardcoded bg-slate-50 to use theme's --card color */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          {/* Removed hardcoded text-slate-800 to use theme's --foreground color */}
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of the task below."
              : "Fill out the details below to create and assign a new task."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add a description. You can use #tags and @mentions..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value: "Low" | "Medium" | "High") =>
                  setPriority(value)
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignee">Assign To</Label>
            <Select
              value={assignee_id}
              onValueChange={(value) => setAssigneeId(value)}
              required
            >
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                ? "Save Changes"
                : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
