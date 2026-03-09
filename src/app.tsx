import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Footer } from 'components/footer'
import { Header } from 'components/header'
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { JsonHighlight } from './components/json-highlight'
import { useDeleteDataset, useGetAllDatasets, useSaveDataset } from './hooks/use-queries'
import {
  type JsonBuilderState,
  type JsonObject,
  type Property,
  type PropertyType,
  SAMPLE_STATE,
  buildJsonOutput,
  generateId,
  importFromJson,
} from './types/json-builder'

const formatDate = (ms: number) => {
  return new Date(ms).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Drag-to-reorder (manual, no dnd-kit since not installed) ───────────────
function useDragReorder(items: JsonObject[], onReorder: (newItems: JsonObject[]) => void) {
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragEnter = (index: number) => {
    dragOver.current = index
  }

  const handleDragEnd = () => {
    if (
      dragItem.current !== null &&
      dragOver.current !== null &&
      dragItem.current !== dragOver.current
    ) {
      const newItems = [...items]
      const [dragged] = newItems.splice(dragItem.current, 1)
      newItems.splice(dragOver.current, 0, dragged)
      onReorder(newItems)
    }
    dragItem.current = null
    dragOver.current = null
  }

  return { handleDragStart, handleDragEnter, handleDragEnd }
}

// ─── Type dot colors for scannable type badges ───────────────────────────────
const TYPE_DOT_CLASS: Record<string, string> = {
  string: 'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[oklch(0.78_0.14_155)]',
  number: 'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[oklch(0.72_0.18_50)]',
  boolean: 'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[oklch(0.7_0.19_280)]',
  array: 'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[oklch(0.75_0.16_175)]',
}

// ─── Property Row ────────────────────────────────────────────────────────────
interface PropertyRowProperties {
  property: Property
  rowIndex: number
  onChange: (updated: Property) => void
  onDelete: () => void
}

function PropertyRow({ property, rowIndex, onChange, onDelete }: PropertyRowProperties) {
  const handleTypeChange = (type: PropertyType) => {
    let value = property.value
    if (type === 'boolean' && value !== 'true' && value !== 'false') {
      value = 'true'
    }
    if (type === 'array' && property.type !== 'array') {
      value = property.value || ''
    }
    onChange({ ...property, type, value })
  }

  return (
    <div className="group animate-fade-in flex items-center gap-1.5 px-3 py-1.5 transition-colors hover:bg-accent/40">
      {/* Key input */}
      <Input
        data-ocid={`property.input.${rowIndex}`}
        value={property.key}
        onChange={(event) => onChange({ ...property, key: event.target.value })}
        placeholder="key"
        className="h-7 w-32 min-w-0 flex-shrink-0 border-border/50 bg-transparent font-mono text-xs text-code-key placeholder:text-muted-foreground/40 focus:border-primary-light/60"
      />

      <span className="flex-shrink-0 text-xs text-muted-foreground/40">:</span>

      {/* Value input */}
      {property.type === 'boolean' ? (
        <Select
          value={property.value}
          onValueChange={(value) => onChange({ ...property, value: value })}
        >
          <SelectTrigger
            data-ocid={`property.select.${rowIndex}`}
            className="h-7 min-w-0 flex-1 border-border/50 bg-transparent font-mono text-xs text-code-boolean focus:border-primary-light/60"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true" className="font-mono text-xs text-code-boolean">
              true
            </SelectItem>
            <SelectItem value="false" className="font-mono text-xs text-code-boolean">
              false
            </SelectItem>
          </SelectContent>
        </Select>
      ) : property.type === 'array' ? (
        <Input
          data-ocid={`property.value_input.${rowIndex}`}
          value={property.value}
          onChange={(event) => onChange({ ...property, value: event.target.value })}
          placeholder="item1, item2, item3"
          title="Comma-separated values. Numbers and booleans are auto-detected."
          className="h-7 min-w-0 flex-1 border-border/50 bg-transparent font-mono text-xs text-code-string placeholder:text-muted-foreground/40 focus:border-primary-light/60"
        />
      ) : (
        <Input
          data-ocid={`property.value_input.${rowIndex}`}
          value={property.value}
          onChange={(event) => onChange({ ...property, value: event.target.value })}
          placeholder={property.type === 'number' ? '0' : 'value'}
          className={`h-7 min-w-0 flex-1 border-border/50 bg-transparent font-mono text-xs focus:border-primary-light/60 ${
            property.type === 'number' ? 'text-code-number' : 'text-code-string'
          } placeholder:text-muted-foreground/40`}
          type={property.type === 'number' ? 'text' : 'text'}
          inputMode={property.type === 'number' ? 'decimal' : 'text'}
        />
      )}

      {/* Type select */}
      <Select value={property.type} onValueChange={handleTypeChange}>
        <SelectTrigger
          data-ocid={`property.type_select.${rowIndex}`}
          className="h-7 w-28 flex-shrink-0 gap-1.5 border-border/50 bg-transparent font-mono text-xs focus:border-primary-light/60"
        >
          <span className={TYPE_DOT_CLASS[property.type]} aria-hidden="true" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="string" className="font-mono text-xs">
            <span className="flex items-center gap-2">
              <span className={TYPE_DOT_CLASS.string} />
              <span className="text-code-string">string</span>
            </span>
          </SelectItem>
          <SelectItem value="number" className="font-mono text-xs">
            <span className="flex items-center gap-2">
              <span className={TYPE_DOT_CLASS.number} />
              <span className="text-code-number">number</span>
            </span>
          </SelectItem>
          <SelectItem value="boolean" className="font-mono text-xs">
            <span className="flex items-center gap-2">
              <span className={TYPE_DOT_CLASS.boolean} />
              <span className="text-code-boolean">boolean</span>
            </span>
          </SelectItem>
          <SelectItem value="array" className="font-mono text-xs">
            <span className="flex items-center gap-2">
              <span className={TYPE_DOT_CLASS.array} />
              <span className="text-primary-light/80">array</span>
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Delete button */}
      <Button
        data-ocid={`property.delete_button.${rowIndex}`}
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-7 w-7 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
      >
        <ILucideTrash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}

// ─── Object Card ─────────────────────────────────────────────────────────────
interface ObjectCardProperties {
  obj: JsonObject
  index: number
  onUpdate: (updated: JsonObject) => void
  onDelete: () => void
  onDragStart: (index: number) => void
  onDragEnter: (index: number) => void
  onDragEnd: () => void
  isDragging: boolean
}

function ObjectCard({
  obj,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
}: ObjectCardProperties) {
  const addProperty = () => {
    const newProperty: Property = {
      id: generateId(),
      key: '',
      value: '',
      type: 'string',
    }
    onUpdate({ ...obj, properties: [...obj.properties, newProperty] })
  }

  const updateProperty = (propertyId: string, updated: Property) => {
    onUpdate({
      ...obj,
      properties: obj.properties.map((p) => (p.id === propertyId ? updated : p)),
    })
  }

  const deleteProperty = (propertyId: string) => {
    onUpdate({
      ...obj,
      properties: obj.properties.filter((p) => p.id !== propertyId),
    })
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      className={`rounded-lg border border-border bg-card shadow-card transition-all duration-150 ${
        isDragging ? 'scale-[0.98] opacity-50' : ''
      }`}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 rounded-t-lg border-b border-border/60 bg-muted/30 px-3 py-2">
        <button
          type="button"
          data-ocid={`object.drag_handle.${index + 1}`}
          className="cursor-grab touch-none text-muted-foreground/40 transition-colors hover:text-muted-foreground active:cursor-grabbing"
          title="Drag to reorder"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <ILucideGripVertical className="h-3.5 w-3.5" />
        </button>

        <div className="flex flex-1 items-center gap-1.5">
          <ILucideBraces className="h-3 w-3 text-primary-light/70" />
          <span className="font-mono text-xs font-medium text-muted-foreground">
            Object {index + 1}
          </span>
          <span className="font-mono text-xs text-muted-foreground/40">
            ({obj.properties.length} {obj.properties.length === 1 ? 'prop' : 'props'})
          </span>
        </div>

        <Button
          data-ocid={`object.delete_button.${index + 1}`}
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-6 w-6 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <ILucideTrash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Properties */}
      <div className="divide-y divide-border/30">
        {obj.properties.length === 0 ? (
          <div className="px-3 py-3 font-mono text-xs text-muted-foreground/50 italic">
            {/* no properties yet */}
            <span>{'// no properties yet'}</span>
          </div>
        ) : (
          obj.properties.map((property, pIndex) => (
            <PropertyRow
              key={property.id}
              property={property}
              rowIndex={pIndex + 1}
              onChange={(updated) => updateProperty(property.id, updated)}
              onDelete={() => deleteProperty(property.id)}
            />
          ))
        )}
      </div>

      {/* Add property button */}
      <div className="border-t border-border/30 px-3 py-2">
        <Button
          data-ocid={`object.add_property_button.${index + 1}`}
          variant="ghost"
          size="sm"
          onClick={addProperty}
          className="h-6 gap-1.5 px-2 font-mono text-xs text-muted-foreground/70 hover:bg-primary-light/10 hover:text-primary-light"
        >
          <ILucidePlus className="h-3 w-3" />
          add property
        </Button>
      </div>
    </div>
  )
}

