<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with('images', 'category');

        // By default, only show approved products
        // If the request comes from an admin context (checked via auth), show all
        if (!$request->user() || $request->user()->role !== 'admin') {
            $query->where('is_approved', true);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'brand' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255|unique:products',
            'stock_quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'old_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'images' => 'required|array|min:1|max:4',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048', // 2MB max
            'specifications' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request) {
            $productData = $request->except('images');
            $productData['slug'] = Str::slug($request->name) . '-' . uniqid();
            $productData['sku'] = $request->sku ?: null;
            
            $product = Product::create($productData);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('products', 'public');
                    
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'is_primary' => $index === 0,
                    ]);
                }
            }

            return response()->json($product->load('images', 'category'), 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::with('images', 'category')->findOrFail($id);
        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'brand' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255|unique:products,sku,' . $id,
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'old_price' => 'nullable|numeric|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'specifications' => 'nullable|array',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'exists:product_images,id',
        ]);

        return DB::transaction(function () use ($request, $product) {
            $updateData = $request->except(['images', 'remove_images']);
            if ($request->has('sku')) {
                $updateData['sku'] = $request->sku ?: null;
            }
            $product->update($updateData);

            // Remove selected images
            if ($request->has('remove_images')) {
                foreach ($request->remove_images as $imageId) {
                    $image = ProductImage::find($imageId);
                    if ($image) {
                        Storage::disk('public')->delete($image->image_path);
                        $image->delete();
                    }
                }
            }

            // Upload new images if under limit
            if ($request->hasFile('images')) {
                $currentImageCount = $product->images()->count();
                $newImageCount = count($request->file('images'));

                if ($currentImageCount + $newImageCount > 4) {
                    return response()->json([
                        'message' => 'O produto não pode ter mais de 4 imagens no total.',
                    ], 422);
                }

                foreach ($request->file('images') as $image) {
                    $path = $image->store('products', 'public');
                    
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'is_primary' => $product->images()->where('is_primary', true)->count() === 0,
                    ]);
                }
            }

            return response()->json($product->load('images', 'category'));
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);

        return DB::transaction(function () use ($product) {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            }
            $product->delete();
            return response()->json(['message' => 'Produto removido com sucesso.']);
        });
    }
}
