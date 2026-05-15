const db_name    = "nerf_db";
const table_name = "loadouts";
let database = null;

function open_db() {
    let new_db = indexedDB.open(db_name,1);
    new_db.onupgradeneeded = (val) => {
        let db = val.target.result;
        if (!db.objectStoreNames.contains(table_name)) {
            db.createObjectStore(table_name,{keyPath:"id",autoIncrement:true});
        }
    };
    new_db.onsuccess = (val)=>{database=val.target.result;};
}

function get_image_url(weapon) {
    if (!weapon) return "";
    return "/resources/" + weapon + ".png";
}

function update_images() {
    let primary   = document.getElementById("primary_select")  .value;
    let secondary = document.getElementById("secondary_select").value;
    document.getElementById("primary_img")  .src = get_image_url(primary);
    document.getElementById("secondary_img").src = get_image_url(secondary);
}

function save_loadout() {
    let primary   = document.getElementById("primary_select")  .value;
    let secondary = document.getElementById("secondary_select").value;
    if (primary === "" && secondary === "") return;
    database.transaction([table_name],"readwrite").objectStore(table_name).add({
        primary   : primary,
        secondary : secondary
    });
}

function load_from_id(id) {
    let db_req = database.transaction([table_name],"readonly").objectStore(table_name).get(Number(id));
    db_req.onsuccess = () => {
        if (db_req.result) {
            document.getElementById("primary_select")  .value = db_req.result.primary   || "";
            document.getElementById("secondary_select").value = db_req.result.secondary || "";
            update_images();
        }
    };
}

window.onload = () => {
    open_db();
    let load_id  = new URLSearchParams(window.location.search).get("id");
    if (load_id) setTimeout(()=>load_from_id(load_id),100);
    update_images();

    document.getElementById("save_btn").onclick = save_loadout;
    document.getElementById("fav_btn") .onclick = () => {window.location.href="favorite";};
    document.getElementById("primary_select")  .onchange = update_images;
    document.getElementById("secondary_select").onchange = update_images;
};