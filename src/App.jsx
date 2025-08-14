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

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await ApiService.fetchTasks()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError('無法載入資料，請檢查網路連線或稍後再試')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

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
      setTasks(tasks.map(task => 
        task.id === taskId ? updated : task
      ))
    } catch (err) {
      setError('更新項目失敗，請稍後再試')
      console.error('Error updating task:', err)
    }
  }

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* 主標題區域 */}
        <header className="text-center mb-8 pb-6 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
            Wonder Charge 活動管理系統
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium">
            2026年2月28日活動時程規劃與管理 - 多人協作版
          </p>
        </header>

        {/* 分頁導航 */}
        <Tabs defaultValue="timeline" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 w-full max-w-md h-12 p-1">
              <TabsTrigger 
                value="timeline" 
                className="text-sm font-medium py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                時間表管理
              </TabsTrigger>
              <TabsTrigger 
                value="gantt" 
                className="text-sm font-medium py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                甘特圖視圖
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 時間表管理分頁 */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground mb-2">
                      活動時程表
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      管理Wonder Charge活動的所有時程項目，支援多人協作編輯
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <TimelineTable
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 甘特圖視圖分頁 */}
          <TabsContent value="gantt" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground mb-2">
                      甘特圖視圖
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      視覺化顯示活動時程，即時同步所有使用者的修改
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <GanttChart tasks={tasks} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

