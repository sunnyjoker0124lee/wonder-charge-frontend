import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Plus, Edit, Trash2, Save, X, Calendar, Users } from 'lucide-react'

const TimelineTable = ({ tasks, onAddTask, onDeleteTask, onEditTask }) => {
  const [editingTask, setEditingTask] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    stage: '',
    customStage: '', // 新增自訂階段名稱欄位
    startDate: '',
    endDate: '',
    milestone: '',
    description: '',
    holidayImpact: '',
    dependencies: '',
    responsible: '',
    risks: ''
  })

  // 獲取所有階段類別
  const stages = [...new Set(tasks.map(task => task.stage))].filter(Boolean)

  // 按階段分組並按日期排序
  const groupedTasks = tasks.reduce((groups, task) => {
    const stage = task.stage || '未分類'
    if (!groups[stage]) {
      groups[stage] = []
    }
    groups[stage].push(task)
    return groups
  }, {})

  // 對每個階段內的任務按開始日期排序
  Object.keys(groupedTasks).forEach(stage => {
    groupedTasks[stage].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  })

  const handleEdit = (task) => {
    setEditingTask({ ...task, customStage: '' })
  }

  const handleSaveEdit = () => {
    // 如果選擇了新階段且有自訂名稱，使用自訂名稱
    const finalStage = editingTask.stage === '新階段' && editingTask.customStage 
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

  const handleAddTask = () => {
    // 如果選擇了新階段且有自訂名稱，使用自訂名稱
    const finalStage = newTask.stage === '新階段' && newTask.customStage 
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
      risks: ''
    })
    setIsAddDialogOpen(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW')
  }

  // 階段顏色映射
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
      {/* 統計資訊和工具列 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">總計</span>
            <Badge variant="secondary" className="font-semibold">
              {tasks.length} 個項目
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">階段</span>
            <Badge variant="outline" className="font-semibold">
              {Object.keys(groupedTasks).length} 個
            </Badge>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>新增項目</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">新增時程項目</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                填寫以下資訊來新增一個新的時程項目
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">階段</label>
                <Select value={newTask.stage} onValueChange={(value) => setNewTask({...newTask, stage: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇階段" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                    <SelectItem value="新階段">新階段</SelectItem>
                  </SelectContent>
                </Select>
                {/* 當選擇新階段時顯示自訂名稱輸入欄位 */}
                {newTask.stage === '新階段' && (
                  <Input
                    value={newTask.customStage}
                    onChange={(e) => setNewTask({...newTask, customStage: e.target.value})}
                    placeholder="輸入新階段名稱"
                    className="mt-2"
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">里程碑</label>
                <Input
                  value={newTask.milestone}
                  onChange={(e) => setNewTask({...newTask, milestone: e.target.value})}
                  placeholder="輸入里程碑"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">開始日期</label>
                <Input
                  type="date"
                  value={newTask.startDate}
                  onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">結束日期</label>
                <Input
                  type="date"
                  value={newTask.endDate}
                  onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground">內容說明</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="輸入內容說明"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">假期影響</label>
                <Input
                  value={newTask.holidayImpact}
                  onChange={(e) => setNewTask({...newTask, holidayImpact: e.target.value})}
                  placeholder="輸入假期影響"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">相依關係</label>
                <Input
                  value={newTask.dependencies}
                  onChange={(e) => setNewTask({...newTask, dependencies: e.target.value})}
                  placeholder="輸入相依關係"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">負責單位/人</label>
                <Input
                  value={newTask.responsible}
                  onChange={(e) => setNewTask({...newTask, responsible: e.target.value})}
                  placeholder="輸入負責單位/人"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">風險/備註</label>
                <Input
                  value={newTask.risks}
                  onChange={(e) => setNewTask({...newTask, risks: e.target.value})}
                  placeholder="輸入風險/備註"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddTask}>
                新增
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 階段分組表格 */}
      <div className="space-y-8">
        {Object.entries(groupedTasks).map(([stage, stageTasks]) => (
          <div key={stage} className="space-y-4">
            {/* 階段標題 */}
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <Badge 
                variant="outline" 
                className={`px-3 py-1 text-sm font-medium ${stageColors[stage] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
              >
                {stage}
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">
                {stageTasks.length} 個項目
              </span>
            </div>
            
            {/* 表格 */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-32 text-xs font-medium">階段</TableHead>
                    <TableHead className="w-28 text-xs font-medium">開始日期</TableHead>
                    <TableHead className="w-28 text-xs font-medium">結束日期</TableHead>
                    <TableHead className="w-48 text-xs font-medium">里程碑</TableHead>
                    <TableHead className="min-w-64 text-xs font-medium">內容說明</TableHead>
                    <TableHead className="w-32 text-xs font-medium">假期影響</TableHead>
                    <TableHead className="w-32 text-xs font-medium">相依關係</TableHead>
                    <TableHead className="w-32 text-xs font-medium">負責單位/人</TableHead>
                    <TableHead className="w-32 text-xs font-medium">風險/備註</TableHead>
                    <TableHead className="w-20 text-xs font-medium text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stageTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-xs">
                        {editingTask?.id === task.id ? (
                          <div className="space-y-2">
                            <Select value={editingTask.stage} onValueChange={(value) => setEditingTask({...editingTask, stage: value})}>
                              <SelectTrigger className="w-full text-xs">
                                <SelectValue placeholder="選擇階段" />
                              </SelectTrigger>
                              <SelectContent>
                                {stages.map(stage => (
                                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                ))}
                                <SelectItem value="新階段">新階段</SelectItem>
                              </SelectContent>
                            </Select>
                            {/* 當選擇新階段時顯示自訂名稱輸入欄位 */}
                            {editingTask.stage === '新階段' && (
                              <Input
                                value={editingTask.customStage}
                                onChange={(e) => setEditingTask({...editingTask, customStage: e.target.value})}
                                placeholder="輸入新階段名稱"
                                className="text-xs"
                              />
                            )}
                          </div>
                        ) : (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${stageColors[task.stage] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                          >
                            {task.stage}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {editingTask?.id === task.id ? (
                          <Input
                            type="date"
                            value={editingTask.startDate}
                            onChange={(e) => setEditingTask({...editingTask, startDate: e.target.value})}
                            className="w-full text-xs"
                          />
                        ) : (
                          <span className="text-muted-foreground">{formatDate(task.startDate)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {editingTask?.id === task.id ? (
                          <Input
                            type="date"
                            value={editingTask.endDate}
                            onChange={(e) => setEditingTask({...editingTask, endDate: e.target.value})}
                            className="w-full text-xs"
                          />
                        ) : (
                          <span className="text-muted-foreground">{formatDate(task.endDate)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingTask?.id === task.id ? (
                          <Input
                            value={editingTask.milestone}
                            onChange={(e) => setEditingTask({...editingTask, milestone: e.target.value})}
                            className="w-full text-xs"
                          />
                        ) : (
                          <div className="font-medium text-sm text-foreground">{task.milestone}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingTask?.id === task.id ? (
                          <Textarea
                            value={editingTask.description}
                            onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                            className="w-full min-h-16 text-xs"
                          />
                        ) : (
                          <div className="text-xs text-muted-foreground leading-relaxed">{task.description}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {editingTask?.id === task.id ? (
                          <Input
                            value={editingTask.holidayImpact}
                            onChange={(e) => setEditingTask({...editingTask, holidayImpact: e.target.value})}
                            className="w-full text-xs"
                          />
                        ) : (
                          <div className="text-muted-foreground">{task.holidayImpact}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {editingTask?.id === task.id ? (
                          <Input
                            value={editingTask.dependencies}
                            onChange={(e) => setEditingTask({...editingTask, dependencies: e.target.value})}
                            className="w-full text-xs"
                          />
                        ) : (
                          <div className="text-muted-foreground">{task.dependencies}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {editingTask?.id === task.id ? (
                          <Input
                            value={editingTask.responsible}
                            onChange={(e) => setEditingTask({...editingTask, responsible: e.target.value})}
                            className="w-full text-xs"
                          />
                        ) : (
                          <div className="text-muted-foreground">{task.responsible}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {editingTask?.id === task.id ? (
                          <Input
                            value={editingTask.risks}
                            onChange={(e) => setEditingTask({...editingTask, risks: e.target.value})}
                            className="w-full text-xs"
                          />
                        ) : (
                          <div className="text-muted-foreground">{task.risks}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingTask?.id === task.id ? (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" variant="default" onClick={handleSaveEdit} className="h-7 w-7 p-0">
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 w-7 p-0">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(task)} className="h-7 w-7 p-0 hover:bg-blue-50">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onDeleteTask(task.id)} className="h-7 w-7 p-0 hover:bg-red-50 text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimelineTable

