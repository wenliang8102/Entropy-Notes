<script setup>
import Sidebar from './Sidebar.vue'
import NoteArea from './NoteArea.vue'
import {ref} from "vue";

// 控制 Sidebar 折叠/展开
const isSidebarCollapsed = ref(false)
const toggleSidebar= ()=> {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
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
  inset: 0;           /* 等价于 top:0; right:0; bottom:0; left:0; */
  display: flex;
  overflow: hidden;
}

.sidebar {

}


.note-area {
  flex: 1;
  min-width: 0;
}
</style>