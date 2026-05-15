import os
import json

EXCLUDE_FILES = {"sw.js","resources_manifest.json","gen_cache_list.py"}

all_files = []

for root, dirs, filenames in os.walk("."):
    if ".git" in dirs:
        dirs.remove(".git")
    for filename in filenames:
        if filename in EXCLUDE_FILES:
            continue

        full_path = os.path.join(root, filename).replace("\\", "/")
        if full_path.startswith("./"):
            full_path = full_path[2:]
        all_files.append("/" + full_path)

with open("resources_manifest.json", "w") as f:
    json.dump(all_files, f, indent=2)
