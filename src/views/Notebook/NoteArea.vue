<script setup>
import { onBeforeUnmount } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'

import { Dropdown, Menu, MenuItem } from 'ant-design-vue'
import { DownOutlined, UnorderedListOutlined, OrderedListOutlined, RollbackOutlined } from '@ant-design/icons-vue'

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
</script>

<template>
  <div class="note-area">
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

      <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }"><b>B</b></button>
      <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }"><i>I</i></button>
      <button type="button" @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }"><u>U</u></button>
      <button type="button" @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }">S</button>

      <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }" title="无序列表">
        <UnorderedListOutlined />
      </button>
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ active: editor.isActive('orderedList') }" title="有序列表">
        <OrderedListOutlined />
      </button>

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

.editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #adb5bd;
  float: left;
  height: 0;
  pointer-events: none;
}

.editor :deep(h1) { font-size: 1.8rem; margin: 1rem 0; }
.editor :deep(h2) { font-size: 1.4rem; margin: 0.8rem 0; }
.editor :deep(p)  { line-height: 1.8; }

/* 高亮当前菜单项 */
:deep(.ant-dropdown-menu-item.active) {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}


</style>
