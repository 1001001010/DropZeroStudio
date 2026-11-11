import { parse as parseYaml } from 'yaml'

export type LegalSection = {
    id: string
    title: string
    description: string
    content: string
}

export type LegalDocumentData = {
    metadata: Record<string, any>
    sections: LegalSection[]
}

export function parseLegalDocument(content: string): LegalDocumentData {
    let metadata: Record<string, any> = {}
    let markdown = content.trim()

    // Извлекаем YAML frontmatter
    const frontmatterMatch = markdown.match(
        /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/
    )

    if (frontmatterMatch) {
        try {
            metadata = parseYaml(frontmatterMatch[1]) ?? {}
        } catch (error) {
            console.error('Ошибка разбора YAML:', error)
        }

        markdown = markdown.slice(frontmatterMatch[0].length).trim()
    }

    // Разделяем документ на секции по заголовкам ##
    const parts = markdown.split(/^##\s+(.+)$/gm)

    const sections: LegalSection[] = []

    for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i].trim()
        const rawContent = (parts[i + 1] ?? '').trim()

        // Извлекаем описание секции из HTML-комментария
        const descriptionMatch = rawContent.match(
            /^<!--\s*description:\s*(.*?)\s*-->\s*(?:\r?\n)?/
        )

        const description = descriptionMatch?.[1]?.trim() ?? ''

        const sectionContent = descriptionMatch
            ? rawContent.slice(descriptionMatch[0].length).trim()
            : rawContent

        const id = `section-${i}`

        sections.push({
            id,
            title,
            description,
            content: sectionContent,
        })
    }

    return {
        metadata,
        sections,
    }
}
