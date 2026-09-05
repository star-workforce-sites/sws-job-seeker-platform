import mammoth from "mammoth"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WordExtractor = require("word-extractor")

function cleanText(text: string): string {
  return text
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function stripRtf(input: string): string {
  let text = input
  text = text.replace(/\\'([0-9a-fA-F]{2})/g, (_m, hex) => {
    try {
      return Buffer.from(hex, "hex").toString("latin1")
    } catch {
      return ""
    }
  })
  text = text.replace(/\\par[d]?/g, "\n")
  text = text.replace(/\\[a-zA-Z]+-?\d* ?/g, " ")
  text = text.replace(/[{}]/g, "")
  text = text.replace(/\\\\/g, "\\")
  return text
}

/**
 * Extract plain text from an uploaded resume file based on its real file
 * type, instead of naively treating the raw bytes as UTF-8 text (which
 * produces garbage for anything other than a plain .txt file and was
 * causing the AI analysis to run on noise instead of the actual resume).
 */
export async function extractResumeText(
  buffer: Buffer,
  fileType: string,
  fileName: string,
): Promise<string> {
  const ext = (fileName.split(".").pop() || "").toLowerCase()

  try {
    if (ext === "pdf" || fileType === "application/pdf") {
      const result = await pdfParse(buffer)
      return cleanText(result.text || "")
    }

    if (
      ext === "docx" ||
      ext === "dotx" ||
      ext === "docm" ||
      fileType.includes("wordprocessingml") ||
      fileType.includes("ms-word.document.macroEnabled")
    ) {
      const result = await mammoth.extractRawText({ buffer })
      return cleanText(result.value || "")
    }

    if (ext === "doc" || fileType === "application/msword") {
      const extractor = new WordExtractor()
      const doc = await extractor.extract(buffer)
      return cleanText(doc.getBody() || "")
    }

    if (ext === "rtf" || fileType === "application/rtf") {
      return cleanText(stripRtf(buffer.toString("latin1")))
    }

    return cleanText(buffer.toString("utf-8"))
  } catch (err) {
    console.error(
      `[extractResumeText] Failed to parse .${ext} file (${fileName}), falling back to raw decode:`,
      err,
    )
    return cleanText(buffer.toString("utf-8"))
  }
}
