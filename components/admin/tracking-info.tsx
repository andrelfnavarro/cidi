"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TrackingInfoProps {
  createdAt?: string
  updatedAt?: string
  createdBy?: { id: string; name: string }
  updatedBy?: { id: string; name: string }
  className?: string
}

export default function TrackingInfo({
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
  className = "",
}: TrackingInfoProps) {
  if (!createdAt && !updatedAt) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch (e) {
      return "Data inválida"
    }
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center text-xs text-gray-500 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-help">
              <InfoIcon className="h-3.5 w-3.5 mr-1" />
              <span>Informações de rastreamento</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-80 p-3">
            <div className="space-y-2">
              {createdAt && (
                <div>
                  <span className="font-medium">Criado em:</span> {formatDate(createdAt)}
                  {createdBy && <span className="block ml-4">por {createdBy.name}</span>}
                </div>
              )}
              {updatedAt && (
                <div>
                  <span className="font-medium">Última atualização:</span> {formatDate(updatedAt)}
                  {updatedBy && <span className="block ml-4">por {updatedBy.name}</span>}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
