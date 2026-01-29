import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Simple syntax highlighting tokens
type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'operator' | 'punctuation' | 'default';

interface Token {
  type: TokenType;
  value: string;
}

// Color scheme (VS Code Dark+ inspired)
const tokenColors: Record<TokenType, string> = {
  keyword: '#C586C0',    // purple/pink
  string: '#CE9178',     // orange
  number: '#B5CEA8',     // light green
  comment: '#6A9955',    // green
  function: '#DCDCAA',   // yellow
  operator: '#D4D4D4',   // white
  punctuation: '#D4D4D4', // white
  default: '#9CDCFE',    // light blue (variables)
};

// Simple tokenizer for common languages
function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'class', 'extends', 'new', 'async', 'await', 'try', 'catch', 'throw', 'true', 'false', 'null', 'undefined', 'this', 'def', 'print', 'in', 'not', 'and', 'or'];
  
  let i = 0;
  while (i < code.length) {
    // Skip whitespace but include it
    if (/\s/.test(code[i])) {
      let ws = '';
      while (i < code.length && /\s/.test(code[i])) {
        ws += code[i];
        i++;
      }
      tokens.push({ type: 'default', value: ws });
      continue;
    }
    
    // Comments
    if (code.slice(i, i + 2) === '//') {
      let comment = '';
      while (i < code.length && code[i] !== '\n') {
        comment += code[i];
        i++;
      }
      tokens.push({ type: 'comment', value: comment });
      continue;
    }
    
    // Strings (single or double quotes)
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const quote = code[i];
      let str = quote;
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\' && i + 1 < code.length) {
          str += code[i] + code[i + 1];
          i += 2;
        } else {
          str += code[i];
          i++;
        }
      }
      if (i < code.length) {
        str += code[i];
        i++;
      }
      tokens.push({ type: 'string', value: str });
      continue;
    }
    
    // Numbers
    if (/\d/.test(code[i])) {
      let num = '';
      while (i < code.length && /[\d.]/.test(code[i])) {
        num += code[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }
    
    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(code[i])) {
      let ident = '';
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
        ident += code[i];
        i++;
      }
      // Check if followed by ( for function
      const isFunction = code[i] === '(';
      if (keywords.includes(ident)) {
        tokens.push({ type: 'keyword', value: ident });
      } else if (isFunction) {
        tokens.push({ type: 'function', value: ident });
      } else {
        tokens.push({ type: 'default', value: ident });
      }
      continue;
    }
    
    // Operators and punctuation
    if (/[+\-*/%=<>!&|^~?:]/.test(code[i])) {
      tokens.push({ type: 'operator', value: code[i] });
      i++;
      continue;
    }
    
    if (/[{}[\]();,.]/.test(code[i])) {
      tokens.push({ type: 'punctuation', value: code[i] });
      i++;
      continue;
    }
    
    // Default: just add the character
    tokens.push({ type: 'default', value: code[i] });
    i++;
  }
  
  return tokens;
}

export interface CodeBlockProps {
  code: string;
  /** Frame when typing starts */
  startFrame?: number;
  /** Characters per second */
  speed?: number;
  /** Language for syntax highlighting hint */
  language?: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Background color */
  backgroundColor?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Show blinking cursor */
  showCursor?: boolean;
  /** Padding inside code block */
  padding?: number;
  /** Border radius */
  borderRadius?: number;
  /** Title bar (filename) */
  title?: string;
  /** Additional CSS styles for container */
  style?: React.CSSProperties;
}

/**
 * CodeBlock - Syntax-highlighted code that types in character by character
 * 
 * Creates a code editor-like display with typing animation and syntax highlighting
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  startFrame = 0,
  speed = 30,
  language = 'javascript',
  fontSize = 24,
  backgroundColor = '#1E1E1E',
  showLineNumbers = true,
  showCursor = true,
  padding = 20,
  borderRadius = 12,
  title,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const relativeFrame = frame - startFrame;
  if (relativeFrame < 0) return null;
  
  // Calculate how many characters to show
  const secondsElapsed = relativeFrame / fps;
  const charsToShow = Math.min(Math.floor(secondsElapsed * speed), code.length);
  const visibleCode = code.slice(0, charsToShow);
  const isComplete = charsToShow >= code.length;
  
  // Tokenize visible code
  const tokens = tokenize(visibleCode);
  
  // Calculate line numbers
  const lines = visibleCode.split('\n');
  const totalLines = code.split('\n').length;
  const lineNumberWidth = String(totalLines).length * 12 + 20;
  
  // Cursor blink
  const cursorOpacity = isComplete
    ? (Math.sin(relativeFrame * 4 * Math.PI / fps) > 0 ? 1 : 0)
    : 1;
  
  // Smooth fade-in for the container
  const containerOpacity = interpolate(
    relativeFrame,
    [0, 10],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        opacity: containerOpacity,
      }}
    >
      <div
        style={{
          backgroundColor,
          borderRadius,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxWidth: '100%',
          width: 'auto',
          minWidth: 600,
          ...style,
        }}
      >
        {/* Title bar */}
        {title && (
          <div
            style={{
              backgroundColor: '#323233',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27CA40' }} />
            </div>
            <span style={{ color: '#808080', fontSize: 14, fontFamily: 'SF Mono, Menlo, monospace' }}>
              {title}
            </span>
          </div>
        )}
        
        {/* Code content */}
        <div
          style={{
            display: 'flex',
            padding,
            fontFamily: 'SF Mono, Menlo, Monaco, Consolas, monospace',
            fontSize,
            lineHeight: 1.5,
          }}
        >
          {/* Line numbers */}
          {showLineNumbers && (
            <div
              style={{
                width: lineNumberWidth,
                color: '#858585',
                textAlign: 'right',
                paddingRight: 20,
                userSelect: 'none',
                borderRight: '1px solid #404040',
                marginRight: 20,
              }}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          
          {/* Code with syntax highlighting */}
          <div style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {tokens.map((token, i) => (
              <span key={i} style={{ color: tokenColors[token.type] }}>
                {token.value}
              </span>
            ))}
            {showCursor && (
              <span
                style={{
                  backgroundColor: '#AEAFAD',
                  opacity: cursorOpacity,
                  width: fontSize * 0.55,
                  height: fontSize * 1.2,
                  display: 'inline-block',
                  verticalAlign: 'text-bottom',
                  marginLeft: 1,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default CodeBlock;
