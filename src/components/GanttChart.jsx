import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ZoomIn, ZoomOut, Filter, BarChart3, Calendar, Target } from 'lucide-react'

const GanttChart = ({ tasks }) => {
  const [selectedStage, setSelectedStage] = useState('all')
  const [zoomLevel, setZoomLevel] = useState(1)

  // 階段顏色映射
  const stageColors = {
    '法規/許可': '#ef4444',
    '贊助招商': '#3b82f6',
    '設計/製作': '#10b981',
    '公關/宣傳': '#f59e0b',
    '營運/交通': '#8b5cf6',
    '活動日': '#ec4899'
  }

  // 獲取所有階段
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

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="選擇階段" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有階段</SelectItem>
                {stages.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">顯示</span>
            <Badge variant="secondary" className="font-semibold">
              {filteredTasks.length} 個項目
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">縮放</span>
          <div className="flex items-center gap-2 bg-background rounded-md border p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="h-7 w-7 p-0"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-xs font-medium min-w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
              className="h-7 w-7 p-0"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* 圖例 */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">階段圖例</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stageColors).map(([stage, color]) => (
              <div key={stage} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-muted-foreground">{stage}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 ml-4">
              <div className="w-3 h-3 rounded-full bg-yellow-400 border border-white shadow-sm" />
              <span className="text-xs font-medium text-muted-foreground">里程碑</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500 border-dashed" />
              <span className="text-xs font-medium text-muted-foreground">今日</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 甘特圖 */}
      <div className="border rounded-lg overflow-auto bg-white shadow-sm">
        <svg width={chartWidth} height={chartHeight} className="block">
          {/* 背景網格 */}
          <defs>
            <pattern id="grid" width={zoomLevel * 14} height="60" patternUnits="userSpaceOnUse">
              <path d={`M ${zoomLevel * 14} 0 L 0 0 0 60`} fill="none" stroke="#f1f5f9" strokeWidth="1"/>
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
                strokeWidth="2"
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
                
                {/* 階段標籤 */}
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

                {/* 里程碑標記 */}
                <circle
                  cx={x + width}
                  cy={y + 21}
                  r="4"
                  fill="#fbbf24"
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer drop-shadow-sm"
                >
                  <title>{`里程碑: ${task.milestone}`}</title>
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

      {/* 統計資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">項目總數</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{filteredTasks.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">總天數</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalDays}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">階段數</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stages.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">縮放比例</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{Math.round(zoomLevel * 100)}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GanttChart

