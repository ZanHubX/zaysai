<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('contact_platform', 50)
                ->default('Telegram')
                ->after('phone');

            $table->string('contact_name', 255)
                ->nullable()
                ->after('contact_platform');

            $table->string('contact_username', 255)
                ->nullable()
                ->after('contact_name');

            $table->string('contact_link', 500)
                ->nullable()
                ->after('contact_username');
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'contact_platform',
                'contact_name',
                'contact_username',
                'contact_link',
            ]);
        });
    }
};
