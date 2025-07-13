# QLI: The Bun-Powered AI Assistant

✨ Welcome to QLI, your interactive command-line interface powered by Bun and OpenAI! ✨

## Features

*   **AI-Powered Interaction**: Communicate with an AI assistant for development tasks.
*   **File Operations**: Easily `readFile` and `writeFile` directly through AI commands.
*   **Shell Execution**: Run any shell command with AI assistance.
*   **Colorful & Expressive UI**: Enjoy a vibrant terminal experience with ANSI colors and emojis.
*   **Bun-Powered**: Leverages the speed and efficiency of the Bun runtime.

## Getting Started

### Prerequisites

*   [Bun](https://bun.sh/) installed on your system.
*   An OpenAI API key.

### Installation

1.  Clone this repository:
    ```bash
    git clone <repository-url>
    cd qli
    ```
2.  Install dependencies using Bun:
    ```bash
    bun install
    ```

### Running QLI

1.  Start the QLI assistant:
    ```bash
    bun index.js
    ```
2.  When prompted, enter your OpenAI API key.
    ```
    🔑 Please enter your OpenAI API key: sk-...
    ```
3.  Once the API key is accepted, you can start interacting with the AI assistant!

    ```
    ✅ API key accepted.
    ✨ AI assistant is ready. You can start interacting now. ✨
    ```

## Usage

Interact with QLI by typing your commands. The AI will interpret your requests and execute them.

### Examples

*   **Read a file:**
    ```
    > read the content of package.json
    ```
*   **Write a file:**
    ```
    > create a file named test.js with "console.log('Hello from QLI!');"
    ```
*   **Execute a shell command:**
    ```
    > run ls -la
    ```

---

Enjoy a smarter, more colorful CLI experience with QLI!