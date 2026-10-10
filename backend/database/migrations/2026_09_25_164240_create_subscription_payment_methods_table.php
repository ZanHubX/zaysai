<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_payment_methods', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            // KPay, WavePay, KBZPay, Bank Transfer, etc.

            $table->string('type')->default('mobile_wallet');

            $table->string('account_name')->nullable();

            $table->string('account_number')->nullable();

            $table->string('qr_image')->nullable();

            $table->text('instructions')->nullable();

            $table->boolean('is_active')->default(true);

            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->index([
                'is_active',
                'sort_order',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_payment_methods');
    }
};
