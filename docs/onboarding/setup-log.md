# PREIshare setup log

**Learner:** Kory Anderson
**Date:** 2026-09-09
**OS:** Linux, Fedora 44
**Team repo (upstream):** https://github.com/EdTechForLearning/PREIshare-org-repo
**Orientation notes used:** 'docs/onboarding/team-orientation-notes.md'

## 1. Accounts and fork

| Check | Result | Notes |
| --- | --- | --- |
| Github sign-in works | PASS | Account username: SkyTabSchool |
| Can view team repo https://github.com/EdTechForLearning/PREIshare-org-repo | PASS | |
| Fork creating in my account | PASS | My fork URL: https://github.com/SkyTabSchool/PREIshare-org-repo |

## 2. Git instal and identity

```text
git version 2.55.0

git config --global user.name "SkyTabSchool"
git config --global user.email "10977027@uvu.edu"
```

Identity Configured: PASS

## 3. Clone (of my fork)

- Parent directory used: '/home/kory/vscode/school/INFO\ 3330'
- Clone command used: 'git clone https://github.com/SkyTabSchool/PREIshare-org-repo.git'
- Cloned my fork: PASS
- Clone completed without error: PASS
- Local project path: '/home/kory/vscode/school/INFO\ 3330/PREIshare-org-repo

## 4. Remotes

- 'git remote add upstream https://github.com/EdTechForLearning/PREIshare-org-repo.git' run: PASS

### git remote -v

```text
origin  https://github.com/SkyTabSchool/PREIShare-org-repo.git (fetch)
origin  https://github.com/SkyTabSchool/PREIShare-org-repo.git (push)
upstream        https://github.com/EdTechForLearning/PREIShare-org-repo.git (fetch)
upstream        https://github.com/EdTechForLearning/PREIShare-org-repo.git (push)
```
origin points at My fork: PASS
upstream points at the team repo: PASS

## 5. Post-clone verification

### git status

```text
On branch main
Your branch is up to date with 'origin/main'.
```

### Default branch

```text
git branch --show-current
main
```

Default branch name: main
Working tree clean after clone: PASS

## 6. Auth notes

- Clone method: HTTPS
- Auth Succeeded: PASS

## 7. Issues and fixes

| Issue | What I Tried | Outcome |
| --- | --- | --- |
| none | |

## 8. Ready for next step

I have a fork I own, a local clone of it with origin and upstream set, and a setup log another teammate could audit: YES