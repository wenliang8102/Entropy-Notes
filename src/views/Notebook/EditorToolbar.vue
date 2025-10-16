<script setup>
import { defineProps } from 'vue'
import { Dropdown, Menu, MenuItem } from 'ant-design-vue'
import {
  DownOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  RollbackOutlined,
  CheckSquareOutlined,
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  MenuUnfoldOutlined,
  LineHeightOutlined,
  ExportOutlined,
} from '@ant-design/icons-vue'
import { saveAs } from 'file-saver'
import HTMLtoDOCX from 'html-to-docx-ts';


const props = defineProps({
  editor: {
    type: Object,
    required: true,
  },
  documentTitle: {
    type: String,
    default: '无标题笔记',
  },
})

// 多级标题配置
const blockTypes = [
  {label: '正文', isActive: () => props.editor?.isActive('paragraph'), command: () => props.editor?.chain().focus().setParagraph().run(),},
  {label: 'H1', level: 1, isActive: () => props.editor?.isActive('heading', { level: 1 }), command: () => props.editor?.chain().focus().toggleHeading({ level: 1 }).run(),},
  {label: 'H2', level: 2, isActive: () => props.editor?.isActive('heading', { level: 2 }), command: () => props.editor?.chain().focus().toggleHeading({ level: 2 }).run(),},
  {label: 'H3', level: 3, isActive: () => props.editor?.isActive('heading', { level: 3 }), command: () => props.editor?.chain().focus().toggleHeading({ level: 3 }).run(),},
  {label: 'H4', level: 4, isActive: () => props.editor?.isActive('heading', { level: 4 }), command: () => props.editor?.chain().focus().toggleHeading({ level: 4 }).run(),},
  {label: 'H5', level: 5, isActive: () => props.editor?.isActive('heading', { level: 5 }), command: () => props.editor?.chain().focus().toggleHeading({ level: 5 }).run(),},
  {label: 'H6', level: 6, isActive: () => props.editor?.isActive('heading', { level: 6 }), command: () => props.editor?.chain().focus().toggleHeading({ level: 6 }).run(),},
]

// 文本对齐配置
const alignTypes = [
  { label: '左对齐', value: 'left', icon: AlignLeftOutlined, command: () => props.editor?.chain().focus().setTextAlign('left').run() },
  { label: '居中对齐', value: 'center', icon: AlignCenterOutlined, command: () => props.editor?.chain().focus().setTextAlign('center').run() },
  { label: '右对齐', value: 'right', icon: AlignRightOutlined, command: () => props.editor?.chain().focus().setTextAlign('right').run() },
  { label: '两端对齐', value: 'justify', icon: MenuUnfoldOutlined, command: () => props.editor?.chain().focus().setTextAlign('justify').run() },
]

// 行高配置
const lineHeights = ['1', '1.5', '1.8', '2', '2.5', '3']



const handleExport = async (format) => {
  if (!props.editor) return;

  const title = props.documentTitle || '无标题笔记';
  let blob;

  switch (format) {
    case 'html':
      blob = new Blob([props.editor.getHTML()], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `${title}.html`);
      break;

    case 'md':
      const markdownContent = props.editor.storage.markdown?.getMarkdown();
      if (markdownContent) {
        blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, `${title}.md`);
      } else {
        console.error('Markdown 导出功能未正确配置！请检查 NoteArea.vue 中的 tiptap-markdown 拓展。');
        alert('Markdown 导出功能未正确配置！');
      }
      break;

    case 'docx':
      const htmlString = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>${title}</title>
          </head>
          <body>
            <h1>${title}</h1>
            ${props.editor.getHTML()}
          </body>
        </html>
      `;

      // 直接调用库函数，完成所有转换
      blob = await HTMLtoDOCX(htmlString, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
      });

      saveAs(blob, `${title}.docx`);
      break;
  }
}
</script>

<template>
  <div class="toolbar" v-if="editor">
    <!--多级标题 -->
    <Dropdown>
      <template #default>
        <button type="button">
          {{ blockTypes.find((it) => it.isActive())?.label || '正文' }}
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

    <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }" title="加粗"><b>B</b></button>
    <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }" title="斜体"><i>I</i></button>
    <button type="button" @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }" title="下划线"><u>U</u></button>
    <button type="button" @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }" title="删除线">S</button>

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

    <!-- 导出 -->
    <Dropdown>
      <template #default>
        <button type="button" title="导出">
          <ExportOutlined />
          <DownOutlined />
        </button>
      </template>
      <template #overlay>
        <Menu>
          <MenuItem @click="handleExport('html')">
            导出为 HTML
          </MenuItem>
          <MenuItem @click="handleExport('md')">
            导出为 Markdown
          </MenuItem>
          <MenuItem @click="handleExport('docx')">
            导出为 Word
          </MenuItem>
        </Menu>
      </template>
    </Dropdown>

    <button type="button" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" title="撤销">
      <RollbackOutlined />
    </button>
    <button type="button" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" title="重做" class="redo-btn">
      <RollbackOutlined class="flip" />
    </button>
  </div>
</template>

<style scoped>
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
.toolbar button {
  background: transparent;
  border: 1px solid transparent;
}
.toolbar button:hover {
  background: #f5f5f5;
  border-color: #e5e5e5;
}
.toolbar button.active {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

/* 图标水平翻转 */
.toolbar .redo-btn .flip {
  transform: scaleX(-1);
  display: inline-block;
}

/* 高亮当前菜单项 */
:deep(.ant-dropdown-menu-item.active) {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}
</style>