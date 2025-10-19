import { ref, watch } from 'vue'
import { saveAs } from 'file-saver'
import HTMLtoDOCX from 'html-to-docx-ts'

/**
 * 封装颜色选择器逻辑
 * @param {import('vue').Ref<import('@tiptap/vue-3').Editor>} editorRef - 编辑器实例的引用
 */
export function useTextColor(editorRef) {
    const selectedColor = ref('#000000')
    const colorInputRef = ref(null)

    // 监听编辑器属性变化，同步颜色选择器的显示
    watch(
        () => {
            if (!editorRef.value?.getAttributes) return null
            return editorRef.value.getAttributes('fontColor')?.color || null
        },
        (newColor) => {
            if (newColor) {
                selectedColor.value = newColor
            }
        }
    )

    const applyColor = (color) => {
        if (!editorRef.value) return
        editorRef.value.chain().focus().setFontColor(color).run()
    }

    const openColorPicker = () => {
        colorInputRef.value?.click()
    }

    return { selectedColor, colorInputRef, applyColor, openColorPicker }
}

/**
 * 封装图片上传逻辑
 * @param {import('vue').Ref<import('@tiptap/vue-3').Editor>} editorRef - 编辑器实例的引用
 */
export function useImageUpload(editorRef) {
    const fileInput = ref(null)

    const triggerFileInput = () => {
        fileInput.value?.click()
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file || !editorRef.value) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const src = e.target?.result
            if (src) {
                editorRef.value.chain().focus().setImage({ src }).run()
            }
        }
        reader.readAsDataURL(file)
        event.target.value = ''
    }

    return { fileInput, triggerFileInput, handleFileChange }
}

/**
 * 封装导出逻辑
 * @param {import('vue').Ref<import('@tiptap/vue-3').Editor>} editorRef - 编辑器实例的引用
 * @param {import('vue').Ref<string>} documentTitleRef - 文档标题的引用
 */
export function useNoteExport(editorRef, documentTitleRef) {
    const handleExport = async (format) => {
        if (!editorRef.value) return

        const title = documentTitleRef.value || '无标题笔记'
        let blob

        switch (format) {
            case 'html':
                blob = new Blob([editorRef.value.getHTML()], { type: 'text/html;charset=utf-8' })
                saveAs(blob, `${title}.html`)
                break

            case 'md':
                const markdownContent = editorRef.value.storage.markdown?.getMarkdown()
                if (markdownContent) {
                    blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' })
                    saveAs(blob, `${title}.md`)
                } else {
                    console.error('导出错误')
                }
                break

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
              ${editorRef.value.getHTML()}
            </body>
          </html>
        `
                blob = await HTMLtoDOCX(htmlString, null, {
                    table: { row: { cantSplit: true } },
                    footer: true,
                    pageNumber: true,
                })
                saveAs(blob, `${title}.docx`)
                break
        }
    }

    return { handleExport }
}

/**
 * 封装字号应用逻辑
 * @param {import('vue').Ref<import('@tiptap/vue-3').Editor>} editorRef - 编辑器实例的引用
 */
export function useFontSize(editorRef) {
    const applyFontSize = (size) => {
        editorRef.value?.chain().focus().setFontSize(size).run()
    }
    return { applyFontSize }
}