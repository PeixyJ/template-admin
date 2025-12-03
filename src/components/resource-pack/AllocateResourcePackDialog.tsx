import { useState, useCallback, useRef, useEffect } from 'react'
import { Loader2Icon, SearchIcon, CheckIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'

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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NumberInput } from '@/components/ui/number-input'
import { Badge } from '@/components/ui/badge'

import { allocateResourcePack } from '@/services/subscription'
import { getTeamList } from '@/services/team'
import type { AdminPackVO, AllocatePackDTO } from '@/types/subscription.types'
import type { TeamVO } from '@/types/team.types'
import { cn } from '@/lib/utils'

interface AllocateResourcePackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pack: AdminPackVO | null
  onSuccess: () => void
}

export function AllocateResourcePackDialog({
  open,
  onOpenChange,
  pack,
  onSuccess,
}: AllocateResourcePackDialogProps) {
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [teams, setTeams] = useState<TeamVO[]>([])
  const [teamsLoading, setTeamsLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<{
    teamId: number | null
    teamName: string
    quantity: number
    remark: string
  }>({
    teamId: null,
    teamName: '',
    quantity: 1,
    remark: '',
  })

  const resetForm = () => {
    setFormData({
      teamId: null,
      teamName: '',
      quantity: 1,
      remark: '',
    })
    setSearchValue('')
    setTeams([])
    setShowDropdown(false)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchTeams = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setTeams([])
      return
    }

    setTeamsLoading(true)
    try {
      const res = await getTeamList({
        pageNum: 1,
        pageSize: 20,
        name: keyword,
      })
      if (res.data.code === 'SUCCESS') {
        setTeams(res.data.data?.records || [])
      }
    } catch (error) {
      console.error('Search teams error:', error)
    } finally {
      setTeamsLoading(false)
    }
  }, [])

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchTeams(value)
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    setShowDropdown(true)
    // Clear selection if user modifies the input
    if (formData.teamId) {
      setFormData((prev) => ({ ...prev, teamId: null, teamName: '' }))
    }
    debouncedSearch(value)
  }

  const handleSelectTeam = (team: TeamVO) => {
    setFormData((prev) => ({
      ...prev,
      teamId: team.id,
      teamName: team.name,
    }))
    setSearchValue(team.name)
    setShowDropdown(false)
    setTeams([])
  }

  const handleClearSelection = () => {
    setFormData((prev) => ({ ...prev, teamId: null, teamName: '' }))
    setSearchValue('')
    setTeams([])
    inputRef.current?.focus()
  }

  const handleSubmit = async () => {
    if (!pack) return

    if (!formData.teamId) {
      toast.error('请选择团队')
      return
    }
    if (formData.quantity <= 0) {
      toast.error('分配数量必须大于0')
      return
    }

    setLoading(true)
    try {
      const data: AllocatePackDTO = {
        teamId: formData.teamId,
        quantity: formData.quantity,
        remark: formData.remark.trim() || undefined,
      }

      const res = await allocateResourcePack(pack.id, data)

      if (res.data.code === 'SUCCESS') {
        toast.success(`已成功向 "${formData.teamName}" 分配 ${formData.quantity} 个扩容包`)
        handleClose(false)
        onSuccess()
      } else {
        toast.error(res.data.message || '分配失败')
      }
    } catch (error) {
      console.error('Allocate resource pack error:', error)
      toast.error('分配失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分配扩容包</DialogTitle>
          <DialogDescription>
            将扩容包 <span className="font-medium text-foreground">{pack?.packName}</span> 分配给指定团队
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* 扩容包信息 */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">资源类型</span>
              <Badge variant="outline">{pack?.resourceTypeDesc}</Badge>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">资源数量</span>
              <span className="font-medium">
                {pack?.resourceAmount} {pack?.resourceUnit}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">时效类型</span>
              <Badge variant={pack?.durationType === 'PERMANENT' ? 'default' : 'secondary'}>
                {pack?.durationTypeDesc}
                {pack?.durationType === 'TEMPORARY' && pack?.durationDays && ` (${pack.durationDays}天)`}
              </Badge>
            </div>
          </div>

          {/* 团队选择 */}
          <div className="flex flex-col gap-2">
            <Label>
              选择团队 <span className="text-destructive">*</span>
            </Label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="输入团队名称搜索..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => searchValue && setShowDropdown(true)}
                  className={cn(
                    'pl-9',
                    formData.teamId && 'pr-8 border-green-500 focus-visible:ring-green-500'
                  )}
                />
                {formData.teamId ? (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="size-4" />
                  </button>
                ) : teamsLoading ? (
                  <Loader2Icon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                ) : null}
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                  {teamsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      {searchValue ? '未找到匹配的团队' : '请输入关键词搜索'}
                    </div>
                  ) : (
                    <ul className="max-h-[200px] overflow-auto py-1">
                      {teams.map((team) => (
                        <li
                          key={team.id}
                          className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-accent"
                          onClick={() => handleSelectTeam(team)}
                        >
                          <div className="flex flex-1 flex-col gap-0.5">
                            <span className="font-medium">{team.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {team.id} | 所有者: {team.ownerNickname || '未知'}
                            </span>
                          </div>
                          {formData.teamId === team.id && (
                            <CheckIcon className="size-4 text-green-500" />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {formData.teamId && (
              <p className="text-xs text-green-600">
                已选择: {formData.teamName} (ID: {formData.teamId})
              </p>
            )}
          </div>

          {/* 分配数量 */}
          <div className="flex flex-col gap-2">
            <Label>
              分配数量 <span className="text-destructive">*</span>
            </Label>
            <NumberInput
              minValue={1}
              value={formData.quantity}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, quantity: value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              分配后团队将获得 {formData.quantity * (pack?.resourceAmount || 0)} {pack?.resourceUnit}
            </p>
          </div>

          {/* 备注 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="remark">备注</Label>
            <Textarea
              id="remark"
              placeholder="分配原因或备注（可选）"
              value={formData.remark}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, remark: e.target.value }))
              }
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            确认分配
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
