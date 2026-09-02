require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function checkData() {
    const { data, error } = await supabase
        .from("scenario_states")
        .select("id, state_name, ecg_rhythm");

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Rhythms in DB:");
        data.forEach(row => console.log(`${row.state_name}: ${row.ecg_rhythm}`));
    }
}

checkData();
