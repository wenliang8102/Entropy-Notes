import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'


// 防抖函数
function debounce(func, delay) {
    let timeout
    return function (...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), delay)
    }
}

export const useNotesStore = defineStore('notes', () => {

    // 尝试从 localStorage 加载初始状态，如果没有则使用默认的空数组
    const notes = ref(JSON.parse(localStorage.getItem('entropy-notes-list') || '[]'))
    const activeNoteId = ref(localStorage.getItem('entropy-active-note-id') || null)


    // 获取当前激活的笔记对象
    const activeNote = computed(() => {
        if (!activeNoteId.value) return null
        return notes.value.find(note => note.id === activeNoteId.value) || null
    })


    // 创建一个新笔记
    function createNote() {
        // 生成自动编号的标题
        const generateTitle = () => {
            const baseTitle = '未命名笔记'
            let counter = 1
            let title = `${baseTitle}${counter}`

            // 检查是否存在相同标题的笔记，如果存在则递增编号
            while (notes.value.some(note => note.title === title)) {
                counter++
                title = `${baseTitle}${counter}`
            }

            return title
        }

        const newNote = {
            id: `note_${Date.now()}`,
            title: generateTitle(),
            content: '', // TipTap 的内容可以是 JSON 或 HTML
            createdAt: Date.now(),
            lastModified: Date.now(),
        }
        // 将新笔记添加到列表开头
        notes.value.unshift(newNote)
        // 将新创建的笔记设置为当前激活的笔记
        setActiveNote(newNote.id)
    }

    // 设置当前激活的笔记
    function setActiveNote(id) {
        activeNoteId.value = id
    }

    // 更新当前激活笔记的标题和内容
    function updateActiveNote(payload) {
        if (!activeNote.value) return

        if (payload.title !== undefined) {
            activeNote.value.title = payload.title
        }
        if (payload.content !== undefined) {
            // TipTap 编辑器的内容推荐存储为 JSON 格式
            activeNote.value.content = payload.content
        }
        activeNote.value.lastModified = Date.now()
    }

    // 删除一个笔记
    function deleteNote(id) {
        const index = notes.value.findIndex(note => note.id === id)
        if (index > -1) {
            // 如果删除的是当前激活的笔记，需要切换到另一篇笔记
            if (activeNoteId.value === id) {
                // 优先切换到下一篇，如果没有下一篇则切换到上一篇
                const newActiveNote = notes.value[index + 1] || notes.value[index - 1]
                activeNoteId.value = newActiveNote ? newActiveNote.id : null
            }
            notes.value.splice(index, 1)
        }
    }


    // 使用 watch 来监听 state 的变化，并自动保存到 localStorage
    const saveStateToLocalStorage = debounce(() => {
        localStorage.setItem('entropy-notes-list', JSON.stringify(notes.value))
        if (activeNoteId.value) {
            localStorage.setItem('entropy-active-note-id', activeNoteId.value)
        } else {
            localStorage.removeItem('entropy-active-note-id')
        }
        console.log('Notes state saved to localStorage.')
    }, 500)


    watch(notes, saveStateToLocalStorage, { deep: true })

    watch(activeNoteId, saveStateToLocalStorage)


    return {
        notes,
        activeNoteId,
        activeNote,
        createNote,
        setActiveNote,
        updateActiveNote,
        deleteNote,
    }
})