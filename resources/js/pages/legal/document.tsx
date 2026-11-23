import { LegalDocumentLayout } from '@/components/admin/legal/legal-document-layout'
import MainLayout from '@/layouts/MainLayout'

type Props = {
    document: {
        title: string
        slug: string
        route: string
        content: string
        version: string | null
        published_at: string | null
    }
}

export default function Document({ document }: Props) {
    return (
        <MainLayout>
            <LegalDocumentLayout
                title={document.title}
                route={document.route}
                content={document.content}
                version={document.version}
                publishedAt={document.published_at}
            />
        </MainLayout>
    )
}
