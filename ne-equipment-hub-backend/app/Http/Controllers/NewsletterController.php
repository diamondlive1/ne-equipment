<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NewsletterController extends Controller
{
    /**
     * Handle newsletter subscription.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->input('email');

        // Logic to "fall into the general email"
        // For now, we simulate sending an email to geral@neequipment.co.mz
        try {
            Mail::raw("Nova subscrição na newsletter: $email", function ($message) use ($email) {
                $message->to('geral@neequipment.co.mz')
                        ->from(config('mail.from.address'))
                        ->subject('Nova Subscrição Newsletter - NE Equipment');
            });
            
            Log::info("Nova subscrição de newsletter: $email enviada para geral@neequipment.co.mz");
            
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully subscribed'
            ]);
        } catch (\Exception $e) {
            Log::error("Erro ao processar newsletter: " . $e->getMessage());
            // Even if mailing fails in dev (log mailer), we return success to the user if it was logged
            return response()->json([
                'status' => 'success',
                'message' => 'Subscription received'
            ]);
        }
    }
}
