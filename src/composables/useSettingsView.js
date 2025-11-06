import { ref, computed, h } from 'vue'
import AntdIcon from '@ant-design/icons-vue/es/components/AntdIcon'
import SunOutlinedSvg from '@ant-design/icons-svg/es/asn/SunOutlined'
import MoonOutlinedSvg from '@ant-design/icons-svg/es/asn/MoonOutlined'
import { Modal } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'

export function useSettingsView(notesStore) {
  const isSettingsView = computed(() => notesStore.viewMode === 'settings')

  const enterSettingsView = () => notesStore.setViewMode('settings')
  const exitSettingsView = () => notesStore.setViewMode('notes')
  const toggleSettingsView = () => (isSettingsView.value ? exitSettingsView() : enterSettingsView())

  const listHeader = computed(() => (isSettingsView.value ? '设置' : ''))

  // 供侧边栏统一判断隐藏哪些区域
  const shouldHideSidebarNoteList = computed(() => isSettingsView.value)
  const shouldHideNewNoteButton = computed(() => isSettingsView.value)

  // 用于菜单项高亮判断（集中在此）
  function isSettingsMenuActive(label) {
    return label === '设置' && isSettingsView.value
  }

  // 设置视图：主题图标切换（仅UI层切换，不涉及主题逻辑）
  const showSun = ref(false)
  function toggleThemeIcon() {
    showSun.value = !showSun.value
    // 切换主题：showSun=false 显示月亮 => 深色；showSun=true 显示太阳 => 浅色
    const next = showSun.value ? 'light' : 'dark'
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next)
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('entropy-theme', next)
      }
    } catch (_) {}
  }

  // 初始化从本地读取主题
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('entropy-theme') : null
    const initial = saved || 'light'
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', initial)
    }
    showSun.value = initial === 'light'
  } catch (_) {}

  // 内联设置行组件（减少 NoteArea 代码）
  const SettingsInlineRow = {
    name: 'SettingsInlineRow',
    setup() {
      const authStore = useAuthStore()
      const isHover = ref(false)
      const isLogoutHover = ref(false)
      
      const handleLogout = () => {
        Modal.confirm({
          title: '确认退出',
          content: '确定要退出登录吗？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            authStore.logout()
          }
        })
      }
      
      // 获取用户名（从 user 对象中提取，可能是 username 或其他字段）
      const username = computed(() => {
        if (!authStore.user) return '未登录'
        return authStore.user.username || authStore.user.name || '未知用户'
      })
      
      return () => h('div', { class: 'settings-container' }, [
        // 账户信息
        h('div', { class: 'settings-inline-row' }, [
          h('span', { class: 'settings-label' }, '当前账户'),
          h('div', { class: 'settings-account-info' }, [
            h('span', { class: 'settings-username' }, username.value),
            h('button', {
              class: 'settings-logout-btn',
              onClick: handleLogout,
              onMouseenter: () => { isLogoutHover.value = true },
              onMouseleave: () => { isLogoutHover.value = false },
              title: '退出登录'
            }, '退出登录')
          ])
        ]),
        // 主题切换
        h('div', { class: 'settings-inline-row' }, [
          h('span', { class: 'settings-label' }, '切换白天/黑夜模式'),
          h('button', {
            class: 'settings-theme-btn',
            title: '切换',
            onClick: toggleThemeIcon,
            onMouseenter: () => { isHover.value = true },
            onMouseleave: () => { isHover.value = false },
            'data-hover': isHover.value ? 'true' : 'false'
          }, [
            showSun.value
              ? h(AntdIcon, { icon: SunOutlinedSvg, style: { fontSize: '18px', color: '#9aa0a6' } })
              : h(AntdIcon, { icon: MoonOutlinedSvg, style: { fontSize: '18px', color: '#ffffff' } })
          ])
        ])
      ])
    }
  }

  return {
    isSettingsView,
    enterSettingsView,
    exitSettingsView,
    toggleSettingsView,
    listHeader,
    shouldHideSidebarNoteList,
    shouldHideNewNoteButton,
    isSettingsMenuActive,
    // 供 NoteArea 使用的设置视图UI状态与图标
    showSun,
    toggleThemeIcon,
    AntdIcon,
    SunOutlinedSvg,
    MoonOutlinedSvg,
    SettingsInlineRow,
  }
}


