<script setup>
import { EditorContent } from '@tiptap/vue-3'
import EditorToolbar from './EditorToolbar.vue'
import TocSidebar from './TocSidebar.vue'
import { useNotesStore } from '@/stores/notes'
import { useTiptapEditor } from '@/composables/useTiptapEditor'
import { useNoteTitle } from '@/composables/useNoteTitle'

const notesStore = useNotesStore()


const { editor } = useTiptapEditor(notesStore)
const { handleTitleChange, handleTitleBlur } = useNoteTitle(notesStore)

</script>

<template>
  <div class="note-area" v-if="notesStore.activeNote">
    <!-- 文档标题框 -->
    <div class="title-wrapper">
      <input
          type="text"
          class="document-title-input"
          placeholder="请输入标题"
          :key="notesStore.activeNote.id"
          :value="notesStore.activeNote.title"
          @input="handleTitleChange"
          @blur="handleTitleBlur"
      />
    </div>

    <!-- 传入editor 实例 -->
    <EditorToolbar v-if="editor" :editor="editor" :document-title="notesStore.activeNote.title" />

    <div class="content-row">
      <EditorContent :editor="editor" class="editor" />
      <TocSidebar v-if="editor" :editor="editor" />
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

.document-title-input {
  width: 100%;
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

.editor :deep(.ProseMirror :first-child::before) {
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
</style>