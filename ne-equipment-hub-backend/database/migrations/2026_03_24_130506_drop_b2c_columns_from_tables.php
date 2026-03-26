<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('is_b2b');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        DB::table('users')->whereIn('role', ['customer_b2c', 'customer_b2b'])->update(['role' => 'customer']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
