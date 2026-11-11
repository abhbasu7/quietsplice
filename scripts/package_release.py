"""Build a code-only Chrome Web Store ZIP from a fixed allowlist."""
from pathlib import Path
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
FILES = ["manifest.json", "quietsplice-worker.js", "content.js", "ad-audio.js", "hbo-intro.js", "PRIVACY.md",
         "icons/icon-16.png", "icons/icon-32.png", "icons/icon-48.png", "icons/icon-128.png"]
SECRET = re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16}|sk-[A-Za-z0-9]{32,}")

def build(minimal=False):
    files = [name for name in FILES if not minimal or name != "PRIVACY.md"]
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    required = {"manifest.json", manifest["background"]["service_worker"], *manifest["icons"].values()}
    for entry in manifest["content_scripts"]:
        required.update(entry["js"])
    if not required.issubset(files):
        raise ValueError("Manifest references files outside the release allowlist")
    for name in files:
        path = ROOT / name
        path.resolve().relative_to(ROOT)
        if path.is_symlink() or not path.is_file():
            raise ValueError(f"Missing or linked release file: {name}")
        if path.suffix in {".json", ".js", ".md"} and SECRET.search(path.read_text(encoding="utf-8")):
            raise ValueError(f"Possible secret in {name}")
    destination = ROOT / "dist"
    destination.mkdir(exist_ok=True)
    suffix = "-unpacked" if minimal else ""
    archive = destination / f"quietsplice-{manifest['version']}{suffix}.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for name in files:
            info = zipfile.ZipInfo(name, date_time=(2026, 11, 9, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            bundle.writestr(info, (ROOT / name).read_bytes())
    with zipfile.ZipFile(archive) as bundle:
        if bundle.namelist() != files or bundle.testzip() is not None:
            raise ValueError("Archive verification failed")
        for name in files:
            if bundle.read(name) != (ROOT / name).read_bytes():
                raise ValueError(f"Archive/source mismatch: {name}")
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    (archive.with_suffix(".zip.sha256")).write_text(f"{digest}  {archive.name}\n", encoding="utf-8")
    print(f"Archive: {archive.name}")
    print("\n".join(files))
    print(f"SHA256: {digest}")
    print("PASS: allowlist, manifest references, secret scan, CRC and source bytes verified.")
    return archive

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--minimal", action="store_true", help="Omit privacy document for unpacked testing")
    build(parser.parse_args().minimal)
