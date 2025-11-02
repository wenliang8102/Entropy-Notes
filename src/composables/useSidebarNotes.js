import { computed } from 'vue'

/**
 * @description 格式化时间戳
 * @param {number} timestamp - The timestamp to format.
 * @returns {string} - The formatted time string.
 */
export function formatTimestamp(timestamp) {
    if (!timestamp) return ''
    const noteDate = new Date(timestamp)
    const now = new Date()

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)

    const diffInSeconds = Math.floor((now - noteDate) / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)

    if (diffInSeconds < 60) {
        return '刚刚'
    }
    if (diffInMinutes < 60) {
        return `${diffInMinutes}分钟前`
    }
    if (noteDate >= startOfToday) {
        return `今天 ${noteDate.getHours()}:${String(noteDate.getMinutes()).padStart(2, '0')}`
    }
    if (noteDate >= startOfYesterday) {
        return `昨天 ${noteDate.getHours()}:${String(noteDate.getMinutes()).padStart(2, '0')}`
    }
    return `${noteDate.getFullYear()}/${noteDate.getMonth() + 1}/${noteDate.getDate()}`
}

/**
 * @description 封装用于侧边栏的笔记相关逻辑
 * @param {import('@/stores/notes').useNotesStore} notesStore - Pinia store 实例
 */
export function useSidebarNotes(notesStore) {
    // 根据视图模式获取对应的笔记列表并排序
    const sortedNotes = computed(() => {
        // 根据 viewMode 过滤笔记
        let filtered = [...notesStore.notes]
        if (notesStore.viewMode === 'trash') {
            // 回收站：只显示已删除的笔记（有 deletedAt 字段）
            filtered = filtered.filter(n => n.deletedAt)
            // 回收站按删除时间排序
            return filtered.sort((a, b) => {
                const aTime = a.deletedAt ? new Date(a.deletedAt).getTime() : 0
                const bTime = b.deletedAt ? new Date(b.deletedAt).getTime() : 0
                return bTime - aTime
            })
        } else {
            // 正常视图：只显示未删除的笔记（没有 deletedAt 或 deletedAt 为 null）
            filtered = filtered.filter(n => !n.deletedAt)
            // 正常笔记按修改时间排序
            return filtered.sort((a, b) => b.lastModified - a.lastModified)
        }
    })

    // 处理新建笔记
    function handleCreateNote() {
        notesStore.createNote()
    }

    // 处理选择笔记
    function handleSelectNote(noteId) {
        notesStore.setActiveNote(noteId)
    }

    // 处理删除笔记
    function handleDeleteNote(event, noteId) {
        event.stopPropagation() // 阻止事件冒泡，避免触发选择笔记
        notesStore.deleteNote(noteId)
    }

    return {
        sortedNotes,
        formatTimestamp,
        handleCreateNote,
        handleSelectNote,
        handleDeleteNote,
    }
}