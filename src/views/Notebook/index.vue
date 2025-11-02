<script setup>
import Sidebar from './Sidebar.vue'
import NoteArea from './NoteArea.vue'
import { ref, onMounted } from 'vue'
import { useNotesStore } from '@/stores/notes'


const isSidebarCollapsed = ref(false)
const toggleSidebar= ()=> {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}


const notesStore = useNotesStore()
onMounted(() => {
  notesStore.fetchNotes()
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