<script setup>
import { defineProps, toRef, ref, onMounted, onBeforeUnmount } from 'vue'
import { Dropdown, Menu, MenuItem } from 'ant-design-vue'
import {
  CaretDownOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  RollbackOutlined,
  CheckSquareOutlined,
  HighlightOutlined,
  ExportOutlined,
  FileImageOutlined,
  LineHeightOutlined,
  AlignLeftOutlined,
  ImportOutlined,
} from '@ant-design/icons-vue'
import {
  useBlockTypes,
  fontFamilies,
  useAlignTypes,
  lineHeights,
  fontSizes,
} from '@/composables/useToolbarConfig'
import {
  useTextColor,
  useImageUpload,
  useNoteExport,
  useFontSize,
  useNoteImport,
} from '@/composables/useEditorCommands'
import { useNotesStore } from '@/stores/notes'

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


const editorRef = toRef(props, 'editor')
const documentTitleRef = toRef(props, 'documentTitle')
const notesStore = useNotesStore()

const blockTypes = useBlockTypes(editorRef)
const alignTypes = useAlignTypes(editorRef)
const { applyFontSize } = useFontSize(editorRef)
const { selectedColor, colorInputRef, applyColor, openColorPicker } = useTextColor(editorRef)
const { fileInput, triggerFileInput, handleFileChange } = useImageUpload(editorRef)
const { handleExport } = useNoteExport(editorRef, documentTitleRef)
const { importFileInput, handleImport, handleImportFileChange } = useNoteImport(editorRef, notesStore)

// 工具栏拖拽横向滚动（仅在溢出时生效，且不影响按钮/下拉点击）
const toolbarRef = ref(null)
const isDragging = ref(false)
let dragStartX = 0
let lastClientX = 0
let dragStartScrollLeft = 0
let canScrollHorizontally = false
let resizeObserver = null
let activePointerId = null
let pendingDrag = false
const DRAG_THRESHOLD = 6
let cancelNextClickOnce = null

function updateCanScroll() {
  const el = toolbarRef.value
  if (!el) return
  canScrollHorizontally = el.scrollWidth > el.clientWidth
}

function onPointerDown(e) {
  const el = toolbarRef.value
  if (!el) return
  updateCanScroll()
  if (!canScrollHorizontally) return
  pendingDrag = true
  isDragging.value = false
  dragStartX = e.clientX
  lastClientX = e.clientX
  dragStartScrollLeft = el.scrollLeft
  activePointerId = e.pointerId
}

function onPointerMove(e) {
  const el = toolbarRef.value
  if (!el) return
  if (pendingDrag && !isDragging.value) {
    const moved = Math.abs(e.clientX - dragStartX)
    if (moved >= DRAG_THRESHOLD) {
      isDragging.value = true
      pendingDrag = false
      try { el.setPointerCapture?.(activePointerId) } catch (_) {}
      // 拖拽一旦激活，拦截下一次 click，避免按钮被误点
      cancelNextClickOnce = function(ev) {
        ev.stopPropagation()
        ev.preventDefault()
        window.removeEventListener('click', cancelNextClickOnce, true)
        cancelNextClickOnce = null
      }
      window.addEventListener('click', cancelNextClickOnce, true)
    } else {
      return
    }
  }
  if (!isDragging.value) return
  e.preventDefault()
  const deltaX = e.clientX - lastClientX
  lastClientX = e.clientX
  el.scrollLeft = el.scrollLeft - deltaX
}

function onPointerUp(e) {
  const el = toolbarRef.value
  if (!el) return
  isDragging.value = false
  pendingDrag = false
  try { if (activePointerId != null) el.releasePointerCapture?.(activePointerId) } catch (_) {}
  activePointerId = null
}

onMounted(() => {
  updateCanScroll()
  const el = toolbarRef.value
  if (window?.ResizeObserver && el) {
    resizeObserver = new ResizeObserver(() => updateCanScroll())
    resizeObserver.observe(el)
  } else {
    window.addEventListener('resize', updateCanScroll)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    try { resizeObserver.disconnect() } catch (_) {}
    resizeObserver = null
  } else {
    window.removeEventListener('resize', updateCanScroll)
  }
})
</script>

<template>
  <div
    class="toolbar"
    :class="{ dragging: isDragging }"
    ref="toolbarRef"
    v-if="editor"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
    @pointercancel="onPointerUp"
  >
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

    <input
        type="file"
        ref="importFileInput"
        @change="handleImportFileChange"
        style="display: none"
    />

    <!-- 导入 -->
    <Dropdown>
      <template #default>
        <button type="button" title="导入">
          <ImportOutlined />
        </button>
      </template>
      <template #overlay>
        <Menu>
          <MenuItem @click="handleImport('.md')">
            从 Markdown 导入
          </MenuItem>
          <MenuItem @click="handleImport('.docx')">
            从 Word 导入
          </MenuItem>
        </Menu>
      </template>
    </Dropdown>

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
/* 样式保持不变 */
.toolbar {
  display: flex;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid #ececec;
  background: #fff;
  overflow-x: auto; /* 仅在溢出时可横向滚动 */
  -ms-overflow-style: none; /* IE/Edge 隐藏滚动条 */
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  touch-action: pan-y; /* 避免垂直滚动被拦截，仍允许横向拖拽 */
}
.toolbar::-webkit-scrollbar { display: none; } /* WebKit 隐藏滚动条 */
.toolbar.dragging { cursor: grabbing; }
.toolbar { cursor: default; }
.toolbar .spacer {
  flex: 1;
}
.toolbar button {
  background: transparent;
  border: 1px solid transparent;
  display: inline-flex; /* 保证图标与文字同一行 */
  align-items: center;
  gap: 6px;
  white-space: nowrap; /* 禁止换行，避免三角掉到下一行 */
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

/* 颜色按钮样式 */
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
  pointer-events: auto;
  z-index: 1;
  cursor: pointer;
}

.toolbar :deep(.anticon-caret-down) {
  color: #ccc;
}
</style>