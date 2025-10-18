<script setup>
import {onBeforeUnmount, ref, watch} from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import TextAlign from '@tiptap/extension-text-align'
import LineHeight from 'tiptap-extension-line-height'
import Highlight from '@tiptap/extension-highlight'
import { FontColor } from '../../extensions/FontColor'
import EditorToolbar from './EditorToolbar.vue'
import TocSidebar from './TocSidebar.vue'
import { Markdown } from 'tiptap-markdown'
import {FontFamily, TextStyle} from '@tiptap/extension-text-style'
import { FontSize } from '../../extensions/FontSize'
import { CustomItalic } from '../../extensions/CustomItalic.js'
import Image from '@tiptap/extension-image'
import { useNotesStore } from '@/stores/notes'


//保存标题信息
const notesStore = useNotesStore()
// 初始化编辑器
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      history: true,
      italic: false,
    }),
    Placeholder.configure({
      placeholder: '开始编辑...',
    }),
    Underline,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    LineHeight,
    Highlight.configure({
      multicolor: true,
    }),
    FontColor,
    TextStyle,
    FontSize,
    FontFamily.configure({
      types: ['textStyle'],
    }),
    Markdown.configure({
      html: false,
      tightLists: true,
      linkify: true,
      breaks: true,
    }),
    CustomItalic,
    Image,
  ],
  content: '',
  autofocus: 'end',
  onUpdate: ({ editor }) => {
    notesStore.updateActiveNote({
      content: editor.getJSON(), // 保存为 JSON
    })
  },
})

//  监听 store 中 activeNote 的变化
watch(() => notesStore.activeNote, (newActiveNote, oldActiveNote) => {
  if (!editor.value) return

  // 如果新旧笔记是同一个，则不重新加载，避免光标跳动
  if (newActiveNote && oldActiveNote && newActiveNote.id === oldActiveNote.id) {
    return
  }

  if (newActiveNote) {
    // 切换到新笔记，更新编辑器的标题和内容
    const newContent = newActiveNote.content || ''

    // 使用 setContent 会重置光标位置
    editor.value.commands.setContent(newContent, false)
  } else {
    // 没有激活的笔记（例如所有笔记都被删除了）
    editor.value.commands.clearContent()
  }
}, {
  immediate: true // 立即执行一次，以便在组件加载时设置初始内容
})

//  监听标题输入框的变化，并通知 store
const handleTitleChange = (event) => {
  notesStore.updateActiveNote({ title: event.target.value })
}


onBeforeUnmount(() => {
  editor?.value?.destroy()
})

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
      />
    </div>

    <!-- 传入editor 实例 -->
    <EditorToolbar v-if="editor" :editor="editor" :document-title="notesStore.activeNote.title" />

    <div class="content-row">
      <EditorContent :editor="editor" class="editor" />
      <TocSidebar v-if="editor" :editor="editor" />
    </div>
  </div>
  <!-- 当没有激活笔记时，显示一个提示信息 -->
  <div class="note-area-empty" v-else>
    <div class="empty-content">
      <h2>没有打开的笔记</h2>
      <p>点击左侧 "新建笔记" 来开始吧！</p>
    </div>
  </div>
</template>

<style scoped>
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