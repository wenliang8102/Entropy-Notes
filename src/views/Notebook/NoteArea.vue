<script setup>
import { onBeforeUnmount ,ref} from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import TextAlign from '@tiptap/extension-text-align'
import  LineHeight  from 'tiptap-extension-line-height'
import FontFamily from '@tiptap/extension-font-family'
import { Dropdown, Menu, MenuItem } from 'ant-design-vue'
import {
  DownOutlined, // 下拉箭头图标
  UnorderedListOutlined, // 无序列表图标
  OrderedListOutlined, // 有序列表图标
  RollbackOutlined, // 撤销重做图标
  CheckSquareOutlined, // 任务列表图标
  AlignCenterOutlined, // 居中对齐图标
  AlignLeftOutlined,   // 左对齐图标
  AlignRightOutlined,  // 右对齐图标
  MenuUnfoldOutlined,  // 用于两端对齐
  LineHeightOutlined,  // 用于行高
} from '@ant-design/icons-vue'

//保存标题信息
const documentTitle = ref('')
// 初始化编辑器
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      history: true,
    }),
    Placeholder.configure({
      placeholder: '开始编辑...'
    }),
    Underline,
    // 添加任务列表扩展
    TaskList,
    TaskItem.configure({
      nested: true, // 允许嵌套任务列表
    }),
    // 添加文本对齐扩展
    TextAlign.configure({
      types: ['heading', 'paragraph'], // 应用于标题和段落
    }),
    //行高
    LineHeight,
  ],
  content: '<p></p>',
  autofocus: 'end',
})

onBeforeUnmount(() => {
  editor?.value?.destroy()
})

//多级标题配置
const blockTypes = [
  {
    label: '正文',
    isActive: () => editor.value?.isActive('paragraph'),
    command: () => editor.value?.chain().focus().setParagraph().run(),
  },
  {
    label: 'H1',
    level: 1,
    isActive: () => editor.value?.isActive('heading', { level: 1 }),
    command: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'H2',
    level: 2,
    isActive: () => editor.value?.isActive('heading', { level: 2 }),
    command: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'H3',
    level: 3,
    isActive: () => editor.value?.isActive('heading', { level: 3 }),
    command: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: 'H4',
    level: 4,
    isActive: () => editor.value?.isActive('heading', { level: 4 }),
    command: () => editor.value?.chain().focus().toggleHeading({ level: 4 }).run(),
  },
  {
    label: 'H5',
    level: 5,
    isActive: () => editor.value?.isActive('heading', { level: 5 }),
    command: () => editor.value?.chain().focus().toggleHeading({ level: 5 }).run(),
  },
  {
    label: 'H6',
    level: 6,
    isActive: () => editor.value?.isActive('heading', { level: 6 }),
    command: () => editor.value?.chain().focus().toggleHeading({ level: 6 }).run(),
  },
]

const alignTypes = [
  { label: '左对齐', value: 'left', icon: AlignLeftOutlined, command: () => editor.value?.chain().focus().setTextAlign('left').run() },
  { label: '居中对齐', value: 'center', icon: AlignCenterOutlined, command: () => editor.value?.chain().focus().setTextAlign('center').run() },
  { label: '右对齐', value: 'right', icon: AlignRightOutlined, command: () => editor.value?.chain().focus().setTextAlign('right').run() },
  { label: '两端对齐', value: 'justify', icon: MenuUnfoldOutlined, command: () => editor.value?.chain().focus().setTextAlign('justify').run() },
]

// 行高配置
const lineHeights = ['1', '1.5', '1.8', '2', '2.5', '3']

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

    <div class="toolbar" v-if="editor">
      <!--多级标题 -->
      <Dropdown>
        <template #default>
          <button type="button">
            {{blockTypes.find((it) => it.isActive())?.label || '正文' }}
            <DownOutlined />
          </button>
        </template>
        <template #overlay>
          <Menu>
            <MenuItem
                v-for="type in blockTypes"
                :key="type.label"
                :class="{ active: type.isActive() }"
                @click="type.command"
            >
              {{ type.label }}
            </MenuItem>
          </Menu>
        </template>
      </Dropdown>

      <!--行高-->
      <Dropdown>
        <template #default>
          <button type="button" title="行高">
            <LineHeightOutlined />
            <DownOutlined />
          </button>
        </template>
        <template #overlay>
          <Menu>
            <MenuItem
                v-for="lh in lineHeights"
                :key="lh"
                @click="editor.chain().focus().setLineHeight(lh).run()"
                :class="{ active: editor.isActive({ lineHeight: lh }) }"
            >
              {{ lh }}
            </MenuItem>
          </Menu>
        </template>
      </Dropdown>

      <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }"><b>B</b></button>
      <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }"><i>I</i></button>
      <button type="button" @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }"><u>U</u></button>
      <button type="button" @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }">S</button>

      <button type="button" @click="editor.chain().focus().toggleTaskList().run()" :class="{ active: editor.isActive('taskList') }" title="任务列表">
        <CheckSquareOutlined />
      </button>
      <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }" title="无序列表">
        <UnorderedListOutlined />
      </button>
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ active: editor.isActive('orderedList') }" title="有序列表">
        <OrderedListOutlined />
      </button>

      <!-- 文本对齐 -->
      <Dropdown>
        <template #default>
          <button type="button">
            <component :is="alignTypes.find(a => editor.isActive({ textAlign: a.value }))?.icon || AlignLeftOutlined" />
            <DownOutlined />
          </button>
        </template>
        <template #overlay>
          <Menu>
            <MenuItem v-for="align in alignTypes" :key="align.value" @click="align.command">
              <component :is="align.icon" /> {{ align.label }}
            </MenuItem>
          </Menu>
        </template>
      </Dropdown>

      <span class="spacer"></span>

      <button type="button" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" title="撤销">
        <RollbackOutlined />
      </button>
      <button type="button" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" title="重做" class="redo-btn">
        <RollbackOutlined class="flip" />
      </button>
    </div>

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
  padding: 16px 20px 8px; /* 调整内边距 */
  border-bottom: 1px solid #ececec;
}

.document-title-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 2em; /* 放大字体 */
  font-weight: 600; /* 加粗 */
  color: #213547;
  box-sizing: border-box;
}

.document-title-input::placeholder {
  color: #adb5bd;
}

.toolbar {
  display: flex;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid #ececec;
  background: #fff;
}
.toolbar .spacer {
  flex: 1;
}
.toolbar button.active {
  background: #e6f7ff;
  border-color: #91d5ff;
}

/* 图标水平翻转 */
.toolbar .redo-btn .flip {
  transform: scaleX(-1);
  display: inline-block;
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
}

/* 5. 移除之前行高的全局样式，并修改默认行高 */
.editor :deep(p) {
  /* 默认行高由 ProseMirror 控制，或由扩展设置 */
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}


/* 高亮当前菜单项 */
:deep(.ant-dropdown-menu-item.active) {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}

/* 8. 添加任务列表和行高的样式 */
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



</style>
