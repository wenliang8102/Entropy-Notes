<script setup>
import { defineProps, defineEmits ,computed} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LeftOutlined, RightOutlined ,PlusOutlined} from '@ant-design/icons-vue'
import { useNotesStore } from '@/stores/notes'

const router = useRouter()
const route = useRoute()
const notesStore = useNotesStore()

// 接收父组件传递的 isCollapsed 状态
const props = defineProps({
  isCollapsed: Boolean
})
const emit = defineEmits(['toggle'])



// 菜单项数据（可根据实际需求调整/支持多级菜单等）
const menu = [
  { name: 'Home', label: '首页', icon: '🏠' },
  { name: '', label: '标签', icon: '🏷️' },
  { name: '', label: '设置', icon: '⚙️' }
]

// 跳转逻辑
const goRoute=(item)=> {
  if (route.name !== item.name) {
    router.push({ name: item.name })
  }
}

const sortedNotes = computed(() => {
  return [...notesStore.notes].sort((a, b) => b.lastModified - a.lastModified)
})


function handleSelectNote(noteId) {
  notesStore.setActiveNote(noteId)
  notesStore.updateActiveNote({})
}

//  处理新建笔记
function handleCreateNote() {
  notesStore.createNote()
}
</script>

<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <!-- 折叠/展开按钮 -->
    <button class="toggle-btn" @click="emit('toggle')" type="button"> <RightOutlined v-if="isCollapsed" /> <LeftOutlined v-else /> </button>
    <!-- 功能菜单区 -->
    <ul class="menu">
      <li
          v-for="item in menu"
          :key="item.name"
          :class="{ active: route.name === item.name }"
          @click="goRoute(item)"
      >
        <span v-if="item.icon" class="icon">{{ item.icon }}</span>
        <span v-if="!isCollapsed">{{ item.label }}</span>
      </li>
    </ul>
    <!-- 新建笔记按钮 -->
    <div class="new-note-wrapper">
      <button class="new-note-btn" @click="handleCreateNote">
        <PlusOutlined />
        <span v-if="!isCollapsed">新建笔记</span>
      </button>
    </div>
    <!-- 笔记列表区 -->
    <div class="notes-list-header" v-if="!isCollapsed">全部笔记</div>
    <ul class="notes-list">
      <li
          v-for="note in sortedNotes"
          :key="note.id"
          :class="{ active: note.id === notesStore.activeNoteId }"
          @click="handleSelectNote(note.id)"
          :title="note.title"
      >
        <span class="icon">📒</span>
        <span v-if="!isCollapsed" class="note-title">{{ note.title || '无标题笔记' }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sidebar {
  width: 200px;
  transition: width 0.3s;
  background: #f7f7fa;
  border-right: 1px solid #ececec;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.sidebar.collapsed {
  width: 64px;
}

/* 笔记列表样式 */
.new-note-wrapper {
  padding: 8px 16px;
  border-bottom: 1px solid #ececec;
}
.new-note-btn {
  width: 100%;
  padding: 8px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
}
.new-note-btn:hover {
  background: #d9f2ff;
}
.sidebar.collapsed .new-note-btn span {
  display: none;
}

.notes-list-header {
  padding: 16px 20px 8px;
  font-size: 12px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
}


.notes-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto; /* 让笔记列表可以滚动 */
}
.notes-list li {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notes-list li .note-title {
  overflow: hidden;
  text-overflow: ellipsis;
}
.notes-list li.active {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}
.sidebar.collapsed .notes-list li {
  justify-content: center;
  padding: 12px 0;
}
.sidebar.collapsed .notes-list li span:not(.icon) {
  display: none;
}


.toggle-btn {
  align-self: flex-end;
  margin: 8px;
  padding: 2px 8px;
  cursor: pointer;
  outline: none;
}
.menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}
.menu li {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}
.menu li.active {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}
.icon {
  margin-right: 8px;
  font-size: 16px;
}
.sidebar.collapsed .icon {
  margin-right: 0;
  display: block;
  width: 100%;
  text-align: center;
}
.sidebar.collapsed .menu li {
  justify-content: center;
  padding: 12px 0;
}
.sidebar.collapsed .menu li span:not(.icon) {
  display: none;
}
</style>