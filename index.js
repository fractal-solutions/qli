import { OpenAI } from "openai";
import fs from "fs";
import readline from "readline";
import { $ } from "bun";

// ANSI escape codes for colors
const Colors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",
  FgGray: "\x1b[90m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
  BgGray: "\x1b[100m",
};

console.log(`${Colors.FgCyan}${Colors.Bright}✨ Welcome to the Bun-powered AI assistant! v6.0 ✨${Colors.Reset}`);

console.log(`${Colors.FgMagenta}
███████╗   ██╗     ██╗
██╔══██╗   ██║     ██║
██║  ██║   ██║     ██║
████████╔╝ ███████╗██║
╚═══════╝  ╚══════╝╚═╝
${Colors.Reset}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// --- Helper Functions ---

async function getDirectoryListing() {
  try {
    const files = await fs.promises.readdir(process.cwd(), { withFileTypes: true });
    return files.map(file => file.isDirectory() ? `${file.name}/` : file.name).join('\n');
  } catch (error) {
    console.error("Error getting directory listing:", error.message);
    return "Error: Could not retrieve directory listing.";
  }
}

async function getOpenAIResponse(openai, history) {
    const completion = await openai.chat.completions.create({
        messages: history,
        model: "gpt-4o",
    });
    return completion.choices[0].message.content;
}

// --- Main Conversation Loop ---

async function startConversation(openai) {
  let conversationHistory = [];

  let fileList;
  try {
    fileList = await getDirectoryListing();
  } catch (error) {
    console.error("Error in startConversation while getting directory listing:", error.message);
    fileList = "Error: Could not retrieve directory listing.";
  }
  const systemPrompt = `You are a helpful AI assistant in a Bun shell. Your goal is to help the user with software development tasks.
The user is in: ${process.cwd()}
Files in this directory:
${fileList}

When you need to run a command, you MUST enclose it in a markdown code block. The tool will then execute it and feed the result back to you.

Example of reading a file:
Sure, let me read that file for you.
\`\`\`
readFile("src/index.js")
\`\`\`

Example of writing a file:
Okay, I will create that file.
\`\`\`
writeFile("hello.js", \`console.log('hello world');\`)
\`\`\`

Example of running a shell command:
Let\'s check the file permissions.
\`\`\`
ls -la
\`\`\`

IMPORTANT: When you want to write a file, you MUST use the writeFile("filename", "content") function within a markdown code block. Do NOT output the file content directly without the writeFile function.

After the command runs, you will get the result and can decide the next step. When you have the final answer for the user, respond with conversational text and NO command block.`;

  conversationHistory.push({ role: "system", content: systemPrompt });
  console.log(`${Colors.FgGreen}✨ AI assistant is ready. You can start interacting now. ✨${Colors.Reset}`);
  rl.prompt();

  rl.on("line", async (input) => {
    if (input.toLowerCase() === "exit") {
      rl.close();
      return;
    }

    conversationHistory.push({ role: "user", content: input });

    let keepProcessing = true;
    while (keepProcessing) {
        try {
            let responseContent = await getOpenAIResponse(openai, conversationHistory);
            conversationHistory.push({ role: "assistant", content: responseContent });

            // Stage 1: Find a command in a markdown block
            const commandBlockRegex = /\`\`\`(?:shell|javascript|js)?\n([\s\S]*?)\n\`\`\`/;
            const blockMatch = responseContent.match(commandBlockRegex);

            if (blockMatch) {
                const commandString = blockMatch[1].trim();
                console.log(`${Colors.FgBlue}🔍 AI command found: ${commandString}${Colors.Reset}`);

                // Stage 2: Parse the command from inside the block
                const readFileRegex = /readFile\("([^"]+)"\)/;
                const writeFileRegex = /writeFile\("([^"]+)",\s*(?:`([\s\S]*)`|"((?:\.|[^"\\])*)")\)/;

                const readFileMatch = commandString.match(readFileRegex);
                const writeFileMatch = commandString.match(writeFileRegex);

                if (readFileMatch) {
                    const path = readFileMatch[1];
                    console.log(`${Colors.FgCyan}📖 Reading file: ${path}${Colors.Reset}`);
                    try {
                        const content = await fs.promises.readFile(path, "utf-8");
                        conversationHistory.push({ role: "system", content: `Content of ${path}:\n${content}` });
                    } catch (e) {
                        conversationHistory.push({ role: "system", content: `Error reading file: ${e.message}` });
                    }
                } else if (writeFileMatch) {
                    const path = writeFileMatch[1];
                    const content = writeFileMatch[2] || writeFileMatch[3] || ''; // Backticks or quotes
                    console.log(`${Colors.FgMagenta}✍️ Writing to file: ${path}${Colors.Reset}`);
                     try {
                        await fs.promises.writeFile(path, content);
                        conversationHistory.push({ role: "system", content: `Successfully wrote to ${path}.` });
                    } catch (e) {
                        conversationHistory.push({ role: "system", content: `Error writing file: ${e.message}` });
                    }
                } else { // It's a shell command
                    console.log(`${Colors.FgYellow}⚡ Executing shell: ${commandString}${Colors.Reset}`);
                    const { stdout, stderr } = Bun.spawn({
                            cmd: ["bash", "-c", commandString],
                            env: { PATH:
                              "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" },
                            stdout: "pipe",
                            stderr: "pipe",
                        });

                    const output = (await new Response(stdout).text()) || (await new Response(stderr).text());
                    conversationHistory.push({ role: "system", content: `Command output:\n${output}` });
                }
            } else {
                keepProcessing = false;
                console.log(`AI: ${responseContent}`);
            }
        } catch (error) {
            console.error("Error:", error.message);
            keepProcessing = false;
        }
    } // end while

    rl.prompt();
  });
}

// --- Main Execution ---
rl.question(`${Colors.FgYellow}🔑 Please enter your OpenAI API key: ${Colors.Reset}`, (apiKey) => {
  if (!apiKey || apiKey.trim() === "") {
    console.log(`${Colors.FgRed}❌ API key is required. Exiting.${Colors.Reset}`);
    rl.close();
    return;
  }
  const openai = new OpenAI({ apiKey });
  console.log(`${Colors.FgGreen}✅ API key accepted.${Colors.Reset}`);
  startConversation(openai);
});

rl.on('close', () => {
  console.log('Exiting assistant. Goodbye!');
  process.exit(0);
});