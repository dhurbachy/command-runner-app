
## 🛠️ Command Runner v1.0
A high-performance, lightweight desktop terminal bridge built with Tauri, React, and TypeScript. This application allows users to execute system-level shell commands through a sleek, modern, and customized user interface.


## ✨ Visual Experience

* Modern Terminal UI: A custom-built, dark-themed terminal interface using the Space Mono and Syne font families.
* Real-time Feedback: Includes a title bar with window controls and a dynamic Status Pill that indicates whether the system is "READY" or "RUNNING" a process.
* Styled Output: Terminal logs are color-coded for clarity:
* 🔵 Blue: Command prompts
   * ⚪ White: Standard output (stdout)
   * 🔴 Red: System and execution errors
   * 🟢 Green: Successful command exits
* Interactive Terminal Elements: Features a blinking cursor and auto-scrolling output area to mimic a native shell experience.

## 🚀 Working Functionality

* Shell Integration: Executes commands directly on the host OS (CMD for Windows, Sh for Linux/macOS) via a [Rust-based backend](https://v2.tauri.app/start/create-project/).
* App Launching: Capable of launching external applications such as:
* Browsers: Open Chrome or Edge in standard or Incognito/InPrivate modes.
   * System Tools: Directly trigger the Windows Snipping Tool overlay.
* Command History: Save and navigate through previous commands using the Up and Down arrow keys.
* Exit Monitoring: Displays the exit code (e.g., 0 for success, 1 for error) for every executed task.

## ⚠️ Current Limitations
While powerful, version 1.0 has specific constraints:

* Non-Interactive Only: Cannot handle commands requiring interactive user input (e.g., git commit without -m or npm init prompts) as it will hang the process.
* Standard Privilege: Execution is limited to the current user's permissions. It cannot automatically elevate to Administrator/Sudo for protected system tasks.
* Buffer-Based Output: Output is returned only after the command finishes. It does not currently support real-time line-by-line streaming for long-running processes like ping.
* Blocking Execution: The UI remains in a "Running" state until the shell process returns, which may temporarily disable input for long tasks.

## 🛠️ Development & Setup## Prerequisites
Ensure you have Rust and Node.js installed.
## Installation

   1. Clone the repo: git clone https://github.com/dhurbachy/command-runner-app
   2. Install JS dependencies: npm install
   3. Run in development: npm run tauri dev
   4. Build production executable: npm run tauri build

