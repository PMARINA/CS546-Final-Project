# CS546-Final-Project

## Developer Guidelines

1. Please [install a version of pip that corresponds to Python3](https://github.com/pypa/get-pip#usage).
2. `pip install pre-commit` to install pre-commit, a tool that helps keep coding standards
3. `cd repo-location-on-disk` - The following commands are specific to the repo
4. `pre-commit install` - Install hooks for basic file/naming-related things
5. `pre-commit install --hook-type commit-msg` - Install the hooks for checking your commit message
6. `pre-commit run` - Get pre-commit to download all the files it needs to run

If everything went without issue, you should be all set to develop!
