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

// Retrieves all reminders for the authenticated user.
export const getAllReminders = async () => {
    const response = await apiClient.get("/api/reminders");
    return response.data;
};

// Updates the time of an existing reminder.
export const updateReminder = async (reminderId, reminderData) => {
    const response = await apiClient.put(
        `/api/reminders/${reminderId}`,
        reminderData
    );
    return response.data;
};

// Deletes an existing reminder.
export const deleteReminder = async (reminderId) => {
    const response = await apiClient.delete(`/api/reminders/${reminderId}`);
    return response.data;
};
