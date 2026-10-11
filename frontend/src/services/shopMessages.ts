import api from "@/lib/api";

const shopMessagesService = {
    getShopMessages: async (shopId: string) => {
        try {
            const response = await api.get(`/messages/get-messages/${shopId}`);
            return response.data.data.messages;
        } catch (error: Error | any) {
            console.log(error.response.data.message || "failed to get shop messages");
            throw new Error(error.response.data.message || "failed to get shop messages");
        }
    },

    sendMessage: async (messageData: any) => {
        try {
            const response = await api.post(`/messages/create-message`, messageData);
            return response.data.data.message;
        } catch (error: Error | any) {
            console.log(error.response.data.message || "failed to send message");
            throw new Error(error.response.data.message || "failed to send message");
        }
    },

    markAsRead: async (messageId: string) => {
        try {
            const response = await api.patch(`/messages/mark-message-as-read/${messageId}`);
            return response.data.data.message;
        } catch (error: Error | any) {
            console.log(error.response.data.message || "failed to mark message as read");
            throw new Error(error.response.data.message || "failed to mark message as read");
        }
    },

    deleteMessage: async (messageId: string) => {
        try {
            const response = await api.delete(`/messages/delete-message/${messageId}`);
            return response.data.data.message;
        } catch (error: Error | any) {
            console.log(error.response.data.message || "failed to delete message");
            throw new Error(error.response.data.message || "failed to delete message");
        }
    },
}

export default shopMessagesService;



