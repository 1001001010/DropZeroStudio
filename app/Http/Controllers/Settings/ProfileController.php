<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Toy;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's toy collection.
     */

    public function profile(string $code): Response
    {
        $toys = Toy::query()
            ->with(['drop.skin'])
            ->where('user_id', Auth::id())
            ->get();

        $currentToy = $toys->firstWhere('code', $code);

        if (!$currentToy) {
            abort(404, 'Игрушка не найдена или она вам не принадлежит');
        }

        // Фигурка, по коду которой вошёл пользователь,
        // всегда будет первой в карусели.
        $toys = collect([$currentToy])
            ->concat(
                $toys->reject(
                    fn(Toy $toy) => $toy->id === $currentToy->id
                )
            )
            ->values();

        // Формируем историю активаций коллекции.
        $history = $toys
            ->filter(fn(Toy $toy) => $toy->claimed_at !== null)
            ->map(fn(Toy $toy) => [
                'id' => $toy->id,
                'title' => 'Фигурка активирована',
                'description' => sprintf(
                    '%s добавлен в твою коллекцию. Подлинность фигурки подтверждена.',
                    $toy->drop?->skin?->name ?? 'Персонаж DropZeroStudio'
                ),
                'date' => $toy->claimed_at->format('d.m.Y'),
                'time' => $toy->claimed_at->format('H:i'),
                'timestamp' => $toy->claimed_at->timestamp,
                'icon' => 'fingerprint',
                'toyCode' => $toy->code,
            ])
            ->sortByDesc('timestamp')
            ->values()
            ->map(
                fn(array $event) => collect($event)
                    ->except('timestamp')
                    ->all()
            )
            ->all();

        return Inertia::render('profile', [
            'toys' => $toys,
            'activeToyCode' => $currentToy->code,
            'history' => $history,
        ]);
    }


    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}