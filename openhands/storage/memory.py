import os

from openhands.core.logger import openhands_logger as logger
from openhands.storage.files import FileStore

IN_MEMORY_FILES: dict = {}


class InMemoryFileStore(FileStore):
    files: dict[str, str]

    def __init__(self, files: dict[str, str] = IN_MEMORY_FILES):
        self.files = files

    def get_full_path(self, path: str) -> str:
        if path.startswith('/'):
            path = path[1:]
        return path

    def write(self, path: str, contents: str) -> None:
        self.files[path] = contents

    def read(self, path: str) -> str:
        if path not in self.files:
            raise FileNotFoundError(path)
        return self.files[path]

    def list(self, path: str) -> list[str]:
        files = []
        for file in self.files:
            if not file.startswith(path):
                continue
            suffix = file.removeprefix(path)
            parts = suffix.split('/')
            if parts[0] == '':
                parts.pop(0)
            if len(parts) == 1:
                files.append(file)
            else:
                dir_path = os.path.join(path, parts[0])
                if not dir_path.endswith('/'):
                    dir_path += '/'
                if dir_path not in files:
                    files.append(dir_path)
        return files

    def delete(self, path: str) -> None:
        try:
            keys_to_delete = [key for key in self.files.keys() if key.startswith(path)]
            for key in keys_to_delete:
                del self.files[key]
            logger.debug(f'Cleared in-memory file store: {path}')
        except Exception as e:
            logger.error(f'Error clearing in-memory file store: {str(e)}')
