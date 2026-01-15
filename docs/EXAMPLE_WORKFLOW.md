# Example Workflow: Building a Todo Feature

This document shows a complete end-to-end example of using SPC AI Team to build a feature from scratch.

## The Request

We'll build a simple todo list feature with CRUD operations (Create, Read, Update, Delete).

```
/spc "Add a todo list feature with the ability to create, view, toggle completion, and delete todos. Store data in localStorage for persistence."
```

## What Happens Step by Step

### Step 1: PM Analyzes the Request

The PM agent receives your request first and creates a PRD.

**Agent Activity:**
```
🧑‍💼 PM: Analyzing request...
🧑‍💼 PM: Creating PRD document...
🧑‍💼 PM: PRD saved to .spc/docs/prd/todo-feature.md
🧑‍💼 PM: Delegating to Architect and Designer...
```

**Generated Artifact:** `.spc/docs/prd/todo-feature.md`

```markdown
# PRD: Todo List Feature

## Problem Statement
Users need a simple way to track tasks and mark them as complete.

## Goals
- Allow users to create new todos
- Display list of todos with completion status
- Enable toggling todo completion
- Allow deleting todos
- Persist data across browser sessions

## Acceptance Criteria
- [ ] User can add a new todo by typing and pressing Enter
- [ ] Todos display with checkbox and text
- [ ] Clicking checkbox toggles completion (strikethrough when done)
- [ ] Delete button removes todo from list
- [ ] Data persists in localStorage
- [ ] Empty state shows "No todos yet" message

## User Stories
1. As a user, I want to add todos so I can track my tasks
2. As a user, I want to mark todos complete so I can see progress
3. As a user, I want to delete todos so I can remove irrelevant items
4. As a user, I want my todos saved so they persist across sessions

## Technical Constraints
- Use localStorage for persistence
- No backend required
- Must work in modern browsers

## Non-Functional Requirements
- Responsive design (mobile-friendly)
- Accessible (keyboard navigable)
- Fast (<100ms response time)
```

### Step 2: Architect Designs the Solution

The Architect receives the PRD and creates technical specifications.

**Agent Activity:**
```
🏗️ Architect: Reading PRD from .spc/docs/prd/todo-feature.md
🏗️ Architect: Designing technical architecture...
🏗️ Architect: Architecture saved to .spc/docs/architecture/todo-feature.md
🏗️ Architect: Ready for implementation...
```

**Generated Artifact:** `.spc/docs/architecture/todo-feature.md`

```markdown
# Architecture: Todo List Feature

## Tech Stack
- **Frontend:** React + TypeScript
- **State Management:** React useState
- **Persistence:** localStorage API
- **Styling:** Tailwind CSS (existing)

## Data Model

### Todo Interface
```typescript
interface Todo {
  id: string;           // UUID
  text: string;         // Todo content
  completed: boolean;   // Completion status
  createdAt: number;    // Unix timestamp
}
```

## Component Architecture

```
TodoApp
├── TodoInput       # Add new todos
├── TodoList        # Container for todo items
│   └── TodoItem    # Individual todo with checkbox, text, delete
└── EmptyState      # Shown when no todos exist
```

## API (localStorage)

| Operation | Key | Method |
|-----------|-----|--------|
| Load | `todos` | `localStorage.getItem('todos')` |
| Save | `todos` | `localStorage.setItem('todos', JSON.stringify(todos))` |

## Functions

```typescript
// Core operations
addTodo(text: string): void
toggleTodo(id: string): void
deleteTodo(id: string): void
getTodos(): Todo[]

// Persistence
loadTodos(): Todo[]
saveTodos(todos: Todo[]): void
```

## File Structure
```
src/
├── components/
│   ├── TodoApp.tsx        # Main container
│   ├── TodoInput.tsx      # Input form
│   ├── TodoList.tsx       # Todo list container
│   ├── TodoItem.tsx       # Single todo item
│   └── EmptyState.tsx     # Empty state message
├── hooks/
│   └── useTodos.ts        # Todo state management hook
├── types/
│   └── todo.ts            # TypeScript interfaces
└── utils/
    └── storage.ts         # localStorage helpers
```
```

### Step 3: Designer Creates UI Specifications

