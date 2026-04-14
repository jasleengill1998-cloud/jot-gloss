import { useState } from 'react'
import { useSpendingStore, fmtMonthLong, currentMonthKey } from './lib/store'
import Dashboard from './components/Dashboard'
import AddEntry from './components/AddEntry'
import EntryLog from './components/EntryLog'
import BudgetModal from './components/BudgetModal'

type View = 'dashboard' | 'log'

export default function App() {
  const store = useSpendingStore()
  const [view, setView] = useState<View>('dashboard')
  const [showAdd, setShowAdd] = useState(false)
  const [showBudget, setShowBudget] = useState(false)

  const handleAdd = (platform: string, amount: number, date: string, note: string) => {
    store.addEntry(platform, amount, date, note)
    setShowAdd(false)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text tracking-tight">AI Spending Tracker</h1>
            <p className="text-xs text-text-dim">{fmtMonthLong(currentMonthKey())}</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-light transition-colors"
          >
            + Add Entry
          </button>
        </div>
      </header>

      {/* Nav tabs */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-surface rounded-lg p-1 w-fit">
          {([['dashboard', 'Dashboard'], ['log', 'Entry Log']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                view === key
                  ? 'bg-surface-2 text-text font-medium'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {showAdd && (
          <div className="mb-6">
            <AddEntry onAdd={handleAdd} onClose={() => setShowAdd(false)} />
          </div>
        )}

        {view === 'dashboard' && (
          <Dashboard
            currentMonthTotal={store.currentMonthTotal}
            allTimeTotal={store.allTimeTotal}
            avgMonthly={store.avgMonthly}
            budget={store.budget}
            platformBreakdown={store.platformBreakdown}
            monthlyHistory={store.monthlyHistory}
            currentMonthEntries={store.currentMonthEntries}
            onEditBudget={() => setShowBudget(true)}
          />
        )}

        {view === 'log' && (
          <EntryLog entries={store.entries} onRemove={store.removeEntry} />
        )}
      </main>

      {/* Budget modal */}
      {showBudget && (
        <BudgetModal
          current={store.budget}
          onSave={store.setBudget}
          onClose={() => setShowBudget(false)}
        />
      )}
    </div>
  )
}
