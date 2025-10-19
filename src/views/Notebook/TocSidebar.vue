<script setup>
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'

const props = defineProps({
  editor: { type: Object, required: true },
})

const headings = ref([]) // [{ uid, el, level, text }]
const activeUid = ref('')
const isCollapsed = ref(false)
const filteredHeadings = computed(() =>
  (headings.value || []).filter(h => (h.text || '').trim().length > 0)
)
let observer = null

const rebuildHeadings = () => {
  if (!props.editor) return
  const view = props.editor.view
  const dom = view.dom
  const list = []
  // 直接保存元素引用，避免 id 在渲染更新时失效
  const nodes = dom.querySelectorAll('h1, h2, h3, h4, h5, h6')
  nodes.forEach((el) => {
    const level = Number(el.tagName.substring(1))
    const uid = Math.random().toString(36).slice(2, 10)
    list.push({ uid, el, level, text: el.textContent || '' })
  })
  headings.value = list
  setupObserver()
}

const setupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (headings.value.length === 0) return
  const rootEl = props.editor.view.dom.parentElement
  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (visible[0]) {
      const el = visible[0].target
      const found = headings.value.find(h => h.el === el)
      if (found) activeUid.value = found.uid
    }
  }, { root: rootEl, rootMargin: '0px 0px -60% 0px', threshold: [0, 1] })

  headings.value.forEach((h) => {
    if (h.el) observer.observe(h.el)
  })
}

const handleClick = (heading) => {
  const el = heading?.el
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeUid.value = heading.uid
}

onMounted(() => {
  props.editor.on('update', rebuildHeadings)
  rebuildHeadings()
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  props.editor.off('update', rebuildHeadings)
})
</script>

<template>
  <aside class="toc" :class="{ collapsed: isCollapsed }">
    <button type="button" class="toggle-btn" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? '展开' : '收起'">
      <span class="toggle-icon" :class="{ collapsed: isCollapsed }">
        <MenuUnfoldOutlined v-if="!isCollapsed" class="toggle-icon" />
      <MenuFoldOutlined v-else class="toggle-icon" />
      </span>
    </button>
    <div v-if="filteredHeadings.length === 0" class="empty">开始导航...</div>
    <ul v-else class="list">
      <li
          v-for="h in filteredHeadings"
          :key="h.uid"
          :class="['item', `lv-${h.level}`, { active: h.uid === activeUid }]"
          @click="handleClick(h)"
          :title="h.text"
      >
        {{ h.text }}
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.toc {
  width: 260px;
  border-left: 1px solid #ececec;
  background: #fff;
  overflow: auto;
  padding: 8px 8px 16px;
  transition: width 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.toc.collapsed {
  width: 40px;
}
.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  outline: none;
  margin-bottom: 8px;
  align-self: flex-start;
  position: relative;
  right: 0;
}
.toggle-btn:hover {
  background: #e6f7ff;
  border: none;
}
.toggle-btn:focus {
  outline: none;
}
.toggle-btn:active {
  outline: none;
}
.toggle-icon {
  display: inline-block;
  font-size: 20px;
  font-weight: bold;
  color: #999;
}
.toggle-icon.collapsed {
  transform: scaleX(-1) rotate(180deg);
}
.toc.collapsed .empty,
.toc.collapsed .list {
  display: none;
}
.toc.collapsed .toggle-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #fff;
  z-index: 10;
  transition: right 0.2s ease;
  animation: slideToRight 0.2s ease;
}

@keyframes slideToRight {
  0% {
    right: calc(100% - 40px);
  }
  100% {
    right: 8px;
  }
}
.toc.collapsed .toggle-btn:hover {
  background: #e6f7ff;
}
.empty {
  color: #adb5bd;
  padding: 12px 8px;
  text-align: left;
  white-space: nowrap;      /* 强制文字不换行（关键） */
  overflow: hidden;         /* 超出宽度的部分隐藏（避免溢出） */
  text-overflow: ellipsis;  /* 超出部分显示省略号（可选，更美观） */
}
.list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.item {
  padding: 4px 8px;
  cursor: pointer;
  white-space: nowrap;      /* 强制文字不换行（关键） */
  overflow: hidden;         /* 超出宽度的部分隐藏（避免溢出） */
  text-overflow: ellipsis;  /* 超出部分显示省略号（可选，更美观） */
  font-size: 16px;
  line-height: 1.6;
  text-align: left;
}
.item:hover {
  color: #1677ff;
}
.item.active {
  color: #1890ff;
  font-weight: 600;
}
.lv-1 { padding-left: 0; font-weight: 700; } /* H1 加粗 */
.lv-1.active { color: inherit; } 
.lv-2 { padding-left: 12px; }
.lv-3 { padding-left: 24px; }
.lv-4 { padding-left: 36px; }
.lv-5 { padding-left: 48px; }
.lv-6 { padding-left: 60px; }
</style>

