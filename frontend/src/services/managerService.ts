import api from "@/lib/api";

const managerService = {
    createManager: async (managerData: any) => {
        try {
            const response = await api.post("/managers/create-manager", managerData);
            return response.data.data.user;
        } catch (error: Error | any) {
            console.log(error.response.data.message || "failed to create manager");
            throw new Error(error.response.data.message || "failed to create manager");
        }
},
    getAllManagers: async () => {
        try {
            const response = await api.get("/managers/my-managers");
            return response.data.data.managers;
        } catch (error: Error | any) {
            console.log(error.response.data.message || "failed to get managers");
            throw new Error(error.response.data.message || "failed to get managers");
        }
    },
    deleteManager: async (managerId: string) => {
        try {
            const response = await api.delete(`/managers/delete-manager/${managerId}`);
            return response.data.message;
        } catch (error: Error | any) {
            console.log(error.response.data.message || "failed to delete manager");
            throw new Error(error.response.data.message || "failed to delete manager");
        }
    },

    updateQuantity : async (productId: string, quantity: number) => {
        try {
            const response = await api.patch(`/managers/stock/${productId}`, { quantity });
            return response.data.data.product;
        } catch (error: Error | any) {
            console.log(error.response.data.message || "failed to update quantity");
            throw new Error(error.response.data.message || "failed to update quantity");
        }
    },

    changeProductStatus: async (productId: string, status: boolean) => {
        try {
            const response = await api.patch(`/managers/visibility/${productId}`, { status });
            return response.data.data.product;
        } catch (error: Error | any) {
            console.log(error.response.data.message || "failed to change product status");
            throw new Error(error.response.data.message || "failed to change product status");
        }
    }
}

export default managerService;