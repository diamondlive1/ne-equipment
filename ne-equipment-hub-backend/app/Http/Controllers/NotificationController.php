<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * List user notifications.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        return response()->json([
            'notifications' => $user->notifications()->limit(20)->get(),
            'unread_count' => $user->unreadNotifications()->count()
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead($id)
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        
        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();
        
        return response()->json(['success' => true]);
    }
}
