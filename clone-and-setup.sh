#!/bin/bash

# Clone the repository
git clone https://github.freewheel.tv/gsemenduyev/gsemenduyev.github.io.git

# Navigate into the cloned repository
cd gsemenduyev.github.io

# Modify the .git/config file
cat <<EOL > .git/config
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
	longpaths = true
[remote "origin"]
	url = https://github.freewheel.tv/gsemenduyev/gsemenduyev.github.io.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
	remote = origin
	merge = refs/heads/master
	vscode-merge-base = origin/master
	vscode-merge-base = origin/master
[branch "clean-folders"]
	vscode-merge-base = origin/master
	remote = origin
	merge = refs/heads/clean-folders
EOL
