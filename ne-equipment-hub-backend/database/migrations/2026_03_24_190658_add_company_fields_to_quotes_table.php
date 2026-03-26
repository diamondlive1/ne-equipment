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
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('user_id');
            $table->string('vat_number')->nullable()->after('company_name');
            $table->string('contact_email')->nullable()->after('vat_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'vat_number', 'contact_email']);
        });
    }
};
