import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { ZoomIn, ZoomOut, Filter, BarChart3, Calendar, Target, X } from 'lucide-react'

const GanttChart = ({ tasks, hideCompletedButton }) => {
  const [selectedStage, setSelectedStage] = useState('all')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // 類型顏色映射
  const stageColors = {
    '法規/許可': '#ef4444',
    '贊助招商': '#3b82f6',
    '設計/製作': '#10b981',
    '公關/宣傳': '#f59e0b',
    '營運/交通': '#8b5cf6',
    '活動日': '#ec4899'
  }

  // 獲取所有類型
  const stages = [...new Set(tasks.map(task => task.stage))].filter(Boolean)

  // 篩選任務
  const filteredTasks = useMemo(() => {
    return selectedStage === 'all' 
      ? tasks 
      : tasks.filter(task => task.stage === selectedStage)
  }, [tasks, selectedStage])

  // 計算時間範圍
  const timeRange = useMemo(() => {
    if (filteredTasks.length === 0) return { start: new Date(), end: new Date() }
    
    const dates = filteredTasks.flatMap(task => [
      new Date(task.startDate),
      new Date(task.endDate)
    ]).filter(date => !isNaN(date))

    return {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates))
    }
  }, [filteredTasks])

  // 計算總天數
  const totalDays = Math.ceil((timeRange.end - timeRange.start) / (1000 * 60 * 60 * 24)) + 1

  // SVG 尺寸設定
  const chartWidth = Math.max(800, totalDays * zoomLevel * 2)
  const chartHeight = filteredTasks.length * 60 + 100
  const leftMargin = 300
  const topMargin = 60

  // 日期轉換為X座標
  const dateToX = (date) => {
    const daysDiff = Math.ceil((new Date(date) - timeRange.start) / (1000 * 60 * 60 * 24))
    return leftMargin + daysDiff * zoomLevel * 2
  }

  // 生成月份標記
  const generateMonthMarkers = () => {
    const markers = []
    const current = new Date(timeRange.start)
    current.setDate(1) // 設為月初
    
    while (current <= timeRange.end) {
      const x = dateToX(current)
      markers.push({
        x,
        label: `${current.getFullYear()}/${String(current.getMonth() + 1).padStart(2, '0')}`,
        date: new Date(current)
      })
      current.setMonth(current.getMonth() + 1)
    }
    
    return markers
  }

  const monthMarkers = generateMonthMarkers()

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 計算任務條寬度
  const getTaskBarWidth = (task) => {
    const startDate = new Date(task.startDate)
    const endDate = new Date(task.endDate)
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    return Math.max(days * zoomLevel * 2, 20) // 最小寬度20px
  }

  // 處理任務點擊
  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setIsDetailDialogOpen(true)
  }

  // 關閉詳情對話框
  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false)
    setSelectedTask(null)
  }

  return (
    <div className="space-y-6">
      {/* 控制面板和圖例整合 - 極簡風格 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 bg-gray-50 rounded-2xl border-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-48 border-gray-200 focus:border-gray-400 focus:ring-gray-400 rounded-lg">
                <SelectValue placeholder="選擇類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有類型</SelectItem>
                {stages.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">顯示</span>
            <Badge variant="secondary" className="font-semibold bg-white text-gray-900 border border-gray-200 rounded-full px-3 py-1">
              {filteredTasks.length} 個項目
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">縮放</span>
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 text-gray-600"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium min-w-12 text-center text-gray-700">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
              className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 text-gray-600"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          {hideCompletedButton}
        </div>
      </div>

      {/* 甘特圖 - 極簡風格 */}
      <div className="border border-gray-100 rounded-2xl overflow-auto bg-white shadow-sm">
        <svg width={chartWidth} height={chartHeight} className="block">
          {/* 背景網格 */}
          <defs>
            <pattern id="grid" width={zoomLevel * 14} height="60" patternUnits="userSpaceOnUse">
              <path d={`M ${zoomLevel * 14} 0 L 0 0 0 60`} fill="none" stroke="#f8fafc" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />
          
          {/* 月份標記 */}
          {monthMarkers.map((marker, index) => (
            <g key={index}>
              <line 
                x1={marker.x} 
                y1={0} 
                x2={marker.x} 
                y2={chartHeight} 
                stroke="#e2e8f0" 
                strokeWidth="1"
              />
              <text 
                x={marker.x + 5} 
                y={25} 
                fontSize="11" 
                fill="#64748b" 
                fontWeight="600"
              >
                {marker.label}
              </text>
            </g>
          ))}
          
          {/* 任務條 */}
          {filteredTasks.map((task, index) => {
            const y = topMargin + index * 60
            const x = dateToX(task.startDate)
            const width = getTaskBarWidth(task)
            const color = stageColors[task.stage] || '#6b7280'
            
            return (
              <g key={task.id}>
                {/* 任務名稱 */}
                <text
                  x={10}
                  y={y + 22}
                  fontSize="11"
                  fill="#374151"
                  fontWeight="500"
                  className="pointer-events-none"
                >
                  {task.milestone}
                </text>
                
                {/* 類型標籤 */}
                <text
                  x={10}
                  y={y + 36}
                  fontSize="9"
                  fill="#6b7280"
                  className="pointer-events-none"
                >
                  {task.stage}
                </text>

                {/* 任務條 */}
                <rect
                  x={x}
                  y={y + 8}
                  width={width}
                  height={26}
                  fill={color}
                  rx="3"
                  className="cursor-pointer hover:opacity-80 transition-opacity drop-shadow-sm"
                  onClick={() => handleTaskClick(task)}
                  style={{ cursor: 'pointer' }}
                >
                  <title>
                    {`${task.milestone}\n${task.stage}\n${formatDate(task.startDate)} - ${formatDate(task.endDate)}\n${task.description}`}
                  </title>
                </rect>

                {/* 任務條內文字 */}
                {width > 80 && (
                  <text
                    x={x + 8}
                    y={y + 24}
                    fontSize="9"
                    fill="white"
                    fontWeight="500"
                    className="pointer-events-none"
                  >
                    {task.milestone.length > 12 ? task.milestone.substring(0, 12) + '...' : task.milestone}
                  </text>
                )}

                {/* 日期標籤 */}
                <text
                  x={x + width + 8}
                  y={y + 18}
                  fontSize="9"
                  fill="#6b7280"
                  className="pointer-events-none"
                >
                  {formatDate(task.startDate)}
                </text>
                <text
                  x={x + width + 8}
                  y={y + 30}
                  fontSize="9"
                  fill="#6b7280"
                  className="pointer-events-none"
                >
                  {formatDate(task.endDate)}
                </text>

                {/* 項目標記 */}
                <circle
                  cx={x + width}
                  cy={y + 21}
                  r="4"
                  fill="#fbbf24"
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer drop-shadow-sm"
                  onClick={() => handleTaskClick(task)}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{`項目: ${task.milestone}`}</title>
                </circle>
              </g>
            )
          })}
          
          {/* 今日標記 */}
          {(() => {
            const today = new Date()
            if (today >= timeRange.start && today <= timeRange.end) {
              const todayX = dateToX(today)
              return (
                <g>
                  <line
                    x1={todayX}
                    y1={0}
                    x2={todayX}
                    y2={chartHeight}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={todayX + 5}
                    y={45}
                    fontSize="11"
                    fill="#ef4444"
                    fontWeight="600"
                  >
                    今日
                  </text>
                </g>
              )
            }
            return null
          })()}
        </svg>
      </div>

      {/* 項目詳情對話框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl border-0 rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-medium text-gray-900">
              項目詳情
            </DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6">
              {/* 項目基本資訊 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">項目名稱</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedTask.milestone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">類型</label>
                    <Badge className="mt-1 bg-gray-100 text-gray-700 border-0">
                      {selectedTask.stage}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">狀態</label>
                    <Badge 
                      className={`mt-1 border-0 ${
                        selectedTask.isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedTask.isCompleted ? '完成' : '未完成'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">開始日期</label>
                    <p className="text-base text-gray-900 mt-1">
                      {new Date(selectedTask.startDate).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">結束日期</label>
                    <p className="text-base text-gray-900 mt-1">
                      {new Date(selectedTask.endDate).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">持續天數</label>
                    <p className="text-base text-gray-900 mt-1">
                      {Math.ceil((new Date(selectedTask.endDate) - new Date(selectedTask.startDate)) / (1000 * 60 * 60 * 24)) + 1} 天
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 詳細資訊 */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">內容說明</label>
                  <p className="text-base text-gray-900 mt-1 leading-relaxed">
                    {selectedTask.description || '無內容說明'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">負責單位/人</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedTask.responsible || '未指定'}
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
                        ((new Date() - new Date(selectedTask.startDate)) / 
                        (new Date(selectedTask.endDate) - new Date(selectedTask.startDate))) * 100
                      ))}%`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {Math.min(100, Math.max(0, 
                        ((new Date() - new Date(selectedTask.startDate)) / 
                        (new Date(selectedTask.endDate) - new Date(selectedTask.startDate))) * 100
                      )).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{new Date(selectedTask.startDate).toLocaleDateString('zh-TW')}</span>
                  <span>{new Date(selectedTask.endDate).toLocaleDateString('zh-TW')}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GanttChart

