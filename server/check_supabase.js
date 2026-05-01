
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log("Checking Supabase connection...");
console.log("URL:", supabaseUrl);
console.log("Key length:", supabaseKey ? supabaseKey.length : 0);

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
    const { data, error } = await supabase.storage.getBucket('devjrnl');
    if (error) {
        console.error("Error getting bucket 'devjrnl':", error.message);
        console.log("Buckets found:");
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) {
            console.error("Error listing buckets:", listError.message);
        } else {
            console.log("Buckets:", buckets.map(b => b.name));
        }
    } else {
        console.log("Bucket 'devjrnl' found and accessible!");
    }
}

checkBucket();
