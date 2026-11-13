import json
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory

from build_catalog import ROOT

REPO = "forestcnz/assistant-scripts"


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def release(*args, capture=False):
    command = ["gh", "release", *args, "--repo", REPO]
    if capture:
        return subprocess.check_output(command, cwd=ROOT, text=True)
    subprocess.run(command, cwd=ROOT, check=True)


def main():
    if git("status", "--porcelain"):
        raise SystemExit("Commit and push market changes before publishing.")
    revision = git("rev-parse", "HEAD")
    remote = git("ls-remote", f"https://github.com/{REPO}.git", "refs/heads/main")
    if not remote or remote.split()[0] != revision:
        raise SystemExit("Check out the current remote main commit before publishing.")
    tag = f"market-{revision}"
    with TemporaryDirectory(prefix="assistant-market-") as temp:
        output = Path(temp)
        import sys
        subprocess.run(
            [sys.executable, str(ROOT / "tools/build_catalog.py"), "--output", temp],
            cwd=ROOT,
            check=True,
        )
        assets = [str(path) for path in sorted(output.iterdir())]
        try:
            current = json.loads(release("view", tag, "--json", "isDraft,url", capture=True))
        except subprocess.CalledProcessError:
            current = None
        if current is None:
            release("create", tag, *assets, "--target", revision, "--title", f"脚本市场 {revision[:7]}", "--draft")
        elif current["isDraft"]:
            release("upload", tag, *assets, "--clobber")
        else:
            print(current["url"])
            return
        release("edit", tag, "--draft=false", "--latest")


if __name__ == "__main__":
    main()
