import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { TeamDatatable } from '@/components/datatable'
import { getTeamList, disbandTeam } from '@/services/team'
import type { TeamVO, TeamListParams } from '@/types/team.types'

const PAGE_SIZE = 10

export default function Teams() {
  const [teams, setTeams] = useState<TeamVO[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [totalCount, setTotalCount] = useState(0)

  const fetchTeams = useCallback(async (pageIndex: number, pageSize: number) => {
    setLoading(true)
    try {
      const params: TeamListParams = {
        page: pageIndex + 1,
        size: pageSize,
      }
      const response = await getTeamList(params)
      if (response.data.code === 'SUCCESS') {
        setTeams(response.data.data?.records || [])
        setTotalCount(response.data.data?.total || 0)
      } else {
        toast.error(response.data.message || '获取团队列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
      toast.error('获取团队列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeams(pagination.pageIndex, pagination.pageSize)
  }, [fetchTeams, pagination.pageIndex, pagination.pageSize])

  const handleDisband = async (team: TeamVO) => {
    if (!confirm(`确定要解散团队 "${team.name}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      const response = await disbandTeam(team.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`团队 "${team.name}" 已解散`)
        fetchTeams(pagination.pageIndex, pagination.pageSize)
      } else {
        toast.error(response.data.message || '解散团队失败')
      }
    } catch (error) {
      console.error('Failed to disband team:', error)
      toast.error('解散团队失败')
    }
  }

  const handlePaginationChange = (newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(newPagination)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <TeamDatatable
          data={teams}
          loading={loading}
          onDisband={handleDisband}
          pagination={pagination}
          totalCount={totalCount}
          onPaginationChange={handlePaginationChange}
        />
      </div>
    </div>
  )
}
