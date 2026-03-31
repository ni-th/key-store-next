import apiClient from "@/lib/api-client";

export const getProfile = async () => {
    return apiClient.get("/profile");
};