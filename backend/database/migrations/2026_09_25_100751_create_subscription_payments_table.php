<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->id();

            // Seller
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Requested subscription plan
            $table->foreignId('plan_id')
                ->constrained('plans')
                ->restrictOnDelete();

            // Payment amount snapshot
            $table->decimal('amount', 12, 2);

            // Payment currency snapshot
            $table->string('currency', 10)->default('MMK');

            // Payment method information
            $table->string('payment_method');

            // Optional transaction/reference number
            $table->string('transaction_reference')
                ->nullable();

            // Uploaded payment screenshot/proof
            $table->string('payment_proof')
                ->nullable();

            // pending / approved / rejected
            $table->string('status')
                ->default('pending');

            // Admin rejection reason
            $table->text('rejection_reason')
                ->nullable();

            // Admin who reviewed the payment
            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('admins')
                ->nullOnDelete();

            $table->timestamp('reviewed_at')
                ->nullable();

            $table->timestamps();

            // Faster seller/payment queries
            $table->index([
                'user_id',
                'status',
            ]);

            $table->index([
                'plan_id',
                'status',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_payments');
    }
};
