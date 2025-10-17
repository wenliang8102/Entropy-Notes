<script setup>
import { onBeforeUnmount, ref } from 'vue'
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
import { Markdown } from 'tiptap-markdown'
import {FontFamily, TextStyle} from '@tiptap/extension-text-style'
import { FontSize } from '../../extensions/FontSize'
import { CustomItalic } from '../../extensions/CustomItalic.js'
import Image from '@tiptap/extension-image'

//保存标题信息
const documentTitle = ref('')
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
})

onBeforeUnmount(() => {
  editor?.value?.destroy()
})

</script>

<template>
  <div class="note-area">
    <!-- 文档标题框 -->
    <div class="title-wrapper">
      <input
          type="text"
          class="document-title-input"
          placeholder="请输入标题"
          v-model="documentTitle"
      />
    </div>

    <!-- 传入editor 实例 -->
    <EditorToolbar v-if="editor" :editor="editor" :document-title="documentTitle" />

    <EditorContent :editor="editor" class="editor" />
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
</style>