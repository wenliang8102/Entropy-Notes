import { computed } from 'vue'

/**
 * @description 格式化时间戳
 * @param {number} timestamp - The timestamp to format.
 * @returns {string} - The formatted time string.
 */
function formatTimestamp(timestamp) {
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
    // 按最后修改时间对笔记进行排序
    const sortedNotes = computed(() => {
        // 创建一个笔记数组的副本以避免直接修改 store state
        return [...notesStore.notes].sort((a, b) => b.lastModified - a.lastModified)
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