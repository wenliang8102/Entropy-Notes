<script setup>
import { EditorContent } from '@tiptap/vue-3'
import EditorToolbar from './EditorToolbar.vue'
import TocSidebar from './TocSidebar.vue'
import { useNotesStore } from '@/stores/notes'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useNoteTitle } from '@/composables/useNoteTitle'
import { computed } from 'vue'
import { analyzeEntropy } from '../../composables/useReadability.js'
import { formatTimestamp } from '@/composables/useSidebarNotes'
import { useTrash } from '@/composables/useTrash'
import { useSettingsView } from '@/composables/useSettingsView'

const notesStore = useNotesStore()

const { editor } = useTiptapEditor(notesStore)
const { handleTitleChange, handleTitleBlur } = useNoteTitle(notesStore)

// 回收站相关功能
const {
  sortedTrashNotes,
  formatRemainingTime,
  getExpiryClass,
  isTrashView,
} = useTrash(notesStore)

// 设置视图：相关UI状态与图标从 useSettingsView 集中提供
const {
  isSettingsView,
  SettingsInlineRow,
} = useSettingsView(notesStore)

const jsonDoc = computed(() => notesStore.activeNote?.content ?? null)

function extractTextFromDoc(node) {
  if (!node) return ''
  if (node.type === 'text' && node.text) return node.text
  if (Array.isArray(node.content)) {
    return node.content.map(child => extractTextFromDoc(child)).join(' ')
  }
  return ''
}

const entropyInfo = computed(() => {
  try {
    const textFromJson = jsonDoc.value ? extractTextFromDoc(jsonDoc.value) : ''
    const fallbackText = editor.value?.getText?.() || ''
    const text = textFromJson && textFromJson.trim() ? textFromJson : fallbackText
    const result = analyzeEntropy(text || '') || {}
    return {
      status: result.status || 'normal',
      progress: Math.round(result.progress ?? 0),
      warningMsg: result.message || ''
    }
  } catch (e) {
    return { status: 'normal', progress: 0, warningMsg: '' }
  }
})

const entropyLevelClass = computed(() => {
  const p = entropyInfo.value.progress || 0
  if (p <= 25) return 'green'
  if (p <= 50) return 'yellow'
  if (p <= 75) return 'orange'
  return 'red'
})

</script>

<template>
  <!-- 回收站视图：显示已删除笔记列表 -->
  <div class="trash-view" v-if="isTrashView">
    <div class="trash-header">
      <h2>回收站</h2>
      <p class="trash-count">共 {{ sortedTrashNotes.length }} 条已删除笔记</p>
    </div>
    <div class="trash-list" v-if="sortedTrashNotes.length > 0">
      <div
        v-for="note in sortedTrashNotes"
        :key="note.id"
        class="trash-item"
        :class="{ active: note.id === notesStore.activeNoteId }"
      >
        <div class="trash-item-content" @click="notesStore.setActiveNote(note.id)">
          <h3 class="trash-item-title">{{ note.title || '无标题笔记' }}</h3>
          <p class="trash-item-meta">
            <span>删除时间：{{ note.deletedAt ? formatTimestamp(new Date(note.deletedAt).getTime()) : '未知' }}</span>
            <span v-if="note.updatedAt">修改时间：{{ formatTimestamp(new Date(note.updatedAt).getTime()) }}</span>
          </p>
          <p class="trash-item-expiry" :class="getExpiryClass(note.deletedAt)">
            {{ formatRemainingTime(note.deletedAt) }}后自动删除
          </p>
        </div>
        <div class="trash-item-actions">
          <button
            class="restore-btn"
            @click.stop="notesStore.restoreNote(note.id)"
            title="恢复笔记"
          >
            恢复
          </button>
          <button
            class="delete-btn"
            @click.stop="notesStore.deleteNote(note.id)"
            title="彻底删除"
          >
            彻底删除
          </button>
        </div>
      </div>
    </div>
    <div class="trash-empty" v-else>
      <p>回收站是空的</p>
    </div>
  </div>

  <!-- 设置视图：由 useSettingsView 暴露的内联组件渲染（减少 NoteArea 代码） -->
  <div v-else-if="isSettingsView" class="settings-view">
    <SettingsInlineRow />
  </div>

  <!-- 正常笔记视图（仅未删除笔记可编辑） -->
  <div class="note-area" v-else-if="notesStore.activeNote && !notesStore.activeNote.deletedAt">
    <!-- 文档标题框 -->
    <div class="title-wrapper">
      <div class="title-row">
      <input
          type="text"
          class="document-title-input"
          placeholder="请输入标题"
            :key="notesStore.activeNote.id"
            :value="notesStore.activeNote.title"
            @input="handleTitleChange"
            @blur="handleTitleBlur"
        />
        <span class="title-divider"></span>
        <div class="readability-inline" title="笔记可读性">
          <div class="rb-progress">
            <div class="rb-progress-bar" :style="{ width: entropyInfo.progress + '%' }"></div>
          </div>
          <span class="rb-dot" :class="entropyLevelClass"></span>
          <div class="readability-warning" v-if="entropyInfo.warningMsg">{{ entropyInfo.warningMsg }}</div>
        </div>
      </div>
    </div>

    <!-- 传入editor 实例 -->
    <EditorToolbar v-if="editor" :editor="editor" :document-title="notesStore.activeNote.title" />

    <div class="content-row">
    <EditorContent :editor="editor" class="editor" />
      <TocSidebar v-if="editor" :editor="editor" />
    </div>
  </div>

  <!-- 已删除但在正常视图：提示不可编辑 -->
  <div class="note-area-empty" v-else-if="notesStore.activeNote && notesStore.activeNote.deletedAt">
    <div class="empty-content">
      <h2>该笔记位于回收站</h2>
      <p>请先恢复该笔记后再进行编辑。</p>
      <button @click="notesStore.restoreNote(notesStore.activeNote.id)" class="restore-btn">恢复笔记</button>
    </div>
  </div>

  <div class="note-area-empty" v-else>
    <div class="empty-content">
      <h2>没有打开的笔记</h2>
      <p>点击左侧 "新建笔记" 来开始吧！</p>
    </div>
  </div>
