/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./config";

export type TaskPriority = 'low' | 'medium' | 'high';

export interface UserData {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin: string;
    id: string;
}

export interface ProjectData {
    name: string;
    color: string;
    userId: string;
    taskCount: number;
    createdAt: string;
    updatedAt: string;
    id: string;
}

export interface TagData {
    name: string;
    userId: string;
    color: string;
    taskCount: number;
    createdAt: string;
    updatedAt: string;
    id: string;
}

export interface CreateTaskPayload {
    title: string;
    description: string;
    completed: boolean;
    priority: TaskPriority;
    dueDate: string;
    dueTime: string;
    tags: string[];
    projectId?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: TaskPriority;
    tags: TagData[];
    dueDate: string;
    dueTime: string;
    recurring: string | null;
    projectId: ProjectData | null;
    userId: UserData;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export const getAllTasks = async (): Promise<Task[]> => {
    try {
        const response = await api.get<ApiResponse<Task[]>>('/tasks/');
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to fetch tasks' };
    }
}

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
    try {
        const response = await api.post<ApiResponse<Task>>('/tasks/', payload);
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to create task' };
    }
}

export const toggleTaskCompletion = async (taskId: string): Promise<Task> => {
    try {
        const response = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}/toggle`);
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to toggle task' };
    }
}
export const deleteTask = async (taskId: string): Promise<void> => {
    try {
        await api.delete(`/tasks/${taskId}`);
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to delete task' };
    }
}