// ─── JSON Preview Panel ───────────────────────────────────────────────────────
interface PreviewPanelProperties {
  state: JsonBuilderState
}

function PreviewPanel({ state }: PreviewPanelProperties) {
  const [copied, setCopied] = useState(false)
  const [compact, setCompact] = useState(false)
  const jsonString = JSON.stringify(buildJsonOutput(state), null, compact ? 0 : 2)

  const handleILucideCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <div
      data-ocid="preview.panel"
      className="terminal-bg flex h-full flex-col overflow-hidden rounded-lg border border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ILucideFileJson className="h-3.5 w-3.5 text-primary-light/70" />
          <span className="font-mono text-xs font-medium text-muted-foreground">JSON Preview</span>
          <span className="font-mono text-xs text-muted-foreground/40">
            {state.length} object{state.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Format toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-ocid="preview.toggle"
                variant="ghost"
                size="icon"
                onClick={() => setCompact((c) => !c)}
                className="h-7 w-7 text-muted-foreground/60 hover:text-primary-light"
              >
                {compact ? (
                  <ILucideAlignLeft className="h-3.5 w-3.5" />
                ) : (
                  <ILucideMinimize2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              {compact ? 'Switch to pretty-print' : 'Switch to compact'}
            </TooltipContent>
          </Tooltip>

          {/* ILucideCopy */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleILucideCopy}
                className="h-7 w-7 text-muted-foreground/60 hover:text-primary-light"
              >
                {copied ? (
                  <ILucideCheck className="h-3.5 w-3.5 text-primary-light" />
                ) : (
                  <ILucideCopy className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              ILucideCopy JSON
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Code */}
      <div className="h-full overflow-y-scroll">
        <JsonHighlight
          json={jsonString}
          className="m-0 min-h-full p-4 font-mono text-xs leading-relaxed text-foreground/90"
        />
      </div>

      {/* Footer stats */}
      <div className="flex gap-4 border-t border-border/40 bg-muted/10 px-4 py-1.5">
        <span className="font-mono text-xs text-muted-foreground/50">
          {jsonString.length} chars
        </span>
        <span className="font-mono text-xs text-muted-foreground/50">
          {compact ? '1 line' : `${jsonString.split('\n').length} lines`}
        </span>
      </div>
    </div>
  )
}

// ─── Save Dataset Dialog ──────────────────────────────────────────────────────
interface SaveDatasetDialogProperties {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: JsonBuilderState
}

function SaveDatasetDialog({ open, onOpenChange, state }: SaveDatasetDialogProperties) {
  const [name, setName] = useState('')
  const { mutateAsync: saveDataset, isPending } = useSaveDataset()

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a dataset name')
      return
    }
    try {
      const jsonString = JSON.stringify(buildJsonOutput(state), null, 2)
      await saveDataset({ name: name.trim(), json: jsonString })
      toast.success(`Dataset "${name}" saved`)
      setName('')
      onOpenChange(false)
    } catch {
      toast.error('Failed to save dataset')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="save_dataset.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">Save Dataset</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Save the current JSON structure with a name for later retrieval.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input
            data-ocid="save_dataset.input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="dataset-name"
            className="font-mono text-sm"
            onKeyDown={(event) => event.key === 'Enter' && handleSave()}
            autoFocus
          />
        </div>
        <DialogFooter className="gap-2">
          <Button
            data-ocid="save_dataset.cancel_button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            data-ocid="save_dataset.submit_button"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="font-mono text-xs"
          >
            {isPending ? (
              <ILucideLoader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <ILucideSave className="mr-1 h-3 w-3" />
            )}
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Saved Datasets Sheet ─────────────────────────────────────────────────────
interface SavedDatasetsSheetProperties {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoad: (state: JsonBuilderState) => void
}

function SavedDatasetsSheet({ open, onOpenChange, onLoad }: SavedDatasetsSheetProperties) {
  const { data: datasets = [], isLoading } = useGetAllDatasets()
  const { mutateAsync: deleteDataset } = useDeleteDataset()

  const handleLoad = (json: string) => {
    try {
      const parsed = JSON.parse(json)
      const state = importFromJson(parsed)
      onLoad(state)
      onOpenChange(false)
      toast.success('Dataset loaded')
    } catch {
      toast.error('Failed to parse dataset JSON')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    try {
      await deleteDataset(id)
      toast.success(`Deleted "${name}"`)
    } catch {
      toast.error('Failed to delete dataset')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-ocid="saved_datasets.sheet"
        side="right"
        className="flex w-full flex-col sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="font-mono text-sm">Saved Datasets</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Load or delete previously saved datasets.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <ILucideLoader2 className="mr-2 h-5 w-5 animate-spin" />
              <span className="font-mono text-xs">Loading...</span>
            </div>
          ) : datasets.length === 0 ? (
            <div
              data-ocid="saved_datasets.empty_state"
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <ILucideFolderOpen className="mb-3 h-8 w-8 text-muted-foreground/30" />
              <p className="font-mono text-sm text-muted-foreground/60">No saved datasets</p>
              <p className="mt-1 text-xs text-muted-foreground/40">
                Save a dataset from the toolbar to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {datasets.map((dataset, index) => (
                <div
                  key={dataset.id}
                  data-ocid={`saved_datasets.item.${index + 1}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm text-foreground">{dataset.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground/60">
                      {formatDate(dataset.created)}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-1.5">
                    <Button
                      data-ocid={`saved_datasets.load_button.${index + 1}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoad(dataset.json)}
                      className="h-7 font-mono text-xs"
                    >
                      Load
                    </Button>
                    <Button
                      data-ocid={`saved_datasets.delete_button.${index + 1}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(dataset.id, dataset.name)}
                      className="h-7 w-7 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <ILucideTrash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            //{' '}
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState<JsonBuilderState>(SAMPLE_STATE)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [savedDatasetsOpen, setSavedDatasetsOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const fileInputReference = useRef<HTMLInputElement>(null)
  const editorBottomReference = useRef<HTMLDivElement>(null)

  const { handleDragStart, handleDragEnter, handleDragEnd } = useDragReorder(state, (newItems) =>
    setState(newItems),
  )

  const onDragStart = (index: number) => {
    setDraggingIndex(index)
    handleDragStart(index)
  }

  const onDragEnter = (index: number) => {
    handleDragEnter(index)
  }

  const onDragEnd = () => {
    setDraggingIndex(null)
    handleDragEnd()
  }

  const addObject = () => {
    const newObject: JsonObject = {
      id: generateId(),
      properties: [{ id: generateId(), key: '', value: '', type: 'string' }],
    }
    setState((previous) => [...previous, newObject])
    setTimeout(() => {
      editorBottomReference.current?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }

  const updateObject = (id: string, updated: JsonObject) => {
    setState((previous) => previous.map((o) => (o.id === id ? updated : o)))
  }

  const deleteObject = (id: string) => {
    setState((previous) => previous.filter((o) => o.id !== id))
  }

  const handleImport = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const newState = importFromJson(parsed)

      if (newState.length === 0) {
        toast.error('No valid objects found in JSON file')
        return
      }

      setState(newState)
      toast.success(`Imported ${newState.length} object${newState.length > 1 ? 's' : ''}`)
    } catch {
      toast.error('Invalid JSON file')
    }

    event.target.value = ''
  }, [])

  const handleExport = useCallback(() => {
    const output = buildJsonOutput(state)
    const jsonString = JSON.stringify(output, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-export-${Date.now()}.json`
    document.body.append(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success('JSON exported')
  }, [state])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModule = event.ctrlKey || event.metaKey
      if (!isModule) return
      switch (event.key) {
        case 'e':
        case 'E': {
          event.preventDefault()
          handleExport()

          break
        }
        case 's':
        case 'S': {
          event.preventDefault()
          setSaveDialogOpen(true)

          break
        }
        case 'i':
        case 'I': {
          event.preventDefault()
          fileInputReference.current?.click()

          break
        }
        // No default
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleExport])

  const editorContent = (
    <div className="flex h-full flex-col">
      <div className="space-y-3 p-4">
        {state.length === 0 ? (
          <div
            data-ocid="editor.empty_state"
            className="flex flex-col items-center justify-center px-6 py-16 text-center"
          >
            {/* Terminal prompt art */}
            <div className="mb-6 w-full max-w-64 text-left font-mono text-xs leading-relaxed select-none">
              <div className="mb-1 text-muted-foreground/25">
                <span className="text-code-punctuation/50">{'// '}</span>
                <span>json-data-builder v1.0</span>
              </div>
              <div className="mb-3 text-muted-foreground/20">
                <span className="text-code-punctuation/40">{'─'.repeat(30)}</span>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="text-primary-light/60">{'>'}</span>
                  <span className="ml-2 text-muted-foreground/40">workspace</span>
                  <span className="ml-1 text-code-string/50">empty</span>
                </div>
                <div>
                  <span className="text-primary-light/60">{'>'}</span>
                  <span className="ml-2 text-muted-foreground/35">objects</span>
                  <span className="ml-1 text-code-number/50">0</span>
                </div>
                <div className="flex items-center gap-0">
                  <span className="text-primary-light/70">{'$'}</span>
                  <span className="ml-2 text-muted-foreground/50">add-object</span>
                  <span className="ml-1 animate-blink text-primary-light/60">▌</span>
                </div>
              </div>
            </div>
            <Button onClick={addObject} size="sm" className="h-8 gap-1.5 font-mono text-xs">
              <ILucidePlus className="h-3.5 w-3.5" />
              New Object
            </Button>
            <p className="mt-3 font-mono text-xs text-muted-foreground/35">
              or import a{' '}
              <button
                type="button"
                onClick={() => fileInputReference.current?.click()}
                className="cursor-pointer text-primary-light/50 underline underline-offset-2 transition-colors hover:text-primary-light/80"
              >
                .json file
              </button>
            </p>
          </div>
        ) : (
          state.map((object, index) => (
            <ObjectCard
              key={object.id}
              obj={object}
              index={index}
              onUpdate={(updated) => updateObject(object.id, updated)}
              onDelete={() => deleteObject(object.id)}
              onDragStart={onDragStart}
              onDragEnter={onDragEnter}
              onDragEnd={onDragEnd}
              isDragging={draggingIndex === index}
            />
          ))
        )}
        {/* Scroll sentinel */}
        <div ref={editorBottomReference} />
      </div>

      {/* Add Object button */}
      {state.length > 0 && (
        <div className="border-t border-border/50 bg-background/50 p-4">
          <Button
            data-ocid="editor.primary_button"
            variant="outline"
            onClick={addObject}
            className="h-8 w-full gap-2 border-dashed border-border font-mono text-xs hover:border-primary-light/60 hover:bg-primary-light/5 hover:text-primary-light"
          >
            <ILucidePlus className="h-3.5 w-3.5" />
            Add Object
          </Button>
        </div>
      )}
    </div>
  )

  const previewContent = <PreviewPanel state={state} />
  const propertiesCount = state.reduce(
    (accumulator, object) => accumulator + object.properties.length,
    0,
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Toolbar */}
      <Header
        fileInputReference={fileInputReference}
        handleExport={handleExport}
        handleImport={handleImport}
        setClearDialogOpen={setClearDialogOpen}
        setSavedDatasetsOpen={setSavedDatasetsOpen}
        setSaveDialogOpen={setSaveDialogOpen}
      />

      {/* Main Layout */}
      <main aria-label="JSON editor" className="flex-1 overflow-hidden">
        {/* Desktop: two-column */}
        <div className="hidden h-[calc(100vh-3rem)] gap-0 md:grid md:grid-cols-2">
          {/* Editor panel */}
          <div className="flex flex-col overflow-hidden border-r border-border/50">
            <div className="flex items-center gap-2 border-b border-border/40 bg-muted/10 px-4 py-2">
              <span className="font-mono text-xs font-medium text-muted-foreground/70">EDITOR</span>
              <span className="font-mono text-xs text-muted-foreground/40">
                {state.length} object{state.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex-1 overflow-y-scroll">{editorContent}</div>
          </div>

          {/* Preview panel */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/40 bg-muted/10 px-4 py-2">
              <span className="font-mono text-xs font-medium text-muted-foreground/70">
                PREVIEW
              </span>
            </div>
            <div className="flex-1 overflow-hidden p-3">{previewContent}</div>
          </div>
        </div>

        {/* Mobile: tabs */}
        <div className="h-[calc(100vh-3rem)] md:hidden">
          <Tabs defaultValue="builder" className="flex h-full flex-col">
            <div className="border-b border-border/50 px-4 py-1">
              <TabsList className="h-8 bg-muted/30 font-mono text-xs">
                <TabsTrigger
                  value="builder"
                  className="h-6 px-3 font-mono text-xs"
                  data-ocid="editor.tab"
                >
                  Builder
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="h-6 px-3 font-mono text-xs"
                  data-ocid="preview.tab"
                >
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="builder"
              className="m-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
            >
              <div className="overflow-y-scroll">{editorContent}</div>
            </TabsContent>
            <TabsContent
              value="preview"
              className="m-0 flex-1 overflow-hidden p-3 data-[state=active]:flex data-[state=active]:flex-col"
            >
              {previewContent}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <Footer propsCount={propertiesCount} />

      {/* ── Dialogs ──────────────────────────────────────────────────── */}
      <SaveDatasetDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen} state={state} />
      <SavedDatasetsSheet
        open={savedDatasetsOpen}
        onOpenChange={setSavedDatasetsOpen}
        onLoad={(newState) => setState(newState)}
      />

      {/* Clear All confirmation */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent data-ocid="clear_all.dialog" className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm">Clear all objects?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to clear all objects? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel data-ocid="clear_all.cancel_button" className="font-mono text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="clear_all.confirm_button"
              onClick={() => {
                setState([])
                toast.success('All objects cleared')
              }}
              className="text-destructive-foreground bg-destructive font-mono text-xs hover:bg-destructive/90"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'font-mono text-xs',
        }}
      />
    </div>
  )
}
