<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        Plan::updateOrCreate(
            [
                'slug' => 'starter',
            ],
            [
                'name' => 'Starter',
                'price' => 20000,
                'currency' => 'MMK',
                'billing_cycle' => 'monthly',

                'max_products' => 15,
                'max_orders' => 100,

                'custom_domain' => false,
                'remove_branding' => false,
                'advanced_analytics' => false,
                'priority_support' => false,

                'is_active' => true,
            ]
        );

        Plan::updateOrCreate(
            [
                'slug' => 'growth',
            ],
            [
                'name' => 'Growth',
                'price' => 35000,
                'currency' => 'MMK',
                'billing_cycle' => 'monthly',

                'max_products' => 50,
                'max_orders' => 500,

                'custom_domain' => false,
                'remove_branding' => false,
                'advanced_analytics' => true,
                'priority_support' => true,

                'is_active' => true,
            ]
        );

        Plan::updateOrCreate(
            [
                'slug' => 'pro',
            ],
            [
                'name' => 'Pro',
                'price' => 60000,
                'currency' => 'MMK',
                'billing_cycle' => 'monthly',

                // null = unlimited
                'max_products' => null,
                'max_orders' => null,

                'custom_domain' => true,
                'remove_branding' => true,
                'advanced_analytics' => true,
                'priority_support' => true,

                'is_active' => true,
            ]
        );
    }
}
