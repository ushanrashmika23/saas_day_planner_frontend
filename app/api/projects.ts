/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./config";

export interface Project {
    id: number;
    name: string;
    color: string;
    description?: string;
    taskCount: number;
}

export const getAllProjects = async (): Promise<Project[]> => {
    try {
        const response = await api.get<Project[]>('/projects');
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to fetch projects' };
    }
}

export interface NewProject {
    data: NewProject | PromiseLike<NewProject>;
    name: string;
    color: string;
    description?: string;
}

export const createProject = async (name: string, color: string, description?: string): Promise<NewProject> => {
    try {
        const response = await api.post<NewProject>('/projects', { name, color, description });
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to create project' };
    }
}

export interface UpdateProjectRequest {
    data: UpdateProjectRequest | PromiseLike<UpdateProjectRequest>;
    id: number;
    name: string;
    color: string;
    description?: string;
}

export const updateProject = async (id: number, name: string, color: string, description?: string): Promise<UpdateProjectRequest> => {
    try {
        const response = await api.put<UpdateProjectRequest>(`/projects/${id}`, { name, color, description });
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to update project' };
    }
}

export const deleteProject = async (id: number): Promise<void> => {
    try {
        await api.delete(`/projects/${id}`);
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to delete project' };
    }
}

export const searchProjects = async (name: string): Promise<Project[]> => {
    try {
        const response = await api.get<Project[]>(`/projects/search?name=${encodeURIComponent(name)}`);
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to search projects' };
    }
}
