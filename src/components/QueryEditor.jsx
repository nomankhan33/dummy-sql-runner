import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { format } from 'sql-formatter';
import './QueryEditor.css';

const QueryEditor = ({ query, onChange, darkMode }) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      monaco.editor.defineTheme('sqlThemeLight', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#ffffff',
        }
      });

      monaco.editor.defineTheme('sqlThemeDark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1e1e1e',
        }
      });

      editorRef.current = monaco.editor.create(containerRef.current, {
        value: query,
        language: 'sql',
        theme: darkMode ? 'sqlThemeDark' : 'sqlThemeLight',
        automaticLayout: true,
        minimap: {
          enabled: false
        },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        fontSize: 14,
        tabSize: 2,
        wordWrap: 'on',
        padding: {
          top: 10,
          bottom: 10
        }
      });

      editorRef.current.onDidChangeModelContent(() => {
        onChange(editorRef.current.getValue());
      });

      const handleResize = () => {
        if (editorRef.current) {
          editorRef.current.layout();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (editorRef.current) {
          editorRef.current.dispose();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(darkMode ? 'sqlThemeDark' : 'sqlThemeLight');
    }
  }, [darkMode]);

  useEffect(() => {
    if (editorRef.current && query !== editorRef.current.getValue()) {
      editorRef.current.setValue(query);
    }
  }, [query]);

  const formatQuery = () => {
    if (editorRef.current) {
      try {
        const currentQuery = editorRef.current.getValue();
        const formattedText = format(currentQuery, { language: 'sql' });
        editorRef.current.setValue(formattedText);
      } catch (error) {
        console.error("Error formatting SQL query:", error);
      }
    }
  };

  return (
    <div className="query-editor">
      <div className="editor-header">
        <span>SQL Query</span>
        <div className="editor-actions">
          <button 
            className="action-button"
            onClick={formatQuery}
            title="Format SQL"
            aria-label="Format SQL query"
          >
            Format
          </button>
        </div>
      </div>
      <div 
        ref={containerRef} 
        className="editor-container"
      />
    </div>
  );
};

export default QueryEditor;