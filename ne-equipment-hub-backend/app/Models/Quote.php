<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'quote_number',
        'user_id',
        'company_name',
        'vat_number',
        'contact_email',
        'status',
        'total_estimated_value',
        'admin_notes',
        'invoice_path',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(QuoteMessage::class);
    }
}
