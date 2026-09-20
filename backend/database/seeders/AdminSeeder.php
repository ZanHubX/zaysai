<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Admin::updateOrCreate(
            [
                'email' => 'admin@zaysai.com',
            ],
            [
                'name' => 'ZaySai Admin',
                'password' => Hash::make('Admin@123456'),
                'is_active' => true,
            ]
        );
    }
}