**Running in parallel with Architect**

**Agent Activity:**
```
🎨 Designer: Reading PRD from .spc/docs/prd/todo-feature.md
🎨 Designer: Creating UI specifications...
🎨 Designer: Design saved to .spc/docs/design/todo-feature.md
🎨 Designer: Ready for implementation...
```

**Generated Artifact:** `.spc/docs/design/todo-feature.md`

```markdown
# Design: Todo List Feature

## Component Specifications

### TodoApp Container
- Max width: 600px, centered
- Padding: 24px
- Background: white (dark mode: gray-900)

### TodoInput
- Full width text input
- Placeholder: "What needs to be done?"
- Border: 1px gray-300
- Padding: 12px 16px
- Font size: 16px
- Border radius: 8px
- Focus: blue ring

### TodoItem
- Horizontal layout: [checkbox] [text] [delete button]
- Padding: 12px 16px
- Border bottom: 1px gray-200
- Hover: gray-50 background

#### Checkbox
- Size: 20x20px
- Border: 2px gray-400
- Checked: blue-500 fill with white checkmark
- Transition: 150ms

#### Text
- Font: 16px
- Color: gray-900
- Completed: gray-400 + line-through

#### Delete Button
- Icon: trash/X icon
- Color: gray-400
- Hover: red-500
- Size: 20x20px
- Visible on row hover

### EmptyState
- Centered text
- Icon: clipboard or checkbox
- Text: "No todos yet. Add one above!"
- Color: gray-400

## Responsive Behavior
- Mobile: Full width with 16px padding
- Tablet+: Max 600px centered

## Accessibility
- All interactive elements keyboard focusable
- Checkbox has aria-label
- Delete button has aria-label
- Focus visible indicators
```

### Step 4: Developer Implements the Code

**Agent Activity:**
```
💻 Developer: Reading architecture from .spc/docs/architecture/todo-feature.md
💻 Developer: Reading design from .spc/docs/design/todo-feature.md
💻 Developer: Implementing components...
💻 Developer: Created src/types/todo.ts
💻 Developer: Created src/utils/storage.ts
💻 Developer: Created src/hooks/useTodos.ts
💻 Developer: Created src/components/TodoItem.tsx
💻 Developer: Created src/components/TodoInput.tsx
💻 Developer: Created src/components/EmptyState.tsx
💻 Developer: Created src/components/TodoList.tsx
💻 Developer: Created src/components/TodoApp.tsx
💻 Developer: Implementation complete!
```

**Generated Code Example:** `src/components/TodoApp.tsx`

```tsx
import { useTodos } from '../hooks/useTodos';
import { TodoInput } from './TodoInput';
import { TodoList } from './TodoList';
import { EmptyState } from './EmptyState';

export function TodoApp() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        My Todos
      </h1>

      <TodoInput onAdd={addTodo} />

      {todos.length === 0 ? (
        <EmptyState />
      ) : (
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      )}
    </div>
  );
}
```

### Step 5: QA Validates the Implementation

**Agent Activity:**
```
🧪 QA: Reading acceptance criteria from PRD...
🧪 QA: Running validation tests...
🧪 QA: Testing: Add new todo - PASS
🧪 QA: Testing: Toggle completion - PASS
🧪 QA: Testing: Delete todo - PASS
🧪 QA: Testing: localStorage persistence - PASS
🧪 QA: Testing: Empty state display - PASS
🧪 QA: Testing: Accessibility (keyboard nav) - PASS
🧪 QA: All tests passed!
🧪 QA: QA Report saved to .spc/qa-reports/todo-feature.md
```

**Generated Artifact:** `.spc/qa-reports/todo-feature.md`

