'use client'

import { useState } from 'react'
import { ArrowLeft, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ToyNav() {
    const [liked, setLiked] = useState(false)

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                <a
                    href="/"
                    className="group flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="hidden sm:inline">Назад</span>
                </a>

                <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-foreground">
                        Dropzero
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLiked(!liked)}
                        aria-label="В избранное"
                        aria-pressed={liked}
                        className="size-11 rounded-none"
                    >
                        <Heart
                            className={
                                liked
                                    ? 'h-4 w-4 fill-primary text-primary'
                                    : 'h-4 w-4 text-muted-foreground'
                            }
                        />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Поделиться"
                        className="size-11 rounded-none"
                    >
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </nav>
    )
}
