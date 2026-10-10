<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'price',
        'currency',
        'billing_cycle',
        'max_products',
        'max_orders',
        'custom_domain',
        'remove_branding',
        'advanced_analytics',
        'priority_support',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'max_products' => 'integer',
            'max_orders' => 'integer',
            'custom_domain' => 'boolean',
            'remove_branding' => 'boolean',
            'advanced_analytics' => 'boolean',
            'priority_support' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
