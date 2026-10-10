<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('plan_id')
                ->constrained('plans')
                ->restrictOnDelete();

            $table->string('status')->default('trial');

            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();

            $table->timestamps();

            $table->index([
                'user_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
