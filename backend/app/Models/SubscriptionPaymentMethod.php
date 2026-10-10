<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'type',
        'account_name',
        'account_number',
        'qr_image',
        'instructions',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
