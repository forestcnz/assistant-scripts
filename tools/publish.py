from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory

from build_catalog import ROOT

REPO = "forestcnz/assistant-scripts"
PUBLISH_BRANCH = "master"
CHINA_TIME = timezone(timedelta(hours=8))


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
    remote = git("ls-remote", f"https://github.com/{REPO}.git", f"refs/heads/{PUBLISH_BRANCH}")
    if not remote or remote.split()[0] != revision:
        raise SystemExit(f"Check out the current remote {PUBLISH_BRANCH} commit before publishing.")
    tag = f"market-{revision}"
    with TemporaryDirectory(prefix="assistant-market-") as temp:
        output = Path(temp)
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
            release("create", tag, *assets, "--target", revision, "--draft")
        elif current["isDraft"]:
            release("upload", tag, *assets, "--clobber")
        else:
            print(current["url"])
            return
        title = datetime.now(CHINA_TIME).strftime("v%Y%m%d%H%M")
        release("edit", tag, "--title", title, "--draft=false", "--latest")


if __name__ == "__main__":
    main()
