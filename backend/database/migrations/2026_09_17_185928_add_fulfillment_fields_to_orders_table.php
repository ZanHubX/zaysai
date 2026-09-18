<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('fulfillment_type')
                ->default('manual')
                ->after('payment_status');

            $table->string('fulfillment_status')
                ->default('pending')
                ->after('fulfillment_type');

            $table->text('voucher')
                ->nullable()
                ->after('fulfillment_status');

            $table->string('purchase_proof')
                ->nullable()
                ->after('voucher');

            $table->text('admin_notes')
                ->nullable()
                ->after('purchase_proof');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'fulfillment_type',
                'fulfillment_status',
                'voucher',
                'purchase_proof',
                'admin_notes',
            ]);
        });
    }
};
