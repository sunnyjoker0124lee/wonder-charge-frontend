import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Plus, Edit, Trash2, Save, X, Calendar, Users, AlertTriangle, Check } from 'lucide-react'

const TimelineTable = ({ tasks, onAddTask, onDeleteTask, onEditTask, hideCompletedButton }) => {
  const [editingTask, setEditingTask] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteStageDialogOpen, setIsDeleteStageDialogOpen] = useState(false)
  const [stageToDelete, setStageToDelete] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [isDeleteMultipleDialogOpen, setIsDeleteMultipleDialogOpen] = useState(false)
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  
  const [newTask, setNewTask] = useState({
    stage: '',
    customStage: '', // 新增自訂類型名稱欄位
    startDate: '',
    endDate: '',
    milestone: '',
    description: '',
    holidayImpact: '',
    dependencies: '',
    responsible: '',
    isCompleted: false // 預設為未完成
  })

  // 獲取所有類型類別
  const stages = [...new Set(tasks.map(task => task.stage))].filter(Boolean)

  // 按類型分組並按日期排序
  const groupedTasks = tasks.reduce((groups, task) => {
    const stage = task.stage || '未分類'
    if (!groups[stage]) {
      groups[stage] = []
    }
    groups[stage].push(task)
    return groups
  }, {})

  // 對每個類型內的任務按開始日期排序
  Object.keys(groupedTasks).forEach(stage => {
    groupedTasks[stage].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  })

  const handleEdit = (task) => {
    setEditingTask({ ...task, customStage: '' })
  }

  const handleSaveEdit = () => {
    // 如果選擇了新類型且有自訂名稱，使用自訂名稱
    const finalStage = editingTask.stage === '新類型' && editingTask.customStage 
      ? editingTask.customStage 
      : editingTask.stage
    
    const taskToSave = {
      ...editingTask,
      stage: finalStage
    }
    
    onEditTask(editingTask.id, taskToSave)
    setEditingTask(null)
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
  }

  const handleDeleteStage = (stage) => {
    setStageToDelete(stage)
    setIsDeleteStageDialogOpen(true)
  }

  const confirmDeleteStage = () => {
    if (stageToDelete) {
      // 刪除該類型下的所有任務
      const tasksToDelete = tasks.filter(task => task.stage === stageToDelete)
      tasksToDelete.forEach(task => {
        onDeleteTask(task.id)
      })
    }
    setIsDeleteStageDialogOpen(false)
    setStageToDelete(null)
  }

  const cancelDeleteStage = () => {
    setIsDeleteStageDialogOpen(false)
    setStageToDelete(null)
  }

  // 處理項目點擊顯示詳情
  const handleTaskClick = (task) => {
    setSelectedTaskForDetail(task)
    setIsDetailDialogOpen(true)
  }

  // 關閉詳情對話框
  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false)
    setSelectedTaskForDetail(null)
  }

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleSelectAllInStage = (stageTasks) => {
    const stageTaskIds = stageTasks.map(task => task.id)
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      const allSelected = stageTaskIds.every(id => newSet.has(id))
      
      if (allSelected) {
        // 如果全部已選中，則取消選中
        stageTaskIds.forEach(id => newSet.delete(id))
      } else {
        // 否則全部選中
        stageTaskIds.forEach(id => newSet.add(id))
      }
      return newSet
    })
  }

  // 切換項目完成狀態
  const toggleTaskStatus = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      const updatedTask = {
        ...task,
        isCompleted: !task.isCompleted
      }
      onEditTask(taskId, updatedTask)
    }
  }

  const handleDeleteMultiple = () => {
    setIsDeleteMultipleDialogOpen(true)
  }

  const confirmDeleteMultiple = () => {
    selectedTasks.forEach(taskId => {
      onDeleteTask(taskId)
    })
    setSelectedTasks(new Set())
    setIsDeleteMultipleDialogOpen(false)
  }

  const cancelDeleteMultiple = () => {
    setIsDeleteMultipleDialogOpen(false)
  }

  const handleAddTask = () => {
    // 如果選擇了新類型且有自訂名稱，使用自訂名稱
    const finalStage = newTask.stage === '新類型' && newTask.customStage 
      ? newTask.customStage 
      : newTask.stage
    
    const taskToAdd = {
      ...newTask,
      stage: finalStage
    }
    
    onAddTask(taskToAdd)
    setNewTask({
      stage: '',
      customStage: '',
      startDate: '',
      endDate: '',
      milestone: '',
      description: '',
      holidayImpact: '',
      dependencies: '',
      responsible: '',
      isCompleted: false
    })
    setIsAddDialogOpen(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW')
  }

  // 限制項目名稱顯示字數的函數 - 固定10個中文字元
  const formatProjectName = (name) => {
    if (!name) return ' '.repeat(10)
    
    // 固定字元限制：10個中文字元
    const fixedChars = 10
    
    // 計算中文字元數量（每個中文字符算1個字元）
    const charCount = name.length
    
    if (charCount <= fixedChars) {
      // 不足10個字元，用空白補足到10個字元
      return name + ' '.repeat(fixedChars - charCount)
    } else {
      // 超過10個字元，截斷到6個字元，加上省略號，然後用空白補足到總寬度10個字元
      const truncated = name.substring(0, 6) + '...'
      return truncated + ' '.repeat(fixedChars - truncated.length)
    }
  }

  // 限制內容說明顯示字數的函數 - 固定15個中文字元
  const formatDescription = (description) => {
    if (!description) return ' '.repeat(15)
    
    // 固定字元限制：15個中文字元
    const fixedChars = 15
    
    // 計算中文字元數量（每個中文字符算1個字元）
    const charCount = description.length
    
    if (charCount <= fixedChars) {
      // 不足15個字元，用空白補足
      return description + ' '.repeat(fixedChars - charCount)
    } else {
      // 超過15個字元，截斷並加上省略號
      return description.substring(0, fixedChars) + '...'
    }
  }

  // 類型顏色映射
  const stageColors = {
    '法規/許可': 'bg-red-100 text-red-800 border-red-200',
    '贊助招商': 'bg-blue-100 text-blue-800 border-blue-200',
    '設計/製作': 'bg-green-100 text-green-800 border-green-200',
    '公關/宣傳': 'bg-orange-100 text-orange-800 border-orange-200',
    '營運/交通': 'bg-purple-100 text-purple-800 border-purple-200',
    '活動日': 'bg-pink-100 text-pink-800 border-pink-200'
  }

  return (
    <div className="space-y-6">
      {/* 統計資訊區域 - 極簡風格 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-2xl border-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">總計</span>
                    <Badge className="bg-white text-gray-900 border border-gray-200 rounded-full px-3 py-1">
                      {tasks.length} 個項目
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">類型</span>
                    <Badge className="bg-white text-gray-900 border border-gray-200 rounded-full px-3 py-1">
                      {Object.keys(groupedTasks).length} 個
                    </Badge>
                  </div>
                </div>
        
        <div className="flex items-center gap-3">
          {selectedTasks.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteMultiple}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
              <span>刪除選中 ({selectedTasks.size})</span>
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-sm">
                <Plus className="h-4 w-4" />
                <span>新增項目</span>
              </Button>
            </DialogTrigger>
          </Dialog>
          {hideCompletedButton}
        </div>
      </div>

      {/* 項目表格 - 極簡風格 */}
      {Object.entries(groupedTasks).map(([stage, stageTasks]) => (
        <div key={stage} className="space-y-3">
          {/* 類型標題 */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{stage}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteStage(stage)}
              className="text-red-600 border-red-200 hover:bg-red-50 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
            >
              刪除類型
            </Button>
          </div>
          
          {/* 表格 */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
            <Table className="w-full table-fixed border-separate border-spacing-0">
              <TableHeader>
                <TableRow className="bg-gray-50 border-0 hover:bg-gray-50">
                  <TableHead className="w-10 text-xs font-medium text-center text-gray-600 py-3">
                    <input
                      type="checkbox"
                      checked={stageTasks.every(task => selectedTasks.has(task.id))}
                      onChange={() => handleSelectAllInStage(stageTasks)}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                    />
                  </TableHead>
                  <TableHead className="w-16 text-xs font-medium text-left text-gray-600 py-3">狀態</TableHead>
                  <TableHead className="w-24 text-xs font-medium text-left text-gray-600 py-3">開始日期</TableHead>
                  <TableHead className="w-24 text-xs font-medium text-left text-gray-600 py-3">結束日期</TableHead>
                  <TableHead className="w-32 text-xs font-medium text-left text-gray-600 py-3">項目</TableHead>
                  <TableHead className="w-64 text-xs font-medium text-left text-gray-600 py-3">內容說明</TableHead>
                  <TableHead className="w-32 text-xs font-medium text-left text-gray-600 py-3">負責單位/人</TableHead>
                  <TableHead className="w-20 text-xs font-medium text-center text-gray-600 py-3">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stageTasks.map(task => (
                  <TableRow key={task.id} className="border-0 hover:bg-gray-50 transition-colors duration-150">
                    <TableCell className="text-center py-3">
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={() => handleSelectTask(task.id)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                      />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center h-full">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-16 px-2 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
                            task.isCompleted
                              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                          }`}
                          title={task.isCompleted ? "點擊標記為未完成" : "點擊標記為完成"}
                        >
                          {task.isCompleted ? '完成' : '未完成'}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {editingTask?.id === task.id ? (
                        <Input
                          type="date"
                          value={editingTask.startDate}
                          onChange={(e) => setEditingTask({...editingTask, startDate: e.target.value})}
                          className="w-full text-xs border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                        />
                      ) : (
                        <div className="flex items-center h-full">
                          <span className="text-sm text-gray-700">{formatDate(task.startDate)}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {editingTask?.id === task.id ? (
                        <Input
                          type="date"
                          value={editingTask.endDate}
                          onChange={(e) => setEditingTask({...editingTask, endDate: e.target.value})}
                          className="w-full text-xs border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                        />
                      ) : (
                        <div className="flex items-center h-full">
                          <span className="text-sm text-gray-700">{formatDate(task.endDate)}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {editingTask?.id === task.id ? (
                        <Input
                          value={editingTask.milestone}
                          onChange={(e) => setEditingTask({...editingTask, milestone: e.target.value})}
                          className="w-full text-xs border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                        />
                      ) : (
                        <div className="flex items-center h-full">
                          <div 
                            className="font-medium text-sm text-gray-900 font-mono cursor-pointer hover:text-blue-600 transition-colors duration-200"
                            onClick={() => handleTaskClick(task)}
                            title="點擊查看項目詳情"
                          >
                            {formatProjectName(task.milestone)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {editingTask?.id === task.id ? (
                        <Textarea
                          value={editingTask.description}
                          onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                          className="w-full min-h-16 text-xs border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                        />
                      ) : (
                        <div className="flex items-center h-full">
                          <div className="text-sm text-gray-700 font-mono leading-relaxed break-words max-w-full overflow-hidden">
                            {formatDescription(task.description)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {editingTask?.id === task.id ? (
                        <Input
                          value={editingTask.responsible}
                          onChange={(e) => setEditingTask({...editingTask, responsible: e.target.value})}
                          className="w-full text-xs border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                        />
                      ) : (
                        <div className="flex items-center h-full">
                          <div className="text-sm text-gray-700 break-words max-w-full overflow-hidden">{task.responsible}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <div className="flex items-center justify-center h-full">
                        {editingTask?.id === task.id ? (
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" variant="default" onClick={handleSaveEdit} className="h-8 w-8 p-0 rounded-full bg-gray-900 hover:bg-gray-800">
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8 w-8 p-0 rounded-full border-gray-200 hover:bg-gray-50">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(task)} className="h-8 w-8 p-0 rounded-full border-gray-200 hover:bg-gray-50">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onDeleteTask(task.id)} className="h-8 w-8 p-0 rounded-full border-red-200 hover:bg-red-50 text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      {/* 新增項目對話框 - 極簡風格 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-medium text-gray-900">新增時程項目</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              填寫以下資訊來新增一個新的時程項目
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">類型</label>
              <Select value={newTask.stage} onValueChange={(value) => setNewTask({...newTask, stage: value})}>
                <SelectTrigger className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 rounded-lg">
                  <SelectValue placeholder="選擇類型" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                  <SelectItem value="新類型">新類型</SelectItem>
                </SelectContent>
              </Select>
              {/* 當選擇新類型時顯示自訂名稱輸入欄位 */}
              {newTask.stage === '新類型' && (
                <Input
                  value={newTask.customStage}
                  onChange={(e) => setNewTask({...newTask, customStage: e.target.value})}
                  placeholder="輸入新類型名稱"
                  className="mt-2 border-gray-200 focus:border-gray-400 focus:ring-gray-400 rounded-lg"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">項目</label>
              <Input
                value={newTask.milestone}
                onChange={(e) => setNewTask({...newTask, milestone: e.target.value})}
                placeholder="輸入項目"
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">開始日期</label>
              <Input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">結束日期</label>
              <Input
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 rounded-lg"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">內容說明</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="輸入內容說明"
                rows={3}
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">負責單位/人</label>
              <Input
                value={newTask.responsible}
                onChange={(e) => setNewTask({...newTask, responsible: e.target.value})}
                placeholder="輸入負責單位/人"
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400 rounded-lg"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-full px-6 py-2 border-gray-200 hover:bg-gray-50">
              取消
            </Button>
            <Button onClick={handleAddTask} className="rounded-full px-6 py-2 bg-gray-900 hover:bg-gray-800">
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除類型確認對話框 - 極簡風格 */}
      <Dialog open={isDeleteStageDialogOpen} onOpenChange={setIsDeleteStageDialogOpen}>
        <DialogContent className="max-w-md border-0 rounded-2xl shadow-2xl">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-medium text-gray-900">確認刪除類型</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              確定要刪除類型 "{stageToDelete}" 嗎？這將同時刪除該類型下的所有項目，此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setIsDeleteStageDialogOpen(false)} className="rounded-full px-6 py-2 border-gray-200 hover:bg-gray-50">
              取消
            </Button>
            <Button onClick={confirmDeleteStage} className="rounded-full px-6 py-2 bg-red-600 hover:bg-red-700">
              確認刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量刪除確認對話框 - 極簡風格 */}
      <Dialog open={isDeleteMultipleDialogOpen} onOpenChange={setIsDeleteMultipleDialogOpen}>
        <DialogContent className="max-w-md border-0 rounded-2xl shadow-2xl">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-medium text-gray-900">確認批量刪除</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              確定要刪除選中的 {selectedTasks.size} 個項目嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={cancelDeleteMultiple} className="rounded-full px-6 py-2 border-gray-200 hover:bg-gray-50">
              取消
            </Button>
            <Button onClick={confirmDeleteMultiple} className="rounded-full px-6 py-2 bg-red-600 hover:bg-red-700">
              確認刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 項目詳情對話框 - 極簡風格 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl border-0 rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-medium text-gray-900">
              項目詳情
            </DialogTitle>
          </DialogHeader>
          
          {selectedTaskForDetail && (
            <div className="space-y-6">
              {/* 項目基本資訊 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">項目名稱</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedTaskForDetail.milestone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">類型</label>
                    <Badge className="mt-1 bg-gray-100 text-gray-700 border-0">
                      {selectedTaskForDetail.stage}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">狀態</label>
                    <Badge 
                      className={`mt-1 border-0 ${
                        selectedTaskForDetail.isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedTaskForDetail.isCompleted ? '完成' : '未完成'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">開始日期</label>
                    <p className="text-base text-gray-900 mt-1">
                      {new Date(selectedTaskForDetail.startDate).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">結束日期</label>
                    <p className="text-base text-gray-900 mt-1">
                      {new Date(selectedTaskForDetail.endDate).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">持續天數</label>
                    <p className="text-base text-gray-900 mt-1">
                      {Math.ceil((new Date(selectedTaskForDetail.endDate) - new Date(selectedTaskForDetail.startDate)) / (1000 * 60 * 60 * 24)) + 1} 天
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 詳細資訊 */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">內容說明</label>
                  <p className="text-base text-gray-900 mt-1 leading-relaxed">
                    {selectedTaskForDetail.description || '無內容說明'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">負責單位/人</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedTaskForDetail.responsible || '未指定'}
                  </p>
                </div>
              </div>
              
              {/* 進度條視覺化 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-600">進度時間軸</label>
                <div className="relative bg-gray-100 rounded-lg h-4 overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-lg transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, 
                        ((new Date() - new Date(selectedTaskForDetail.startDate)) / 
                        (new Date(selectedTaskForDetail.endDate) - new Date(selectedTaskForDetail.startDate))) * 100
                      ))}%`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {Math.min(100, Math.max(0, 
                        ((new Date() - new Date(selectedTaskForDetail.startDate)) / 
                        (new Date(selectedTaskForDetail.endDate) - new Date(selectedTaskForDetail.startDate))) * 100
                      )).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{new Date(selectedTaskForDetail.startDate).toLocaleDateString('zh-TW')}</span>
                  <span>{new Date(selectedTaskForDetail.endDate).toLocaleDateString('zh-TW')}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TimelineTable

