import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from 'components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'components/ui/dropdown-menu'

type HeaderProperties = {
  fileInputReference: React.RefObject<HTMLInputElement | null>
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleExport: () => void
  setSaveDialogOpen: (open: boolean) => void
  setSavedDatasetsOpen: (open: boolean) => void
  setClearDialogOpen: (open: boolean) => void
}

export function Header({
  fileInputReference,
  handleImport,
  handleExport,
  setSaveDialogOpen,
  setSavedDatasetsOpen,
  setClearDialogOpen,
}: HeaderProperties) {
  return (
    <header
      aria-label="Application toolbar"
      className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-sm"
    >
      <div className="flex h-12 items-center gap-2 px-4">
        {/* Brand */}
        <div className="mr-auto flex items-center gap-2">
          <div className="drop-shadow-glow flex items-center gap-1.5 rounded-lg bg-primary-light/15 p-1 shadow-glow">
            <ILucideBraces className="h-4 w-4 text-primary-light" />
          </div>

          <span className="hidden font-mono text-sm font-semibold tracking-widest text-muted-foreground transition-colors duration-200 select-none hover:text-foreground sm:block">
            JSON Data Builder
            <span className="ml-0.5 animate-blink text-primary-light/70">_</span>
          </span>

          <span className="font-mono text-sm font-semibold tracking-widest text-muted-foreground transition-colors duration-200 select-none hover:text-foreground sm:hidden">
            JSON Builder
            <span className="ml-0.5 animate-blink text-primary-light/70">_</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <input
            ref={fileInputReference}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="hidden"
            aria-label="Import JSON file"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-ocid="toolbar.upload_button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputReference?.current?.click()}
                className="h-8 gap-1.5 font-mono text-xs text-muted-foreground transition-all duration-150 hover:text-foreground"
              >
                <ILucideUpload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Import</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Import JSON file (Ctrl+I)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-ocid="toolbar.primary_button"
                variant="default"
                size="sm"
                onClick={handleExport}
                className="h-8 gap-1.5 font-mono text-xs shadow-sm transition-all duration-150"
              >
                <ILucideDownload className="h-3.5 w-3.5" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Export as .json file (Ctrl+E)</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="toolbar.dropdown_menu"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2 font-mono text-xs text-muted-foreground transition-all duration-150 hover:text-foreground"
                    aria-label="More actions"
                  >
                    <ILucideChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent className="text-xs">More actions</TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="w-44 font-mono text-xs">
              <DropdownMenuItem
                data-ocid="toolbar.save_button"
                onClick={() => setSaveDialogOpen(true)}
                className="cursor-pointer gap-2 text-xs"
              >
                <ILucideSave className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Save dataset</span>
                <span className="ml-auto text-muted-foreground/50">⌘S</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                data-ocid="toolbar.open_modal_button"
                onClick={() => setSavedDatasetsOpen(true)}
                className="cursor-pointer gap-2 text-xs"
              >
                <ILucideFolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Saved datasets</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                data-ocid="toolbar.delete_button"
                onClick={() => setClearDialogOpen(true)}
                className="cursor-pointer gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <ILucideRotateCcw className="h-3.5 w-3.5" />
                <span>Clear all</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
