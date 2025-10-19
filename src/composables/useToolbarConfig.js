import {
    AlignCenterOutlined,
    AlignLeftOutlined,
    AlignRightOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons-vue'

// 多级标题配置
export const useBlockTypes = (editor) => [
    { label: '正文', isActive: () => editor.value?.isActive('paragraph'), command: () => editor.value?.chain().focus().setParagraph().run() },
    { label: 'H1', level: 1, isActive: () => editor.value?.isActive('heading', { level: 1 }), command: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: 'H2', level: 2, isActive: () => editor.value?.isActive('heading', { level: 2 }), command: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'H3', level: 3, isActive: () => editor.value?.isActive('heading', { level: 3 }), command: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'H4', level: 4, isActive: () => editor.value?.isActive('heading', { level: 4 }), command: () => editor.value?.chain().focus().toggleHeading({ level: 4 }).run() },
    { label: 'H5', level: 5, isActive: () => editor.value?.isActive('heading', { level: 5 }), command: () => editor.value?.chain().focus().toggleHeading({ level: 5 }).run() },
    { label: 'H6', level: 6, isActive: () => editor.value?.isActive('heading', { level: 6 }), command: () => editor.value?.chain().focus().toggleHeading({ level: 6 }).run() },
]

// 字体配置
export const fontFamilies = [
    { label: '默认', value: '' },
    { label: '宋体', value: 'SimSun' },
    { label: '黑体', value: 'SimHei' },
    { label: '微软雅黑', value: 'Microsoft YaHei' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Times New Roman', value: 'Times New Roman' },
]

// 文本对齐配置
export const useAlignTypes = (editor) => [
    { label: '左对齐', value: 'left', icon: AlignLeftOutlined, command: () => editor.value?.chain().focus().setTextAlign('left').run() },
    { label: '居中对齐', value: 'center', icon: AlignCenterOutlined, command: () => editor.value?.chain().focus().setTextAlign('center').run() },
    { label: '右对齐', value: 'right', icon: AlignRightOutlined, command: () => editor.value?.chain().focus().setTextAlign('right').run() },
    { label: '两端对齐', value: 'justify', icon: MenuUnfoldOutlined, command: () => editor.value?.chain().focus().setTextAlign('justify').run() },
]

// 行高配置
export const lineHeights = ['1', '1.5', '1.8', '2', '2.5', '3']

// 字号配置
export const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '48px', '64px']