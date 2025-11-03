<script setup>
import { defineProps, defineEmits } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LeftOutlined, RightOutlined ,PlusOutlined, DeleteOutlined, HomeOutlined, SettingOutlined, BookOutlined} from '@ant-design/icons-vue'
import { useNotesStore } from '@/stores/notes'
import { useSidebarNotes } from '@/composables/useSidebarNotes'
import { useTrash } from '@/composables/useTrash'


const props = defineProps({
  isCollapsed: Boolean
})
const emit = defineEmits(['toggle'])

const router = useRouter()
const route = useRoute()

// 静态菜单数据
const menu = [
  { name: 'Home', label: '首页', icon: HomeOutlined },
  { name: '', label: '设置', icon: SettingOutlined },
  { name: '', label: '回收站', icon: DeleteOutlined }
]

const notesStore = useNotesStore()

const {
  sortedNotes,
  formatTimestamp,
  handleCreateNote,
  handleSelectNote,
  handleDeleteNote,
} = useSidebarNotes(notesStore)

// 回收站相关功能
const {
  toggleTrashView,
  isTrashView,
  listHeader,
} = useTrash(notesStore)

const goRoute = (item) => {
  // 如果是回收站，切换视图模式（如果已经在回收站，则切回正常视图）
  if (item.label === '回收站') {
    toggleTrashView()
  } else {
    // 如果从回收站视图点击其他菜单项，切换回正常视图
    if (isTrashView.value) {
      notesStore.setViewMode('notes')
    }
    if (item.name && route.name !== item.name) {
      router.push({ name: item.name })
    }
  }
}

</script>

<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <!-- 折叠/展开按钮 -->
    <button class="toggle-btn" @click="emit('toggle')" type="button">
      <RightOutlined v-if="isCollapsed" />
      <LeftOutlined v-else />
    </button>

    <!-- 功能菜单区 -->
    <ul class="menu">
      <li
          v-for="item in menu"
          :key="item.name || item.label"
          :class="{ active: item.label === '回收站' ? isTrashView : route.name === item.name }"
          @click="goRoute(item)"
      >
        <component :is="item.icon" class="icon" />
        <span v-if="!isCollapsed" class="label">{{ item.label }}</span>
      </li>
    </ul>

    <!-- 新建笔记按钮（回收站视图下不显示） -->
    <div class="new-note-wrapper" v-if="!isTrashView">
      <button class="new-note-btn" @click="handleCreateNote">
        <PlusOutlined />
        <span v-if="!isCollapsed" class="label">新建笔记</span>
      </button>
    </div>

    <!-- 笔记列表区 -->
    <div class="notes-list-header" v-if="!isCollapsed">
      {{ listHeader }}
    </div>
    <ul class="notes-list">
      <li
          v-for="note in sortedNotes"
          :key="note.id"
          :class="{ active: note.id === notesStore.activeNoteId }"
          @click="handleSelectNote(note.id)"
          :title="note.title"
      >
        <BookOutlined class="icon" />
        <div class="note-info" v-if="!isCollapsed">
          <span class="note-title">{{ note.title || '无标题笔记' }}</span>
          <span class="note-timestamp">{{ formatTimestamp(note.lastModified) }}</span>
        </div>
        <button
            v-if="!isCollapsed"
            class="delete-btn"
            @click="handleDeleteNote($event, note.id)"
            title="删除笔记"
        >
          <DeleteOutlined />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* 样式保持不变 */
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
.sidebar.collapsed .new-note-btn span.label {
  display: none;
}

/* 新建笔记按钮文字布局优化 */
.new-note-btn span {
  white-space: nowrap;      /* 强制文字不换行（关键） */
  overflow: hidden;         /* 超出宽度的部分隐藏（避免溢出） */
  text-overflow: ellipsis;  /* 超出部分显示省略号（可选，更美观） */
}

.notes-list-header {
  padding: 16px 20px 8px;
  font-size: 12px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;      /* 强制文字不换行（关键） */
  overflow: hidden;         /* 超出宽度的部分隐藏（避免溢出） */
  text-overflow: ellipsis;  /* 超出部分显示省略号（可选，更美观） */
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
  flex: 1; /* 占据剩余空间 */
  min-width: 0; /* 允许收缩 */
}

.notes-list li .note-timestamp {
  font-size: 12px;
  color: #888;
  white-space: nowrap;      /* 强制文字不换行（关键） */
  overflow: hidden;         /* 超出宽度的部分隐藏（避免溢出） */
  text-overflow: ellipsis;  /* 超出部分显示省略号（可选，更美观） */
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
  white-space: nowrap;      /* 强制文字不换行（关键） */
  flex: 1; /* 占据剩余空间 */
  min-width: 0; /* 允许收缩 */
}
.notes-list li.active {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}

.notes-list li.active .icon {
  color: #1890ff;
}

.notes-list li.active .icon :deep(svg) {
  color: #1890ff;
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

.menu li.active .icon {
  color: #1890ff;
}

.menu li.active .icon :deep(svg) {
  color: #1890ff;
}
.icon {
  margin-right: 8px;
  font-size: 16px;
  color: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon :deep(svg) {
  font-size: 16px;
  color: #1890ff;
}

/* 菜单文字布局优化 */
.menu li span:not(.icon) {
  white-space: nowrap;      /* 强制文字不换行（关键） */
  overflow: hidden;         /* 超出宽度的部分隐藏（避免溢出） */
  text-overflow: ellipsis;  /* 超出部分显示省略号（可选，更美观） */
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