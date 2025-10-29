import { ref, watch } from 'vue'
import { saveAs } from 'file-saver'
import HTMLtoDOCX from 'html-to-docx-ts'
import { renderAsync } from 'docx-preview'

/**
 * 将 docx-preview 生成的 HTML 规范化为 Tiptap 更容易解析的标签
 */
function normalizeDocxPreviewHtml(html) {
    try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        // 去掉页面包装容器，把子节点提升出来
        doc.querySelectorAll('[class*="docx"],[class*="page"]').forEach(el => {
            if (el.parentElement && el.childNodes.length) {
                const frag = doc.createDocumentFragment()
                while (el.firstChild) frag.appendChild(el.firstChild)
                el.replaceWith(frag)
            } else {
                el.remove()
            }
        })

        // 将样式映射到 Tiptap 支持的元素
        doc.querySelectorAll('span, p, div, strong, em, u, s, mark').forEach(node => {
            const style = (node.getAttribute('style') || '').toLowerCase()

            // 粗体 -> strong
            if (/font-weight\s*:\s*(bold|[6-9]00)/.test(style) && node.tagName !== 'STRONG') {
                const strong = doc.createElement('strong')
                while (node.firstChild) strong.appendChild(node.firstChild)
                node.replaceWith(strong)
                node = strong
            }

            // 斜体 -> em
            if (/font-style\s*:\s*italic/.test(style) && node.tagName !== 'EM') {
                const em = doc.createElement('em')
                while (node.firstChild) em.appendChild(node.firstChild)
                node.replaceWith(em)
                node = em
            }

            // 下划线 -> u
            if (/text-decoration\s*:\s*[^;]*underline/.test(style) && node.tagName !== 'U') {
                const u = doc.createElement('u')
                while (node.firstChild) u.appendChild(node.firstChild)
                node.replaceWith(u)
                node = u
            }

            // 删除线 -> s
            if (/text-decoration\s*:\s*[^;]*line-through/.test(style) && node.tagName !== 'S') {
                const s = doc.createElement('s')
                while (node.firstChild) s.appendChild(node.firstChild)
                node.replaceWith(s)
                node = s
            }

            // 高亮 -> mark
            const bg = style.match(/background(?:-color)?\s*:\s*([^;]+)/)
            if (bg && node.tagName !== 'MARK') {
                const mark = doc.createElement('mark')
                mark.setAttribute('style', `background-color:${bg[1].trim()}`)
                while (node.firstChild) mark.appendChild(node.firstChild)
                node.replaceWith(mark)
                node = mark
            }

            // 文本颜色 -> span style=color
            const color = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/)
            if (color && node.tagName !== 'SPAN') {
                const span = doc.createElement('span')
                span.setAttribute('style', `color:${color[1].trim()}`)
                while (node.firstChild) span.appendChild(node.firstChild)
                node.replaceWith(span)
            }
        })

        return doc.body.innerHTML
    } catch {
        return html
    }
}

// File -> ArrayBuffer
function fileReaderArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target?.result)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
    })
}

// blob:URL -> dataURL
async function blobUrlToDataUrl(url) {
    const res = await fetch(url)
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

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

/**
 * 导入
 */
export function useNoteImport(editorRef) {
    const importFileInput = ref(null)

    const handleImport = (acceptType) => {
        if (importFileInput.value) {
            importFileInput.value.accept = acceptType
            importFileInput.value.click()
        }
    }

    const handleImportFileChange = async (event) => {
        const file = event.target.files?.[0]
        if (!file || !editorRef.value) return

        const ext = file.name.split('.').pop().toLowerCase()

        if (ext === 'md') {
            const reader = new FileReader()
            reader.onload = (e) => {
                const markdownContent = e.target?.result
                if (markdownContent) {
                    editorRef.value.commands.setContent(markdownContent, true)
                }
            }
            reader.readAsText(file)
        }else if (ext === 'docx') {
            try {
                const arrayBuffer = await fileReaderArrayBuffer(file)

                const offscreen = document.createElement('div')
                offscreen.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;'
                document.body.appendChild(offscreen)


                await renderAsync(arrayBuffer, offscreen, undefined, {

                })

                const imgs = offscreen.querySelectorAll('img[src^="blob:"]')
                await Promise.all(
                    Array.from(imgs).map(async (img) => {
                        try {
                            const dataUrl = await blobUrlToDataUrl(img.src)
                            img.src = dataUrl
                        } catch {}
                    })
                )

                const normalizedHtml = normalizeDocxPreviewHtml(offscreen.innerHTML)
                document.body.removeChild(offscreen)

                editorRef.value.commands.clearContent(false)
                editorRef.value.commands.insertContent(normalizedHtml)
            } catch (error) {
                console.error('导入 DOCX 失败:', error)
                alert('导入 DOCX 文件失败。请确保文件格式正确。')
            }
        } else {
            alert('不支持的文件类型。请选择 .md 或 .docx 文件。')
        }

        event.target.value = ''
    }

    return { importFileInput, handleImport, handleImportFileChange }
}