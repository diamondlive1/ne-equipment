<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'brand',
        'sku',
        'stock_quantity',
        'old_price',
        'price',
        'seller_name',
        'specifications',
        'category_id',
    ];

    protected $casts = [
        'specifications' => 'array',
        'price' => 'decimal:2',
        'old_price' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
}
