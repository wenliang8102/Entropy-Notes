<script setup>
import { defineProps } from 'vue'
import { watch,ref } from 'vue'
import { Dropdown, Menu, MenuItem } from 'ant-design-vue'
import {
  CaretDownOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  RollbackOutlined,
  CheckSquareOutlined,
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  MenuUnfoldOutlined,
  LineHeightOutlined,
  HighlightOutlined,
  ExportOutlined,
  FileImageOutlined,
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

const fileInput = ref(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

//  处理文件选择事件
const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file || !props.editor) {
    return
  }

  // 使用 FileReader 将图片文件转换为 Base64 Data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    const src = e.target?.result
    if (src) {
      // 调用 editor 的命令插入图片
      props.editor.chain().focus().setImage({ src }).run()
    }
  }
  reader.readAsDataURL(file)

  // 清空输入框，以便下次可以选择同一个文件
  event.target.value = ''
}

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

// 字体配置
const fontFamilies = [
  { label: '默认', value: '' },
  { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' },
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
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

// 字号配置
const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '48px', '64px']
const applyFontSize = (size) => {
  props.editor.chain().focus().setFontSize(size).run()
}

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
        console.error('导出错误');
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

// 存储选中的颜色值
const selectedColor = ref('#000000')
const colorInputRef = ref(null)

// 监听编辑器中选中文本的颜色变化，同步到选择器（fontColor 標記）
watch(
    () => {
      if (!props.editor?.getAttributes) return null
      const color = props.editor.getAttributes('fontColor')?.color
      return color || null
    },
    (newColor) => {
      if (newColor) {
        selectedColor.value = newColor
      }
    },
)

// 应用颜色到选中文本（fontColor 標記）
const applyColor = (color) => {
  if (!props.editor) return
  props.editor.chain().focus().setFontColor(color).run()
}

const openColorPicker = () => {
  if (colorInputRef?.value) {
    colorInputRef.value.click()
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
          <CaretDownOutlined />
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

    <!-- 字体 -->
    <Dropdown>
      <template #default>
        <button type="button" title="字体" class="font-btn">
          <span>{{ editor.getAttributes('textStyle').fontFamily?.replace(/,.*$/, '') || '默认' }}</span>
          <CaretDownOutlined />
        </button>
      </template>
      <template #overlay>
        <Menu>
          <MenuItem
              v-for="font in fontFamilies"
              :key="font.value"
              @click="font.value ? editor.chain().focus().setFontFamily(font.value).run() : editor.chain().focus().unsetFontFamily().run()"
              :class="{ active: editor.isActive('textStyle', { fontFamily: font.value }) }"
          >
            <span :style="{ fontFamily: font.value }">{{ font.label }}</span>
          </MenuItem>
        </Menu>
      </template>
    </Dropdown>

    <!-- 字号 -->
    <Dropdown>
      <template #default>
        <button type="button" title="字号">
          <span>{{ editor.getAttributes('textStyle').fontSize || '16px' }}</span>
          <CaretDownOutlined />
        </button>
      </template>
      <template #overlay>
        <Menu>
          <MenuItem
              v-for="size in fontSizes"
              :key="size"
              @click="applyFontSize(size)"
              :class="{ active: editor.isActive('textStyle', { fontSize: size }) }"
          >
            {{ size }}
          </MenuItem>
        </Menu>
      </template>
    </Dropdown>

    <!--行高-->
    <Dropdown>
      <template #default>
        <button type="button" title="行高" class="btn-compact">
          <LineHeightOutlined />
          <CaretDownOutlined />
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

    <button
        type="button"
        class="color-btn"
        title="文本颜色"
        @click="openColorPicker"
        :class="{ active: editor.isActive('fontColor') }"
    >
      <span class="color-letter">A</span>
      <span class="color-underline" :style="{ backgroundColor: selectedColor }"></span>
      <input
          ref="colorInputRef"
          type="color"
          v-model="selectedColor"
          @input="applyColor(selectedColor)"
          class="color-input-hidden"
      >
    </button>

    <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }" title="加粗"><b>B</b></button>
    <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }" title="斜体"><i>I</i></button>
    <button type="button" @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }" title="下划线"><u>U</u></button>
    <button type="button" @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }" title="删除线">S</button>

    <button type="button" @click="editor.chain().focus().toggleHighlight().run()" :class="{ active: editor.isActive('highlight') }" title="高亮">
      <HighlightOutlined />
    </button>

    <button type="button" @click="editor.chain().focus().toggleTaskList().run()" :class="{ active: editor.isActive('taskList') }" title="任务列表">
      <CheckSquareOutlined />
    </button>
    <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }" title="无序列表">
      <UnorderedListOutlined />
    </button>
    <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ active: editor.isActive('orderedList') }" title="有序列表">
      <OrderedListOutlined />
    </button>

    <button type="button" @click="triggerFileInput" title="插入图片">
      <FileImageOutlined />
    </button>

    <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        accept="image/*"
        style="display: none"
    />

    <!-- 文本对齐 -->
    <Dropdown>
      <template #default>
        <button type="button">
          <component :is="alignTypes.find(a => editor.isActive({ textAlign: a.value }))?.icon || AlignLeftOutlined" />
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
.toolbar button:focus {
  outline: none;
  box-shadow: none;
}
.toolbar button:hover {
  background: #f5f5f5;
  border-color: #e5e5e5;
}
.toolbar .font-btn span {
  display: inline-block;
  max-width: 8ch; /* 根据需要调整宽度（也可用 px，例如 80px） */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
.toolbar button.active {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}
/* 更緊湊的按鈕（用於行高等） */
.btn-compact {
  padding-left: 6px;
  padding-right: 6px;
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

/* 颜色按钮樣式（與其他按鈕規格一致） */
.color-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.color-letter {
  font-weight: 700;
}
.color-underline {
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 4px;
  height: 3px;
  border-radius: 2px;
}
.color-input-hidden {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto; /* 讓 input 接收點擊，定位以 input 為準 */
  z-index: 1;
  cursor: pointer;
}

.toolbar :deep(.anticon-caret-down) {
  color: #ccc;
}

</style>