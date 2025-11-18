from pygit2 import init_repository

repository = init_repository(path="gittest", bare=False, initial_head="main",workdir_path="gittest")
print("Initialized a new Git repository at:", repository.workdir)
print("Git status", repository.status())
