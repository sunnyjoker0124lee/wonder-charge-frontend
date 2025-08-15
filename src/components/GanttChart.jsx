import { useState, useEffect, useRef, useCallback } from 'react'
import { Calendar, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const API_BASE_URL = 'https://wonder-charge-backend.onrender.com/api'

const STAGE_COLORS = {
  '法規/許可': '#ef4444',
  '贊助招商': '#3b82f6',
  '設計/製作': '#eab308',
  '公關/宣傳': '#a855f7',
  '營運/交通': '#22c55e',
  '活動日': '#ec4899'
}

export default function GanttChart() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false)
  const ganttContentRef = useRef(null)
  const [leftColumnWidth, setLeftColumnWidth] = useState(192) // 12rem = 192px
  
  // 可拖動日期光棒相關狀態
  const [currentViewDate, setCurrentViewDate] = useState(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartDate, setDragStartDate] = useState(new Date())

  useEffect(() => {
    fetchTasks()
    
    // 監聽視窗大小變化，動態調整左側欄寬度
    const handleResize = () => {
      if (ganttContentRef.current) {
        const leftColumn = ganttContentRef.current.querySelector('.w-48')
        if (leftColumn) {
          setLeftColumnWidth(leftColumn.offsetWidth)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    // 初始化時也執行一次
    setTimeout(handleResize, 100)
    
    return () => window.removeEventListener('resize', handleResize)
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

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const closeDetailDialog = () => {
    setSelectedTask(null)
  }

  // 拖動處理函數
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragStartDate(new Date(currentViewDate))
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !ganttContentRef.current) return
    
    // 使用組件渲染時的時間範圍，確保一致性
    const ganttRect = ganttContentRef.current.getBoundingClientRect()
    const ganttWidth = ganttRect.width - leftColumnWidth
    const deltaX = e.clientX - dragStartX
    const deltaPercent = (deltaX / ganttWidth) * 100
    const deltaDays = (deltaPercent / 100) * totalDays
    
    const newDate = new Date(dragStartDate)
    newDate.setDate(dragStartDate.getDate() + Math.round(deltaDays))
    
    // 限制在甘特圖範圍內
    if (newDate >= startDate && newDate <= endDate) {
      setCurrentViewDate(newDate)
    }
  }, [isDragging, dragStartX, dragStartDate, leftColumnWidth, totalDays, startDate, endDate])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 添加全局鼠標事件監聽
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // 計算甘特圖的時間範圍
  const getDateRange = useCallback(() => {
    if (tasks.length === 0) return { start: new Date(), end: new Date() }
    
    const dates = tasks.flatMap(task => [
      new Date(task.startDate),
      new Date(task.endDate)
    ])
    
    const start = new Date(Math.min(...dates))
    const end = new Date(Math.max(...dates))
    
    // 添加一些緩衝時間
    start.setDate(start.getDate() - 7)
    end.setDate(end.getDate() + 7)
    
    return { start, end }
  }, [tasks])

  const { start: startDate, end: endDate } = getDateRange()
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

  // 計算任務在甘特圖中的位置和寬度
  const getTaskPosition = (task) => {
    const taskStart = new Date(task.startDate)
    const taskEnd = new Date(task.endDate)
    
    const startOffset = Math.ceil((taskStart - startDate) / (1000 * 60 * 60 * 24))
    const duration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1
    
    const left = (startOffset / totalDays) * 100
    const width = (duration / totalDays) * 100
    
    return { left: `${left}%`, width: `${width}%` }
  }

  // 篩選任務
  const filteredTasks = showIncompleteOnly 
    ? tasks.filter(task => !task.completed)
    : tasks

  // 按類型分組任務
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    if (!acc[task.stage]) {
      acc[task.stage] = []
    }
    acc[task.stage].push(task)
    return acc
  }, {})

  const totalTasks = filteredTasks.length
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
          <h2 className="text-2xl font-bold text-gray-800">甘特圖視圖</h2>
          <Button
            onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
            variant={showIncompleteOnly ? "default" : "outline"}
            className={showIncompleteOnly ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {showIncompleteOnly ? "顯示所有項目" : "只顯示未完成項目"}
          </Button>
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
        {/* 圖例 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">類型圖例</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(STAGE_COLORS).map(([stage, color]) => (
              <div key={stage} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700">{stage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 甘特圖 */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* 時間軸標題 */}
            <div className="flex border-b bg-gray-50">
              <div className="w-48 font-medium text-gray-700 p-2">項目名稱</div>
              <div className="flex-1 font-medium text-gray-700">
                <div className="text-center p-2 border-b">時間軸</div>
                <div className="flex">
                  {Array.from({ length: Math.ceil(totalDays / 7) }, (_, weekIndex) => {
                    const weekStart = new Date(startDate)
                    weekStart.setDate(startDate.getDate() + weekIndex * 7)
                    return (
                      <div 
                        key={weekIndex} 
                        className="flex-1 text-xs text-gray-600 p-1 border-r text-center"
                        style={{ minWidth: '60px' }}
                      >
                        {weekStart.toLocaleDateString('zh-TW', { 
                          month: '2-digit', 
                          day: '2-digit' 
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 甘特圖內容 */}
            <div className="space-y-1 relative" ref={ganttContentRef}>
              {/* 可拖動日期光棒 */}
              {(() => {
                const viewDate = new Date(currentViewDate)
                viewDate.setHours(0, 0, 0, 0) // 設置為當天的開始時間
                
                if (viewDate >= startDate && viewDate <= endDate) {
                  // 計算位置：查看日期相對於開始日期的天數除以總天數
                  const daysFromStart = Math.floor((viewDate - startDate) / (1000 * 60 * 60 * 24))
                  const datePosition = (daysFromStart / totalDays) * 100
                  
                  return (
                    <div 
                      key={`lightbar-${viewDate.getTime()}`}
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 cursor-col-resize"
                      style={{ 
                        left: `${leftColumnWidth}px`,
                        transform: `translateX(${datePosition}%)`
                      }}
                      title={`查看日期: ${viewDate.toLocaleDateString('zh-TW')} (第${daysFromStart + 1}天) - 可拖動`}
                    >
                      <div 
                        className="absolute -top-2 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap cursor-grab active:cursor-grabbing select-none"
                        onMouseDown={handleMouseDown}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                      >
                        {viewDate.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                      </div>
                    </div>
                  )
                }
                return null
              })()}
              
              {Object.entries(groupedTasks).map(([stage, stageTasks]) => (
                <div key={stage}>
                  {/* 類型標題 */}
                  <div className="flex bg-gray-100 p-2 font-medium text-gray-800">
                    <div className="w-48">{stage} ({stageTasks.length}個項目)</div>
                    <div className="flex-1"></div>
                  </div>
                  
                  {/* 該類型的任務 */}
                  {stageTasks.map((task, index) => {
                    const position = getTaskPosition(task)
                    const color = STAGE_COLORS[task.stage] || '#6b7280'
                    
                    return (
                      <div key={task.id} className="flex border-b hover:bg-gray-50">
                        <div className="w-48 p-2 text-sm text-gray-700 border-r">
                          {task.milestone}
                        </div>
                        <div className="flex-1 relative h-8 p-1">
                          <div
                            className="absolute h-6 rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center px-2"
                            style={{
                              backgroundColor: color,
                              left: position.left,
                              width: position.width,
                              minWidth: '60px'
                            }}
                            onClick={() => handleTaskClick(task)}
                            title={`${task.milestone} (${task.startDate} - ${task.endDate})`}
                          >
                            <span className="text-white text-xs font-medium truncate">
                              {task.milestone}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 統計資訊 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">統計資訊</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">總項目數：</span>
              <span className="font-medium">{totalTasks}</span>
            </div>
            <div>
              <span className="text-gray-600">類型數：</span>
              <span className="font-medium">{totalStages}</span>
            </div>
            <div>
              <span className="text-gray-600">開始日期：</span>
              <span className="font-medium">{startDate.toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-600">結束日期：</span>
              <span className="font-medium">{endDate.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細資訊對話框 */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">項目詳細資訊</h3>
              <Button
                onClick={closeDetailDialog}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium`}
                       style={{ 
                         backgroundColor: STAGE_COLORS[selectedTask.stage] || '#6b7280',
                         color: 'white'
                       }}>
                    {selectedTask.stage}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">項目名稱</label>
                  <p className="text-gray-900 font-medium">{selectedTask.milestone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                  <p className="text-gray-900">{selectedTask.startDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
                  <p className="text-gray-900">{selectedTask.endDate}</p>
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">內容說明</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedTask.holidayImpact && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">假期影響</label>
                    <p className="text-gray-900">{selectedTask.holidayImpact}</p>
                  </div>
                )}
                {selectedTask.dependencies && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">相依關係</label>
                    <p className="text-gray-900">{selectedTask.dependencies}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedTask.responsible && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">負責單位/人</label>
                    <p className="text-gray-900">{selectedTask.responsible}</p>
                  </div>
                )}
                {selectedTask.risks && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">風險/備註</label>
                    <p className="text-gray-900">{selectedTask.risks}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={closeDetailDialog}>
                關閉
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

