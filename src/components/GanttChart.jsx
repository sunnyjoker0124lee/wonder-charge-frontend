import React, { useState, useEffect, useRef, useCallback } from 'react';

const GanttChart = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
  const [currentDate] = useState(new Date('2025-08-15')); // 今天的日期
  const chartRef = useRef(null);
  const timelineRef = useRef(null);

  // 顏色映射
  const stageColors = {
    '法規/許可': '#8B5CF6',     // 紫色
    '贊助招商': '#F59E0B',     // 橙色
    '設計/製作': '#10B981',    // 綠色
    '公關/宣傳': '#3B82F6',    // 藍色
    '營運/交通': '#EF4444',    // 紅色
    '活動日': '#EC4899'        // 粉色
  };

  // 獲取任務數據
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('獲取的任務數據:', data);
        setTasks(data);
      } catch (err) {
        console.error('獲取任務失敗:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // 日期處理函數
  const parseDate = useCallback((dateStr) => {
    if (!dateStr) return null;
    try {
      // 處理 YYYY-MM-DD 格式
      const date = new Date(dateStr + 'T00:00:00');
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      console.error('日期解析錯誤:', dateStr, e);
      return null;
    }
  }, []);

  // 計算日期範圍 - 自動延伸到涵蓋所有任務
  const getDateRange = useCallback(() => {
    const validTasks = tasks.filter(task => 
      task.startDate && task.endDate && 
      parseDate(task.startDate) && parseDate(task.endDate)
    );

    if (validTasks.length === 0) {
      // 如果沒有有效任務，使用當前日期前後各3個月
      const today = new Date();
      const start = new Date(today);
      start.setMonth(start.getMonth() - 3);
      start.setDate(1); // 月初
      const end = new Date(today);
      end.setMonth(end.getMonth() + 6);
      end.setDate(0); // 上個月最後一天，即這個月最後一天
      end.setDate(end.getDate() + 1); // 下個月第一天
      return { start, end };
    }

    // 找出所有任務的最早和最晚日期
    const dates = validTasks.flatMap(task => [
      parseDate(task.startDate),
      parseDate(task.endDate)
    ]).filter(Boolean);

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // 自動添加緩衝時間：前後各加1個月
    const start = new Date(minDate);
    start.setMonth(start.getMonth() - 1);
    start.setDate(1); // 設為月初
    
    const end = new Date(maxDate);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // 設為上個月最後一天
    end.setDate(end.getDate() + 1); // 下個月第一天

    console.log('自動計算時間範圍:', {
      原始最早: minDate.toDateString(),
      原始最晚: maxDate.toDateString(),
      緩衝後開始: start.toDateString(),
      緩衝後結束: end.toDateString(),
      總天數: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    });

    return { start, end };
  }, [tasks, parseDate]);

  // 計算總天數
  const getTotalDays = useCallback(() => {
    const { start, end } = getDateRange();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }, [getDateRange]);

  // 計算日期到像素的轉換
  const dateToPixel = useCallback((date) => {
    if (!date) return 0;
    const { start } = getDateRange();
    const daysDiff = Math.floor((date - start) / (1000 * 60 * 60 * 24));
    const leftPanelWidth = 200; // 左側面板寬度
    const dayWidth = 30; // 每天30像素
    return leftPanelWidth + (daysDiff * dayWidth);
  }, [getDateRange]);

  // 生成智能時間軸標籤 - 自動適應時間範圍
  const generateTimeLabels = useCallback(() => {
    const { start, end } = getDateRange();
    const labels = [];
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // 根據時間跨度決定標籤密度
    let labelInterval;
    if (totalDays <= 60) {
      labelInterval = 7; // 2個月內：每週
    } else if (totalDays <= 180) {
      labelInterval = 14; // 6個月內：每兩週
    } else if (totalDays <= 365) {
      labelInterval = 30; // 1年內：每月
    } else {
      labelInterval = 60; // 超過1年：每兩個月
    }

    console.log(`時間跨度: ${totalDays}天，標籤間隔: ${labelInterval}天`);

    // 生成基礎時間標籤
    const current = new Date(start);
    while (current <= end) {
      labels.push({
        date: new Date(current),
        label: `${String(current.getMonth() + 1).padStart(2, '0')}/${String(current.getDate()).padStart(2, '0')}`,
        x: dateToPixel(current),
        isRegular: true
      });
      current.setDate(current.getDate() + labelInterval);
    }

    // 收集重要日期（任務的開始和結束日期）
    const importantDates = new Set();
    tasks.forEach(task => {
      const startDate = parseDate(task.startDate);
      const endDate = parseDate(task.endDate);
      if (startDate && startDate >= start && startDate <= end) {
        importantDates.add(startDate.toDateString());
      }
      if (endDate && endDate >= start && endDate <= end) {
        importantDates.add(endDate.toDateString());
      }
    });

    console.log('重要日期數量:', importantDates.size);

    // 添加重要日期標籤（如果不與現有標籤重疊）
    importantDates.forEach(dateStr => {
      const date = new Date(dateStr);
      
      // 檢查是否與現有標籤太接近（3天內）
      const tooClose = labels.some(label => 
        Math.abs(label.date.getTime() - date.getTime()) < 3 * 24 * 60 * 60 * 1000
      );
      
      if (!tooClose) {
        labels.push({
          date: new Date(date),
          label: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
          x: dateToPixel(date),
          isImportant: true
        });
        console.log('添加重要日期標籤:', date.toDateString());
      }
    });

    // 按日期排序
    const sortedLabels = labels.sort((a, b) => a.date.getTime() - b.date.getTime());
    console.log('總標籤數:', sortedLabels.length);
    
    return sortedLabels;
  }, [getDateRange, dateToPixel, tasks, parseDate]);

  // 過濾任務
  const filteredTasks = tasks.filter(task => {
    if (!showOnlyIncomplete) return true;
    return !task.completed;
  });

  // 按階段分組任務
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const stage = task.stage || '未分類';
    if (!groups[stage]) {
      groups[stage] = [];
    }
    groups[stage].push(task);
    return groups;
  }, {});

  // 計算今天線的位置
  const todayLinePosition = dateToPixel(currentDate);

  // 滾動同步
  const handleScroll = useCallback((e) => {
    if (timelineRef.current && chartRef.current) {
      if (e.target === chartRef.current) {
        timelineRef.current.scrollLeft = e.target.scrollLeft;
      } else if (e.target === timelineRef.current) {
        chartRef.current.scrollLeft = e.target.scrollLeft;
      }
    }
  }, []);

  // 渲染任務條
  const renderTaskBar = (task) => {
    const startDate = parseDate(task.startDate);
    const endDate = parseDate(task.endDate);
    
    if (!startDate || !endDate) {
      return null;
    }

    const startX = dateToPixel(startDate);
    const endX = dateToPixel(endDate);
    const width = Math.max(endX - startX, 10); // 最小寬度10px
    const color = stageColors[task.stage] || '#6B7280';

    return (
      <div
        key={task.id}
        className="task-bar"
        style={{
          position: 'absolute',
          left: `${startX}px`,
          width: `${width}px`,
          height: '20px',
          backgroundColor: color,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: '500',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          padding: '0 4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          cursor: 'pointer'
        }}
        title={`${task.milestone}\n${task.startDate} - ${task.endDate}`}
      >
        {task.milestone}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">錯誤: {error}</div>
      </div>
    );
  }

  const totalDays = getTotalDays();
  const chartWidth = 200 + (totalDays * 30); // 左側面板 + 時間軸寬度
  const timeLabels = generateTimeLabels();

  return (
    <div className="gantt-chart w-full h-full bg-white">
      {/* 標題和控制項 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">甘特圖視圖</h2>
        <button
          onClick={() => setShowOnlyIncomplete(!showOnlyIncomplete)}
          className={`px-4 py-2 rounded ${
            showOnlyIncomplete 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          只顯示未完成項目
        </button>
      </div>

      {/* 時間軸 */}
      <div 
        ref={timelineRef}
        className="timeline-header border-b bg-gray-50 overflow-x-auto"
        style={{ height: '40px' }}
        onScroll={handleScroll}
      >
        <div 
          className="relative"
          style={{ width: `${chartWidth}px`, height: '40px' }}
        >
          {/* 左側空白區域 */}
          <div 
            className="absolute top-0 left-0 bg-gray-100 border-r flex items-center justify-center font-semibold"
            style={{ width: '200px', height: '40px' }}
          >
            時間軸
          </div>
          
          {/* 時間標籤 */}
          {timeLabels.map((label, index) => (
            <div
              key={index}
              className={`absolute top-0 flex items-center justify-center text-sm font-medium border-l border-gray-300 ${
                label.isImportant ? 'bg-yellow-100 border-yellow-400' : ''
              }`}
              style={{
                left: `${label.x}px`,
                width: label.isImportant ? '80px' : '120px', // 重要日期標籤稍窄
                height: '40px'
              }}
            >
              <span className={label.isImportant ? 'text-yellow-800 font-bold text-xs' : 'text-gray-700'}>
                {label.label}
              </span>
            </div>
          ))}
          
          {/* 今天線標籤 */}
          <div
            className="absolute top-0 flex items-center justify-center"
            style={{
              left: `${todayLinePosition - 15}px`,
              width: '30px',
              height: '40px'
            }}
          >
            <div className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
              8/15
            </div>
          </div>
        </div>
      </div>

      {/* 甘特圖主體 */}
      <div 
        ref={chartRef}
        className="gantt-body overflow-auto"
        style={{ height: 'calc(100vh - 200px)' }}
        onScroll={handleScroll}
      >
        <div 
          className="relative"
          style={{ width: `${chartWidth}px` }}
        >
          {/* 網格線 */}
          <div className="absolute inset-0">
            {Array.from({ length: totalDays }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-gray-200"
                style={{ left: `${200 + (i * 30)}px` }}
              />
            ))}
          </div>

          {/* 今天線 */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{ left: `${todayLinePosition}px` }}
          />

          {/* 任務行 */}
          {Object.entries(groupedTasks).map(([stage, stageTasks], stageIndex) => (
            <div key={stage}>
              {/* 階段標題 */}
              <div 
                className="flex items-center border-b bg-gray-50"
                style={{ height: '40px' }}
              >
                <div 
                  className="flex items-center px-4 font-semibold border-r"
                  style={{ width: '200px' }}
                >
                  <div
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: stageColors[stage] || '#6B7280' }}
                  />
                  {stage} ({stageTasks.length}個項目)
                </div>
              </div>

              {/* 任務列表 */}
              {stageTasks.map((task, taskIndex) => (
                <div 
                  key={task.id}
                  className="flex items-center border-b hover:bg-gray-50"
                  style={{ height: '40px' }}
                >
                  {/* 任務名稱 */}
                  <div 
                    className="flex items-center px-4 border-r text-sm"
                    style={{ width: '200px' }}
                  >
                    {task.milestone}
                  </div>

                  {/* 任務條區域 */}
                  <div className="relative flex-1" style={{ height: '40px' }}>
                    {renderTaskBar(task)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 圖例 */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex flex-wrap gap-4">
          {Object.entries(stageColors).map(([stage, color]) => (
            <div key={stage} className="flex items-center">
              <div
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm">{stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="border-t p-4 bg-white">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold">總項目數：</span>
            {filteredTasks.length}
          </div>
          <div>
            <span className="font-semibold">類型數：</span>
            {Object.keys(groupedTasks).length}
          </div>
          <div>
            <span className="font-semibold">開始日期：</span>
            {getDateRange().start.toLocaleDateString('zh-TW')}
          </div>
          <div>
            <span className="font-semibold">結束日期：</span>
            {getDateRange().end.toLocaleDateString('zh-TW')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;

