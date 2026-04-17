import { useState, useCallback } from "react"
import { Upload, X, FileText } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
    onUpload?: (files: File[]) => void
    maxSize?: number // in MB
    accept?: string
}

export function FileUploader({ onUpload, maxSize = 5, accept = "image/*,application/pdf" }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const validateFile = (file: File): boolean => {
        if (file.size > maxSize * 1024 * 1024) {
            toast.error(`${file.name} exceeds ${maxSize}MB`)
            return false
        }
        if (accept && !accept.split(",").some(type => file.type.match(type.trim()))) {
            toast.error(`${file.name} has an unsupported type`)
            return false
        }
        return true
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFiles = Array.from(e.dataTransfer.files)
        const validFiles = droppedFiles.filter(validateFile)
        if (validFiles.length) {
            setFiles(prev => [...prev, ...validFiles])
            // Simulate upload progress
            validFiles.forEach(file => {
                let progress = 0
                const interval = setInterval(() => {
                    progress += 10
                    setUploadProgress(prev => ({ ...prev, [file.name]: progress }))
                    if (progress >= 100) {
                        clearInterval(interval)
                        toast.success(`${file.name} uploaded!`)
                    }
                }, 200)
            })
            onUpload?.(validFiles)
        }
    }, [maxSize, accept, onUpload])

    const removeFile = (name: string) => {
        setFiles(prev => prev.filter(f => f.name !== name))
        setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[name]
            return newProgress
        })
    }

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-border"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm">Drag & drop files here, or click to select</p>
            <p className="text-xs text-muted-foreground">Max size: {maxSize}MB | Accepts: {accept}</p>
            <input
                type="file"
                multiple
                accept={accept}
                className="hidden"
                id="file-input"
                onChange={(e) => {
                    const selected = Array.from(e.target.files || [])
                    const valid = selected.filter(validateFile)
                    if (valid.length) setFiles(prev => [...prev, ...valid])
                }}
            />
            <Button variant="outline" size="sm" className="mt-4" onClick={() => document.getElementById("file-input")?.click()}>
                Select Files
            </Button>

            {files.length > 0 && (
                <div className="mt-4 space-y-2 text-left">
                    {files.map(file => (
                        <div key={file.name} className="flex items-center justify-between bg-surface p-2 rounded">
                            <div className="flex items-center gap-2">
                                <FileText size={16} />
                                <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                                    <Progress value={uploadProgress[file.name]} className="w-20 h-1" />
                                )}
                                <button onClick={() => removeFile(file.name)} className="text-muted-foreground hover:text-destructive">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}