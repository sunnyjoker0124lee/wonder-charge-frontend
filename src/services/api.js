// src/services/api.js
const API_BASE_URL = '/api'; // 交給 Vite 代理

class ApiService {
  async fetchTasks() {
    const res = await fetch(`${API_BASE_URL}/tasks`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async addTask(task) {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async updateTask(taskId, updatedTask) {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async deleteTask(taskId) {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export default new ApiService();