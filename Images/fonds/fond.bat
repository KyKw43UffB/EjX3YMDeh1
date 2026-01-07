@echo off
setlocal enabledelayedexpansion

echo [> fonds.json

set first=1
for %%F in (fond-*) do (
    if !first! equ 0 (
        echo ,>> fonds.json
    )
    echo "%%F">> fonds.json
    set first=0
)

echo ]>> fonds.json
