<script setup>
import { defineProps, defineEmits ,computed} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LeftOutlined, RightOutlined ,PlusOutlined, DeleteOutlined} from '@ant-design/icons-vue'
import { useNotesStore } from '@/stores/notes'

const router = useRouter()
const route = useRoute()
const notesStore = useNotesStore()

// 接收父组件传递的 isCollapsed 状态
const props = defineProps({
  isCollapsed: Boolean
})
const emit = defineEmits(['toggle'])

// 格式化时间戳
function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const noteDate = new Date(timestamp)
  const now = new Date()

  const diffInSeconds = Math.floor((now - noteDate) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  } else if (diffInHours < 24 && noteDate.getDate() === now.getDate()) {
    return `今天 ${noteDate.getHours()}:${String(noteDate.getMinutes()).padStart(2, '0')}`
  } else if (diffInDays === 1 && noteDate.getDate() === now.getDate() - 1) {
    return `昨天 ${noteDate.getHours()}:${String(noteDate.getMinutes()).padStart(2, '0')}`
  } else {
    return `${noteDate.getFullYear()}/${noteDate.getMonth() + 1}/${noteDate.getDate()}`
  }
}

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
}

//  处理新建笔记
function handleCreateNote() {
  notesStore.createNote()
}

// 处理删除笔记
function handleDeleteNote(event, note) {
  event.stopPropagation() // 阻止触发点击选择笔记
  notesStore.deleteNote(note.id)
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
        <div class="note-info" v-if="!isCollapsed">
          <span class="note-title">{{ note.title || '无标题笔记' }}</span>
          <span class="note-timestamp">{{ formatTimestamp(note.lastModified) }}</span>
        </div>
        <button
            v-if="!isCollapsed"
            class="delete-btn"
            @click="handleDeleteNote($event, note)"
            title="删除笔记"
        >
          <DeleteOutlined />
        </button>
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
  margin-top: 20px; /* 与“设置”之间预留20px距离 */
}
.new-note-btn {
  width: 100%;
  padding: 8px;
  background: none;
  border: 1px solid transparent;
  color: #1a1a1a;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.2s;
}
.new-note-btn:focus {
  outline: none; /* 清除浏览器默认的焦点边框 */
}
.new-note-btn:hover {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}

/*保留图标，隐藏文字*/
.sidebar.collapsed .new-note-btn span:nth-of-type(2) {
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

/* 自定义滚动条样式 */
.notes-list::-webkit-scrollbar {
  width: 6px;
}

.notes-list::-webkit-scrollbar-track {
  background: transparent;
}

.notes-list::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.note-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 4px; /* 标题和时间戳之间的间距 */
}

.notes-list li .note-timestamp {
  font-size: 12px;
  color: #888;
}

.notes-list li.active .note-timestamp {
  color: #1890ff;
}

.notes-list::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
.notes-list li {
  position: relative;
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
  font-size: 14px;
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

/* 删除按钮样式 */
.delete-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  color: #999;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-width: 20px;
  box-sizing: border-box;
}

.notes-list li:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: transparent;
  color: #666;
}
.delete-btn:focus{
  outline: none;
}
</style>