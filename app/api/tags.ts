/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./config";

export interface Tag {
    id: number;
    name: string;
    color: string;
    taskCount: number;
}

export const getAllTags = async (): Promise<Tag[]> => {
    try {
        const response = await api.get<Tag[]>('/tags');
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to fetch tags' };
    }
}

export interface newTag {
    data: newTag | PromiseLike<newTag>;
    name: string;
    color: string;
}
export const createTag = async (name: string, color: string): Promise<newTag> => {
    try {
        const response = await api.post<newTag>('/tags', { name, color });
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to create tag' };
    }
}

export interface UpdateTagRequest {
    data: UpdateTagRequest | PromiseLike<UpdateTagRequest>;
    id: number;
    name: string;
    color: string;
}

export const updateTag = async (id: number, name: string, color: string): Promise<UpdateTagRequest> => {
    try {
        const response = await api.put<UpdateTagRequest>(`/tags/${id}`, { name, color });
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to update tag' };
    }
}

export const deleteTag = async (id: number): Promise<void> => {
    try {
        await api.delete(`/tags/${id}`);
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to delete tag' };
    }
}

export const searchTags = async (name: string): Promise<Tag[]> => {
    try {
        const response = await api.get<Tag[]>(`/tags/search?name=${encodeURIComponent(name)}`);
        return response.data.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to search tags' };
    }
}