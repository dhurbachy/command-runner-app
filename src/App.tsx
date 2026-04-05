import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface OutputLine {
  text: string;
  type: "info" | "prompt" | "stdout" | "error" | "success";
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap');

  .cr-root {
    font-family: 'Space Mono', monospace;
    background: #0d1117;
    border-radius: 12px;
    border: 1px solid #30363d;
    overflow: hidden;
    min-height: 420px;
    display: flex;
    flex-direction: column;
  }

  .cr-titlebar {
    background: #161b22;
    border-bottom: 1px solid #30363d;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    user-select: none;
  }

  .cr-dots { display: flex; gap: 6px; }
  .cr-dot { width: 12px; height: 12px; border-radius: 50%; }
  .cr-dot-red    { background: #ff5f57; }
  .cr-dot-yellow { background: #febc2e; }
  .cr-dot-green  { background: #28c840; }

  .cr-title {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #7d8590;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 auto;
  }

  .cr-status-pill {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 20px;
    border: 1px solid #1a6b28;
    color: #39d353;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .cr-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #39d353;
  }
  .cr-status-dot.ready  { animation: cr-pulse 2s ease-in-out infinite; }
  .cr-status-dot.running { background: #e3b341; animation: none; }

  .cr-status-pill.running { border-color: #854f0b; color: #e3b341; }

  .cr-output {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    min-height: 280px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cr-line {
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .cr-line.info    { color: #7d8590; font-size: 12px; }
  .cr-line.prompt  { color: #58a6ff; }
  .cr-line.stdout  { color: #e6edf3; padding-left: 16px; border-left: 2px solid #1f2937; }
  .cr-line.error   { color: #f85149; padding-left: 16px; border-left: 2px solid #f85149; }
  .cr-line.success { color: #39d353; }

  .cr-separator { height: 1px; background: #30363d; margin: 8px 0; opacity: 0.5; }

  .cr-cursor {
    display: inline-block;
    width: 8px;
    height: 14px;
    background: #39d353;
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: cr-blink 1s step-end infinite;
  }

  .cr-input-row {
    border-top: 1px solid #30363d;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #161b22;
  }

  .cr-prompt-symbol {
    color: #39d353;
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    user-select: none;
    flex-shrink: 0;
  }

  .cr-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    box-shadow: none;
    color: #e6edf3;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    caret-color: #39d353;
    padding: 0;
  }
  .cr-input::placeholder { color: #7d8590; }
  .cr-input:disabled { opacity: 0.5; }

  .cr-run-btn {
    background: transparent;
    border: 1px solid #1a6b28;
    color: #39d353;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    padding: 5px 14px;
    border-radius: 4px;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 56px;
    height: 28px;
  }
  .cr-run-btn:hover:not(:disabled) { background: #1a6b28; border-color: #39d353; }
  .cr-run-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .cr-run-btn.loading { border-color: #854f0b; color: #e3b341; }

  .cr-spinner {
    width: 12px;
    height: 12px;
    border: 2px solid #e3b341;
    border-top-color: transparent;
    border-radius: 50%;
    animation: cr-spin 0.7s linear infinite;
  }

  .cr-footer {
    background: #161b22;
    border-top: 1px solid #30363d;
    padding: 6px 20px;
    display: flex;
    gap: 20px;
    align-items: center;
  }
  .cr-footer-item {
    font-size: 10px;
    color: #7d8590;
    font-family: 'Space Mono', monospace;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .cr-footer-item span { color: #79c0ff; }
  .cr-footer-hint { margin-left: auto; }

  @keyframes cr-pulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes cr-blink  { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes cr-spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default function App() {
  const [lines, setLines] = useState<OutputLine[]>([
    { text: "// command runner v1.0.0 — tauri shell bridge", type: "info" },
    { text: "// type a command and press enter or click run", type: "info" },
  ]);
  const [command, setCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [exitCode, setExitCode] = useState<string>("—");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  function addLines(newLines: OutputLine[]) {
    setLines(prev => [...prev, ...newLines]);
  }

  async function executeCommand() {
    const cmd = command.trim();
    if (!cmd) return;

    setHistory(prev => [cmd, ...prev]);
    setHistoryIdx(-1);
    setCommand("");
    setIsLoading(true);
    setExitCode("—");

    addLines([{ text: `$ ${cmd}`, type: "prompt" }]);

    try {
      const result = await invoke<string>("run_shell_command", { cmd });
      const outputLines: OutputLine[] = result
        .split("\n")
        .filter(l => l !== "")
        .map(l => ({ text: l, type: "stdout" }));
      addLines([...outputLines, { text: "✓ exited 0", type: "success" }]);
      setExitCode("0");
    } catch (err) {
      addLines([
        { text: String(err), type: "error" },
        { text: "✗ exited 1", type: "error" },
      ]);
      setExitCode("1");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      executeCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistoryIdx(prev => {
        const next = Math.min(prev + 1, history.length - 1);
        setCommand(history[next] ?? "");
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistoryIdx(prev => {
        const next = prev - 1;
        if (next < 0) { setCommand(""); return -1; }
        setCommand(history[next] ?? "");
        return next;
      });
    }
  }

  return (
    <>
      <style>{styles}</style>
      <main className="cr-root">
        {/* Title bar */}
        <div className="cr-titlebar">
          <div className="cr-dots">
            <div className="cr-dot cr-dot-red" />
            <div className="cr-dot cr-dot-yellow" />
            <div className="cr-dot cr-dot-green" />
          </div>
          <div className="cr-title">command runner</div>
          <div className={`cr-status-pill ${isLoading ? "running" : ""}`}>
            <div className={`cr-status-dot ${isLoading ? "running" : "ready"}`} />
            {isLoading ? "running" : "ready"}
          </div>
        </div>

        {/* Output */}
        <div className="cr-output" ref={outputRef}>
          <div className="cr-separator" />
          {lines.map((line, i) => (
            <div key={i} className={`cr-line ${line.type}`}>
              {line.text}
            </div>
          ))}
          {!isLoading && <div className="cr-line">
            <span className="cr-cursor" />
          </div>}
        </div>

        {/* Input row */}
        <div className="cr-input-row">
          <div className="cr-prompt-symbol">$</div>
          <input
            ref={inputRef}
            className="cr-input"
            type="text"
            value={command}
            onChange={e => setCommand(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder="enter command (e.g. dir, echo 'hello')..."
            disabled={isLoading}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            className={`cr-run-btn ${isLoading ? "loading" : ""}`}
            onClick={executeCommand}
            disabled={isLoading}
          >
            {isLoading ? <div className="cr-spinner" /> : "RUN"}
          </button>
        </div>

        {/* Footer */}
        <div className="cr-footer">
          <div className="cr-footer-item">shell <span>zsh</span></div>
          <div className="cr-footer-item">history <span>{history.length}</span></div>
          <div className="cr-footer-item">exit <span>{exitCode}</span></div>
          <div className="cr-footer-item cr-footer-hint">↑ ↓ history · enter to run</div>
        </div>
      </main>
    </>
  );
}