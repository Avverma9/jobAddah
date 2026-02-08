from pathlib import Path
path = Path("controllers/govJob/govJob.mjs")
lines = path.read_text().splitlines()
targets = [
    "normalizeForHash",
    "buildManualHashInput",
    "prepareManualPostData",
    "const createPost",
]
for target in targets:
    for idx, line in enumerate(lines, 1):
        if target in line:
            print(f"{target}:{idx}")
            break
 