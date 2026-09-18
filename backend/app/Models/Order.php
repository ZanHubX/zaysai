<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'store_id',
        'payment_method_id',
        'payment_proof',
        'order_number',
        'customer_name',
        'customer_phone',
        'customer_email',
        'contact_platform',
        'contact_name',
        'contact_username',
        'contact_link',
        'fulfillment_type',
        'fulfillment_status',
        'voucher',
        'purchase_proof',
        'admin_notes',
        'total',
        'currency',
        'status',
        'payment_status',
        'notes',
    ];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
