import { useState } from 'react'
import TimelineTable from './components/TimelineTable'
import GanttChart from './components/GanttChart'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('table')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Motivibes 專案管理</h1>
        </header>

        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-1 flex">
            <button
              onClick={() => setCurrentView('table')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentView === 'table'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              時間表管理
            </button>
            <button
              onClick={() => setCurrentView('gantt')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentView === 'gantt'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              甘特圖視圖
            </button>
          </div>
        </div>

        {currentView === 'table' ? <TimelineTable /> : <GanttChart />}
      </div>
    </div>
  )
}

export default App

