import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { Bot, Calendar } from 'lucide-react'
import type { Task } from '@/types'
import { useTasksStore, isOverdue } from '@/store/tasksStore'
import { updateTaskStatus } from '@/integrations/notion'

const PROJECT_COLORS: Record<Task['project'], string> = {
  research: '#818cf8',
  business: '#f59e0b',
  brand: '#f472b6',
  ideas: '#60a5fa',
  finance: '#34d399',
}

const PRIORITY_DOT: Record<Task['priority'], string> = {
  high: 'var(--status-red)',
  medium: 'var(--accent)',
  low: 'var(--text-muted)',
}

const COLUMNS: Array<{ status: Task['status']; label: string; color: string }> = [
  { status: 'todo', label: 'To Do', color: 'var(--text-muted)' },
  { status: 'in_progress', label: 'In Progress', color: 'var(--status-blue)' },
  { status: 'blocked', label: 'Blocked', color: 'var(--status-red)' },
  { status: 'done', label: 'Done', color: 'var(--status-green)' },
]

// ─── Draggable Card ───────────────────────────────────────────────────────────
function TaskCard({ task, isDragging = false }: { task: Task; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id })
  const overdue = isOverdue(task)

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    background: isDragging ? 'var(--bg-hover)' : 'var(--bg-elevated)',
    border: `1px solid ${isDragging ? 'var(--accent)' : 'var(--border-default)'}`,
    borderRadius: '8px',
    padding: '10px 12px',
    cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
    userSelect: 'none',
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <p
        style={{
          fontSize: '12.5px',
          color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
          lineHeight: '1.4',
          marginBottom: '8px',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {/* Project tag */}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: PROJECT_COLORS[task.project],
            background: `${PROJECT_COLORS[task.project]}18`,
            padding: '1px 6px',
            borderRadius: '4px',
          }}
        >
          {task.project}
        </span>

        {/* Priority dot */}
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: PRIORITY_DOT[task.priority],
            display: 'inline-block',
          }}
          title={task.priority}
        />

        {/* Due date */}
        {task.dueDate && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
              color: overdue ? 'var(--status-amber)' : 'var(--text-muted)',
              fontFamily: 'DM Mono, monospace',
              marginLeft: 'auto',
            }}
          >
            <Calendar size={9} />
            {task.dueDate.slice(5)} {/* show MM-DD */}
          </span>
        )}

        {task.agentCreated && (
          <Bot size={10} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
        )}
      </div>
    </div>
  )
}

// ─── Droppable Column ─────────────────────────────────────────────────────────
function KanbanColumn({
  status,
  label,
  color,
  tasks,
}: {
  status: Task['status']
  label: string
  color: string
  tasks: Task[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          padding: '0 2px',
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            color: 'var(--text-muted)',
            background: 'var(--bg-elevated)',
            padding: '1px 6px',
            borderRadius: '8px',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: '120px',
          background: isOver ? 'rgba(245,158,11,0.05)' : 'var(--bg-surface)',
          border: `1px solid ${isOver ? 'var(--accent)' : 'var(--border-subtle)'}`,
          borderRadius: '10px',
          padding: '10px',
          transition: 'all 0.15s ease',
        }}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '12px',
              padding: '20px 0',
            }}
          >
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Board ───────────────────────────────────────────────────────────────
interface Props {
  tasks: Task[]
}

export default function KanbanBoard({ tasks }: Props) {
  const { updateTask } = useTasksStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = ({ active }: DragStartEvent) => {
    const task = tasks.find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null)
    if (!over) return

    const task = tasks.find((t) => t.id === active.id)
    const newStatus = over.id as Task['status']

    if (task && task.status !== newStatus) {
      updateTask(task.id, { status: newStatus })
      if (task.notionId && import.meta.env.VITE_NOTION_API_KEY) {
        updateTaskStatus(task.notionId, newStatus).catch(console.warn)
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          alignItems: 'start',
        }}
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            color={col.color}
            tasks={tasks.filter((t) => t.status === col.status)}
          />
        ))}
      </div>

      {/* Drag overlay — shows a "ghost" card while dragging */}
      <DragOverlay>
        {activeTask ? (
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent)',
              borderRadius: '8px',
              padding: '10px 12px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              opacity: 0.95,
              cursor: 'grabbing',
              maxWidth: '260px',
            }}
          >
            <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              {activeTask.title}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
