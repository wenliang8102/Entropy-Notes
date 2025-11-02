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
        deletedAt: n.deletedAt || null, // 删除状态，null 表示未删除
        lastModified: updatedAt || Date.now(),
    }
}

export const useNotesStore = defineStore('notes', () => {
    // 使用本地缓存做弱离线
    const notes = ref(JSON.parse(localStorage.getItem('entropy-notes-list') || '[]'))
    const activeNoteId = ref(localStorage.getItem('entropy-active-note-id') || null)
    // 视图模式：'notes' 正常笔记 | 'trash' 回收站
    const viewMode = ref(localStorage.getItem('entropy-view-mode') || 'notes')

    const activeNote = computed(() => {
        if (!activeNoteId.value) return null
        return notes.value.find(n => n.id === activeNoteId.value) || null
    })
    
    // 切换视图模式
    async function setViewMode(mode) {
        viewMode.value = mode
        localStorage.setItem('entropy-view-mode', mode)
        
        // 进入回收站时，清理过期笔记
        if (mode === 'trash') {
            await cleanupExpiredDeletedNotes()
        }
    }

    // 进入 Notebook 拉取全部笔记
    async function fetchNotes() {
        try {
            // 先保存本地已删除笔记的状态（deletedAt）
            const localDeletedMap = new Map()
            notes.value.forEach(n => {
                if (n.deletedAt) {
                    localDeletedMap.set(n.id, n.deletedAt)
                }
            })
            
            const { data } = await notesApi.getAll()
            const list = Array.isArray(data) ? data.map(normalizeNote) : []
            
            // 如果后端返回的笔记在本地有 deletedAt 标记，保留这个标记
            list.forEach(note => {
                if (localDeletedMap.has(note.id)) {
                    note.deletedAt = localDeletedMap.get(note.id)
                }
            })
            
            // 合并本地已删除但后端没有返回的笔记（后端不返回已删除的笔记）
            const localOnlyDeleted = notes.value.filter(n => n.deletedAt && !list.find(l => l.id === n.id))
            
            // 合并所有笔记
            notes.value = [...list, ...localOnlyDeleted]
            
            // 清理超过7天的已删除笔记
            await cleanupExpiredDeletedNotes()
            
            // 更新 activeNoteId
            const currentList = viewMode.value === 'trash' 
                ? notes.value.filter(n => n.deletedAt)
                : notes.value.filter(n => !n.deletedAt)
            if (activeNoteId.value && !currentList.some(n => n.id === activeNoteId.value)) {
                activeNoteId.value = currentList[0]?.id || null
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
                // 将标题设置为"未命名笔记"
                note.title = '未命名笔记'
                
                notes.value.unshift(note)
                setActiveNote(note.id)
                
                // 立即更新后端，保存标题
                try {
                    const { data: updatedData } = await notesApi.update(note.id, {
                        title: '未命名笔记',
                        content: note.content,
                        lastKnownUpdatedAt: note.updatedAt,
                    })
                    // 更新本地笔记数据
                    const updated = normalizeNote(updatedData)
                    const idx = notes.value.findIndex(n => n.id === note.id)
                    if (idx > -1 && updated) {
                        notes.value[idx] = updated
                    }
                } catch (updateError) {
                    // 如果更新失败，不影响使用
                    console.warn('Failed to update note title:', updateError)
                }
            }
        } catch (e) {
            alert(e?.response?.data?.message || '创建笔记失败')
            console.error('Create note failed:', e)
        }
    }

    function setActiveNote(id) {
        activeNoteId.value = id
    }

    // 删除笔记：根据视图模式决定行为
    async function deleteNote(id) {
        const idx = notes.value.findIndex(n => n.id === id)
        if (idx === -1) return
        
        const note = notes.value[idx]
        const wasActive = activeNoteId.value === id

        // 如果在回收站视图且笔记已经有 deletedAt（已被标记为删除），则彻底删除
        if (viewMode.value === 'trash' && note.deletedAt) {
            // 彻底删除：从数组中移除，然后调用后端
            notes.value.splice(idx, 1)
            if (wasActive) {
                const remainingTrash = notes.value.filter(n => n.deletedAt)
                if (remainingTrash.length === 0) {
                    viewMode.value = 'notes'
                    activeNoteId.value = notes.value.find(n => !n.deletedAt)?.id || null
                } else {
                    activeNoteId.value = remainingTrash[0]?.id || null
                }
            }

            try {
                await notesApi.permanentDelete(id)
            } catch (e) {
                // 回滚
                notes.value.splice(idx, 0, note)
                if (wasActive) activeNoteId.value = id
                alert(e?.response?.data?.message || '彻底删除失败')
                console.error('Permanent delete note failed:', e)
            }
        } else {
            // 正常删除：只标记 deletedAt，不调用后端
            const deletedTime = new Date().toISOString()
            const updatedNote = {
                ...note,
                deletedAt: deletedTime
            }
            notes.value[idx] = updatedNote
            
            if (wasActive) {
                const firstNote = notes.value.find(n => !n.deletedAt)
                activeNoteId.value = firstNote?.id || null
            }
        }
    }

    // 恢复笔记：清除删除标记
    function restoreNote(id) {
        const idx = notes.value.findIndex(n => n.id === id)
        if (idx === -1) return
        
        notes.value[idx] = {
            ...notes.value[idx],
            deletedAt: null
        }
        viewMode.value = 'notes'
        activeNoteId.value = id
    }

    // 清理超过7天的已删除笔记
    async function cleanupExpiredDeletedNotes() {
        const now = Date.now()
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000 // 7天的毫秒数
        
        // 找出所有超过7天的已删除笔记
        const expiredNotes = notes.value.filter(n => {
            if (!n.deletedAt) return false
            const deletedTime = new Date(n.deletedAt).getTime()
            return now - deletedTime >= sevenDaysInMs
        })
        
        if (expiredNotes.length === 0) return
        
        // 记录要删除的笔记ID
        const expiredIds = new Set(expiredNotes.map(n => n.id))
        const wasActiveExpired = expiredIds.has(activeNoteId.value)
        
        // 批量删除过期笔记（先删除后端，再删除本地）
        const deletePromises = expiredNotes.map(async (note) => {
            try {
                await notesApi.permanentDelete(note.id)
                // 后端删除成功后，从本地数组中移除
                const idx = notes.value.findIndex(n => n.id === note.id)
                if (idx > -1) {
                    notes.value.splice(idx, 1)
                }
            } catch (e) {
                // 如果后端删除失败，保留笔记（不删除本地数据）
                console.error(`Failed to permanently delete note ${note.id}:`, e)
            }
        })
        
        await Promise.all(deletePromises)
        
        // 如果当前激活的笔记被删除，切换到其他笔记
        if (wasActiveExpired) {
            const currentList = viewMode.value === 'trash' 
                ? notes.value.filter(n => n.deletedAt)
                : notes.value.filter(n => !n.deletedAt)
            activeNoteId.value = currentList[0]?.id || null
            
            // 如果回收站空了，切换回正常视图
            if (viewMode.value === 'trash' && currentList.length === 0) {
                viewMode.value = 'notes'
                activeNoteId.value = notes.value.find(n => !n.deletedAt)?.id || null
            }
        }
    }

    // 自动保存（防抖） 并用 lastKnownUpdatedAt 做并发冲突检测
    const debouncedSave = debounce(async () => {
        if (!activeNote.value) return
        const n = activeNote.value
        
        // 如果笔记已被标记为删除，不保存
        if (n.deletedAt) return
        
        try {
            const { data } = await notesApi.update(n.id, {
                title: n.title,
                content: n.content,
                lastKnownUpdatedAt: n.updatedAt, // 服务端用 ISO 字符串进行比较
            })
            const saved = normalizeNote(data)
            const idx = notes.value.findIndex(it => it.id === n.id)
            if (idx > -1) {
                // 保存时保留本地的 deletedAt 状态（如果存在）
                const existingDeletedAt = notes.value[idx].deletedAt
                notes.value[idx] = saved
                if (existingDeletedAt) {
                    notes.value[idx].deletedAt = existingDeletedAt
                }
            }
        } catch (e) {
            if (e?.response?.status === 409) {
                // 并发冲突：用服务器最新版本覆盖
                const latest = normalizeNote(e.response.data?.latestNote)
                if (latest) {
                    const idx = notes.value.findIndex(it => it.id === n.id)
                    if (idx > -1) {
                        // 保留本地的 deletedAt 状态
                        const existingDeletedAt = notes.value[idx].deletedAt
                        notes.value[idx] = latest
                        if (existingDeletedAt) {
                            notes.value[idx].deletedAt = existingDeletedAt
                        }
                    }
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
        viewMode.value = 'notes'
        localStorage.removeItem('entropy-notes-list')
        localStorage.removeItem('entropy-active-note-id')
        localStorage.removeItem('entropy-view-mode')
    }

    // 弱离线缓存
    const saveStateToLocalStorage = debounce(() => {
        localStorage.setItem('entropy-notes-list', JSON.stringify(notes.value))
        localStorage.setItem('entropy-view-mode', viewMode.value)
        if (activeNoteId.value) {
            localStorage.setItem('entropy-active-note-id', activeNoteId.value)
        } else {
            localStorage.removeItem('entropy-active-note-id')
        }
    }, 300)

    watch(notes, saveStateToLocalStorage, { deep: true })
    watch(activeNoteId, saveStateToLocalStorage)
    watch(viewMode, saveStateToLocalStorage)

    return {
        notes,
        activeNoteId,
        activeNote,
        viewMode,
        fetchNotes,
        createNote,
        setActiveNote,
        updateActiveNote,
        deleteNote,
        restoreNote,
        setViewMode,
        clearNotes,
        cleanupExpiredDeletedNotes,
    }
})