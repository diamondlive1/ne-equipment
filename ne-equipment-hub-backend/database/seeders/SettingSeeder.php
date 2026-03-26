<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'bank_1_name' => 'Millennium BIM',
            'bank_1_account' => '123456789',
            'bank_1_nib' => '0001 0000 1234 5678 9012 3',
            'bank_2_name' => 'BCI',
            'bank_2_account' => '987654321',
            'bank_2_nib' => '0008 0000 9876 5432 1098 7',
        ];

        foreach ($settings as $key => $value) {
            \App\Models\Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
