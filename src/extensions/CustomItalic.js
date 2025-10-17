import Italic from '@tiptap/extension-italic'

export const CustomItalic = Italic.extend({
    renderHTML({ HTMLAttributes }) {
        return ['i', HTMLAttributes, 0]
    },
})