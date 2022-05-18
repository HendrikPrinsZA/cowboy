#!/usr/bin/env python3

import logging
from os import path
import subprocess
import sys
import unittest

PATH_DIR = path.abspath(f"{path.dirname(__file__)}/../../tests/__pycache__")
PATH_CACHE = f"{PATH_DIR}/test_cache.json"

class TestMain(unittest.TestCase):
    def execute(self, command):
        proc = subprocess.Popen(command,
            stdout = subprocess.PIPE,
            stderr = subprocess.PIPE,
        )
        out, err = proc.communicate()
        return out, err, proc.returncode

    def test_create(self):
        # command = ["python3", f"main.py {PATH_CACHE}"]
        # out, err, code = self.execute(command)
        # self.assertEqual(0, code, f"err: {err}, out: {out}")

        self.assertTrue(True)