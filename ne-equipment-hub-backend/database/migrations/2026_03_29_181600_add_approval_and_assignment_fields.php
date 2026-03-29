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
        // Add approval fields to products table
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_approved')->default(false)->after('is_b2b');
            $table->foreignId('approved_by')->nullable()->after('is_approved')->constrained('users')->nullOnDelete();
        });

        // Add category assignment to users table for task division
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('assigned_category_id')->nullable()->after('role')->constrained('categories')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['is_approved', 'approved_by']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['assigned_category_id']);
            $table->dropColumn('assigned_category_id');
        });
    }
};
