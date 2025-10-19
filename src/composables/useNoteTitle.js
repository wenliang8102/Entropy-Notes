import { ref, watch } from 'vue'

/**
 * @description 封装笔记标题处理逻辑
 * @param {import('@/stores/notes').useNotesStore} notesStore - Pinia store 实例
 * @returns {{handleTitleChange: (event: Event) => void, handleTitleBlur: (event: Event) => void}}
 */
export function useNoteTitle(notesStore) {
    // 存储原始标题，用于重名时恢复
    const originalTitle = ref('')

    // 监听 activeNote 变化，同步 originalTitle
    watch(() => notesStore.activeNote, (activeNote) => {
        if (activeNote) {
            originalTitle.value = activeNote.title || ''
        }
    }, { immediate: true, deep: true })

    // 监听标题输入框的变化
    const handleTitleChange = (event) => {
        notesStore.updateActiveNote({ title: event.target.value })
    }

    // 监听输入框失去焦点事件，进行重名检查
    const handleTitleBlur = (event) => {
        const newTitle = event.target.value

        // 检查是否与其他笔记重名
        const isDuplicate = notesStore.notes.some(note =>
            note.id !== notesStore.activeNoteId &&
            note.title === newTitle
        )

        if (isDuplicate) {
            // 如果重名，显示提示并恢复原始标题
            alert('标题不能与其他笔记相同，请修改标题')
            notesStore.updateActiveNote({ title: originalTitle.value })
            // 恢复输入框的值并聚焦
            event.target.value = originalTitle.value
            event.target.focus()
            event.target.select()
        } else {
            // 如果不重名，更新原始标题
            originalTitle.value = newTitle
        }
    }

    return {
        handleTitleChange,
        handleTitleBlur,
    }
}