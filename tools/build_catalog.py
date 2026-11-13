import argparse
from datetime import date
import hashlib
import json
from pathlib import Path
import re
import subprocess
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
TASK_FILES = {"task.js", "config.json", "flow.json"}
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}
TEXT_FIELDS = {
    "title": 50, "description": 200, "author": 60, "version": 24,
    "usage": 2000, "environment": 500, "changes": 500,
}


def validate_metadata(metadata):
    for field, limit in TEXT_FIELDS.items():
        value = metadata[field]
        if not isinstance(value, str) or not 1 <= len(value.strip()) <= limit:
            raise ValueError(f"Invalid field: {field}")
    for field, limit in {"targetApp": 80, "targetPackage": 160}.items():
        value = metadata.get(field)
        if value is not None and (not isinstance(value, str) or not 1 <= len(value.strip()) <= limit):
            raise ValueError(f"Invalid field: {field}")
    target = metadata.get("targetPackage")
    if target and (not metadata.get("targetApp") or not re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+", target)):
        raise ValueError("Invalid target package")
    capabilities = metadata["capabilities"]
    if not isinstance(capabilities, list) or len(capabilities) > 8 or any(
        not isinstance(item, str) or not 1 <= len(item.strip()) <= 80 for item in capabilities
    ):
        raise ValueError("Invalid capabilities")
    if type(metadata["minAppVersionCode"]) is not int or not 1 <= metadata["minAppVersionCode"] <= 2147483647:
        raise ValueError("Invalid minimum app version")
    if date.fromisoformat(metadata["updatedAt"]).isoformat() != metadata["updatedAt"]:
        raise ValueError("Invalid update date")


def pack(directory, output):
    paths = []
    for path in sorted(directory.iterdir()):
        if path.is_symlink():
            raise ValueError(f"Unexpected symlink: {path}")
        if path.name == "release.json" and path.is_file():
            continue
        if path.name in TASK_FILES and path.is_file():
            paths.append(path)
        elif path.name == "images" and path.is_dir():
            for image in sorted(path.iterdir()):
                if not image.is_file() or image.is_symlink() or image.suffix.lower() not in IMAGE_SUFFIXES:
                    raise ValueError(f"Unexpected image: {image}")
                paths.append(image)
        else:
            raise ValueError(f"Unexpected file: {path}")
    if not (directory / "task.js").is_file() or not (directory / "task.js").stat().st_size:
        raise ValueError(f"Missing task.js: {directory}")
    if len(paths) > 200 or sum(path.stat().st_size for path in paths) > 40 * 1024 * 1024:
        raise ValueError(f"Package exceeds limits: {directory}")
    with ZipFile(output, "w", compression=ZIP_DEFLATED) as archive:
        for path in paths:
            entry = path.relative_to(directory).as_posix()
            limit = 8 * 1024 * 1024 if path.parent.name == "images" else 2_000_000
            if path.stat().st_size > limit or any(ord(c) < 32 or 127 <= ord(c) < 160 or c == chr(92) for c in entry):
                raise ValueError(f"Invalid package entry: {path}")
            if path.name in ("config.json", "flow.json"):
                document = json.loads(path.read_text(encoding="utf-8"))
                if not isinstance(document, dict):
                    raise ValueError(f"Invalid task JSON: {path}")
                if path.name == "flow.json" and not isinstance(document.get("nodes"), list):
                    raise ValueError(f"Flow missing nodes: {path}")
            archive.writestr(ZipInfo(entry), path.read_bytes(), compress_type=ZIP_DEFLATED)
    if output.stat().st_size > 20 * 1024 * 1024:
        raise ValueError(f"ZIP too large: {directory}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    output = parser.parse_args().output
    output.mkdir(parents=True, exist_ok=True)
    revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    releases = []
    for script in sorted((ROOT / "scripts").iterdir()):
        if not script.is_dir() or script.is_symlink() or len(script.name) > 48 or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", script.name):
            raise ValueError(f"Invalid script directory: {script}")
        for version in sorted(script.iterdir()):
            if not version.is_dir() or version.is_symlink() or not re.fullmatch(r"[1-9][0-9]{0,9}", version.name) or int(version.name) > 2147483647:
                raise ValueError(f"Invalid version directory: {version}")
            metadata_path = version / "release.json"
            if metadata_path.is_symlink():
                raise ValueError(f"Unexpected symlink: {metadata_path}")
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            validate_metadata(metadata)
            package = output / f"{script.name}-{version.name}.zip"
            pack(version, package)
            releases.append({
                **metadata,
                "scriptId": script.name,
                "versionCode": int(version.name),
                "revision": revision,
                "sizeBytes": package.stat().st_size,
                "sha256": hashlib.sha256(package.read_bytes()).hexdigest(),
            })
    catalog = json.dumps({"schemaVersion": 1, "releases": releases}, ensure_ascii=False, indent=2) + "\n"
    if len(releases) > 500 or len(catalog.encode("utf-8")) > 1024 * 1024:
        raise ValueError("Catalog exceeds app limits")
    (output / "catalog.json").write_text(catalog, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
