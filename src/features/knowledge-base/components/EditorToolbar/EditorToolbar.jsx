import { useState, useRef, useEffect } from 'react';
import Icon from '../../../../components/Icon/Icon';
import './EditorToolbar.css';

export default function EditorToolbar({
  onExecCommand,
  activeFormats = {},
}) {
  const [isParagraphMenuOpen, setIsParagraphMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsParagraphMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkPrompt = (e) => {
    e.preventDefault();
    const url = window.prompt('Enter link URL (e.g. https://... or /knowledge-base/...):');
    if (url) {
      onExecCommand('createLink', url);
    }
  };

  const handleFormatBlock = (tag) => {
    onExecCommand('formatBlock', tag);
    setIsParagraphMenuOpen(false);
  };

  return (
    <div className="kb-editor-toolbar" role="toolbar" aria-label="Text formatting toolbar">
      {/* Paragraph / Heading Dropdown */}
      <div className="kb-editor-toolbar__dropdown" ref={menuRef}>
        <button
          type="button"
          className="kb-toolbar-btn kb-toolbar-btn--dropdown"
          onClick={() => setIsParagraphMenuOpen((prev) => !prev)}
          aria-expanded={isParagraphMenuOpen}
          aria-label="Format text block style"
        >
          <span>{activeFormats.block || 'Paragraph'}</span>
          <Icon name="chevron-down" size={13} />
        </button>

        {isParagraphMenuOpen && (
          <div className="kb-toolbar-menu" role="menu">
            <button
              type="button"
              className="kb-toolbar-menu__item"
              onClick={() => handleFormatBlock('p')}
              role="menuitem"
            >
              Paragraph
            </button>
            <button
              type="button"
              className="kb-toolbar-menu__item"
              onClick={() => handleFormatBlock('h2')}
              role="menuitem"
            >
              Heading 2 (H2)
            </button>
            <button
              type="button"
              className="kb-toolbar-menu__item"
              onClick={() => handleFormatBlock('h3')}
              role="menuitem"
            >
              Heading 3 (H3)
            </button>
          </div>
        )}
      </div>

      <div className="kb-toolbar-divider" aria-hidden="true" />

      {/* Bold */}
      <button
        type="button"
        className={`kb-toolbar-btn ${activeFormats.bold ? 'kb-toolbar-btn--active' : ''}`}
        onClick={() => onExecCommand('bold')}
        title="Bold (Ctrl/⌘+B)"
        aria-label="Bold"
      >
        <span className="kb-toolbar-text-btn">B</span>
      </button>

      {/* Italic */}
      <button
        type="button"
        className={`kb-toolbar-btn ${activeFormats.italic ? 'kb-toolbar-btn--active' : ''}`}
        onClick={() => onExecCommand('italic')}
        title="Italic (Ctrl/⌘+I)"
        aria-label="Italic"
      >
        <span className="kb-toolbar-text-btn" style={{ fontStyle: 'italic' }}>I</span>
      </button>

      {/* Underline */}
      <button
        type="button"
        className={`kb-toolbar-btn ${activeFormats.underline ? 'kb-toolbar-btn--active' : ''}`}
        onClick={() => onExecCommand('underline')}
        title="Underline (Ctrl/⌘+U)"
        aria-label="Underline"
      >
        <span className="kb-toolbar-text-btn" style={{ textDecoration: 'underline' }}>U</span>
      </button>

      {/* Heading 2 Quick Button */}
      <button
        type="button"
        className={`kb-toolbar-btn ${activeFormats.h2 ? 'kb-toolbar-btn--active' : ''}`}
        onClick={() => onExecCommand('formatBlock', 'h2')}
        title="Heading 2"
        aria-label="Heading 2"
      >
        <span className="kb-toolbar-text-btn">H₂</span>
      </button>

      <div className="kb-toolbar-divider" aria-hidden="true" />

      {/* Bullet List */}
      <button
        type="button"
        className={`kb-toolbar-btn ${activeFormats.bulletList ? 'kb-toolbar-btn--active' : ''}`}
        onClick={() => onExecCommand('insertUnorderedList')}
        title="Bullet list"
        aria-label="Bullet list"
      >
        <span className="kb-toolbar-text-btn">• List</span>
      </button>

      {/* Numbered List */}
      <button
        type="button"
        className={`kb-toolbar-btn ${activeFormats.numberList ? 'kb-toolbar-btn--active' : ''}`}
        onClick={() => onExecCommand('insertOrderedList')}
        title="Numbered list"
        aria-label="Numbered list"
      >
        <span className="kb-toolbar-text-btn">1. List</span>
      </button>

      {/* Link */}
      <button
        type="button"
        className={`kb-toolbar-btn ${activeFormats.link ? 'kb-toolbar-btn--active' : ''}`}
        onClick={handleLinkPrompt}
        title="Insert Link"
        aria-label="Insert Link"
      >
        <span className="kb-toolbar-text-btn">Link</span>
      </button>

      <div className="kb-toolbar-divider" aria-hidden="true" />

      {/* Undo */}
      <button
        type="button"
        className="kb-toolbar-btn"
        onClick={() => onExecCommand('undo')}
        title="Undo (Ctrl/⌘+Z)"
        aria-label="Undo"
      >
        <Icon name="undo" size={15} />
      </button>

      {/* Redo */}
      <button
        type="button"
        className="kb-toolbar-btn"
        onClick={() => onExecCommand('redo')}
        title="Redo (Ctrl/⌘+Y)"
        aria-label="Redo"
      >
        <Icon name="redo" size={15} />
      </button>
    </div>
  );
}

