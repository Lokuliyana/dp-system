"use client"

import React, { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { axiosInstance } from '@/lib/axios'
import { toast } from 'sonner'

interface ExportButtonProps {
  endpoint: string
  filename?: string
  variant?: 'outline' | 'default' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  endpoint,
  filename = 'report',
  variant = 'outline',
  size = 'default',
  className = '',
}) => {
  const [loading, setLoading] = useState(false)

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    setLoading(true)
    const toastId = toast.loading(`Preparing ${format.toUpperCase()} export...`)

    try {
      const response = await axiosInstance.get(`${endpoint}?format=${format}`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${filename}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Export completed successfully', { id: toastId })
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed. Please try again.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xlsx')} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Export as Excel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
