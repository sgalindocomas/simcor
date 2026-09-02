require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function fixData() {
    console.log("Fixing scenario states...");
    const { data: statesData, error: statesError } = await supabase
        .from("scenario_states")
        .update({ ecg_rhythm: "nsr" })
        .eq("ecg_rhythm", "Sinusal")
        .select();

    if (statesError) {
        console.error("Error updating states:", statesError);
    } else {
        console.log(`Updated ${statesData.length} rows in scenario_states`);
    }

    console.log("Fixing monitor state...");
    const { data: monitorData, error: monitorError } = await supabase
        .from("monitor_state")
        .update({ ecg_rhythm: "nsr" })
        .eq("ecg_rhythm", "Sinusal")
        .select();

    if (monitorError) {
        console.error("Error updating monitor:", monitorError);
    } else {
        console.log(`Updated ${monitorData?.length || 0} rows in monitor_state`);
    }
}

fixData();
