import { onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import TextAlign from '@tiptap/extension-text-align'
import LineHeight from 'tiptap-extension-line-height'
import Highlight from '@tiptap/extension-highlight'
import { FontColor } from '@/extensions/FontColor'
import { Markdown } from 'tiptap-markdown'
import { FontFamily, TextStyle } from '@tiptap/extension-text-style'
import { FontSize } from '@/extensions/FontSize'
import { CustomItalic } from '@/extensions/CustomItalic.js'
import Image from '@tiptap/extension-image'

// 编辑器插件配置
const editorExtensions = [
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
        html: true,
        tightLists: true,
        linkify: true,
        breaks: true,
        transformPastedText: true,
        transformCopiedText: true,
    }),
    CustomItalic,
    Image,
]

/**
 * @description 封装 Tiptap 编辑器逻辑
 * @param {import('@/stores/notes').useNotesStore} notesStore - Pinia store 实例
 * @returns {{editor: import('@tiptap/vue-3').Editor}}
 */
export function useTiptapEditor(notesStore) {
    const isLoadingContent = ref(false) // 静音按钮逻辑

    const editor = useEditor({
        extensions: editorExtensions,
        content: '',
        autofocus: 'end',
        onUpdate: ({ editor }) => {
            // 只有当文档内容真正被用户修改时才触发更新
            if (!isLoadingContent.value) {
                notesStore.updateActiveNote({
                    content: editor.getJSON(),
                })
            }
        },
    })

    // 监听 activeNote 切换，更新编辑器内容
    watch(() => notesStore.activeNote, (newActiveNote, oldActiveNote) => {
        if (!editor.value || (newActiveNote && oldActiveNote && newActiveNote.id === oldActiveNote.id)) {
            return
        }

        isLoadingContent.value = true
        const newContent = newActiveNote?.content || ''
        editor.value.commands.setContent(newContent, false)

        nextTick(() => {
            isLoadingContent.value = false
        })
    })

    // 处理页面首次加载或刷新时的情况
    onMounted(() => {
        if (notesStore.activeNote && editor.value) {
            isLoadingContent.value = true
            const initialContent = notesStore.activeNote.content || ''
            editor.value.commands.setContent(initialContent, false)
            nextTick(() => {
                isLoadingContent.value = false
            })
        }
    })

    onBeforeUnmount(() => {
        editor.value?.destroy()
    })

    return { editor }
}