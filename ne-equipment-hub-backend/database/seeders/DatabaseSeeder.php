<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Users
        User::updateOrCreate(
            ['email' => 'admin@neequipment.co.mz'],
            [
                'name' => 'Admin NE',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '+258 84 000 0000',
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'John Customer',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '+258 84 123 4567',
            ]
        );

        // 2. Create Categories
        $catEpi = Category::create(['name' => "EPI'S", 'slug' => 'epi']);
        $catHospital = Category::create(['name' => 'Hospitalar', 'slug' => 'hospital']);

        // 3. Create Products

        $prod2 = Product::create([
            'name' => 'Conjunto EPI Completo Nível 3',
            'slug' => 'conjunto-epi-nivel-3',
            'description' => 'Capacete, óculos, proteção auditiva e luvas de alta resistência.',
            'brand' => 'NE Safety',
            'sku' => '#NE-EPI-001',
            'price' => 8500,
            'old_price' => 10000,
            'stock_quantity' => 50,
            'seller_name' => 'NE Equipment',
            'category_id' => $catEpi->id,
        ]);
        ProductImage::create(['product_id' => $prod2->id, 'image_path' => 'https://images.unsplash.com/photo-1618090583220-3c2acd0ae3da?w=800&h=600&fit=crop', 'is_primary' => true]);
        
        $prod3 = Product::create([
            'name' => 'Cama Hospitalar Eléctrica',
            'slug' => 'cama-hospitalar-eletrica',
            'description' => 'Cama articulada com controlo eléctrico.',
            'brand' => 'HealthCare Solutions',
            'sku' => '#NE-HOS-002',
            'price' => 125000,
            'old_price' => 140000,
            'stock_quantity' => 5,
            'seller_name' => 'NE Medical',
            'category_id' => $catHospital->id,
        ]);
        ProductImage::create(['product_id' => $prod3->id, 'image_path' => 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=600&fit=crop', 'is_primary' => true]);

    }
}