</template>

<style scoped>
/* 样式保持不变 */
.settings-theme-btn:focus {
  outline: none;
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}
.note-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
}

/* 为标题区域和输入框添加样式 */
.title-wrapper {
  padding: 16px 20px 8px;
  border-bottom: 1px solid #ececec;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.document-title-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 2em;
  font-weight: 600;
  color: #213547;
  box-sizing: border-box;
}

.document-title-input::placeholder {
  color: #adb5bd;
}

/* 中间竖线分隔符 */
.title-divider {
  width: 1px;
  align-self: stretch;
  background: #ececec;
}

/* 右侧可读性纯文字区域 */
.readability-inline {
  color: #6b7280; /* 灰色 */
  font-size: 14px;
  white-space: nowrap;
}
.rb-progress {
  width: 160px;
  height: 8px;
  background: #e5e7eb; /* 灰背景 */
  border-radius: 999px;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}
.rb-progress-bar {
  height: 100%;
  background: #9ca3af; /* 灰色进度 */
  transition: width 0.2s ease;
}
.rb-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 6px;
  vertical-align: middle;
}
.rb-dot.green { background: #22c55e; }
.rb-dot.yellow { background: #eab308; }
.rb-dot.orange { background: #f59e0b; }
.rb-dot.red { background: #ef4444; }
.readability-warning {
  margin-top: 4px;
  font-size: 12px;
  color: #1890ff;
  white-space: normal; /* 允许换行，避免溢出 */
}


.editor {
  flex: 1;
  padding: 16px 20px;
  overflow: auto;
  background: #fff;
  color: #213547;
  min-width: 0;
}

.content-row {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* 去掉黑框 */
.editor :deep(.ProseMirror) {
  text-align: left;
  outline: none;
  height: 100%;
}

.editor :deep(p) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* 添加任务列表和行高的样式 */
.editor :deep(ul[data-type="taskList"]) {
  list-style: none;
  padding: 0;
}
.editor :deep(ul[data-type="taskList"] li) {
  display: flex;
  align-items: center;
}
.editor :deep(ul[data-type="taskList"] li > label) {
  flex: 0 0 auto;
  margin-right: 0.5rem;
  user-select: none;
}
.editor :deep(ul[data-type="taskList"] li > div) {
  flex: 1 1 auto;
}
.editor :deep(ul[data-type="taskList"] li[data-checked="true"] > div > p) {
  text-decoration: line-through;
  color: #adb5bd;
}
.editor :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5em 0;
}

.editor::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度，调窄一点 */
  height: 8px;
}

.editor::-webkit-scrollbar-track {
  background: transparent; /* 滚动条轨道背景，设为透明 */
}

.editor::-webkit-scrollbar-thumb {
  background: #e0e0e0; /* 滚动条滑块颜色，淡灰色 */
  border-radius: 4px; /* 滑块圆角 */
}

.editor::-webkit-scrollbar-thumb:hover {
  background: #cccccc; /* 鼠标悬浮时滑块颜色，稍深一点 */
}

.note-area-empty {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #adb5bd;
  background-color: #fafafa;
}
.empty-content p {
  font-size: 1.2em;
}

/* 回收站视图样式 */
.trash-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  overflow-y: auto;
}

.trash-header {
  padding: 24px 32px;
  border-bottom: 1px solid #ececec;
  background: #fafafa;
}

.trash-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #213547;
}

.trash-count {
  margin: 0;
  font-size: 14px;
  color: #888;
}

.trash-list {
  flex: 1;
  padding: 16px 32px;
  overflow-y: auto;
}

.trash-item {
  position: relative;
  padding: 16px 20px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trash-item:hover {
  border-color: #91d5ff;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.trash-item.active {
  border-color: #1890ff;
  background: #e6f7ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.trash-item-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.trash-item-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #213547;
}

.trash-item-meta {
  margin: 0;
  font-size: 13px;
  color: #888;
  display: flex;
  gap: 16px;
}

.trash-item-expiry {
  margin: 4px 0 0 0;
  font-size: 12px;
  font-weight: 500;
  transition: color 0.2s;
}

.trash-item-expiry.normal {
  color: #888;
}

.trash-item-expiry.warning {
  color: #faad14;
}

.trash-item-expiry.urgent {
  color: #ff4d4f;
}

.trash-item-expiry.expired {
  color: #ff4d4f;
  font-weight: 600;
}

.trash-empty {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #adb5bd;
  font-size: 16px;
}

.trash-item-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
  flex-shrink: 0;
}

.restore-btn,
.delete-btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  white-space: nowrap;
}

.restore-btn {
  color: #52c41a;
  border-color: #52c41a;
}

.restore-btn:hover {
  background: #f6ffed;
  border-color: #73d13d;
  color: #389e0d;
}

.delete-btn {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.delete-btn:hover {
  background: #fff2f0;
  border-color: #ff7875;
  color: #cf1322;
}

.restore-btn:focus,
.delete-btn:focus {
  outline: none;
}
</style>