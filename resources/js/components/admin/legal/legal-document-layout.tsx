
import { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import {
    ArrowLeft,
    ArrowUpRight,
    ShieldCheck,
    ChevronRight,
    Menu,
    X,
    FileText,
    Package,
} from 'lucide-react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

import { parseLegalDocument } from '@/lib/legal-document'

type Props = {
    title: string
    route: string
    content: string
    version?: string | null
    publishedAt?: string | null
    preview?: boolean
}

const navigation = [
    { label: 'Главная', href: '/' },
    { label: 'Конфиденциальность', href: '/legal/privacy' },
    {
        label: 'Согласие на обработку ПД',
        href: '/legal/personal-data-consent',
    },
    {
        label: 'Пользовательское соглашение',
        href: '/legal/terms',
    },
    { label: 'Публичная оферта', href: '/legal/offer' },
]

export function LegalDocumentLayout({
    title,
    route,
    content,
    version,
    publishedAt,
    preview = false,
}: Props) {
    const [activeSection, setActiveSection] = useState('')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const { metadata, sections } = parseLegalDocument(content)

    const pageTitle = metadata.title || title
    const description = metadata.description || ''
    const importantTitle =
        metadata.important_title || 'Важная информация'
    const importantText = metadata.important_text || ''
    const contactTitle =
        metadata.contact_title || 'Остались вопросы?'
    const contactText = metadata.contact_text || ''
    const contactEmail =
        metadata.contact_email || 'dropzerostudio@gmail.com'

    const scrollToSection = (id: string) => {
        setActiveSection(id)
        setMobileMenuOpen(false)

        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
    }

    const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString('ru-RU')
        : null

    return (
        <>
            <Head>
                <title>
                    {metadata.seo_title || `${pageTitle} — DropZeroStudio`}
                </title>

                {metadata.seo_description && (
                    <meta
                        head-key="description"
                        name="description"
                        content={metadata.seo_description}
                    />
                )}

                <meta
                    head-key="robots"
                    name="robots"
                    content={metadata.robots || 'index, follow'}
                />

                {metadata.seo_keywords && (
                    <meta
                        head-key="keywords"
                        name="keywords"
                        content={metadata.seo_keywords}
                    />
                )}

                <meta
                    head-key="og:title"
                    property="og:title"
                    content={metadata.seo_title || pageTitle}
                />

                {metadata.seo_description && (
                    <meta
                        head-key="og:description"
                        property="og:description"
                        content={metadata.seo_description}
                    />
                )}

                <meta
                    head-key="og:type"
                    property="og:type"
                    content="website"
                />

                <meta
                    head-key="og:site_name"
                    property="og:site_name"
                    content="DropZeroStudio"
                />

                <meta
                    head-key="og:locale"
                    property="og:locale"
                    content="ru_RU"
                />
            </Head>

            <div className="min-h-screen bg-[#050505] text-white">
                <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#050505]/90 backdrop-blur-xl">
                    <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AA141E]/10 text-[#AA141E] transition-colors group-hover:bg-[#AA141E]/20">
                                <ShieldCheck size={19} />
                            </div>

                            <span className="text-[13px] font-bold tracking-[0.18em]">
                                DROPZERO<span className="text-[#AA141E]">STUDIO</span>
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-6 sm:flex">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`text-[12px] transition-colors hover:text-white ${item.href === route
                                        ? 'text-white'
                                        : 'text-white/45'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 sm:hidden"
                            aria-label="Открыть меню"
                        >
                            {mobileMenuOpen ? (
                                <X size={19} />
                            ) : (
                                <Menu size={19} />
                            )}
                        </button>
                    </div>

                    {mobileMenuOpen && (
                        <div className="border-t border-white/[0.07] bg-[#080808] px-5 py-5 sm:hidden">
                            <div className="flex flex-col gap-4 text-[13px]">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={
                                            item.href === route
                                                ? 'text-white'
                                                : 'text-white/60'
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </header>

                {preview && (
                    <div className="border-b border-[#AA141E]/20 bg-[#AA141E]/10 px-5 py-2 text-center text-[11px] font-medium text-[#e87980]">
                        Предпросмотр редакции — эта версия ещё не опубликована
                    </div>
                )}

                <main className="mx-auto max-w-[1440px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:px-12">
                    <Link
                        href="/"
                        className="mb-12 inline-flex items-center gap-2 text-[12px] text-white/35 transition-colors hover:text-white"
                    >
                        <ArrowLeft size={14} />
                        Вернуться на главную
                    </Link>

                    <div className="mb-14 max-w-3xl">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#AA141E]/20 bg-[#AA141E]/10 text-[#AA141E]">
                                <Package size={19} />
                            </div>

                            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#AA141E]">
                                {metadata.eyebrow || 'ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ'}
                            </span>
                        </div>

                        <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-[64px]">
                            {pageTitle}
                        </h1>

                        {description && (
                            <p className="mt-7 max-w-2xl text-[14px] leading-7 text-white/45 sm:text-[15px]">
                                {description}
                            </p>
                        )}

                        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/[0.08] pt-6">
                            <div>
                                <span className="block text-[9px] uppercase tracking-[0.2em] text-white/25">
                                    Последнее обновление
                                </span>

                                <span className="mt-1 block text-[12px] text-white/65">
                                    {formattedDate || 'Не опубликовано'}
                                </span>
                            </div>

                            <div>
                                <span className="block text-[9px] uppercase tracking-[0.2em] text-white/25">
                                    Документ
                                </span>

                                <span className="mt-1 block text-[12px] text-white/65">
                                    {sections.length} разделов
                                    {version ? ` · v${version}` : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-20">
                        <aside className="hidden lg:block">
                            <div className="sticky top-28">
                                <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/25">
                                    Содержание документа
                                </p>

                                <nav className="max-h-[calc(100vh-150px)] space-y-1 overflow-y-auto pr-3">
                                    {sections.map((section, index) => (
                                        <button
                                            key={section.id}
                                            type="button"
                                            onClick={() => scrollToSection(section.id)}
                                            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${activeSection === section.id
                                                ? 'bg-white/[0.06] text-white'
                                                : 'text-white/35 hover:bg-white/[0.03] hover:text-white/70'
                                                }`}
                                        >
                                            <span
                                                className={`font-mono text-[9px] ${activeSection === section.id
                                                    ? 'text-[#AA141E]'
                                                    : 'text-white/20'
                                                    }`}
                                            >
                                                {String(index + 1).padStart(2, '0')}
                                            </span>

                                            <span className="text-[11px]">
                                                {section.title}
                                            </span>

                                            {activeSection === section.id && (
                                                <ChevronRight
                                                    size={13}
                                                    className="ml-auto text-[#AA141E]"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        <div className="min-w-0">
                            {importantText && (
                                <div className="mb-10 rounded-2xl border border-[#AA141E]/15 bg-[#AA141E]/[0.045] p-5 sm:p-6">
                                    <div className="flex gap-4">
                                        <ShieldCheck
                                            size={20}
                                            className="mt-0.5 shrink-0 text-[#AA141E]"
                                        />

                                        <div>
                                            <h2 className="text-[13px] font-semibold">
                                                {importantTitle}
                                            </h2>

                                            <p className="mt-2 text-[12px] leading-6 text-white/45">
                                                {importantText}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-10 lg:hidden">
                                <label className="mb-3 block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                    Перейти к разделу
                                </label>

                                <select
                                    value={activeSection}
                                    onChange={(event) =>
                                        scrollToSection(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-[12px] text-white outline-none"
                                >
                                    {sections.map((section, index) => (
                                        <option
                                            key={section.id}
                                            value={section.id}
                                        >
                                            {String(index + 1).padStart(2, '0')} — {section.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-16">
                                {sections.map((section, index) => (
                                    <section
                                        key={section.id}
                                        id={section.id}
                                        className="scroll-mt-28"
                                        onMouseEnter={() =>
                                            setActiveSection(section.id)
                                        }
                                    >
                                        <div className="mb-7 flex items-start gap-4 border-b border-white/[0.08] pb-6">
                                            <span className="pt-1 font-mono text-[11px] text-[#AA141E]">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>

                                            <div>
                                                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                                    {section.title}
                                                </h2>

                                                {section.description && (
                                                    <p className="mt-2 text-[11px] text-white/30">
                                                        {section.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="legal-markdown pl-0 text-[12px] leading-[1.9] text-white/45 sm:pl-9 sm:text-[13px]">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeSanitize]}
                                            >
                                                {section.content}
                                            </ReactMarkdown>
                                        </div>
                                    </section>
                                ))}
                            </div>

                            {contactText && (
                                <div className="mt-20 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-white/50">
                                            <FileText size={18} />
                                        </div>

                                        <div>
                                            <h2 className="text-[14px] font-semibold">
                                                {contactTitle}
                                            </h2>

                                            <p className="mt-2 text-[12px] leading-6 text-white/40">
                                                {contactText}
                                            </p>

                                            <a
                                                href={`mailto:${contactEmail}`}
                                                className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium text-[#AA141E] transition-colors hover:text-[#d52a35]"
                                            >
                                                {contactEmail}
                                                <ArrowUpRight size={14} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="border-t border-white/[0.07]">
                    <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
                        <span className="text-[10px] font-bold tracking-[0.18em] text-white/45">
                            DROPZERO<span className="text-[#AA141E]">STUDIO</span>
                        </span>

                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] text-white/30">
                            {navigation.slice(1).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`transition-colors hover:text-white/70 ${item.href === route ? 'text-white/60' : ''
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <span className="text-[10px] text-white/20">
                            © {new Date().getFullYear()} DropZeroStudio
                        </span>
                    </div>
                </footer>
            </div>
        </>
    )
}
