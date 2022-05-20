import os
import random
import unittest
from datetime import datetime
from os import path

from lib.cache import Cache

class TestCache(unittest.TestCase):
    MAX_MS = 1000000
    PATH_DIR = path.abspath(f"{path.dirname(__file__)}/../../tests/lib/__pycache__")
    PATH_CACHE = f"{PATH_DIR}/test_cache.json"

    def __init__(self, methodName):
        super().__init__(methodName)
        self.cache = Cache(self.PATH_CACHE)
        self.cache.clear()
        
    def test_create(self):
        started_at = datetime.now()
        created_at = self.cache.get('created_at')
        
        difference = started_at - created_at
        self.assertLess(
            difference.microseconds, 
            self.MAX_MS, 
            f"Took longer than {self.MAX_MS} to save, check the algorithm!"
        )
        self.assertIsInstance(created_at, datetime) 
    
    def test_hash(self):
        hash = self.cache.hash('Random Text 1')
        self.assertEqual('cc3b53c9ab1d1d4b5cc9a744c08d64e6', hash)
        
    def test_hash_audit_fields(self):
        field = random.choice(Cache.AUDIT_FIELDS)
        hash = self.cache.hash(field)
        self.assertEqual(field, hash)
        
    def test_set_and_get(self):
        self.cache.set('random_key', 'random_value')
        self.assertEqual('random_value', self.cache.get('random_key'))
    
    def test_get_fail(self):
        value = self.cache.get('random_key')
        self.assertIsNone(value)
        
    def test_clear(self):
        self.cache.set('random_key', 'random_value')
        self.cache.clear()
        self.assertIsNone(self.cache.get('random_key'))
    
    def test_set_not_exist(self):
        if path.isfile(self.PATH_CACHE):
            os.remove(self.PATH_CACHE)
            
        self.cache.set('random_key', 'random_value')
        self.assertEqual('random_value', self.cache.get('random_key'))

    def test_set_str(self):
        value = 'value'
        self.cache.set('value', value)
        cached = self.cache.get('value')
        self.assertEqual(value, cached)

    def test_set_json(self):
        value = {
            'str': 'String',
            'int': 1,
            'bool_true': True,
            'bool_true': False,
            'list_int': [ 1, 2, 3, 4, 5 ],
            'list_float': [ 0.1, 0.2, 0.3 ],
            'weird_strings': [
                'single quote\'s',
                "double quote's",
                "Some new\nline\ns"
            ],
            'level_1': {
                'level_2': {
                    'level_3': True
                }
            },
            'inception': "{\"str\": \"String\", \"int\": 1, \"bool_true\": false, \"list_int\": [1, 2, 3, 4, 5], \"list_float\": [0.1, 0.2, 0.3], \"weird_strings\": [\"apostrophe's\", \"apostrophe's\"], \"level_1\": {\"level_2\": {\"level_3\": true}}}"
        }

        self.cache.set('value', value)
        cached = self.cache.get('value')
        self.assertEqual(value, cached)
        
    def test_pop(self):
        values = [1, 2, 3]
        self.cache.set('values', values)
        cached = self.cache.get('values')
        self.assertEqual(values, cached)

        value = self.cache.pop('values')
        self.assertEqual(1, value)
        value = self.cache.pop('values')
        self.assertEqual(2, value)
        value = self.cache.pop('values')
        self.assertEqual(3, value)

if __name__ == '__main__':
    unittest.main()
