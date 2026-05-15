const db_name    = "nerf_db";
const table_name = "loadouts";
let database = null;

function open_db() {
    let new_db = indexedDB.open(db_name, 1);
    new_db.onupgradeneeded = (val) => {
        let db = val.target.result;
        if (!db.objectStoreNames.contains(table_name)) {
            db.createObjectStore(table_name,{keyPath:"id",autoIncrement:true});
        }
    };
    new_db.onsuccess = (val) => { database = val.target.result; show_all(); };
}

function show_all() {
    let db_req = database.transaction([table_name], "readonly").objectStore(table_name).getAll();
    db_req.onsuccess = () => {
        let items     = db_req.result || [];
        let container = document.getElementById("list");
        if (!items.length) {
            container.innerHTML = "<p>no saved loadouts</p>";
            return;
        }
        let html = "";
        for (let it of items) {
            html += `<div class="card">
                        <div><strong>#${it.id}</strong> &nbsp; PRIMARY: ${it.primary || "—"} &nbsp; SECONDARY: ${it.secondary || "—"}</div>
                        <div>
                            <button class="open_btn" data-id="${it.id}" style="background: #014995; color: #FFFFFF">OPEN</button>
                            <button class="del_btn"  data-id="${it.id}">DELETE</button>
                        </div>
                     </div>`;
        }
        container.innerHTML = html;
        document.querySelectorAll(".open_btn").forEach(btn => {
            btn.onclick = () => {window.location.href=`/?id=${btn.getAttribute("data-id")}`;};
        });
        document.querySelectorAll(".del_btn").forEach(btn => {
            btn.onclick = () => {
                let id      = Number(btn.getAttribute("data-id"));
                let db_req2 = database.transaction([table_name],"readwrite");
                db_req2.objectStore(table_name).delete(id);
                db_req2.oncomplete = () => show_all();
            };
        });
    };
}

window.onload = () => {
    open_db();
    document.getElementById("back_btn").onclick = ()=>{window.location.href="/";};
};