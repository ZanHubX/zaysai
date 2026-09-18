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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('contact_platform')
                ->nullable()
                ->after('customer_email');

            $table->string('contact_name')
                ->nullable()
                ->after('contact_platform');

            $table->string('contact_username')
                ->nullable()
                ->after('contact_name');

            $table->string('contact_link')
                ->nullable()
                ->after('contact_username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'contact_platform',
                'contact_name',
                'contact_username',
                'contact_link',
            ]);
        });
    }
};
