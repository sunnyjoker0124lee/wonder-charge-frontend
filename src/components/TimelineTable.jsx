import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const API_BASE_URL = 'https://wonder-charge-backend.onrender.com/api'

const STAGE_COLORS = {
  '法規/許可': 'bg-red-100 text-red-800',
  '贊助招商': 'bg-blue-100 text-blue-800',
  '設計/製作': 'bg-yellow-100 text-yellow-800',
  '公關/宣傳': 'bg-purple-100 text-purple-800',
  '營運/交通': 'bg-green-100 text-green-800',
  '活動日': 'bg-pink-100 text-pink-800'
}

const PREDEFINED_STAGES = [
  '法規/許可',
  '贊助招商', 
  '設計/製作',
  '公關/宣傳',
  '營運/交通',
  '活動日'
]

export default function TimelineTable() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [newTask, setNewTask] = useState({
    stage: '',
    customStage: '',
    milestone: '',
    startDate: '',
    endDate: '',
    description: '',
    responsible: '',
    risks: '',
    completed: false
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('獲取任務失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    // 驗證必填欄位
    if (!newTask.stage) {
      alert('請選擇類型')
      return
    }
    
    if (newTask.stage === '新類型' && !newTask.customStage.trim()) {
      alert('請輸入自訂類型名稱')
      return
    }
    
    if (!newTask.milestone.trim()) {
      alert('請輸入項目名稱')
      return
    }
    
    if (!newTask.startDate) {
      alert('請選擇開始日期')
      return
    }
    
    if (!newTask.endDate) {
      alert('請選擇結束日期')
      return
    }

    try {
      const taskData = {
        ...newTask,
        stage: newTask.stage === '新類型' ? newTask.customStage : newTask.stage
      }
      
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        await fetchTasks()
        setShowAddDialog(false)
        setNewTask({
          stage: '',
          customStage: '',
          milestone: '',
          startDate: '',
          endDate: '',
          description: '',
          responsible: '',
          risks: '',
          completed: false
        })
      } else {
        alert('新增項目失敗，請稍後再試')
      }
    } catch (error) {
      console.error('新增任務失敗:', error)
      alert('新增項目失敗，請稍後再試')
    }
  }

  const handleEditTask = async (taskId) => {
    if (!editingTask.milestone.trim()) {
      alert('請輸入項目名稱')
      return
    }
    
    if (!editingTask.startDate) {
      alert('請選擇開始日期')
      return
    }
    
    if (!editingTask.endDate) {
      alert('請選擇結束日期')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTask),
      })

      if (response.ok) {
        await fetchTasks()
        setEditingTask(null)
      } else {
        alert('更新項目失敗，請稍後再試')
      }
    } catch (error) {
      console.error('更新任務失敗:', error)
      alert('更新項目失敗，請稍後再試')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('確定要刪除這個項目嗎？')) {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchTasks()
        } else {
          alert('刪除項目失敗，請稍後再試')
        }
      } catch (error) {
        console.error('刪除任務失敗:', error)
        alert('刪除項目失敗，請稍後再試')
      }
    }
  }

  const handleToggleComplete = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle-complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        await fetchTasks()
      } else {
        alert('更新完成狀態失敗，請稍後再試')
      }
    } catch (error) {
      console.error('更新完成狀態失敗:', error)
      alert('更新完成狀態失敗，請稍後再試')
    }
  }

  const handleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleSelectAllInStage = (stageTasks) => {
    const stageTaskIds = stageTasks.map(task => task.id)
    const newSelected = new Set(selectedTasks)
    const allSelected = stageTaskIds.every(id => newSelected.has(id))
    
    if (allSelected) {
      stageTaskIds.forEach(id => newSelected.delete(id))
    } else {
      stageTaskIds.forEach(id => newSelected.add(id))
    }
    setSelectedTasks(newSelected)
  }

  const handleBatchDelete = async () => {
    if (selectedTasks.size === 0) {
      alert('請先選擇要刪除的項目')
      return
    }

    if (confirm(`確定要刪除選中的 ${selectedTasks.size} 個項目嗎？此操作無法復原。`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/batch-delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskIds: Array.from(selectedTasks) }),
        })

        if (response.ok) {
          setSelectedTasks(new Set())
          await fetchTasks()
          alert('批量刪除成功')
        } else {
          alert('批量刪除失敗，請稍後再試')
        }
      } catch (error) {
        console.error('批量刪除失敗:', error)
        alert('批量刪除失敗，請稍後再試')
      }
    }
  }

  const handleDeleteStage = async (stage) => {
    if (confirm(`確定要刪除「${stage}」類型及其所有項目嗎？此操作無法復原。`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/stage/${encodeURIComponent(stage)}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchTasks()
        } else {
          alert('刪除類型失敗，請稍後再試')
        }
      } catch (error) {
        console.error('刪除類型失敗:', error)
        alert('刪除類型失敗，請稍後再試')
      }
    }
  }

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.stage]) {
      acc[task.stage] = []
    }
    acc[task.stage].push(task)
    return acc
  }, {})

  const totalTasks = tasks.length
  const totalStages = Object.keys(groupedTasks).length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">載入中...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">各項工作時程表清單</h2>
          <div className="flex gap-2">
            {selectedTasks.size > 0 && (
              <Button 
                onClick={handleBatchDelete}
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                刪除選中項目 ({selectedTasks.size})
              </Button>
            )}
            <Button onClick={() => setShowAddDialog(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              新增項目
            </Button>
          </div>
        </div>
        
        <div className="flex gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            總計 {totalTasks} 個項目
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            類型 {totalStages} 個
          </div>
        </div>
      </div>

      <div className="p-6">
        {Object.entries(groupedTasks).map(([stage, stageTasks]) => (
          <div key={stage} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={stageTasks.every(task => selectedTasks.has(task.id))}
                  onChange={() => handleSelectAllInStage(stageTasks)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STAGE_COLORS[stage] || 'bg-gray-100 text-gray-800'}`}>
                  {stage}
                </span>
                <span className="text-sm text-gray-500">{stageTasks.length} 個項目</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDeleteStage(stage)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  刪除類型
                </Button>
                
                {/* 批量刪除按鈕 - 只有當該階段有選中項目時才顯示 */}
                {(() => {
                  const stageSelectedCount = stageTasks.filter(task => selectedTasks.has(task.id)).length
                  if (stageSelectedCount > 0) {
                    return (
                      <Button
                        onClick={() => {
                          const stageTaskIds = stageTasks.filter(task => selectedTasks.has(task.id)).map(task => task.id)
                          if (confirm(`確定要刪除選中的 ${stageSelectedCount} 個項目嗎？此操作無法復原。`)) {
                            handleBatchDelete()
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        刪除所選項目 ({stageSelectedCount})
                      </Button>
                    )
                  }
                  return null
                })()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-700">選擇</th>
                    <th className="text-left p-3 font-medium text-gray-700">完成</th>
                    <th className="text-left p-3 font-medium text-gray-700">開始日期</th>
                    <th className="text-left p-3 font-medium text-gray-700">結束日期</th>
                    <th className="text-left p-3 font-medium text-gray-700">項目名稱</th>
                    <th className="text-left p-3 font-medium text-gray-700">內容說明</th>
                    <th className="text-left p-3 font-medium text-gray-700">負責單位/人</th>
                    <th className="text-left p-3 font-medium text-gray-700">備註</th>
                    <th className="text-left p-3 font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {stageTasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(task.id)}
                          onChange={() => handleSelectTask(task.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={() => handleToggleComplete(task.id)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                        />
                      </td>
                      <td className="p-3">
                        {editingTask?.id === task.id ? (
                          <input
                            type="date"
                            value={editingTask.startDate}
                            onChange={(e) => setEditingTask({...editingTask, startDate: e.target.value})}
                            className="w-full p-2 border rounded"
                          />
                        ) : (
                          new Date(task.startDate).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }).replace(/\//g, '/')
                        )}
                      </td>
                      <td className="p-3">
                        {editingTask?.id === task.id ? (
                          <input
                            type="date"
                            value={editingTask.endDate}
                            onChange={(e) => setEditingTask({...editingTask, endDate: e.target.value})}
                            className="w-full p-2 border rounded"
                          />
                        ) : (
                          new Date(task.endDate).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }).replace(/\//g, '/')
                        )}
                      </td>
                      <td className="p-3 font-medium">
                        {editingTask?.id === task.id ? (
                          <input
                            type="text"
                            value={editingTask.milestone}
                            onChange={(e) => setEditingTask({...editingTask, milestone: e.target.value})}
                            className="w-full p-2 border rounded"
                            placeholder="輸入項目名稱"
                          />
                        ) : (
                          task.milestone
                        )}
                      </td>
                      <td className="p-3 max-w-xs">
                        {editingTask?.id === task.id ? (
                          <textarea
                            value={editingTask.description}
                            onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                            className="w-full p-2 border rounded"
                            rows="2"
                          />
                        ) : (
                          <div className="truncate" title={task.description}>
                            {task.description || '—'}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {editingTask?.id === task.id ? (
                          <input
                            type="text"
                            value={editingTask.responsible}
                            onChange={(e) => setEditingTask({...editingTask, responsible: e.target.value})}
                            className="w-full p-2 border rounded"
                          />
                        ) : (
                          task.responsible || '—'
                        )}
                      </td>
                      <td className="p-3">
                        {editingTask?.id === task.id ? (
                          <input
                            type="text"
                            value={editingTask.risks}
                            onChange={(e) => setEditingTask({...editingTask, risks: e.target.value})}
                            className="w-full p-2 border rounded"
                          />
                        ) : (
                          task.risks || '—'
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {editingTask?.id === task.id ? (
                            <>
                              <Button
                                onClick={() => handleEditTask(task.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                保存
                              </Button>
                              <Button
                                onClick={() => setEditingTask(null)}
                                variant="outline"
                                size="sm"
                              >
                                取消
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => setEditingTask(task)}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteTask(task.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* 新增項目對話框 */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">新增時程項目</h3>
              <Button
                onClick={() => setShowAddDialog(false)}
                variant="outline"
                size="sm"
              >
                ✕
              </Button>
            </div>
            
            <p className="text-gray-600 mb-6">填寫以下資訊來新增一個新的時程項目</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">類型</label>
                <select
                  value={newTask.stage}
                  onChange={(e) => setNewTask({...newTask, stage: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">選擇類型</option>
                  {PREDEFINED_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                  <option value="新類型">新類型</option>
                </select>
                
                {newTask.stage === '新類型' && (
                  <input
                    type="text"
                    value={newTask.customStage}
                    onChange={(e) => setNewTask({...newTask, customStage: e.target.value})}
                    placeholder="輸入新類型名稱"
                    className="w-full p-3 border rounded-lg mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">項目名稱</label>
                <input
                  type="text"
                  value={newTask.milestone}
                  onChange={(e) => setNewTask({...newTask, milestone: e.target.value})}
                  placeholder="輸入項目名稱"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">開始日期</label>
                <input
                  type="date"
                  value={newTask.startDate}
                  onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">結束日期</label>
                <input
                  type="date"
                  value={newTask.endDate}
                  onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">內容說明</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="輸入內容說明"
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">負責單位/人</label>
                <input
                  type="text"
                  value={newTask.responsible}
                  onChange={(e) => setNewTask({...newTask, responsible: e.target.value})}
                  placeholder="輸入負責單位/人"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">備註</label>
                <input
                  type="text"
                  value={newTask.risks}
                  onChange={(e) => setNewTask({...newTask, risks: e.target.value})}
                  placeholder="輸入備註"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => setShowAddDialog(false)}
                variant="outline"
              >
                取消
              </Button>
              <Button
                onClick={handleAddTask}
                className="bg-green-600 hover:bg-green-700"
              >
                新增
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