```markdown
# QA Report: Todo List Feature

## Test Summary
| Total | Passed | Failed | Skipped |
|-------|--------|--------|---------|
| 12    | 12     | 0      | 0       |

## Acceptance Criteria Validation

- [x] User can add a new todo by typing and pressing Enter
- [x] Todos display with checkbox and text
- [x] Clicking checkbox toggles completion (strikethrough when done)
- [x] Delete button removes todo from list
- [x] Data persists in localStorage
- [x] Empty state shows "No todos yet" message

## Test Cases

### Functional Tests
| Test | Status | Notes |
|------|--------|-------|
| Add todo with Enter key | PASS | |
| Add todo with empty text | PASS | Correctly prevented |
| Toggle todo completion | PASS | |
| Delete single todo | PASS | |
| Delete all todos shows empty state | PASS | |
| Refresh preserves todos | PASS | localStorage working |

### UI/UX Tests
| Test | Status | Notes |
|------|--------|-------|
| Responsive on mobile | PASS | Tested at 375px width |
| Dark mode support | PASS | |
| Loading state | PASS | Instant, no loading needed |

### Accessibility Tests
| Test | Status | Notes |
|------|--------|-------|
| Keyboard navigation | PASS | Tab through all elements |
| Screen reader labels | PASS | aria-labels present |
| Focus indicators | PASS | Visible blue ring |

## Issues Found
None

## Recommendation
**APPROVED** for release
```

### Step 6: Writer Documents the Feature

**Agent Activity:**
```
📝 Writer: Reading implementation details...
📝 Writer: Updating README.md...
📝 Writer: Creating component documentation...
📝 Writer: Documentation complete!
```

**Generated Documentation:** Added to `README.md`

```markdown
## Todo List Feature

A simple, persistent todo list for tracking tasks.

### Usage

The todo list is available at `/todos`. Features include:

- **Add todos**: Type in the input field and press Enter
- **Mark complete**: Click the checkbox to toggle completion
- **Delete**: Click the trash icon to remove a todo
- **Persistence**: Your todos are saved automatically

### Components

| Component | Description |
|-----------|-------------|
| `TodoApp` | Main container component |
| `TodoInput` | Input field for adding todos |
| `TodoList` | Container for todo items |
| `TodoItem` | Individual todo with checkbox and delete |
| `EmptyState` | Displayed when no todos exist |

### Data Storage

Todos are stored in `localStorage` under the key `todos`.
```

## Final Directory Structure

After completion, your `.spc/` directory will contain:

```
.spc/
├── docs/
│   ├── prd/
│   │   └── todo-feature.md          # PRD from PM
│   ├── architecture/
│   │   └── todo-feature.md          # Tech spec from Architect
│   └── design/
│       └── todo-feature.md          # UI spec from Designer
├── qa-reports/
│   └── todo-feature.md              # Test results from QA
└── handoffs/
    ├── handoff-1.yaml               # PM → Architect/Designer
    ├── handoff-2.yaml               # Architect/Designer → Developer
    ├── handoff-3.yaml               # Developer → QA
    └── handoff-4.yaml               # QA → Writer
```

## Handoff Record Example

Each agent creates a handoff record when delegating work:

**`.spc/handoffs/handoff-1.yaml`**
```yaml
task_id: todo-feature-001
timestamp: 2024-01-15T10:30:00Z
from: spc-pm
to:
  - spc-architect
  - spc-designer
context:
  prd: .spc/docs/prd/todo-feature.md
requirements:
  - Design localStorage-based persistence
  - Create responsive UI components
  - Follow existing Tailwind design system
message: "PRD complete. Architect and Designer can work in parallel."
```

## Timeline Overview

```
00:00  /spc command invoked
00:05  🧑‍💼 PM starts analyzing
00:30  🧑‍💼 PM completes PRD
00:35  🏗️ Architect + 🎨 Designer start (parallel)
01:30  🏗️ Architect completes tech spec
01:45  🎨 Designer completes design spec
02:00  💻 Developer starts implementation
05:00  💻 Developer completes code
05:15  🧪 QA starts testing
06:00  🧪 QA completes validation
06:15  📝 Writer starts documentation
07:00  📝 Writer completes docs
07:00  ✅ Feature complete!
```

## Key Takeaways

1. **PM Always Starts** - Every request goes through PM first for requirements analysis
2. **Parallel Execution** - Architect and Designer work simultaneously after PRD
3. **Sequential Validation** - QA validates before Writer documents
4. **Artifact Trail** - Every decision is documented in `.spc/`
5. **Handoff Protocol** - Agents communicate through structured handoff records

## Try It Yourself

Run this command in your project:

```
/spc "Add a todo list feature with create, toggle, and delete functionality. Use localStorage for persistence."
```

Watch your AI team build it from scratch!
