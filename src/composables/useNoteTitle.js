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

    // 监听输入框失去焦点事件
    const handleTitleBlur = (event) => {
        const newTitle = event.target.value
        // 更新原始标题
        originalTitle.value = newTitle
    }

    return {
        handleTitleChange,
        handleTitleBlur,
    }
}