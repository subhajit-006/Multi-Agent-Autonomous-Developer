import time
import uuid
from typing import Dict, Any


class SharedMemory:
    def __init__(self, store: Dict[str, Any] | None = None):
        self._store: Dict[str, Any] = store.copy() if store else {}

        # 🧠 Ensure run identity exists
        if "run_id" not in self._store:
            self._store["run_id"] = str(uuid.uuid4())

        # 📜 Decision log for debugging
        if "decision_log" not in self._store:
            self._store["decision_log"] = []

        # 🚦 Track pipeline state
        if "status" not in self._store:
            self._store["status"] = "initialized"

        if "current_step" not in self._store:
            self._store["current_step"] = None

    # ✍️ WRITE
    def write(self, key: str, value: Any):
        if key in self._store and self._store[key] is not None:
            self._log(key, f"Overwriting existing value for '{key}'")

        self._store[key] = value
        self._log(key, f"Updated state for '{key}'")

    # 📖 READ
    def read(self, key: str) -> Any:
        return self._store.get(key)

    # 📦 FULL STATE
    def dump(self) -> Dict[str, Any]:
        return self._store

    # 🧾 INTERNAL LOGGING
    def _log(self, key: str, action: str):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
        self._store["decision_log"].append({
            "timestamp": timestamp,
            "key": key,
            "action": action
        })

    # 🚦 STATUS HELPERS
    def set_status(self, status: str):
        self._store["status"] = status
        self._log("status", f"Pipeline status changed to '{status}'")

    def set_current_step(self, step: str):
        self._store["current_step"] = step
        self._log("current_step", f"Now executing '{step}'")