<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\LegalDocument;
use App\Models\LegalDocumentVersion;
use Illuminate\Support\Facades\DB;


class LegalController extends Controller
{
    public function privacy()
    {
        return $this->showDocument('privacy');
    }

    public function personalDataConsent()
    {
        return $this->showDocument('personal-data-consent');
    }

    public function terms()
    {
        return $this->showDocument('terms');
    }

    public function offer()
    {
        return $this->showDocument('offer');
    }

    public function index()
    {
        $documents = LegalDocument::with([
            'currentVersion',
            'versions' => fn($query) => $query->latest(),
        ])->get();

        return Inertia::render('admin/legal/index', [
            'documents' => $documents,
            'selectedDocument' => $documents->first(),
        ]);
    }

    public function storeVersion(LegalDocument $document)
    {
        $version = DB::transaction(function () use ($document) {
            $document = LegalDocument::whereKey($document->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Не создаём второй черновик, если он уже существует
            $draft = $document->versions()
                ->where('status', 'draft')
                ->first();

            if ($draft) {
                return $draft;
            }

            $lastVersion = $document->versions()
                ->orderByDesc('created_at')
                ->first();

            if (!$lastVersion) {
                $newVersion = '1.0';
            } else {
                $parts = explode('.', $lastVersion->version);
                $minor = (int) ($parts[1] ?? 0) + 1;

                $newVersion = ($parts[0] ?? '1') . '.' . $minor;
            }

            return $document->versions()->create([
                'version' => $newVersion,
                'content' => '',
                'content_hash' => hash('sha256', ''),
                'created_by' => auth()->id(),
                'status' => 'draft',
            ]);
        });

        return redirect()
            ->route('admin.legal.index')
            ->with('success', 'Черновик редакции ' . $version->version . ' создан.');
    }

    public function updateVersion(
        Request $request,
        LegalDocument $document,
        LegalDocumentVersion $version
    ) {
        abort_unless($version->document_id === $document->id, 404);
        abort_unless($version->status === 'draft', 403);

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $version->update([
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'Черновик сохранён.');
    }
    public function publishVersion(
        LegalDocument $document,
        LegalDocumentVersion $version
    ) {
        abort_unless($version->document_id === $document->id, 404);
        abort_unless($version->status === 'draft', 403);

        DB::transaction(function () use ($document, $version) {
            $version->update([
                'content_hash' => hash('sha256', $version->content),
                'status' => 'published',
                'published_at' => now(),
            ]);

            $document->update([
                'current_version_id' => $version->id,
            ]);
        });

        return redirect()
            ->route('admin.legal.index')
            ->with('success', 'Документ успешно опубликован.');
    }

    private function showDocument(string $slug)
    {
        $document = LegalDocument::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with('currentVersion')
            ->firstOrFail();

        $version = $document->currentVersion;

        abort_unless(
            $version && $version->status === 'published',
            404
        );

        return Inertia::render('legal/document', [
            'document' => [
                'title' => $document->title,
                'slug' => $document->slug,
                'route' => $document->route,
                'content' => $version->content,
                'version' => $version->version,
                'published_at' => $version->published_at,
            ],
        ]);
    }
}
