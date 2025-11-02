<script setup>
import Sidebar from './Sidebar.vue'
import NoteArea from './NoteArea.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNotesStore } from '@/stores/notes'


const isSidebarCollapsed = ref(false)
const toggleSidebar= ()=> {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}


const notesStore = useNotesStore()

// 设置定时器，每小时检查一次过期笔记
let cleanupTimer = null

onMounted(() => {
  notesStore.fetchNotes()
  
  // 每小时清理一次过期笔记（7天自动删除）
  cleanupTimer = setInterval(async () => {
    await notesStore.cleanupExpiredDeletedNotes()
  }, 60 * 60 * 1000) // 1小时 = 60分钟 * 60秒 * 1000毫秒
})

onBeforeUnmount(() => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
})
</script>

<template>
  <div class="notebook">
    <Sidebar :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar" class="sidebar"/>
    <NoteArea class="note-area"/>
  </div>
</template>

<style scoped>
.notebook {
  position: fixed;
  inset: 0;
  display: flex;
  overflow: hidden;
}
.sidebar {}
.note-area {
  flex: 1;
  min-width: 0;
}
</style>