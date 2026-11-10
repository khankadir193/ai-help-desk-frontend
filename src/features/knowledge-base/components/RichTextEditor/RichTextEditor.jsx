import { useRef, useEffect, useState, useCallback } from 'react';
import EditorToolbar from '../EditorToolbar/EditorToolbar';
import { wordCount, readingTime } from '../../utils/kbUtils';
import './RichTextEditor.css';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Write your article content here...' }) {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});
  const isInternalUpdate = useRef(false);

  // Sync incoming value to editor innerHTML only when external change
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  // Check active format states
  const updateActiveFormats = useCallback(() => {
    if (!document) return;
    try {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      const isBulletList = document.queryCommandState('insertUnorderedList');
      const isNumberList = document.queryCommandState('insertOrderedList');
      const blockType = document.queryCommandValue('formatBlock');

      let blockLabel = 'Paragraph';
      if (blockType && blockType.toLowerCase().includes('h2')) blockLabel = 'Heading 2';
      if (blockType && blockType.toLowerCase().includes('h3')) blockLabel = 'Heading 3';

      setActiveFormats({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        bulletList: isBulletList,
        numberList: isNumberList,
        block: blockLabel,
        h2: blockType && blockType.toLowerCase().includes('h2'),
      });
    } catch {
      // Ignore queryCommandState error if not supported
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      const html = editorRef.current.innerHTML;
      onChange?.(html);
      updateActiveFormats();
    }
  };

  // Execute formatting command
  const execCommand = (command, arg = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  // Clean text paste
  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        execCommand('bold');
      } else if (key === 'i') {
        e.preventDefault();
        execCommand('italic');
      } else if (key === 'u') {
        e.preventDefault();
        execCommand('underline');
      } else if (key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          execCommand('redo');
        } else {
          execCommand('undo');
        }
      } else if (key === 'y') {
        e.preventDefault();
        execCommand('redo');
      }
    }
  };

  const words = wordCount(value);
  const minutes = readingTime(value);

  return (
    <div className="kb-rich-editor">
      <EditorToolbar
        onExecCommand={execCommand}
        activeFormats={activeFormats}
      />

      <div
        ref={editorRef}
        className="kb-rich-editor__content"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        data-placeholder={placeholder}
        role="textbox"
        aria-multiline="true"
        aria-label="Article content"
      />

      <div className="kb-rich-editor__footer">
        <span className="kb-rich-editor__words">
          {words} words · Reading time: {minutes} min
        </span>
        <span className="kb-rich-editor__status">Rich text · English</span>
      </div>
    </div>
  );
}

