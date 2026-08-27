<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ToyVerificationCode extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code
    ) {
    }

    public function build()
    {
        return $this
            ->subject('Код подтверждения DropZero Studio')
            ->view('emails.toy-verification-code');
    }
}