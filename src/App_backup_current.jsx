import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import TimelineTable from './components/TimelineTable.jsx'
import GanttChart from './components/GanttChart.jsx'
import ApiService from './services/api.js'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hideCompleted, setHideCompleted] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true);
    try {
      console.log('[App] will fetch tasks → /api/tasks');
  
      // 取得原始資料
      const raw = await ApiService.fetchTasks();
  
      // 映射：start_date/end_date → startDate/endDate，並添加完成狀態
      const normalized = (Array.isArray(raw) ? raw : []).map((t) => ({
        ...t,
        startDate: t.startDate ?? t.start_date ?? (t.created_at ? t.created_at.slice(0, 10) : ''),
        endDate:   t.endDate   ?? t.end_date   ?? '',
        isCompleted: t.isCompleted ?? false, // 預設為未完成
      }));
  
      console.log('[App] got tasks:', `length=${normalized.length}`, normalized[0]);
  
      // 丟進 state
      setTasks(normalized);
      setError(null);
    } catch (err) {
      console.error('[App] fetch error:', err);
      setError('無法載入資料，請檢查網路連線或稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const addedTask = await ApiService.addTask(newTask)
      setTasks([...tasks, addedTask])
    } catch (err) {
      setError('新增項目失敗，請稍後再試')
      console.error('Error adding task:', err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await ApiService.deleteTask(taskId)
      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (err) {
      setError('刪除項目失敗，請稍後再試')
      console.error('Error deleting task:', err)
    }
  }

  const handleEditTask = async (taskId, updatedTask) => {
    try {
      const updated = await ApiService.updateTask(taskId, updatedTask)
      // 確保返回的任務包含 isCompleted 字段
      const normalizedUpdated = {
        ...updated,
        isCompleted: updated.isCompleted ?? updatedTask.isCompleted ?? false
      }
      setTasks(tasks.map(task => 
        task.id === taskId ? normalizedUpdated : task
      ))
    } catch (err) {
      setError('更新項目失敗，請稍後再試')
      console.error('Error updating task:', err)
    }
  }

  // 根據隱藏完成項目的狀態過濾任務
  const filteredTasks = hideCompleted ? tasks.filter(task => !task.isCompleted) : tasks

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <Button onClick={loadTasks}>重新載入</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-600">
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        {/* 主標題區域 - 極簡風格 */}
        <header className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight text-center mb-4">
            Motivibes
          </h1>
        </header>

        {/* 分頁導航 - 極簡風格 */}
        <Tabs defaultValue="timeline" className="w-full">
          <div className="flex justify-center mb-4">
            <TabsList className="grid grid-cols-2 w-auto h-12 p-1 bg-gray-100 border-0 rounded-2xl">
              <TabsTrigger 
                value="timeline" 
                className="text-sm font-medium py-2 px-5 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-xl transition-all duration-200 text-gray-600"
              >
                項目一覽
              </TabsTrigger>
              <TabsTrigger 
                value="gantt" 
                className="text-sm font-medium py-2 px-5 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-xl transition-all duration-200 text-gray-600"
              >
                甘特圖
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 時間表管理分頁 - 極簡風格 */}
          <TabsContent value="timeline" className="space-y-4">
            <Card className="shadow-none border-0 bg-white rounded-2xl">
              <CardContent className="p-4">
                <TimelineTable
                  tasks={filteredTasks}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                  hideCompletedButton={
                    <Button
                      variant={hideCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHideCompleted(!hideCompleted)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        hideCompleted 
                          ? "bg-gray-900 text-white hover:bg-gray-800" 
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {hideCompleted ? "顯示所有項目" : "隱藏完成項目"}
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 甘特圖視圖分頁 - 極簡風格 */}
          <TabsContent value="gantt" className="space-y-4">
            <Card className="shadow-none border-0 bg-white rounded-2xl">
              <CardContent className="p-4">
                <GanttChart 
                  tasks={filteredTasks} 
                  hideCompletedButton={
                    <Button
                      variant={hideCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHideCompleted(!hideCompleted)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        hideCompleted 
                          ? "bg-gray-900 text-white hover:bg-gray-800" 
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {hideCompleted ? "顯示所有項目" : "隱藏完成項目"}
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

