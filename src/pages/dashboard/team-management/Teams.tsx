import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { TeamDatatable, type TeamFilters } from '@/components/datatable'
import { getTeamList, disbandTeam } from '@/services/team'
import type { TeamVO, TeamListParams } from '@/types/team.types'

export default function Teams() {
  const [teams, setTeams] = useState<TeamVO[]>([])
  const [loading, setLoading] = useState(false)

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  })

  // 筛选条件
  const [filters, setFilters] = useState<TeamFilters>({})

  const fetchTeams = useCallback(async (page = 1, size = 10, currentFilters?: TeamFilters) => {
    setLoading(true)
    try {
      const filtersToUse = currentFilters ?? filters
      const params: TeamListParams = {
        page,
        size,
        ...filtersToUse,
      }
      const response = await getTeamList(params)
      if (response.data.code === 'SUCCESS') {
        const data = response.data.data
        setTeams(data?.records || [])
        setPagination({
          current: data?.current || 1,
          size: data?.size || 10,
          total: data?.total || 0,
          pages: data?.pages || 0,
        })
      } else {
        toast.error(response.data.message || '获取团队列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
      toast.error('获取团队列表失败')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchTeams(1, pagination.size)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page: number) => {
    fetchTeams(page, pagination.size)
  }

  const handleFiltersChange = (newFilters: TeamFilters) => {
    setFilters(newFilters)
    // 筛选条件变化时，回到第一页
    fetchTeams(1, pagination.size, newFilters)
  }

  const handleDisband = async (team: TeamVO) => {
    if (!confirm(`确定要解散团队 "${team.name}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      const response = await disbandTeam(team.id)
      if (response.data.code === 'SUCCESS') {
        toast.success(`团队 "${team.name}" 已解散`)
        fetchTeams(pagination.current, pagination.size)
      } else {
        toast.error(response.data.message || '解散团队失败')
      }
    } catch (error) {
      console.error('Failed to disband team:', error)
      toast.error('解散团队失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card">
        <TeamDatatable
          data={teams}
          loading={loading}
          pagination={pagination}
          filters={filters}
          onPageChange={handlePageChange}
          onFiltersChange={handleFiltersChange}
          onDisband={handleDisband}
          onRefresh={() => fetchTeams(pagination.current, pagination.size)}
        />
      </div>
    </div>
  )
}
