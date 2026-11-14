
import { parse as parseYaml } from 'yaml'

import type {
    LegalDocumentData,
    LegalMetadata,
    LegalSection,
} from '@/types/index.d'

/**
 * Проверяет, что YAML-значение является объектом с метаданными.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    )
}

/**
 * Извлекает YAML frontmatter из начала Markdown-документа.
 */
function extractFrontmatter(content: string): {
    metadata: LegalMetadata
    markdown: string
} {
    const match = content.match(
        /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/,
    )

    if (!match) {
        return {
            metadata: {},
            markdown: content,
        }
    }

    let parsedMetadata: unknown

    try {
        parsedMetadata = parseYaml(match[1]) as unknown
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Неизвестная ошибка разбора YAML.'

        throw new Error(`Некорректный YAML frontmatter: ${message}`)
    }

    if (parsedMetadata == null) {
        parsedMetadata = {}
    }

    if (!isRecord(parsedMetadata)) {
        throw new Error(
            'YAML frontmatter должен содержать объект с метаданными.',
        )
    }

    return {
        metadata: parsedMetadata,
        markdown: content.slice(match[0].length).trim(),
    }
}

/**
 * Извлекает описание из HTML-комментария в начале раздела.
 *
 * Формат:
 * <!-- description: Описание раздела -->
 */
function extractDescription(content: string): {
    description: string
    content: string
} {
    const match = content.match(
        /^[ \t]*<!--[ \t]*description:[ \t]*([\s\S]*?)-->[ \t]*(?:\r?\n|$)/i,
    )

    if (!match) {
        return {
            description: '',
            content: content.trim(),
        }
    }

    return {
        description: match[1].trim(),
        content: content.slice(match[0].length).trim(),
    }
}

/**
 * Разделяет Markdown на секции по заголовкам второго уровня.
 *
 * Заголовки внутри блоков кода игнорируются.
 * Подзаголовки третьего уровня остаются содержимым секции.
 */
function extractSections(markdown: string): LegalSection[] {
    const lines = markdown.split(/\r?\n/)
    const sections: LegalSection[] = []

    let currentTitle: string | null = null
    let currentContent: string[] = []

    let codeFence: {
        character: string
        length: number
    } | null = null

    const saveSection = () => {
        if (currentTitle === null) {
            return
        }

        const rawContent = currentContent.join('\n').trim()
        const { description, content } = extractDescription(rawContent)

        sections.push({
            id: `section-${sections.length + 1}`,
            title: currentTitle,
            description,
            content,
        })
    }

    for (const line of lines) {
        const fenceMatch = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/)

        if (fenceMatch) {
            const marker = fenceMatch[1]
            const character = marker[0]

            if (!codeFence) {
                codeFence = {
                    character,
                    length: marker.length,
                }
            } else if (
                character === codeFence.character &&
                marker.length >= codeFence.length
            ) {
                codeFence = null
            }

            if (currentTitle !== null) {
                currentContent.push(line)
            }

            continue
        }

        // Не принимаем заголовки внутри fenced code blocks.
        if (!codeFence) {
            const headingMatch = line.match(
                /^[ \t]{0,3}##(?!#)[ \t]+(.+?)\s*#*[ \t]*$/,
            )

            if (headingMatch) {
                saveSection()

                currentTitle = headingMatch[1].trim()
                currentContent = []

                continue
            }
        }

        if (currentTitle !== null) {
            currentContent.push(line)
        }
    }

    saveSection()

    return sections
}

/**
 * Разбирает юридический документ в формате Markdown.
 *
 * Поддерживает:
 * - YAML frontmatter;
 * - разделы второго уровня (##);
 * - подразделы третьего уровня (###);
 * - описание раздела через HTML-комментарий.
 */
export function parseLegalDocument(
    content: string,
): LegalDocumentData {
    const normalizedContent = content.trim()

    const { metadata, markdown } =
        extractFrontmatter(normalizedContent)

    return {
        metadata,
        sections: extractSections(markdown),
    }
}
