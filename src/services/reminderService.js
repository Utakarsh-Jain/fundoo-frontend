import apiClient from "../utils/apiClient";

/*
 * Service Name : ReminderService
 * Description  : Handles reminder scheduling API operations.
 * Author       : Utakarsh Jain
 * Date         : 25/11/2026
 */

// Schedules a reminder for a note.
export const createReminder = async (reminderData) => {
    const response = await apiClient.post("/api/reminders", reminderData);
    return response.data;
};