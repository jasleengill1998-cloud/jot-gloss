import { useEffect, useRef, useState } from 'react'
import type { StudyFile } from '../types'

interface Props {
  file: StudyFile
  relatedFiles?: StudyFile[]
  onSelectVersion?: (file: StudyFile) => void
  onArchiveVersion?: (id: string) => void
  onRestoreVersion?: (file: StudyFile) => void
  onPersistState?: (id: string, state: Record<string, unknown>) => void
  onClose: () => void
}

function hasJsxSyntax(code: string): boolean {
  return /<[A-Z][a-zA-Z]*[\s/>]/.test(code) ||
         /return\s*\(?\s*</.test(code) ||
         /<\/[A-Z]/.test(code) ||
         /<\/[a-z]+>/.test(code) ||
         /<[a-z]+\s+[a-z]/.test(code)
}

function preprocessCode(code: string): { processed: string; componentName: string; fallbacks: string } {
  const processed = code
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/^\s*import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
    .replace(/^\s*import\s+['"].*?['"];?\s*$/gm, '')
    .replace(/export\s+default\s+function\s+/g, 'function ')
    .replace(/export\s+default\s+class\s+/g, 'class ')
    .replace(/export\s+(?=(?:function|const|let|var|class)\s+)/g, '')
    .replace(/^\s*export\s+default\s+(\w+)\s*;?\s*$/gm, '')

  const funcMatches = [...processed.matchAll(/(?:function|class)\s+([A-Z][A-Za-z0-9]*)/g)]
  const arrowMatches = [...processed.matchAll(/(?:const|let|var)\s+([A-Z][A-Za-z0-9]*)\s*=/g)]
  const allNames = funcMatches.map(m => m[1]).concat(arrowMatches.map(m => m[1]))

  let componentName = 'App'
  if (allNames.length > 0) {
    componentName = allNames.find(n => n === 'App') || allNames[allNames.length - 1]
  }

  const fallbacks = allNames
    .filter(n => n !== componentName)
    .map(n => `if(typeof ${n}==="function")return ${n};`)
    .join('\n')

  return { processed, componentName, fallbacks }
}

/* Human-readable title */
function humanTitle(name: string): string {
  let base = name.replace(/\.[^.]+$/, '')
  // Collapse course-code dashes: m-b-a-s-801 → mbas801
  base = base.replace(/^m[-_]b[-_]a[-_]s[-_]?(\d{3})/i, 'mbas$1')
  base = base.replace(/^mbas[-_]?\d{3}[-_]/i, '')
  return base.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase()).trim()
}

function JsxViewer({
  code,
  fileId,
  savedState,
  onPersistState,
}: {
  code: string
  fileId: string
  savedState?: Record<string, unknown>
  onPersistState?: (id: string, state: Record<string, unknown>) => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [showSource, setShowSource] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Listen for messages from the sandbox iframe. The iframe is a null-origin
  // sandbox loaded from /preview.html, so origin checks against a URL are
  // meaningless — instead we verify the message came from THIS iframe's
  // window and that any state payload is a well-formed plain object within
  // limits.
  useEffect(() => {
    const MAX_STATE_BYTES = 256 * 1024
    const isPlainObject = (v: unknown): v is Record<string, unknown> =>
      typeof v === 'object' && v !== null && !Array.isArray(v) &&
      (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null)

    const handler = (e: MessageEvent) => {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return
      const data = e.data
      if (!data || typeof data !== 'object') return
      const t = (data as { type?: unknown }).type
      if (t === 'sb-ready') {
        setIframeReady(true)
        return
      }
      if (t !== 'sb-state-save') return
      const state = (data as { state?: unknown }).state
      if (!isPlainObject(state)) return
      let serialized: string
      try { serialized = JSON.stringify(state) } catch { return }
      if (serialized.length > MAX_STATE_BYTES) return
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        onPersistState?.(fileId, state)
      }, 700)
    }
    window.addEventListener('message', handler)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      window.removeEventListener('message', handler)
    }
  }, [fileId, onPersistState])

  // When the iframe is ready and the code/state changes, post a render
  // request. We never set srcdoc anymore — the iframe loads /preview.html
  // and we communicate exclusively over postMessage.
  useEffect(() => {
    if (!iframeReady || !iframeRef.current?.contentWindow) return
    const { processed, componentName, fallbacks } = preprocessCode(code)
    const needsBabel = hasJsxSyntax(processed)
    iframeRef.current.contentWindow.postMessage({
      type: 'sb-render',
      code: processed,
      componentName,
      fallbacks,
      needsBabel,
      savedState: savedState ?? null,
    }, '*')
  }, [code, savedState, iframeReady])

  return (
    <div className="flex flex-col gap-3 h-full">
      <iframe
        ref={iframeRef}
        src="/preview.html"
        sandbox="allow-scripts"
        title="JSX Preview"
        className="flex-1 w-full min-h-[400px]"
        style={{ border: '1px solid rgba(184,149,106,0.18)', background: '#FFF8F2', borderRadius: 2 }}
      />
      <div>
        <button
          onClick={() => setShowSource(!showSource)}
          className="font-heading text-[10px] font-semibold transition-colors"
          style={{ color: '#C88898' }}
        >
          {showSource ? '\u25be hide source' : '\u25b8 view source'}
        </button>
        {showSource && (
          <pre className="mt-2 p-4 overflow-x-auto text-[11px] leading-relaxed"
               style={{ background: '#5A3E4B', color: '#FFF8F2', borderRadius: 2 }}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}

const HTML_BASE_STYLE = `<style data-jotgloss-base>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');
body { font-family: 'EB Garamond', 'Cormorant Garamond', Georgia, serif; color: #5A3E4B; background: #FFF8F2; line-height: 1.55; font-size: 15px; -webkit-font-smoothing: antialiased; }
h1,h2,h3,h4,h5,h6 { font-family: 'Cormorant Garamond', Georgia, serif; color: #5A3E4B; font-weight: 700; }
button { font-family: 'Cormorant Garamond', Georgia, serif; border-radius: 2px; cursor: pointer; letter-spacing: 0.04em; }
a { color: #C97C8A; }
table { border-collapse: collapse; } th { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #C97C8A; border-bottom: 1px solid rgba(184,149,106,0.18); padding: 8px 10px; text-align: left; } td { padding: 7px 10px; border-bottom: 1px solid rgba(184,149,106,0.1); }
hr { border: none; border-top: 1px solid rgba(184,149,106,0.18); }
code { background: rgba(184,149,106,0.08); padding: 1px 5px; border-radius: 2px; font-size: 0.9em; }
blockquote { border-left: 3px solid #C8A878; padding-left: 14px; color: rgba(90,62,75,0.7); font-style: italic; }
</style><script data-jotgloss-print>
window.addEventListener('message', function(e) {
  if (e && e.data && e.data.type === 'sb-print') {
    try { window.focus(); window.print(); } catch (_) {}
  }
});
</script>`

function injectBaseStyle(html: string): string {
  if (html.includes('<head>')) return html.replace('<head>', '<head>' + HTML_BASE_STYLE)
  if (html.includes('<html>')) return html.replace('<html>', '<html><head>' + HTML_BASE_STYLE + '</head>')
  return HTML_BASE_STYLE + html
}

function HtmlViewer({ html }: { html: string }) {
  return (
    <iframe
      srcDoc={injectBaseStyle(html)}
      sandbox="allow-scripts"
      title="HTML Preview"
      className="w-full h-[70dvh]"
      style={{ border: '1px solid rgba(184,149,106,0.18)', background: '#FFF8F2', borderRadius: 2 }}
    />
  )
}

function PdfViewer({ dataUrl }: { dataUrl: string }) {
  return (
    <iframe
      src={dataUrl}
      title="PDF Preview"
      className="w-full h-[70dvh]"
      style={{ border: '1px solid rgba(184,149,106,0.14)', borderRadius: 2 }}
    />
  )
}

let RMModule: any = null

function MarkdownViewer({ content }: { content: string }) {
  const [MD, setMD] = useState<any>(() => RMModule)

  useEffect(() => {
    if (!RMModule) {
      import('react-markdown').then(mod => {
        RMModule = mod.default
        setMD(mod.default)
      }).catch(() => {
        setMD(null)
      })
    }
  }, [])

  if (!MD) {
    return (
      <div className="p-6" style={{ background: '#FFF8F2', border: '1px solid rgba(184,149,106,0.14)', borderRadius: 2 }}>
        <p className="font-heading text-[13px] italic" style={{ color: 'rgba(200,136,152,0.5)' }}>Loading markdown viewer...</p>
      </div>
    )
  }

  return (
    <div className="prose prose-sm max-w-none p-6 overflow-auto max-h-[70dvh]"
         style={{ fontSize: 15, color: '#5A3E4B', fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif", lineHeight: 1.55, background: '#FFF8F2', border: '1px solid rgba(184,149,106,0.14)', borderRadius: 2 }}>
      <MD>{content}</MD>
    </div>
  )
}

function OtherViewer({ file }: { file: StudyFile }) {
  if (file.content.startsWith('data:')) {
    return (
      <div className="text-center py-10">
        <p className="mb-3 font-heading text-[13px] italic" style={{ color: 'rgba(200,136,152,0.5)' }}>Binary file — cannot preview inline.</p>
        <a href={file.content} download={file.name}
           className="inline-block px-5 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.15em]"
           style={{ background: '#F0849C', color: '#FFF4F0', borderRadius: 2 }}>
          Download {file.name}
        </a>
      </div>
    )
  }
  return <pre className="text-[12px] font-body whitespace-pre-wrap leading-relaxed" style={{ color: '#5A3E4B' }}>{file.content}</pre>
}

export default function FileViewer({
  file,
  relatedFiles,
  onSelectVersion,
  onArchiveVersion,
  onRestoreVersion,
  onPersistState,
  onClose,
}: Props) {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (fullscreen) setFullscreen(false); else onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, fullscreen])

  const effectiveType = (() => {
    if (file.type !== 'other') return file.type
    const c = file.content
    if (c.startsWith('data:application/pdf')) return 'pdf' as const
    if (/React\.createElement|function\s+[A-Z]\w*\s*\(|const\s+[A-Z]\w*\s*=/.test(c) || hasJsxSyntax(c)) return 'jsx' as const
    if (/^\s*<!doctype\s+html|^\s*<html/i.test(c) || /<\/(?:div|body|html)>/i.test(c)) return 'html' as const
    if (/^#\s|\n##\s|\*\*.*\*\*|\[.*\]\(.*\)/.test(c)) return 'markdown' as const
    return file.type
  })()

  const title = humanTitle(file.name)

  const handlePrint = () => {
    const iframe = document.querySelector('iframe[title="JSX Preview"], iframe[title="HTML Preview"]') as HTMLIFrameElement | null
    iframe?.contentWindow?.postMessage({ type: 'sb-print' }, '*')
  }

  const handleFullscreen = () => {
    setFullscreen(!fullscreen)
  }

  return (
    <div
      className="folio-viewer-shell animate-fadeIn"
      role="region"
      aria-label={`Viewing ${file.name}`}
    >
      <div
        className="flex flex-col overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--color-parchment, #faf6f0)',
          borderBottom: '1px solid rgba(169, 151, 141, 0.18)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        <div
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between px-5 sm:px-8 py-4 sm:py-5 gap-3"
          style={{ borderBottom: '1px solid rgba(169, 151, 141, 0.16)', background: 'rgba(255, 246, 240, 0.94)', position: 'relative', zIndex: 1 }}
        >
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-[19px] sm:text-[22px] font-bold text-[#5A3E4B] truncate">{title}</h2>
            <p className="font-heading text-[11px] sm:text-[12px] italic mt-1" style={{ color: 'rgba(90,62,75,0.62)' }}>
              {file.className} · {file.resourceType}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={handleFullscreen} className="font-heading text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-1" style={{ color: '#C8A878' }}>
              {fullscreen ? 'exit' : 'fullscreen'}
            </button>
            {effectiveType !== 'pdf' && <button onClick={handlePrint} className="font-heading text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-1" style={{ color: '#C8A878' }}>print</button>}
            <button onClick={() => { if (fullscreen) setFullscreen(false); else onClose() }} className="font-heading text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-1" style={{ color: '#F0849C' }}>
              close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 sm:px-8 py-4 sm:py-6" style={{ background: 'rgba(255, 246, 240, 0.9)', position: 'relative', zIndex: 1 }}>
          {effectiveType === 'jsx' && <JsxViewer code={file.content} fileId={file.id} savedState={file.viewerState} onPersistState={onPersistState} />}
          {effectiveType === 'html' && <HtmlViewer html={file.content} />}
          {effectiveType === 'pdf' && <PdfViewer dataUrl={file.content} />}
          {effectiveType === 'markdown' && <MarkdownViewer content={file.content} />}
          {effectiveType === 'other' && <OtherViewer file={file} />}
        </div>

        {relatedFiles && relatedFiles.length > 1 && (
          <div className="px-6 sm:px-8 py-3 sm:py-4" style={{ borderTop: '1px solid rgba(169, 151, 141, 0.16)', background: 'rgba(255, 246, 240, 0.92)', position: 'relative', zIndex: 1 }}>
            <div className="font-heading text-[9px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: '#C8A878' }}>Saved versions</div>
            <div className="space-y-1">
              {relatedFiles.map(rel => (
                <div key={rel.id} className="flex items-center justify-between py-1 cursor-pointer" onClick={() => onSelectVersion?.(rel)}>
                  <span className="font-heading text-[11px]" style={{ color: rel.id === file.id ? '#F0849C' : '#5A3E4B80', fontWeight: rel.id === file.id ? 700 : 400 }}>
                          v{rel.version} {rel.archived ? '(saved)' : ''}
                  </span>
                  <span className="font-heading text-[9px] italic" style={{ color: '#C8A87880' }}>{new Date(rel.updatedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
