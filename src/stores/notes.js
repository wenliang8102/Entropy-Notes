import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { notesApi } from '@/services/api'

// 防抖
function debounce(func, delay) {
    let timeout
    return function (...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), delay)
    }
}

// 统一格式化
function normalizeNote(n) {
    if (!n) return null
    const id = n.id || n._id
    const createdAt = n.createdAt
    const updatedAt = n.updatedAt
    return {
        id,
        title: n.title ?? '无标题笔记',
        content: n.content ?? null,
        createdAt,
        updatedAt,
        lastModified: updatedAt || Date.now(),
    }
}

export const useNotesStore = defineStore('notes', () => {
    // 使用本地缓存做弱离线
    const notes = ref(JSON.parse(localStorage.getItem('entropy-notes-list') || '[]'))
    const activeNoteId = ref(localStorage.getItem('entropy-active-note-id') || null)

    const activeNote = computed(() => {
        if (!activeNoteId.value) return null
        return notes.value.find(n => n.id === activeNoteId.value) || null
    })

    // 进入 Notebook 拉取全部笔记
    async function fetchNotes() {
        try {
            const { data } = await notesApi.getAll()
            const list = Array.isArray(data) ? data.map(normalizeNote) : []
            notes.value = list
            if (activeNoteId.value && !notes.value.some(n => n.id === activeNoteId.value)) {
                activeNoteId.value = notes.value[0]?.id || null
            }
        } catch (e) {
            console.error('Fetch notes failed:', e?.response?.data?.message || e.message)
            // 失败时保留本地缓存，弱离线可继续编辑
        }
    }

    // 新建笔记
    async function createNote() {
        try {
            const { data } = await notesApi.create()
            const note = normalizeNote(data)
            if (note) {
                notes.value.unshift(note)
                setActiveNote(note.id)
            }
        } catch (e) {
            alert(e?.response?.data?.message || '创建笔记失败')
            console.error('Create note failed:', e)
        }
    }

    function setActiveNote(id) {
        activeNoteId.value = id
    }

    // 乐观删除，失败回滚
    async function deleteNote(id) {
        const idx = notes.value.findIndex(n => n.id === id)
        if (idx === -1) return
        const backup = notes.value[idx]
        const wasActive = activeNoteId.value === id

        notes.value.splice(idx, 1)
        if (wasActive) {
            activeNoteId.value = notes.value[0]?.id || null
        }

        try {
            await notesApi.delete(id)
        } catch (e) {
            // 回滚
            notes.value.splice(idx, 0, backup)
            if (wasActive) activeNoteId.value = id
            alert(e?.response?.data?.message || '删除失败')
            console.error('Delete note failed:', e)
        }
    }

    // 自动保存（防抖） 并用 lastKnownUpdatedAt 做并发冲突检测
    const debouncedSave = debounce(async () => {
        if (!activeNote.value) return
        const n = activeNote.value
        try {
            const { data } = await notesApi.update(n.id, {
                title: n.title,
                content: n.content,
                lastKnownUpdatedAt: n.updatedAt, // 服务端用 ISO 字符串进行比较
            })
            const saved = normalizeNote(data)
            const idx = notes.value.findIndex(it => it.id === n.id)
            if (idx > -1) notes.value[idx] = saved
        } catch (e) {
            if (e?.response?.status === 409) {
                // 并发冲突：用服务器最新版本覆盖
                const latest = normalizeNote(e.response.data?.latestNote)
                if (latest) {
                    const idx = notes.value.findIndex(it => it.id === n.id)
                    if (idx > -1) notes.value[idx] = latest
                    alert('检测到该笔记在其他设备已更新，已为你刷新为最新版本。')
                } else {
                    alert('检测到并发冲突，但未能获取最新内容。')
                }
            } else if (e?.response?.status === 404) {
                alert('该笔记不存在或已被删除。')
            } else if (e?.response?.status === 401) {
                alert('登录已过期，请重新登录。')
            } else {
                console.error('Save note failed:', e)
            }
        }
    }, 500)

    // 本地更新 + 触发防抖保存
    function updateActiveNote(payload) {
        if (!activeNote.value) return
        if (payload.title !== undefined) activeNote.value.title = payload.title
        if (payload.content !== undefined) activeNote.value.content = payload.content
        // 本地更新时间戳，便于列表实时排序显示
        activeNote.value.lastModified = Date.now()
        debouncedSave()
    }

    // 退出登录时清理（authStore.logout 已调用）
    function clearNotes() {
        notes.value = []
        activeNoteId.value = null
        localStorage.removeItem('entropy-notes-list')
        localStorage.removeItem('entropy-active-note-id')
    }

    // 弱离线缓存
    const saveStateToLocalStorage = debounce(() => {
        localStorage.setItem('entropy-notes-list', JSON.stringify(notes.value))
        if (activeNoteId.value) {
            localStorage.setItem('entropy-active-note-id', activeNoteId.value)
        } else {
            localStorage.removeItem('entropy-active-note-id')
        }
    }, 300)

    watch(notes, saveStateToLocalStorage, { deep: true })
    watch(activeNoteId, saveStateToLocalStorage)

    return {
        notes,
        activeNoteId,
        activeNote,
        fetchNotes,
        createNote,
        setActiveNote,
        updateActiveNote,
        deleteNote,
        clearNotes,
    }
})