import { computed } from 'vue'

/**
 * @description 回收站相关功能模块
 * @param {import('@/stores/notes').useNotesStore} notesStore - Pinia store 实例
 */
export function useTrash(notesStore) {
    // 获取已删除的笔记列表（按删除时间倒序排序）
    const sortedTrashNotes = computed(() => {
        const trashNotes = notesStore.notes.filter(n => n.deletedAt)
        return [...trashNotes].sort((a, b) => {
            const aTime = a.deletedAt ? new Date(a.deletedAt).getTime() : 0
            const bTime = b.deletedAt ? new Date(b.deletedAt).getTime() : 0
            return bTime - aTime
        })
    })

    // 计算剩余删除天数（7天后自动删除）
    function getDaysUntilPermanentDelete(deletedAt) {
        if (!deletedAt) return null
        
        const now = Date.now()
        const deletedTime = new Date(deletedAt).getTime()
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
        const elapsed = now - deletedTime
        const remaining = sevenDaysInMs - elapsed
        
        if (remaining <= 0) {
            return { days: 0, hours: 0, expired: true }
        }
        
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
        
        return { days, hours, expired: false }
    }

    // 格式化剩余时间显示
    function formatRemainingTime(deletedAt) {
        const timeInfo = getDaysUntilPermanentDelete(deletedAt)
        if (!timeInfo) return '未知'
        
        if (timeInfo.expired) {
            return '已过期'
        }
        
        if (timeInfo.days > 0) {
            return timeInfo.hours > 0 
                ? `剩余 ${timeInfo.days} 天 ${timeInfo.hours} 小时`
                : `剩余 ${timeInfo.days} 天`
        } else {
            return `剩余 ${timeInfo.hours} 小时`
        }
    }

    // 获取剩余时间的样式类（根据剩余天数返回不同颜色）
    function getExpiryClass(deletedAt) {
        const timeInfo = getDaysUntilPermanentDelete(deletedAt)
        if (!timeInfo || timeInfo.expired) return 'expired'
        
        if (timeInfo.days <= 1) return 'urgent' // 1天以内：紧急（红色）
        if (timeInfo.days <= 3) return 'warning' // 3天以内：警告（橙色）
        return 'normal' // 3天以上：正常（灰色）
    }

    // 处理回收站菜单切换
    function toggleTrashView() {
        if (notesStore.viewMode === 'trash') {
            notesStore.setViewMode('notes')
        } else {
            notesStore.setViewMode('trash')
        }
    }

    // 检查是否在回收站视图
    const isTrashView = computed(() => notesStore.viewMode === 'trash')

    // 获取列表标题（回收站或全部笔记）
    const listHeader = computed(() => {
        return notesStore.viewMode === 'trash' ? '回收站' : '全部笔记'
    })

    return {
        sortedTrashNotes,
        getDaysUntilPermanentDelete,
        formatRemainingTime,
        getExpiryClass,
        toggleTrashView,
        isTrashView,
        listHeader,
    }
}

