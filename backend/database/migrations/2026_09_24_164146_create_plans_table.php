<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('slug')->unique();

            $table->decimal('price', 12, 2)->default(0);
            $table->string('currency')->default('MMK');
            $table->string('billing_cycle')->default('monthly');

            // Limits
            $table->unsignedInteger('max_products')->nullable();
            $table->unsignedInteger('max_orders')->nullable();

            // Features
            $table->boolean('custom_domain')->default(false);
            $table->boolean('remove_branding')->default(false);
            $table->boolean('advanced_analytics')->default(false);
            $table->boolean('priority_support')->default(false);

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
