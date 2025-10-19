<script setup>
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
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

//静音按钮
const isLoadingContent = ref(false)
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
  onUpdate: ({ editor, transaction }) => {
    // 只有当文档内容真正被用户修改时才触发更新
    if (!isLoadingContent.value) {
      notesStore.updateActiveNote({
        content: editor.getJSON(),
      })
    }
  },
})


//  监听 store 中 activeNote 的变化
watch(() => notesStore.activeNote, (newActiveNote, oldActiveNote) => {
  if (!editor.value) return
  if (newActiveNote && oldActiveNote && newActiveNote.id === oldActiveNote.id) {
    return
  }

  isLoadingContent.value = true

  if (newActiveNote) {
    const newContent = newActiveNote.content || ''
    originalTitle.value = newActiveNote.title || ''

    // 使用 setContent 会重置光标位置
    editor.value.commands.setContent(newContent, false)
  } else {
    // 没有激活的笔记（例如所有笔记都被删除了）
    originalTitle.value = ''
    editor.value.commands.clearContent()
  }
  // 使用nextTick确保在DOM更新之后执行
  import('vue').then(({ nextTick }) => {
    nextTick(() => {
      isLoadingContent.value = false
    })
  })
}, )

onMounted(() => {
  if (notesStore.activeNote && editor.value) {
    isLoadingContent.value = true
    const initialContent = notesStore.activeNote.content || ''
    editor.value.commands.setContent(initialContent, false)
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        isLoadingContent.value = false
      })
    })
  }
})

// 存储原始标题，用于重名时恢复
const originalTitle = ref('')
const titleInputRef = ref(null)

//  监听标题输入框的变化
const handleTitleChange = (event) => {
  notesStore.updateActiveNote({ title: event.target.value })
}

// 监听输入框失去焦点事件，进行重名检查
const handleTitleBlur = (event) => {
  const newTitle = event.target.value
  
  // 检查是否与其他笔记重名
  const isDuplicate = notesStore.notes.some(note => 
    note.id !== notesStore.activeNoteId && 
    note.title === newTitle
  )
  
  if (isDuplicate) {
    // 如果重名，显示提示并恢复原始标题
    alert('标题不能与其他笔记相同，请修改标题')
    notesStore.updateActiveNote({ title: originalTitle.value })
    // 恢复输入框的值
    event.target.value = originalTitle.value
    event.target.focus()
    event.target.select()
  } else {
    // 如果不重名，更新原始标题
    originalTitle.value = newTitle
  }
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
          ref="titleInputRef"
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