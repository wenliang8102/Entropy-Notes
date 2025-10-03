<script setup>
import { defineProps, defineEmits } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

// 接收父组件传递的 isCollapsed 状态
const props = defineProps({
  isCollapsed: Boolean
})
const emit = defineEmits(['toggle'])



// 菜单项数据（可根据实际需求调整/支持多级菜单等）
const menu = [
  { name: 'Home', label: '首页', icon: '🏠' },
  { name: '', label: '全部笔记', icon: '📒' },
  { name: '', label: '标签', icon: '🏷️' },
  { name: '', label: '设置', icon: '⚙️' }
]

// 跳转逻辑
const goRoute=(item)=> {
  if (route.name !== item.name) {
    router.push({ name: item.name })
  }
}
</script>

<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <!-- 折叠/展开按钮 -->
    <button class="toggle-btn" @click="emit('toggle')" type="button"> <RightOutlined v-if="isCollapsed" /> <LeftOutlined v-else /> </button>
    <!-- 功能菜单区 -->
    <ul class="menu">
      <li
          v-for="item in menu"
          :key="item.name"
          :class="{ active: route.name === item.name }"
          @click="goRoute(item)"
      >
        <span v-if="item.icon" class="icon">{{ item.icon }}</span>
        <span v-if="!isCollapsed">{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sidebar {
  width: 200px;
  transition: width 0.3s;
  background: #f7f7fa;
  border-right: 1px solid #ececec;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.sidebar.collapsed {
  width: 64px;
}
.toggle-btn {
  align-self: flex-end;
  margin: 8px;
  padding: 2px 8px;
  cursor: pointer;
  outline: none;
}
.menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}
.menu li {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}
.menu li.active {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}
.icon {
  margin-right: 8px;
  font-size: 16px;
}
.sidebar.collapsed .icon {
  margin-right: 0;
  display: block;
  width: 100%;
  text-align: center;
}
.sidebar.collapsed .menu li {
  justify-content: center;
  padding: 12px 0;
}
.sidebar.collapsed .menu li span:not(.icon) {
  display: none;
}
</style>